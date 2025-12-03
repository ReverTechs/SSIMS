import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToStream } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/invoice-pdf';
import React from 'react';

interface InvoiceItem {
    item_name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    total_amount: number;
}

interface InvoiceData {
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    notes: string | null;
    student_id: string;
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
    academic_years: {
        name: string;
    } | null;
    terms: {
        name: string;
    } | null;
    invoice_items: InvoiceItem[] | null;
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

        // Fetch invoice with all details
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select(`
                id,
                invoice_number,
                invoice_date,
                due_date,
                total_amount,
                amount_paid,
                balance,
                status,
                notes,
                student_id,
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
                academic_years (
                    name
                ),
                terms (
                    name
                ),
                invoice_items (
                    item_name,
                    description,
                    quantity,
                    unit_price,
                    total_amount
                )
            `)
            .eq('id', id)
            .single();

        if (invoiceError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const typedInvoice = invoice as unknown as InvoiceData;

        // Check permissions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isStudent = typedInvoice.student_id === user.id;
        const isAdminOrStaff = ['admin', 'staff'].includes(profile?.role || '');

        // Check if user is a guardian of this student
        let isGuardian = false;
        if (profile?.role === 'guardian') {
            const { data: relationship } = await supabase
                .from('student_guardians')
                .select('student_id, guardian_id')
                .eq('student_id', typedInvoice.student_id)
                .eq('guardian_id', user.id)
                .single();

            isGuardian = !!relationship;
        }

        if (!isStudent && !isGuardian && !isAdminOrStaff) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Validate required data
        if (!typedInvoice.students) {
            return NextResponse.json({ error: 'Student data not found' }, { status: 500 });
        }

        // Prepare data for PDF
        const pdfData = {
            invoice_number: typedInvoice.invoice_number,
            invoice_date: typedInvoice.invoice_date,
            due_date: typedInvoice.due_date,
            status: typedInvoice.status,
            student: {
                student_id: typedInvoice.students.student_id,
                full_name: `${typedInvoice.students.profiles.first_name} ${typedInvoice.students.profiles.last_name}`,
                class_name: typedInvoice.students.classes.name,
            },
            academic_year: typedInvoice.academic_years?.name || 'N/A',
            term: typedInvoice.terms?.name || 'N/A',
            items: (typedInvoice.invoice_items || []).map((item) => ({
                item_name: item.item_name,
                description: item.description || '',
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_amount: item.total_amount,
            })),
            total_amount: typedInvoice.total_amount,
            amount_paid: typedInvoice.amount_paid,
            balance: typedInvoice.balance,
            notes: typedInvoice.notes || undefined,
        };

        // Generate PDF stream
        // Note: Using 'as any' intermediate cast is required for @react-pdf/renderer in .ts files
        // See: https://github.com/diegomura/react-pdf/issues/2162
        const pdfElement = React.createElement(InvoicePDF, { data: pdfData });
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
                'Content-Disposition': `attachment; filename="${typedInvoice.invoice_number}.pdf"`,
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF. Please try again later.' },
            { status: 500 }
        );
    }
}
