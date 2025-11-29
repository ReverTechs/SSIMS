'use server';

import { createClient } from '@/utils/supabase/server';
import { enrollStudentInDefaultSubjects } from './student-subjects';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

/**
 * Syncs a student's subjects based on their current class and stream.
 * This will enroll them in all compulsory subjects they're missing.
 * 
 * @param studentId - The student's UUID
 * @param termId - Optional term ID for term-specific enrollment
 * @param dryRun - If true, returns what would be changed without making changes
 * @returns ActionResult with sync details
 */
export async function syncStudentSubjects(
    studentId: string,
    termId?: string,
    dryRun: boolean = false
): Promise<ActionResult<{ enrolledCount: number }>> {
    const supabase = await createClient();

    try {
        console.log(`[syncStudentSubjects] Starting sync for student ${studentId}, dryRun: ${dryRun}`);

        // 1. Fetch Student Details (Class and Stream)
        const { data: student, error } = await supabase
            .from('students')
            .select('class_id, stream')
            .eq('id', studentId)
            .single();

        if (error || !student) {
            console.error('[syncStudentSubjects] Error fetching student:', error);
            return {
                success: false,
                error: 'Student not found. Please verify the student ID.'
            };
        }

        if (!student.class_id) {
            return {
                success: false,
                error: 'Student is not assigned to a class. Please assign a class first.'
            };
        }

        console.log(`[syncStudentSubjects] Student class: ${student.class_id}, stream: ${student.stream || 'none'}`);

        // 2. If dry run, we'd need to fetch what WOULD be enrolled
        if (dryRun) {
            // For now, just return a message
            return {
                success: true,
                data: { enrolledCount: 0 },
                message: 'Dry run mode - no changes made. Use the actual sync to enroll.'
            };
        }

        // 3. Run Enrollment Logic
        const result = await enrollStudentInDefaultSubjects(
            studentId,
            student.class_id,
            student.stream || undefined,
            termId
        );

        if (result.success) {
            revalidatePath(`/dashboard/students/${studentId}`);
            revalidatePath('/dashboard/students');
            console.log(`[syncStudentSubjects] Sync completed successfully`);
        }

        return result;
    } catch (error) {
        console.error('[syncStudentSubjects] Unexpected error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred during sync. Please try again.'
        };
    }
}
