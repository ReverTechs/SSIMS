'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface BulkAssignFeesParams {
    academic_year_id: string;
    term_id: string;
}

export async function bulkAssignFees(params: BulkAssignFeesParams) {
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
            return { error: 'Only admins can assign fees' };
        }

        // Get fee structures for this term
        const { data: feeStructures, error: structuresError } = await supabase
            .from('fee_structures')
            .select('*')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id)
            .eq('is_active', true);

        if (structuresError) {
            console.error('Error fetching fee structures:', structuresError);
            return { error: 'Failed to fetch fee structures' };
        }

        if (!feeStructures || feeStructures.length === 0) {
            return { error: 'No active fee structures found for this term. Please create fee structures first.' };
        }

        // Separate internal and external fee structures
        const internalStructure = feeStructures.find(fs => fs.student_type === 'internal');
        const externalStructure = feeStructures.find(fs => fs.student_type === 'external');

        if (!internalStructure && !externalStructure) {
            return { error: 'No fee structures found. Please create at least one fee structure.' };
        }

        // Get all students grouped by student_type
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('id, student_type');

        if (studentsError) {
            console.error('Error fetching students:', studentsError);
            return { error: 'Failed to fetch students' };
        }

        if (!students || students.length === 0) {
            return { error: 'No students found in the system' };
        }

        // Check for existing assignments
        const { data: existingAssignments } = await supabase
            .from('student_fees')
            .select('student_id')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        const existingStudentIds = new Set(existingAssignments?.map(a => a.student_id) || []);

        // Prepare bulk insert data
        const studentFeesData = [];
        let internalCount = 0;
        let externalCount = 0;
        let skippedCount = 0;

        for (const student of students) {
            // Skip if already assigned
            if (existingStudentIds.has(student.id)) {
                skippedCount++;
                continue;
            }

            const feeStructure = student.student_type === 'internal' ? internalStructure : externalStructure;

            if (!feeStructure) {
                // Skip students without matching fee structure
                continue;
            }

            studentFeesData.push({
                student_id: student.id,
                fee_structure_id: feeStructure.id,
                academic_year_id: params.academic_year_id,
                term_id: params.term_id,
                total_amount: feeStructure.total_amount,
                amount_paid: 0,
                balance: feeStructure.total_amount,
                discount_amount: 0,
                status: 'unpaid',
                due_date: feeStructure.due_date,
                assigned_by: user.id,
            });

            if (student.student_type === 'internal') {
                internalCount++;
            } else {
                externalCount++;
            }
        }

        if (studentFeesData.length === 0) {
            if (skippedCount > 0) {
                return { error: `All ${skippedCount} students already have fees assigned for this term` };
            }
            return { error: 'No students to assign fees to' };
        }

        // Batch insert student fees
        const { error: insertError } = await supabase
            .from('student_fees')
            .insert(studentFeesData);

        if (insertError) {
            console.error('Error inserting student fees:', insertError);
            return { error: 'Failed to assign fees to students' };
        }

        // Calculate total expected revenue
        const totalAmount = studentFeesData.reduce((sum, fee) => sum + fee.total_amount, 0);

        revalidatePath('/dashboard/management/fee-structures');

        return {
            success: true,
            internal_count: internalCount,
            external_count: externalCount,
            total_count: internalCount + externalCount,
            skipped_count: skippedCount,
            total_amount: totalAmount,
            message: `Successfully assigned fees to ${internalCount + externalCount} students (${internalCount} internal, ${externalCount} external)${skippedCount > 0 ? `. Skipped ${skippedCount} students who already have fees assigned.` : ''}`,
        };
    } catch (error) {
        console.error('Error in bulkAssignFees:', error);
        return { error: 'An unexpected error occurred' };
    }
}

// Preview function - shows what will happen without actually assigning
export async function previewBulkAssignment(params: BulkAssignFeesParams) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Get fee structures for this term
        const { data: feeStructures } = await supabase
            .from('fee_structures')
            .select('*')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id)
            .eq('is_active', true);

        if (!feeStructures || feeStructures.length === 0) {
            return { error: 'No active fee structures found for this term' };
        }

        const internalStructure = feeStructures.find(fs => fs.student_type === 'internal');
        const externalStructure = feeStructures.find(fs => fs.student_type === 'external');

        // Get all students
        const { data: students } = await supabase
            .from('students')
            .select('id, student_type');

        if (!students || students.length === 0) {
            return { error: 'No students found' };
        }

        // Check existing assignments
        const { data: existingAssignments } = await supabase
            .from('student_fees')
            .select('student_id')
            .eq('academic_year_id', params.academic_year_id)
            .eq('term_id', params.term_id);

        const existingStudentIds = new Set(existingAssignments?.map(a => a.student_id) || []);

        // Count students
        const internalStudents = students.filter(s => s.student_type === 'internal' && !existingStudentIds.has(s.id));
        const externalStudents = students.filter(s => s.student_type === 'external' && !existingStudentIds.has(s.id));

        const internalAmount = internalStructure ? internalStructure.total_amount : 0;
        const externalAmount = externalStructure ? externalStructure.total_amount : 0;

        const totalExpected = (internalStudents.length * internalAmount) + (externalStudents.length * externalAmount);

        return {
            success: true,
            preview: {
                internal: {
                    count: internalStudents.length,
                    amount_per_student: internalAmount,
                    total: internalStudents.length * internalAmount,
                    structure_name: internalStructure?.name || 'Not created',
                },
                external: {
                    count: externalStudents.length,
                    amount_per_student: externalAmount,
                    total: externalStudents.length * externalAmount,
                    structure_name: externalStructure?.name || 'Not created',
                },
                total_students: internalStudents.length + externalStudents.length,
                total_expected_revenue: totalExpected,
                already_assigned: existingStudentIds.size,
            },
        };
    } catch (error) {
        console.error('Error in previewBulkAssignment:', error);
        return { error: 'An unexpected error occurred' };
    }
}
