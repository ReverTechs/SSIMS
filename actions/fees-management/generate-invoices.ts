'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface GenerateInvoicesParams {
    academic_year_id: string;
    term_id: string;
}

export async function generateInvoices(params: GenerateInvoicesParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return { error: 'Only admins can generate invoices' };
        }

        // Get student fees that don't have invoices yet
        const { data: studentFees, error: feesError } = await supabase
            .from('student_fees')
            .select(`
                id,
                student_id,
                fee_structure_id,
                academic_year_id,
                term_id,
                total_amount,
                due_date,
                fee_structures (
                    id,
                    name,
                    student_type
                )
            `)
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        if (feesError) {
            console.error('Error fetching student fees:', feesError);
            return { error: 'Failed to fetch student fees' };
        }

        if (!studentFees || studentFees.length === 0) {
            return { error: 'No student fees found for this term. Please assign fees first.' };
        }

        // Check for existing invoices
        const { data: existingInvoices } = await supabase
            .from('invoices')
            .select('student_fee_id')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        const existingFeeIds = new Set(existingInvoices?.map(inv => inv.student_fee_id) || []);

        // Filter out fees that already have invoices
        const feesToInvoice = studentFees.filter(fee => !existingFeeIds.has(fee.id));

        if (feesToInvoice.length === 0) {
            return { error: `All ${studentFees.length} student fees already have invoices generated` };
        }

        // Get fee structure items for all fee structures
        const feeStructureIds = [...new Set(feesToInvoice.map(f => f.fee_structure_id))];
        const { data: feeItems } = await supabase
            .from('fee_structure_items')
            .select('*')
            .in('fee_structure_id', feeStructureIds)
            .order('display_order', { ascending: true });

        const feeItemsByStructure = new Map();
        feeItems?.forEach(item => {
            if (!feeItemsByStructure.has(item.fee_structure_id)) {
                feeItemsByStructure.set(item.fee_structure_id, []);
            }
            feeItemsByStructure.get(item.fee_structure_id).push(item);
        });

        // Prepare invoice data with financial aid calculation
        const invoicesData = [];

        for (const fee of feesToInvoice) {
            // Check for active financial aid for this student
            const { data: activeAid } = await supabase
                .rpc('get_active_student_aid', {
                    p_student_id: fee.student_id,
                    p_academic_year_id: fee.academic_year_id,
                    p_term_id: fee.term_id
                });

            // Calculate total aid amount
            const { data: aidAmount } = await supabase
                .rpc('calculate_student_aid_amount', {
                    p_student_id: fee.student_id,
                    p_academic_year_id: fee.academic_year_id,
                    p_term_id: fee.term_id,
                    p_total_fees: fee.total_amount
                });

            const totalAidAmount = aidAmount || 0;
            const studentResponsibility = fee.total_amount - totalAidAmount;

            // Update student_fees with discount information
            if (totalAidAmount > 0) {
                const aidSummary = activeAid && activeAid.length > 0
                    ? activeAid.map((a: any) => a.sponsor_name).join(', ')
                    : 'Financial Aid';

                await supabase
                    .from('student_fees')
                    .update({
                        discount_amount: totalAidAmount,
                        discount_reason: `Financial Aid: ${aidSummary}`,
                        balance: studentResponsibility,
                    })
                    .eq('id', fee.id);

                // Update calculated_aid_amount in student_financial_aid
                if (activeAid && activeAid.length > 0) {
                    for (const aid of activeAid) {
                        await supabase
                            .from('student_financial_aid')
                            .update({ calculated_aid_amount: totalAidAmount / activeAid.length })
                            .eq('id', aid.aid_id);
                    }
                }
            }

            invoicesData.push({
                student_fee_id: fee.id,
                student_id: fee.student_id,
                academic_year_id: fee.academic_year_id,
                term_id: fee.term_id,
                invoice_date: new Date().toISOString().split('T')[0],
                due_date: fee.due_date,
                total_amount: fee.total_amount,
                amount_paid: 0,
                balance: studentResponsibility, // Student only pays their portion
                status: studentResponsibility <= 0 ? 'paid' : 'unpaid',
                notes: totalAidAmount > 0 ? `Financial aid applied: MK ${totalAidAmount.toLocaleString()}` : null,
                generated_by: user.id,
            });
        }

        // Batch insert invoices (invoice numbers will be auto-generated by trigger)
        const { data: createdInvoices, error: invoicesError } = await supabase
            .from('invoices')
            .insert(invoicesData)
            .select('id, invoice_number, student_fee_id');

        if (invoicesError) {
            console.error('Error creating invoices:', invoicesError);
            return { error: 'Failed to create invoices' };
        }

        // Create invoice items for each invoice
        const invoiceItemsData = [];
        for (const invoice of createdInvoices) {
            const studentFee = feesToInvoice.find(f => f.id === invoice.student_fee_id);
            if (!studentFee) continue;

            const items = feeItemsByStructure.get(studentFee.fee_structure_id) || [];

            for (const item of items) {
                invoiceItemsData.push({
                    invoice_id: invoice.id,
                    item_name: item.item_name,
                    description: item.description,
                    quantity: 1,
                    unit_price: item.amount,
                    total_amount: item.amount,
                });
            }
        }

        if (invoiceItemsData.length > 0) {
            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItemsData);

            if (itemsError) {
                console.error('Error creating invoice items:', itemsError);
                // Don't fail the whole operation, items can be added later
            }
        }

        const totalAmount = createdInvoices.reduce((sum, inv) => {
            const fee = feesToInvoice.find(f => f.id === inv.student_fee_id);
            return sum + (fee?.total_amount || 0);
        }, 0);

        revalidatePath('/dashboard/management/fee-structures');

        return {
            success: true,
            invoice_count: createdInvoices.length,
            skipped_count: existingFeeIds.size,
            total_amount: totalAmount,
            invoices: createdInvoices.map(inv => ({
                invoice_number: inv.invoice_number,
                student_fee_id: inv.student_fee_id,
            })),
            message: `Successfully generated ${createdInvoices.length} invoice${createdInvoices.length > 1 ? 's' : ''}${existingFeeIds.size > 0 ? `. Skipped ${existingFeeIds.size} that already had invoices.` : ''}`,
        };
    } catch (error) {
        console.error('Error in generateInvoices:', error);
        return { error: 'An unexpected error occurred' };
    }
}

