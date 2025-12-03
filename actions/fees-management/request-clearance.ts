'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface RequestClearanceParams {
    student_id: string;
    clearance_type_id: string;
    academic_year_id: string;
    term_id?: string;
}

interface EligibilityResult {
    eligible: boolean;
    payment_percentage: number;
    required_percentage: number;
    total_fees: number;
    amount_paid: number;
    outstanding_balance: number;
    reason: string;
}

/**
 * Request fee clearance for a student
 * Features:
 * - Checks eligibility automatically
 * - Auto-approves if criteria met
 * - Creates pending request if manual approval needed
 * - Generates certificate number on approval
 */
export async function requestClearance(params: RequestClearanceParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check permissions
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isStudent = params.student_id === user.id;
        const isAdminOrStaff = ['admin', 'teacher'].includes(profile?.role || '');

        // Check if user is a guardian of this student
        let isGuardian = false;
        if (profile?.role === 'guardian') {
            const { data: relationship } = await supabase
                .from('student_guardians')
                .select('student_id, guardian_id')
                .eq('student_id', params.student_id)
                .eq('guardian_id', user.id)
                .single();

            isGuardian = !!relationship;
        }

        if (!isStudent && !isGuardian && !isAdminOrStaff) {
            return { error: 'You do not have permission to request clearance for this student' };
        }

        // Check for existing active clearance
        const { data: existingClearance } = await supabase
            .from('clearance_requests')
            .select('id, status, certificate_number')
            .eq('student_id', params.student_id)
            .eq('clearance_type_id', params.clearance_type_id)
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id || null)
            .in('status', ['pending', 'auto_approved', 'manually_approved'])
            .single();

        if (existingClearance) {
            return {
                error: `An active clearance request already exists${existingClearance.certificate_number ? ` (${existingClearance.certificate_number})` : ''}`,
                existing: true,
                clearance: existingClearance,
            };
        }

        // Check eligibility using database function
        const { data: eligibilityData, error: eligibilityError } = await supabase
            .rpc('check_clearance_eligibility', {
                p_student_id: params.student_id,
                p_clearance_type_id: params.clearance_type_id,
                p_academic_year_id: params.academic_year_id,
                p_term_id: params.term_id || null,
            })
            .single();

        const eligibility = eligibilityData as unknown as EligibilityResult;

        if (eligibilityError) {
            console.error('Error checking eligibility:', eligibilityError);
            return { error: 'Failed to check clearance eligibility' };
        }

        // Determine status based on eligibility
        const status = eligibility.eligible ? 'auto_approved' : 'pending';

        // Create clearance request
        const { data: clearanceRequest, error: requestError } = await supabase
            .from('clearance_requests')
            .insert({
                student_id: params.student_id,
                clearance_type_id: params.clearance_type_id,
                academic_year_id: params.academic_year_id,
                term_id: params.term_id || null,
                total_fees_amount: eligibility.total_fees,
                amount_paid: eligibility.amount_paid,
                outstanding_balance: eligibility.outstanding_balance,
                payment_percentage: eligibility.payment_percentage,
                status: status,
                approved_by: eligibility.eligible ? user.id : null,
                approved_at: eligibility.eligible ? new Date().toISOString() : null,
                requested_by: user.id,
            })
            .select(`
                id,
                status,
                certificate_number,
                payment_percentage,
                clearance_types (
                    display_name,
                    minimum_payment_percentage
                )
            `)
            .single();

        if (requestError) {
            console.error('Error creating clearance request:', requestError);
            return { error: 'Failed to create clearance request' };
        }

        // Revalidate paths
        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/management/clearances');

        const clearanceType = Array.isArray(clearanceRequest.clearance_types)
            ? clearanceRequest.clearance_types[0]
            : clearanceRequest.clearance_types;

        return {
            success: true,
            clearance: {
                id: clearanceRequest.id,
                status: clearanceRequest.status,
                certificate_number: clearanceRequest.certificate_number,
                payment_percentage: clearanceRequest.payment_percentage,
            },
            message: eligibility.eligible
                ? `${clearanceType.display_name} automatically approved! Certificate: ${clearanceRequest.certificate_number}`
                : `${clearanceType.display_name} request submitted for approval. Payment: ${Math.round(eligibility.payment_percentage)}% (Required: ${clearanceType.minimum_payment_percentage}%)`,
            auto_approved: eligibility.eligible,
        };
    } catch (error) {
        console.error('Error in requestClearance:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get clearance status for a student
 */
export async function getClearanceStatus(
    studentId: string,
    academicYearId: string,
    termId?: string
) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Fetch all clearance requests for this student/term
        const { data: clearances, error: clearancesError } = await supabase
            .from('clearance_requests')
            .select(`
                id,
                status,
                certificate_number,
                payment_percentage,
                total_fees_amount,
                amount_paid,
                outstanding_balance,
                valid_from,
                valid_until,
                created_at,
                approved_at,
                rejection_reason,
                clearance_types (
                    name,
                    display_name,
                    minimum_payment_percentage,
                    requires_full_payment
                )
            `)
            .eq('student_id', studentId)
            .eq('academic_year_id', academicYearId)
            .eq('term_id', termId || null)
            .order('created_at', { ascending: false });

        if (clearancesError) {
            console.error('Error fetching clearances:', clearancesError);
            return { error: 'Failed to fetch clearance status' };
        }

        // Get all available clearance types
        const { data: allTypes } = await supabase
            .from('clearance_types')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        return {
            success: true,
            clearances: clearances || [],
            available_types: allTypes || [],
        };
    } catch (error) {
        console.error('Error in getClearanceStatus:', error);
        return { error: 'An unexpected error occurred' };
    }
}
