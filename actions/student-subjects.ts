'use server';

import { createClient } from '@/utils/supabase/server';
import { getActiveAcademicYear } from './academic-years';
import { revalidatePath } from 'next/cache';
import type { ActionResult } from '@/types';

/**
 * Enrolls a student in default compulsory subjects based on their class level and stream.
 * 
 * @param studentId - The student's UUID
 * @param classId - The class UUID
 * @param stream - Optional stream for senior students
 * @param termId - Optional term ID for term-specific enrollment
 * @returns ActionResult with enrollment details
 */
export async function enrollStudentInDefaultSubjects(
    studentId: string,
    classId: string,
    stream?: string,
    termId?: string
): Promise<ActionResult<{ enrolledCount: number }>> {
    const supabase = await createClient();

    try {
        console.log(`[enrollStudentInDefaultSubjects] Starting for student ${studentId}, class ${classId}, stream ${stream || 'none'}`);

        // 1. Get Active Academic Year
        const activeYear = await getActiveAcademicYear();
        if (!activeYear) {
            console.error('[enrollStudentInDefaultSubjects] No active academic year found');
            return {
                success: false,
                error: 'No active academic year found. Please contact an administrator.'
            };
        }

        console.log(`[enrollStudentInDefaultSubjects] Using academic year: ${activeYear.name} (${activeYear.id})`);

        // 2. Determine Curriculum Level from Class
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('grade_level, name')
            .eq('id', classId)
            .single();

        if (classError || !classData) {
            console.error('[enrollStudentInDefaultSubjects] Error fetching class:', classError);
            return {
                success: false,
                error: 'Class not found. Please verify the class selection.'
            };
        }

        // Map grade_level to Curriculum Level
        const level: 'junior' | 'senior' = classData.grade_level <= 2 ? 'junior' : 'senior';
        console.log(`[enrollStudentInDefaultSubjects] Class ${classData.name} is ${level} level (grade ${classData.grade_level})`);

        // 3. Fetch Compulsory Subjects
        let query = supabase
            .from('curriculum_subjects')
            .select('subject_id, subjects(name, code)')
            .eq('level', level)
            .eq('is_compulsory', true);

        if (level === 'senior' && stream) {
            // For seniors, filter by stream OR subjects that apply to all streams (stream is null)
            query = query.or(`stream.eq.${stream},stream.is.null`);
            console.log(`[enrollStudentInDefaultSubjects] Fetching senior subjects for stream: ${stream}`);
        } else {
            // For juniors or no stream specified, just get general compulsory ones
            query = query.is('stream', null);
            console.log(`[enrollStudentInDefaultSubjects] Fetching junior compulsory subjects`);
        }

        const { data: subjects, error: subjectsError } = await query;

        if (subjectsError) {
            console.error('[enrollStudentInDefaultSubjects] Error fetching curriculum subjects:', subjectsError);
            return {
                success: false,
                error: 'Failed to fetch curriculum subjects. Please try again.'
            };
        }

        if (!subjects || subjects.length === 0) {
            console.warn('[enrollStudentInDefaultSubjects] No compulsory subjects found');
            return {
                success: true,
                data: { enrolledCount: 0 },
                message: 'No compulsory subjects found for this class level.'
            };
        }

        console.log(`[enrollStudentInDefaultSubjects] Found ${subjects.length} compulsory subjects`);

        // 4. Get current user for audit trail
        const { data: { user } } = await supabase.auth.getUser();
        const enrolledBy = user?.id;

        // 5. Enroll Student
        const enrollments = subjects.map(sub => ({
            student_id: studentId,
            subject_id: sub.subject_id,
            academic_year_id: activeYear.id,
            term_id: termId || null,
            is_optional: false,
            enrolled_by: enrolledBy || null
        }));

        const { error: enrollError, data: enrollData } = await supabase
            .from('student_subjects')
            .upsert(enrollments, {
                onConflict: 'student_id,subject_id,academic_year_id,term_id',
                ignoreDuplicates: false
            })
            .select();

        if (enrollError) {
            console.error('[enrollStudentInDefaultSubjects] Error enrolling student in subjects:', enrollError);
            return {
                success: false,
                error: 'Failed to enroll student in subjects. Please try again.'
            };
        }

        const enrolledCount = enrollData?.length || enrollments.length;
        console.log(`[enrollStudentInDefaultSubjects] Successfully enrolled in ${enrolledCount} subjects`);

        revalidatePath(`/dashboard/students/${studentId}`);
        revalidatePath('/dashboard/students');

        return {
            success: true,
            data: { enrolledCount },
            message: `Successfully enrolled in ${enrolledCount} compulsory subject${enrolledCount !== 1 ? 's' : ''}.`
        };

    } catch (error) {
        console.error('[enrollStudentInDefaultSubjects] Unexpected error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred. Please contact support.'
        };
    }
}