// Preview function
export async function previewInvoiceGeneration(params: GenerateInvoicesParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Get student fees
        const { data: studentFees } = await supabase
            .from('student_fees')
            .select(`
                id,
                total_amount,
                fee_structures (
                    student_type
                )
            `)
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        if (!studentFees || studentFees.length === 0) {
            return { error: 'No student fees found for this term' };
        }

        // Check existing invoices
        const { data: existingInvoices } = await supabase
            .from('invoices')
            .select('student_fee_id')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        const existingFeeIds = new Set(existingInvoices?.map(inv => inv.student_fee_id) || []);
        const feesToInvoice = studentFees.filter(fee => !existingFeeIds.has(fee.id));

        const internalCount = feesToInvoice.filter(f => {
            const fs = Array.isArray(f.fee_structures) ? f.fee_structures[0] : f.fee_structures;
            return fs?.student_type === 'internal';
        }).length;
        const externalCount = feesToInvoice.filter(f => {
            const fs = Array.isArray(f.fee_structures) ? f.fee_structures[0] : f.fee_structures;
            return fs?.student_type === 'external';
        }).length;
        const totalAmount = feesToInvoice.reduce((sum, fee) => sum + fee.total_amount, 0);

        return {
            success: true,
            preview: {
                total_invoices: feesToInvoice.length,
                internal_count: internalCount,
                external_count: externalCount,
                total_amount: totalAmount,
                already_generated: existingFeeIds.size,
            },
        };
    } catch (error) {
        console.error('Error in previewInvoiceGeneration:', error);
        return { error: 'An unexpected error occurred' };
    }
}
