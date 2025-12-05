'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    RecordSponsorPaymentInput,
    AllocateSponsorPaymentInput,
    SponsorPayment,
    SponsorPaymentWithDetails,
    RecordSponsorPaymentResponse,
} from '@/types/fees';

/**
 * Record a payment from a sponsor
 */
export async function recordSponsorPayment(
    input: RecordSponsorPaymentInput
): Promise<RecordSponsorPaymentResponse | { error: string }> {
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
            return { error: 'Only admins can record sponsor payments' };
        }

        // Validate sponsor exists
        const { data: sponsor } = await supabase
            .from('sponsors')
            .select('id, name')
            .eq('id', input.sponsor_id)
            .single();

        if (!sponsor) {
            return { error: 'Sponsor not found' };
        }

        // Validate amount
        if (input.amount <= 0) {
            return { error: 'Payment amount must be greater than zero' };
        }

        // Create sponsor payment
        const { data: payment, error: createError } = await supabase
            .from('sponsor_payments')
            .insert({
                sponsor_id: input.sponsor_id,
                amount: input.amount,
                payment_date: input.payment_date,
                payment_method: input.payment_method,
                reference_number: input.reference_number,
                notes: input.notes,
                recorded_by: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error recording sponsor payment:', createError);
            return { error: 'Failed to record sponsor payment' };
        }

        let allocations = undefined;

        // Auto-allocate if requested
        if (input.auto_allocate) {
            console.log('[AUTO-ALLOCATE] Starting auto-allocation for sponsor:', input.sponsor_id);

            // Get students with active aid from this sponsor
            const { data: studentsWithAid, error: aidError } = await supabase
                .from('student_financial_aid')
                .select(`
                    id,
                    student_id,
                    calculated_aid_amount,
                    student_fees!inner (
                        id,
                        balance,
                        academic_year_id,
                        term_id
                    )
                `)
                .eq('sponsor_id', input.sponsor_id)
                .in('status', ['active', 'approved'])
                .gte('valid_until', new Date().toISOString().split('T')[0]); // Aid must still be valid

            if (aidError) {
                console.error('[AUTO-ALLOCATE] Error fetching students with aid:', aidError);
            }

            console.log('[AUTO-ALLOCATE] Found students with aid:', studentsWithAid?.length || 0);
            console.log('[AUTO-ALLOCATE] Students data:', JSON.stringify(studentsWithAid, null, 2));

            if (studentsWithAid && studentsWithAid.length > 0) {
                const allocationData = [];
                let remainingAmount = input.amount;

                for (const aid of studentsWithAid) {
                    if (remainingAmount <= 0) break;

                    const studentFee = Array.isArray(aid.student_fees) ? aid.student_fees[0] : aid.student_fees;

                    if (!studentFee) {
                        console.warn('[AUTO-ALLOCATE] No student_fees found for aid:', aid.id);
                        continue;
                    }

                    // Allocate the lesser of: aid amount or remaining payment
                    const allocationAmount = Math.min(
                        aid.calculated_aid_amount || studentFee.balance,
                        remainingAmount,
                        studentFee.balance // Don't allocate more than student owes
                    );

                    console.log('[AUTO-ALLOCATE] Student:', aid.student_id, 'Amount:', allocationAmount, 'Balance:', studentFee.balance);

                    if (allocationAmount > 0) {
                        allocationData.push({
                            sponsor_payment_id: payment.id,
                            student_id: aid.student_id,
                            student_fee_id: studentFee.id,
                            allocated_amount: allocationAmount,
                            allocation_date: input.payment_date,
                            allocated_by: user.id,
                        });

                        remainingAmount -= allocationAmount;
                    }
                }

                console.log('[AUTO-ALLOCATE] Allocation data to insert:', allocationData.length, 'records');

                if (allocationData.length > 0) {
                    const { data: createdAllocations, error: allocError } = await supabase
                        .from('sponsor_payment_allocations')
                        .insert(allocationData)
                        .select();

                    if (allocError) {
                        console.error('[AUTO-ALLOCATE] Error creating allocations:', allocError);
                    } else {
                        console.log('[AUTO-ALLOCATE] Successfully created allocations:', createdAllocations?.length);
                        allocations = createdAllocations;
                    }
                } else {
                    console.warn('[AUTO-ALLOCATE] No allocations to create (all amounts were 0)');
                }
            } else {
                console.warn('[AUTO-ALLOCATE] No students with active aid found for this sponsor');
            }
        } else {
            console.log('[AUTO-ALLOCATE] Auto-allocation disabled');
        }

        revalidatePath('/dashboard/management/sponsors');
        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            payment: payment as SponsorPayment,
            allocations,
            message: `Sponsor payment of MK ${input.amount.toLocaleString()} recorded successfully${allocations ? `. Allocated to ${allocations.length} student(s).` : ''}`,
        };
    } catch (error) {
        console.error('Error in recordSponsorPayment:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Manually allocate sponsor payment to specific students
 */
export async function allocateSponsorPayment(input: AllocateSponsorPaymentInput) {
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
            return { error: 'Only admins can allocate sponsor payments' };
        }

        // Get sponsor payment
        const { data: payment } = await supabase
            .from('sponsor_payments')
            .select('*')
            .eq('id', input.sponsor_payment_id)
            .single();

        if (!payment) {
            return { error: 'Sponsor payment not found' };
        }

        // Calculate total allocation amount
        const totalAllocation = input.allocations.reduce((sum, a) => sum + a.allocated_amount, 0);

        // Check if allocation exceeds unallocated amount
        if (totalAllocation > payment.unallocated_amount) {
            return {
                error: `Total allocation (MK ${totalAllocation.toLocaleString()}) exceeds unallocated amount (MK ${payment.unallocated_amount.toLocaleString()})`,
            };
        }

        // Create allocations
        const allocationData = input.allocations.map(a => ({
            ...a,
            sponsor_payment_id: input.sponsor_payment_id,
            allocated_by: user.id,
        }));

        const { data: allocations, error: allocError } = await supabase
            .from('sponsor_payment_allocations')
            .insert(allocationData)
            .select();

        if (allocError) {
            console.error('Error creating allocations:', allocError);
            return { error: 'Failed to allocate sponsor payment' };
        }

        revalidatePath('/dashboard/management/sponsors');
        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            allocations,
            message: `Payment allocated to ${allocations.length} student(s) successfully`,
        };
    } catch (error) {
        console.error('Error in allocateSponsorPayment:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get sponsor payments with optional filtering
 */
export async function getSponsorPayments(filters?: {
    sponsor_id?: string;
    from_date?: string;
    to_date?: string;
}) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('sponsor_payments')
            .select(`
                *,
                sponsors (
                    id,
                    name
                )
            `)
            .order('payment_date', { ascending: false });

        // Apply filters
        if (filters?.sponsor_id) {
            query = query.eq('sponsor_id', filters.sponsor_id);
        }

        if (filters?.from_date) {
            query = query.gte('payment_date', filters.from_date);
        }

        if (filters?.to_date) {
            query = query.lte('payment_date', filters.to_date);
        }

        const { data: payments, error } = await query;

        if (error) {
            console.error('Error fetching sponsor payments:', error);
            return { error: 'Failed to fetch sponsor payments' };
        }

        return {
            success: true,
            payments: payments as SponsorPaymentWithDetails[],
        };
    } catch (error) {
        console.error('Error in getSponsorPayments:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get payment allocations for a sponsor payment
 */
export async function getPaymentAllocations(sponsorPaymentId: string) {
    try {
        const supabase = await createClient();

        const { data: allocations, error } = await supabase
            .from('sponsor_payment_allocations')
            .select(`
                *,
                students (
                    id,
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    )
                )
            `)
            .eq('sponsor_payment_id', sponsorPaymentId)
            .order('allocation_date', { ascending: false });

        if (error) {
            console.error('Error fetching allocations:', error);
            return { error: 'Failed to fetch payment allocations' };
        }

        return {
            success: true,
            allocations,
        };
    } catch (error) {
        console.error('Error in getPaymentAllocations:', error);
        return { error: 'An unexpected error occurred' };
    }
}
