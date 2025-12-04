'use server';

import { createClient } from '@/lib/supabase/server';

interface AssignStudentFeesParams {
    studentId: string;
    studentType: 'internal' | 'external';
    academicYearId: string;
    termId: string;
}

interface AssignStudentFeesResult {
    success?: boolean;
    error?: string;
    feeAssigned?: boolean;
    amount?: number;
    message?: string;
}

/**
 * Assigns fees to a single student based on their student type and the active fee structure.
 * This is called automatically during student registration.
 */
export async function assignStudentFees(
    params: AssignStudentFeesParams
): Promise<AssignStudentFeesResult> {
    try {
        const supabase = await createClient();

        // Check if student already has fees assigned for this term
        const { data: existingFee } = await supabase
            .from('student_fees')
            .select('id')
            .eq('student_id', params.studentId)
            .eq('academic_year_id', params.academicYearId)
            .eq('term_id', params.termId)
            .maybeSingle();

        if (existingFee) {
            console.log(`[assignStudentFees] Student ${params.studentId} already has fees assigned for this term`);
            return {
                success: true,
                feeAssigned: false,
                message: 'Student already has fees assigned for this term',
            };
        }

        // Get active fee structure for this student type
        const { data: feeStructure, error: structureError } = await supabase
            .from('fee_structures')
            .select('*')
            .eq('academic_year_id', params.academicYearId)
            .eq('term_id', params.termId)
            .eq('student_type', params.studentType)
            .eq('is_active', true)
            .maybeSingle();

        if (structureError) {
            console.error('[assignStudentFees] Error fetching fee structure:', structureError);
            return {
                error: 'Failed to fetch fee structure',
            };
        }

        if (!feeStructure) {
            console.warn(
                `[assignStudentFees] No active fee structure found for ${params.studentType} students in term ${params.termId}. Skipping fee assignment.`
            );
            return {
                success: true,
                feeAssigned: false,
                message: `No active fee structure found for ${params.studentType} students. Fee assignment skipped.`,
            };
        }

        // Create student fee record
        const { data: createdFee, error: insertError } = await supabase
            .from('student_fees')
            .insert({
                student_id: params.studentId,
                fee_structure_id: feeStructure.id,
                academic_year_id: params.academicYearId,
                term_id: params.termId,
                total_amount: feeStructure.total_amount,
                amount_paid: 0,
                balance: feeStructure.total_amount,
                discount_amount: 0,
                status: 'unpaid',
                due_date: feeStructure.due_date,
            })
            .select('id')
            .single();

        if (insertError || !createdFee) {
            console.error('[assignStudentFees] Error creating student fee:', insertError);
            return {
                error: 'Failed to assign fees to student',
            };
        }

        console.log(
            `[assignStudentFees] Successfully assigned ${feeStructure.total_amount} in fees to student ${params.studentId} (${params.studentType})`
        );

        // Automatically generate invoice for the assigned fee
        try {
            // Get fee structure items
            const { data: feeItems } = await supabase
                .from('fee_structure_items')
                .select('*')
                .eq('fee_structure_id', feeStructure.id)
                .order('display_order', { ascending: true });

            // Create invoice
            const { data: createdInvoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    student_fee_id: createdFee.id,
                    student_id: params.studentId,
                    academic_year_id: params.academicYearId,
                    term_id: params.termId,
                    invoice_date: new Date().toISOString().split('T')[0],
                    due_date: feeStructure.due_date,
                    total_amount: feeStructure.total_amount,
                    amount_paid: 0,
                    balance: feeStructure.total_amount,
                    status: 'unpaid',
                })
                .select('id, invoice_number')
                .single();

            if (invoiceError || !createdInvoice) {
                console.error('[assignStudentFees] Error creating invoice:', invoiceError);
                // Don't fail fee assignment if invoice creation fails
            } else {
                console.log(`[assignStudentFees] Created invoice ${createdInvoice.invoice_number} for student ${params.studentId}`);

                // Create invoice items
                if (feeItems && feeItems.length > 0) {
                    const invoiceItemsData = feeItems.map(item => ({
                        invoice_id: createdInvoice.id,
                        item_name: item.item_name,
                        description: item.description,
                        quantity: 1,
                        unit_price: item.amount,
                        total_amount: item.amount,
                    }));

                    const { error: itemsError } = await supabase
                        .from('invoice_items')
                        .insert(invoiceItemsData);

                    if (itemsError) {
                        console.error('[assignStudentFees] Error creating invoice items:', itemsError);
                    } else {
                        console.log(`[assignStudentFees] Created ${invoiceItemsData.length} invoice items`);
                    }
                }
            }
        } catch (invoiceGenError) {
            console.error('[assignStudentFees] Error during invoice generation:', invoiceGenError);
            // Don't fail fee assignment if invoice generation fails
        }

        return {
            success: true,
            feeAssigned: true,
            amount: feeStructure.total_amount,
            message: `Successfully assigned ${feeStructure.total_amount} in fees and generated invoice`,
        };
    } catch (error) {
        console.error('[assignStudentFees] Unexpected error:', error);
        return {
            error: 'An unexpected error occurred while assigning fees',
        };
    }
}
