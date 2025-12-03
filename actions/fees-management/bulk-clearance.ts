'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface BulkClearanceParams {
    clearance_type_id: string;
    academic_year_id: string;
    term_id?: string;
    class_id?: string;
    minimum_payment_percentage?: number; // Override default requirement
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
 * Bulk approve clearances for multiple students
 * Admin/Staff only
 */
export async function bulkApproveClearances(params: BulkClearanceParams) {
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

        if (!profile || !['admin', 'teacher'].includes(profile.role)) {
            return { error: 'Only admin and teachers can perform bulk clearances' };
        }

        // Get clearance type
        const { data: clearanceType, error: typeError } = await supabase
            .from('clearance_types')
            .select('*')
            .eq('id', params.clearance_type_id)
            .single();

        if (typeError || !clearanceType) {
            return { error: 'Clearance type not found' };
        }

        // Get eligible students
        let studentsQuery = supabase
            .from('students')
            .select(`
                id,
                student_id,
                profiles (
                    first_name,
                    last_name
                )
            `)
            .eq('is_active', true);

        if (params.class_id) {
            studentsQuery = studentsQuery.eq('class_id', params.class_id);
        }

        const { data: students, error: studentsError } = await studentsQuery;

        if (studentsError) {
            console.error('Error fetching students:', studentsError);
            return { error: 'Failed to fetch students' };
        }

        if (!students || students.length === 0) {
            return { error: 'No students found matching criteria' };
        }

        // Check eligibility for each student and create clearances
        const results = {
            approved: [] as string[],
            pending: [] as string[],
            failed: [] as string[],
            existing: [] as string[],
        };

        const threshold = params.minimum_payment_percentage || clearanceType.minimum_payment_percentage;

        for (const student of students) {
            const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
            const studentName = `${profile.first_name} ${profile.last_name}`;

            try {
                // Check for existing clearance
                const { data: existing } = await supabase
                    .from('clearance_requests')
                    .select('id, status')
                    .eq('student_id', student.id)
                    .eq('clearance_type_id', params.clearance_type_id)
                    .eq('academic_year_id', params.academic_year_id)
                    .eq('term_id', params.term_id || null)
                    .in('status', ['pending', 'auto_approved', 'manually_approved'])
                    .single();

                if (existing) {
                    results.existing.push(studentName);
                    continue;
                }

                // Check eligibility
                const { data: eligibilityData } = await supabase
                    .rpc('check_clearance_eligibility', {
                        p_student_id: student.id,
                        p_clearance_type_id: params.clearance_type_id,
                        p_academic_year_id: params.academic_year_id,
                        p_term_id: params.term_id || null,
                    })
                    .single();

                const eligibility = eligibilityData as unknown as EligibilityResult;

                if (!eligibility) {
                    results.failed.push(studentName);
                    continue;
                }

                // Determine if eligible based on threshold
                const meetsThreshold = eligibility.payment_percentage >= threshold;
                const status = meetsThreshold ? 'auto_approved' : 'pending';

                // Create clearance request
                const { error: createError } = await supabase
                    .from('clearance_requests')
                    .insert({
                        student_id: student.id,
                        clearance_type_id: params.clearance_type_id,
                        academic_year_id: params.academic_year_id,
                        term_id: params.term_id || null,
                        total_fees_amount: eligibility.total_fees,
                        amount_paid: eligibility.amount_paid,
                        outstanding_balance: eligibility.outstanding_balance,
                        payment_percentage: eligibility.payment_percentage,
                        status: status,
                        approved_by: meetsThreshold ? user.id : null,
                        approved_at: meetsThreshold ? new Date().toISOString() : null,
                        requested_by: user.id,
                    });

                if (createError) {
                    console.error(`Error creating clearance for ${student.student_id}:`, createError);
                    results.failed.push(studentName);
                } else {
                    if (meetsThreshold) {
                        results.approved.push(studentName);
                    } else {
                        results.pending.push(studentName);
                    }
                }
            } catch (error) {
                console.error(`Error processing student ${student.student_id}:`, error);
                results.failed.push(studentName);
            }
        }

        revalidatePath('/dashboard/fees');
        revalidatePath('/dashboard/management/clearances');

        return {
            success: true,
            results,
            summary: {
                total: students.length,
                approved: results.approved.length,
                pending: results.pending.length,
                existing: results.existing.length,
                failed: results.failed.length,
            },
            message: `Bulk clearance complete: ${results.approved.length} approved, ${results.pending.length} pending review, ${results.existing.length} already cleared, ${results.failed.length} failed`,
        };
    } catch (error) {
        console.error('Error in bulkApproveClearances:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Preview students eligible for bulk clearance
 */
export async function previewBulkClearance(params: BulkClearanceParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Get clearance type
        const { data: clearanceType } = await supabase
            .from('clearance_types')
            .select('*')
            .eq('id', params.clearance_type_id)
            .single();

        if (!clearanceType) {
            return { error: 'Clearance type not found' };
        }

        // Get students
        let studentsQuery = supabase
            .from('students')
            .select(`
                id,
                student_id,
                profiles (
                    first_name,
                    last_name
                ),
                classes (
                    name
                )
            `)
            .eq('is_active', true);

        if (params.class_id) {
            studentsQuery = studentsQuery.eq('class_id', params.class_id);
        }

        const { data: students } = await studentsQuery;

        if (!students || students.length === 0) {
            return { error: 'No students found' };
        }

        const threshold = params.minimum_payment_percentage || clearanceType.minimum_payment_percentage;
        const eligible = [];
        const ineligible = [];

        for (const student of students) {
            const { data: eligibilityData } = await supabase
                .rpc('check_clearance_eligibility', {
                    p_student_id: student.id,
                    p_clearance_type_id: params.clearance_type_id,
                    p_academic_year_id: params.academic_year_id,
                    p_term_id: params.term_id || null,
                })
                .single();

            const eligibility = eligibilityData as unknown as EligibilityResult;

            if (eligibility) {
                const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
                const studentClass = Array.isArray(student.classes) ? student.classes[0] : student.classes;

                const studentInfo = {
                    id: student.id,
                    student_id: student.student_id,
                    name: `${profile.first_name} ${profile.last_name}`,
                    class: studentClass?.name || 'N/A',
                    payment_percentage: eligibility.payment_percentage,
                    total_fees: eligibility.total_fees,
                    amount_paid: eligibility.amount_paid,
                    outstanding: eligibility.outstanding_balance,
                };

                if (eligibility.payment_percentage >= threshold) {
                    eligible.push(studentInfo);
                } else {
                    ineligible.push(studentInfo);
                }
            }
        }

        return {
            success: true,
            eligible,
            ineligible,
            threshold,
            clearance_type: clearanceType.display_name,
        };
    } catch (error) {
        console.error('Error in previewBulkClearance:', error);
        return { error: 'An unexpected error occurred' };
    }
}
