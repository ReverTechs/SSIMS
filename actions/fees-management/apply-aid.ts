'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Manually apply aid to existing invoices for a student
 * Use this when aid is assigned after invoice generation
 */
export async function applyAidToInvoice(studentId: string, academicYearId: string, termId?: string) {
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

        if (!profile || profile.role !== 'admin') {
            return { error: 'Only admins can apply aid to invoices' };
        }

        // Get student's active aid
        const { data: activeAid } = await supabase
            .rpc('get_active_student_aid', {
                p_student_id: studentId,
                p_academic_year_id: academicYearId,
                p_term_id: termId || null
            });

        if (!activeAid || activeAid.length === 0) {
            return { error: 'No active financial aid found for this student' };
        }

        // Get student's fee record
        let feeQuery = supabase
            .from('student_fees')
            .select('*')
            .eq('student_id', studentId)
            .eq('academic_year_id', academicYearId);

        if (termId) {
            feeQuery = feeQuery.eq('term_id', termId);
        } else {
            feeQuery = feeQuery.is('term_id', null);
        }

        const { data: studentFee, error: feeError } = await feeQuery.single();

        if (feeError || !studentFee) {
            return { error: 'Student fee record not found' };
        }

        // Calculate total aid amount
        const { data: aidAmount } = await supabase
            .rpc('calculate_student_aid_amount', {
                p_student_id: studentId,
                p_academic_year_id: academicYearId,
                p_term_id: termId || null,
                p_total_fees: studentFee.total_amount
            });

        const totalAidAmount = aidAmount || 0;

        if (totalAidAmount <= 0) {
            return { error: 'No aid amount to apply' };
        }

        // Update student_fees with discount
        const newBalance = studentFee.total_amount - studentFee.amount_paid - totalAidAmount;

        await supabase
            .from('student_fees')
            .update({
                discount_amount: totalAidAmount,
                discount_reason: 'Financial Aid Applied',
                balance: newBalance,
            })
            .eq('id', studentFee.id);

        // Update invoice if exists
        let invoiceQuery = supabase
            .from('invoices')
            .select('*')
            .eq('student_fee_id', studentFee.id)
            .eq('academic_year_id', academicYearId);

        if (termId) {
            invoiceQuery = invoiceQuery.eq('term_id', termId);
        } else {
            invoiceQuery = invoiceQuery.is('term_id', null);
        }

        const { data: invoice } = await invoiceQuery.single();

        if (invoice) {
            const invoiceNewBalance = invoice.total_amount - invoice.amount_paid - totalAidAmount;
            const newStatus = invoiceNewBalance <= 0 ? 'paid' :
                invoiceNewBalance < invoice.total_amount ? 'partially_paid' : 'unpaid';

            await supabase
                .from('invoices')
                .update({
                    balance: invoiceNewBalance,
                    status: newStatus,
                    notes: (invoice.notes || '') + `\nFinancial aid applied: MK ${totalAidAmount.toLocaleString()} (${new Date().toLocaleDateString()})`,
                })
                .eq('id', invoice.id);
        }

        // Update calculated_aid_amount in aid records
        for (const aid of activeAid) {
            await supabase
                .from('student_financial_aid')
                .update({ calculated_aid_amount: totalAidAmount / activeAid.length })
                .eq('id', aid.aid_id);
        }

        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            aid_amount: totalAidAmount,
            new_balance: newBalance,
            message: `Financial aid of MK ${totalAidAmount.toLocaleString()} applied successfully. New balance: MK ${newBalance.toLocaleString()}`,
        };
    } catch (error) {
        console.error('Error applying aid to invoice:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Recalculate and apply aid for all students in an academic year/term
 * Use this after bulk aid assignment
 */
export async function recalculateAllAid(academicYearId?: string, termId?: string) {
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

        if (!profile || profile.role !== 'admin') {
            return { error: 'Only admins can recalculate aid' };
        }

        // Call the database function
        const { data, error } = await supabase
            .rpc('recalculate_all_student_aid', {
                p_academic_year_id: academicYearId || null,
                p_term_id: termId || null
            });

        if (error) {
            console.error('Error recalculating aid:', error);
            return { error: 'Failed to recalculate aid' };
        }

        const result = Array.isArray(data) ? data[0] : data;

        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            students_updated: result.students_updated || 0,
            total_aid_applied: result.total_aid_applied || 0,
            message: `Aid recalculated for ${result.students_updated || 0} student(s). Total aid applied: MK ${(result.total_aid_applied || 0).toLocaleString()}`,
        };
    } catch (error) {
        console.error('Error in recalculateAllAid:', error);
        return { error: 'An unexpected error occurred' };
    }
}