/**
 * Fetches enrolled subjects for a student in a specific academic year and optionally term.
 * 
 * @param studentId - The student's UUID
 * @param academicYearId - Optional academic year ID (defaults to active year)
 * @param termId - Optional term ID for term-specific subjects
 * @returns Array of student subjects with details
 */
export async function getStudentSubjects(
    studentId: string,
    academicYearId?: string,
    termId?: string
) {
    const supabase = await createClient();

    try {
        // If no year specified, use active year
        let yearId = academicYearId;
        if (!yearId) {
            const activeYear = await getActiveAcademicYear();
            if (!activeYear) {
                console.warn('[getStudentSubjects] No active academic year found');
                return [];
            }
            yearId = activeYear.id;
        }

        let query = supabase
            .from('student_subjects')
            .select(`
                *,
                subject:subjects (
                    id,
                    name,
                    code,
                    department:departments(name)
                ),
                academic_year:academic_years(name),
                term:terms(name)
            `)
            .eq('student_id', studentId)
            .eq('academic_year_id', yearId);

        // Filter by term if specified
        if (termId) {
            query = query.eq('term_id', termId);
        }

        const { data, error } = await query.order('enrolled_at', { ascending: false });

        if (error) {
            console.error('[getStudentSubjects] Error fetching student subjects:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('[getStudentSubjects] Unexpected error:', error);
        return [];
    }
}

/**
 * Adds a single subject to a student's enrollment.
 * 
 * @param studentId - The student's UUID
 * @param subjectId - The subject's UUID
 * @param termId - Optional term ID for term-specific enrollment
 * @returns ActionResult
 */
export async function addStudentSubject(
    studentId: string,
    subjectId: string,
    termId?: string
): Promise<ActionResult> {
    const supabase = await createClient();

    try {
        const activeYear = await getActiveAcademicYear();
        if (!activeYear) {
            return {
                success: false,
                error: 'No active academic year found.'
            };
        }

        // Get current user for audit trail
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('student_subjects')
            .insert({
                student_id: studentId,
                subject_id: subjectId,
                academic_year_id: activeYear.id,
                term_id: termId || null,
                is_optional: true, // Manual additions are usually optional/electives
                enrolled_by: user?.id || null
            });

        if (error) {
            // Check for duplicate enrollment
            if (error.code === '23505') {
                return {
                    success: false,
                    error: 'Student is already enrolled in this subject.'
                };
            }
            console.error('[addStudentSubject] Error:', error);
            return {
                success: false,
                error: 'Failed to add subject. Please try again.'
            };
        }

        revalidatePath(`/dashboard/students/${studentId}`);
        revalidatePath('/dashboard/students');

        return {
            success: true,
            message: 'Subject added successfully.'
        };
    } catch (error) {
        console.error('[addStudentSubject] Unexpected error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.'
        };
    }
}

/**
 * Removes a subject from a student's enrollment.
 * 
 * @param enrollmentId - The enrollment record ID
 * @returns ActionResult
 */
export async function removeStudentSubject(enrollmentId: string): Promise<ActionResult> {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('student_subjects')
            .delete()
            .eq('id', enrollmentId);

        if (error) {
            console.error('[removeStudentSubject] Error:', error);
            return {
                success: false,
                error: 'Failed to remove subject. Please try again.'
            };
        }

        revalidatePath('/dashboard/students');

        return {
            success: true,
            message: 'Subject removed successfully.'
        };
    } catch (error) {
        console.error('[removeStudentSubject] Unexpected error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred.'
        };
    }
}

/**
 * Gets complete enrollment history for a student across all years and terms.
 * 
 * @param studentId - The student's UUID
 * @returns Array of enrollments grouped by year and term
 */
export async function getStudentSubjectHistory(studentId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('student_subjects')
            .select(`
                *,
                subject:subjects (
                    id,
                    name,
                    code
                ),
                academic_year:academic_years (
                    id,
                    name,
                    start_date,
                    end_date
                ),
                term:terms (
                    id,
                    name,
                    start_date,
                    end_date
                )
            `)
            .eq('student_id', studentId)
            .order('enrolled_at', { ascending: false });

        if (error) {
            console.error('[getStudentSubjectHistory] Error:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('[getStudentSubjectHistory] Unexpected error:', error);
        return [];
    }
}
