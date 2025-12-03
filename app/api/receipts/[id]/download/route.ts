import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { ReceiptPDF } from '@/components/pdf/receipt-pdf';
import React from 'react';

interface ReceiptData {
    id: string;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    student_id: string;
    payments: {
        payment_number: string;
        reference_number: string | null;
        invoices: {
            invoice_number: string;
            balance: number;
        };
    } | null;
    students: {
        student_id: string;
        profiles: {
            first_name: string;
            last_name: string;
        };
        classes: {
            name: string;
        };
    } | null;
    generated_by_profile: {
        first_name: string;
        last_name: string;
    } | null;
}

interface InvoiceWithAcademicInfo {
    academic_years: {
        name: string;
    } | null;
    terms: {
        name: string;
    } | null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15+
        const { id } = await params;

        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch receipt with all details
        const { data: receipt, error: receiptError } = await supabase
            .from('receipts')
            .select(`
                id,
                receipt_number,
                amount,
                payment_date,
                payment_method,
                student_id,
                payments (
                    payment_number,
                    reference_number,
                    invoices (
                        invoice_number,
                        balance
                    )
                ),
                students (
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name
                    )
                ),
                generated_by_profile:profiles!receipts_generated_by_fkey (
                    first_name,
                    last_name
                )
            `)
            .eq('id', id)
            .single();

        if (receiptError || !receipt) {
            return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
        }

        const typedReceipt = receipt as unknown as ReceiptData;

        // Check permissions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isStudent = typedReceipt.student_id === user.id;
        const isAdminOrStaff = ['admin', 'staff'].includes(profile?.role || '');

        // Check if user is a guardian of this student
        let isGuardian = false;
        if (profile?.role === 'guardian') {
            const { data: relationship } = await supabase
                .from('student_guardians')
                .select('student_id, guardian_id')
                .eq('student_id', typedReceipt.student_id)
                .eq('guardian_id', user.id)
                .single();

            isGuardian = !!relationship;
        }

        if (!isStudent && !isGuardian && !isAdminOrStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Validate required data
        if (!typedReceipt.students || !typedReceipt.payments) {
            return NextResponse.json({ error: 'Receipt data incomplete' }, { status: 500 });
        }

        // Get academic year and term from invoice
        let academicYear = 'N/A';
        let term = 'N/A';

        if (typedReceipt.payments.invoices.invoice_number) {
            const { data: invoiceData } = await supabase
                .from('invoices')
                .select(`
                    academic_years (name),
                    terms (name)
                `)
                .eq('invoice_number', typedReceipt.payments.invoices.invoice_number)
                .single();

            const typedInvoiceData = invoiceData as unknown as InvoiceWithAcademicInfo | null;

            if (typedInvoiceData) {
                academicYear = typedInvoiceData.academic_years?.name || 'N/A';
                term = typedInvoiceData.terms?.name || 'N/A';
            }
        }

        // Calculate balances
        const invoice_balance_before = typedReceipt.payments.invoices.balance + typedReceipt.amount;
        const invoice_balance_after = typedReceipt.payments.invoices.balance;

        // Prepare data for PDF
        const pdfData = {
            receipt_number: typedReceipt.receipt_number,
            payment_number: typedReceipt.payments.payment_number,
            invoice_number: typedReceipt.payments.invoices.invoice_number,
            payment_date: typedReceipt.payment_date,
            amount: typedReceipt.amount,
            payment_method: typedReceipt.payment_method,
            reference_number: typedReceipt.payments.reference_number || undefined,
            student: {
                student_id: typedReceipt.students.student_id,
                full_name: `${typedReceipt.students.profiles.first_name} ${typedReceipt.students.profiles.last_name}`,
                class_name: typedReceipt.students.classes.name,
            },
            academic_year: academicYear,
            term: term,
            invoice_balance_before,
            invoice_balance_after,
            recorded_by: typedReceipt.generated_by_profile
                ? `${typedReceipt.generated_by_profile.first_name} ${typedReceipt.generated_by_profile.last_name}`
                : 'System',
        };

        // Generate PDF stream
        // Note: Using 'as any' intermediate cast is required for @react-pdf/renderer in .ts files
        // See: https://github.com/diegomura/react-pdf/issues/2162
        const pdfElement = React.createElement(ReceiptPDF, { data: pdfData });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = await renderToStream(pdfElement as any);

        // Convert stream to buffer
        const chunks: Buffer[] = [];
        for await (const chunk of stream as AsyncIterable<Buffer>) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Return PDF
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${typedReceipt.receipt_number}.pdf"`,
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error generating receipt PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF. Please try again later.' },
            { status: 500 }
        );
    }
}
