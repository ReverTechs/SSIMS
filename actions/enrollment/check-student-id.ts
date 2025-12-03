'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Check if a Student ID is already in use
 * Used for client-side validation during registration
 */
export async function checkStudentIdAvailability(studentId: string): Promise<{ available: boolean; error?: string }> {
    if (!studentId || studentId.trim() === '') {
        return { available: false, error: 'Student ID is required' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('students')
        .select('id, student_id')
        .eq('student_id', studentId)
        .maybeSingle();

    if (error) {
        console.error('Error checking Student ID availability:', error);
        return { available: false, error: 'Failed to check Student ID availability' };
    }

    return { available: !data };
}
