'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface ApproveClearanceParams {
    clearance_request_id: string;
    approve: boolean;
    reason?: string; // Required for rejection or override
}

/**
 * Approve or reject a clearance request
 * Admin/Staff only
 */
export async function approveClearance(params: ApproveClearanceParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user has permission (admin or staff)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'teacher'].includes(profile.role)) {
            return { error: 'Only admin and teachers can approve clearances' };
        }

        // Fetch clearance request
        const { data: clearanceRequest, error: fetchError } = await supabase
            .from('clearance_requests')
            .select(`
                id,
                student_id,
                status,
                payment_percentage,
                clearance_types (
                    display_name,
                    minimum_payment_percentage,
                    allows_override
                ),
                students (
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    )
                )
            `)
            .eq('id', params.clearance_request_id)
            .single();

        if (fetchError || !clearanceRequest) {
            return { error: 'Clearance request not found' };
        }

        // Check if already approved/rejected
        if (['auto_approved', 'manually_approved', 'rejected'].includes(clearanceRequest.status)) {
            return { error: `Clearance already ${clearanceRequest.status}` };
        }

        const clearanceType = Array.isArray(clearanceRequest.clearance_types)
            ? clearanceRequest.clearance_types[0]
            : clearanceRequest.clearance_types;

        if (params.approve) {
            // Check if override is needed
            const needsOverride = clearanceRequest.payment_percentage < clearanceType.minimum_payment_percentage;

            if (needsOverride && !clearanceType.allows_override) {
                return {
                    error: `${clearanceType.display_name} does not allow override. Student must meet payment requirement.`,
                };
            }

            if (needsOverride && !params.reason) {
                return {
                    error: 'Override reason is required when approving below payment threshold',
                };
            }

            // Approve clearance
            const { error: updateError } = await supabase
                .from('clearance_requests')
                .update({
                    status: 'manually_approved',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    override_reason: needsOverride ? params.reason : null,
                })
                .eq('id', params.clearance_request_id);

            if (updateError) {
                console.error('Error approving clearance:', updateError);
                return { error: 'Failed to approve clearance' };
            }

            // Fetch updated clearance with certificate number
            const { data: updatedClearance } = await supabase
                .from('clearance_requests')
                .select('certificate_number')
                .eq('id', params.clearance_request_id)
                .single();

            const student = Array.isArray(clearanceRequest.students)
                ? clearanceRequest.students[0]
                : clearanceRequest.students;

            const profile = Array.isArray(student.profiles)
                ? student.profiles[0]
                : student.profiles;

            const studentName = `${profile.first_name} ${profile.last_name}`;

            revalidatePath('/dashboard/fees');
            revalidatePath('/dashboard/management/clearances');

            return {
                success: true,
                message: `${clearanceType.display_name} approved for ${studentName}${needsOverride ? ' (Override)' : ''}. Certificate: ${updatedClearance?.certificate_number}`,
                certificate_number: updatedClearance?.certificate_number,
            };
        } else {
            // Reject clearance
            if (!params.reason) {
                return { error: 'Rejection reason is required' };
            }

            const { error: updateError } = await supabase
                .from('clearance_requests')
                .update({
                    status: 'rejected',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    rejection_reason: params.reason,
                })
                .eq('id', params.clearance_request_id);

            if (updateError) {
                console.error('Error rejecting clearance:', updateError);
                return { error: 'Failed to reject clearance' };
            }

            const student = Array.isArray(clearanceRequest.students)
                ? clearanceRequest.students[0]
                : clearanceRequest.students;

            const profile = Array.isArray(student.profiles)
                ? student.profiles[0]
                : student.profiles;

            const studentName = `${profile.first_name} ${profile.last_name}`;

            revalidatePath('/dashboard/fees');
            revalidatePath('/dashboard/management/clearances');

            return {
                success: true,
                message: `${clearanceType.display_name} rejected for ${studentName}`,
            };
        }
    } catch (error) {
        console.error('Error in approveClearance:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get pending clearance requests for admin review
 */
export async function getPendingClearances(filters?: {
    academic_year_id?: string;
    term_id?: string;
    clearance_type_id?: string;
    class_id?: string;
}) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user has permission
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'teacher', 'headteacher', 'deputy_headteacher'].includes(profile.role)) {
            return { error: 'Insufficient permissions' };
        }

        // Build query
        let query = supabase
            .from('clearance_requests')
            .select(`
                id,
                student_id,
                status,
                payment_percentage,
                total_fees_amount,
                amount_paid,
                outstanding_balance,
                created_at,
                clearance_types (
                    name,
                    display_name,
                    minimum_payment_percentage
                ),
                students (
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name,
                        id
                    )
                ),
                academic_years (
                    name
                ),
                terms (
                    name
                )
            `)
            .eq('status', 'pending');

        // Apply filters
        if (filters?.academic_year_id) {
            query = query.eq('academic_year_id', filters.academic_year_id);
        }
        if (filters?.term_id) {
            query = query.eq('term_id', filters.term_id);
        }
        if (filters?.clearance_type_id) {
            query = query.eq('clearance_type_id', filters.clearance_type_id);
        }

        const { data: clearances, error: clearancesError } = await query.order('created_at', { ascending: true });

        if (clearancesError) {
            console.error('Error fetching pending clearances:', clearancesError);
            return { error: 'Failed to fetch pending clearances' };
        }

        // Filter by class if needed (post-query since it's nested)
        let filteredClearances = clearances || [];
        if (filters?.class_id) {
            filteredClearances = filteredClearances.filter((c) => {
                const student = Array.isArray(c.students) ? c.students[0] : c.students;
                if (!student) return false;

                const studentClass = Array.isArray(student.classes) ? student.classes[0] : student.classes;
                return studentClass?.id === filters.class_id;
            });
        }

        return {
            success: true,
            clearances: filteredClearances,
        };
    } catch (error) {
        console.error('Error in getPendingClearances:', error);
        return { error: 'An unexpected error occurred' };
    }
}
