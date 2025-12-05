'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    AssignAidToStudentInput,
    BulkAssignAidInput,
    StudentFinancialAid,
    StudentFinancialAidWithDetails,
    AssignAidResponse,
    BulkAssignAidResponse,
} from '@/types/fees';

/**
 * Assign financial aid to a student
 */
export async function assignAidToStudent(input: AssignAidToStudentInput): Promise<AssignAidResponse | { error: string }> {
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
            return { error: 'Only admins can assign financial aid' };
        }

        // Validate student exists
        const { data: student } = await supabase
            .from('students')
            .select('id, student_id')
            .eq('id', input.student_id)
            .single();

        if (!student) {
            return { error: 'Student not found' };
        }

        // Get aid type details
        const { data: aidType } = await supabase
            .from('financial_aid_types')
            .select('*, sponsors(id, name)')
            .eq('id', input.financial_aid_type_id)
            .single();

        if (!aidType || !aidType.is_active) {
            return { error: 'Financial aid type not found or inactive' };
        }

        const sponsor = Array.isArray(aidType.sponsors) ? aidType.sponsors[0] : aidType.sponsors;

        // Check for existing active aid for same sponsor and period
        const { data: existingAid } = await supabase
            .from('student_financial_aid')
            .select('id')
            .eq('student_id', input.student_id)
            .eq('sponsor_id', sponsor.id)
            .eq('academic_year_id', input.academic_year_id)
            .eq('term_id', input.term_id || null)
            .in('status', ['pending', 'approved', 'active'])
            .single();

        if (existingAid) {
            return { error: 'Student already has active aid from this sponsor for this period' };
        }

        // Use aid type defaults or overrides from input
        const coverageType = input.coverage_type || aidType.coverage_type;
        const coveragePercentage = input.coverage_percentage || aidType.coverage_percentage;
        const coverageAmount = input.coverage_amount || aidType.coverage_amount;
        const coveredItems = input.covered_items || aidType.covered_items;

        // Create aid award
        const { data: aidAward, error: createError } = await supabase
            .from('student_financial_aid')
            .insert({
                student_id: input.student_id,
                financial_aid_type_id: input.financial_aid_type_id,
                sponsor_id: sponsor.id,
                academic_year_id: input.academic_year_id,
                term_id: input.term_id || null,
                coverage_type: coverageType,
                coverage_percentage: coveragePercentage,
                coverage_amount: coverageAmount,
                covered_items: coveredItems,
                valid_from: input.valid_from,
                valid_until: input.valid_until,
                conditions: input.conditions,
                notes: input.notes,
                status: 'approved', // Auto-approve for now
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                assigned_by: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error assigning aid:', createError);
            return { error: 'Failed to assign financial aid' };
        }

        revalidatePath('/dashboard/management/financial-aid');
        revalidatePath('/dashboard/fees');

        return {
            success: true,
            aid_award: aidAward as StudentFinancialAid,
            message: `${aidType.name} assigned to student ${student.student_id} successfully`,
        };
    } catch (error) {
        console.error('Error in assignAidToStudent:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Bulk assign financial aid to multiple students
 */
export async function bulkAssignAid(input: BulkAssignAidInput): Promise<BulkAssignAidResponse | { error: string }> {
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
            return { error: 'Only admins can assign financial aid' };
        }

        // Get aid type details
        const { data: aidType } = await supabase
            .from('financial_aid_types')
            .select('*, sponsors(id, name)')
            .eq('id', input.financial_aid_type_id)
            .single();

        if (!aidType || !aidType.is_active) {
            return { error: 'Financial aid type not found or inactive' };
        }

        const sponsor = Array.isArray(aidType.sponsors) ? aidType.sponsors[0] : aidType.sponsors;

        let assignedCount = 0;
        let failedCount = 0;

        // Assign aid to each student
        for (const studentId of input.student_ids) {
            // Check if student already has aid from this sponsor
            const { data: existingAid } = await supabase
                .from('student_financial_aid')
                .select('id')
                .eq('student_id', studentId)
                .eq('sponsor_id', sponsor.id)
                .eq('academic_year_id', input.academic_year_id)
                .eq('term_id', input.term_id || null)
                .in('status', ['pending', 'approved', 'active'])
                .single();

            if (existingAid) {
                failedCount++;
                continue; // Skip this student
            }

            // Create aid award
            const { error: createError } = await supabase
                .from('student_financial_aid')
                .insert({
                    student_id: studentId,
                    financial_aid_type_id: input.financial_aid_type_id,
                    sponsor_id: sponsor.id,
                    academic_year_id: input.academic_year_id,
                    term_id: input.term_id || null,
                    coverage_type: aidType.coverage_type,
                    coverage_percentage: aidType.coverage_percentage,
                    coverage_amount: aidType.coverage_amount,
                    covered_items: aidType.covered_items,
                    valid_from: input.valid_from,
                    valid_until: input.valid_until,
                    conditions: input.conditions,
                    notes: input.notes,
                    status: 'approved',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    assigned_by: user.id,
                });

            if (createError) {
                console.error('Error assigning aid to student:', studentId, createError);
                failedCount++;
            } else {
                assignedCount++;
            }
        }

        revalidatePath('/dashboard/management/financial-aid');
        revalidatePath('/dashboard/fees');

        return {
            success: true,
            assigned_count: assignedCount,
            failed_count: failedCount,
            total_aid_amount: 0, // Will be calculated when invoices are generated
            message: `Successfully assigned aid to ${assignedCount} student(s). ${failedCount > 0 ? `${failedCount} failed.` : ''}`,
        };
    } catch (error) {
        console.error('Error in bulkAssignAid:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get student's financial aid awards
 */
export async function getStudentAid(
    studentId: string,
    academicYearId?: string,
    termId?: string
) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('student_financial_aid')
            .select(`
                *,
                sponsors (
                    id,
                    name,
                    sponsor_type
                ),
                financial_aid_types (
                    id,
                    name
                ),
                academic_years (
                    id,
                    name
                ),
                terms (
                    id,
                    name
                )
            `)
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (academicYearId) {
            query = query.eq('academic_year_id', academicYearId);
        }

        if (termId) {
            query = query.eq('term_id', termId);
        }

        const { data: aidAwards, error } = await query;

        if (error) {
            console.error('Error fetching student aid:', error);
            return { error: 'Failed to fetch student aid' };
        }

        // Transform to include related details
        const awardsWithDetails: StudentFinancialAidWithDetails[] = (aidAwards || []).map((award: any) => ({
            ...award,
            sponsor: Array.isArray(award.sponsors) ? award.sponsors[0] : award.sponsors,
            financial_aid_type: Array.isArray(award.financial_aid_types) ? award.financial_aid_types[0] : award.financial_aid_types,
            academic_year: Array.isArray(award.academic_years) ? award.academic_years[0] : award.academic_years,
            term: award.terms ? (Array.isArray(award.terms) ? award.terms[0] : award.terms) : undefined,
        }));

        return {
            success: true,
            aid_awards: awardsWithDetails,
        };
    } catch (error) {
        console.error('Error in getStudentAid:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Update aid status (approve, suspend, complete, reject)
 */
export async function updateAidStatus(
    aidId: string,
    status: 'approved' | 'active' | 'suspended' | 'completed' | 'rejected',
    rejectionReason?: string
) {
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
            return { error: 'Only admins can update aid status' };
        }

        const updateData: any = { status };

        if (status === 'approved') {
            updateData.approved_by = user.id;
            updateData.approved_at = new Date().toISOString();
        } else if (status === 'rejected') {
            updateData.rejection_reason = rejectionReason;
        }

        const { error: updateError } = await supabase
            .from('student_financial_aid')
            .update(updateData)
            .eq('id', aidId);

        if (updateError) {
            console.error('Error updating aid status:', updateError);
            return { error: 'Failed to update aid status' };
        }

        revalidatePath('/dashboard/management/financial-aid');
        revalidatePath('/dashboard/fees');

        return {
            success: true,
            message: `Aid status updated to ${status}`,
        };
    } catch (error) {
        console.error('Error in updateAidStatus:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Revoke financial aid from a student
 */
export async function revokeAid(aidId: string, reason: string) {
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
            return { error: 'Only admins can revoke financial aid' };
        }

        // Update status to suspended with reason
        const { error: updateError } = await supabase
            .from('student_financial_aid')
            .update({
                status: 'suspended',
                notes: reason,
            })
            .eq('id', aidId);

        if (updateError) {
            console.error('Error revoking aid:', updateError);
            return { error: 'Failed to revoke aid' };
        }

        revalidatePath('/dashboard/management/financial-aid');
        revalidatePath('/dashboard/fees');

        return {
            success: true,
            message: 'Financial aid revoked successfully',
        };
    } catch (error) {
        console.error('Error in revokeAid:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get all aid awards with filtering
 */
export async function getAllAidAwards(filters?: {
    sponsor_id?: string;
    academic_year_id?: string;
    term_id?: string;
    status?: string;
}) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('student_financial_aid')
            .select(`
                *,
                students (
                    id,
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    )
                ),
                sponsors (
                    id,
                    name,
                    sponsor_type
                ),
                financial_aid_types (
                    id,
                    name
                ),
                academic_years (
                    id,
                    name
                ),
                terms (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters?.sponsor_id) {
            query = query.eq('sponsor_id', filters.sponsor_id);
        }

        if (filters?.academic_year_id) {
            query = query.eq('academic_year_id', filters.academic_year_id);
        }

        if (filters?.term_id) {
            query = query.eq('term_id', filters.term_id);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data: aidAwards, error } = await query;

        if (error) {
            console.error('Error fetching aid awards:', error);
            return { error: 'Failed to fetch aid awards' };
        }

        // Transform to include related details
        const awardsWithDetails: StudentFinancialAidWithDetails[] = (aidAwards || []).map((award: any) => {
            const student = Array.isArray(award.students) ? award.students[0] : award.students;
            const profile = student?.profiles ? (Array.isArray(student.profiles) ? student.profiles[0] : student.profiles) : null;

            return {
                ...award,
                student: {
                    id: student?.id || '',
                    student_id: student?.student_id || '',
                    full_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
                },
                sponsor: Array.isArray(award.sponsors) ? award.sponsors[0] : award.sponsors,
                financial_aid_type: Array.isArray(award.financial_aid_types) ? award.financial_aid_types[0] : award.financial_aid_types,
                academic_year: Array.isArray(award.academic_years) ? award.academic_years[0] : award.academic_years,
                term: award.terms ? (Array.isArray(award.terms) ? award.terms[0] : award.terms) : undefined,
            };
        });

        return {
            success: true,
            aid_awards: awardsWithDetails,
        };
    } catch (error) {
        console.error('Error in getAllAidAwards:', error);
        return { error: 'An unexpected error occurred' };
    }
}
