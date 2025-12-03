'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Enrollment } from "@/types";

export async function enrollStudent(data: {
    studentId: string;
    classId: string;
    academicYearId: string;
    status?: 'active' | 'completed' | 'dropped' | 'transferred' | 'expelled';
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('enrollments')
        .insert({
            student_id: data.studentId,
            class_id: data.classId,
            academic_year_id: data.academicYearId,
            status: data.status || 'active'
        });

    if (error) {
        console.error('Error enrolling student:', error);
        throw new Error('Failed to enroll student');
    }

    revalidatePath('/dashboard/students');
    revalidatePath(`/dashboard/students/${data.studentId}`);
}

export async function getStudentEnrollments(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('enrollments')
        .select(`
      *,
      academic_years (
        name,
        start_date,
        end_date
      ),
      classes (
        name
      )
    `)
        .eq('student_id', studentId)
        .order('academic_years(start_date)', { ascending: false });

    if (error) {
        console.error('Error fetching student enrollments:', error);
        return [];
    }

    return data.map((enrollment: any) => ({
        id: enrollment.id,
        studentId: enrollment.student_id,
        classId: enrollment.class_id,
        academicYearId: enrollment.academic_year_id,
        enrolledAt: new Date(enrollment.enrolled_at),
        status: enrollment.status,
        academicYear: {
            name: enrollment.academic_years.name,
            startDate: enrollment.academic_years.start_date,
            endDate: enrollment.academic_years.end_date
        },
        className: enrollment.classes.name
    }));
}

export async function promoteStudents(data: {
    studentIds: string[];
    targetClassId: string;
    targetYearId: string;
}) {
    const supabase = await createClient();

    // 1. Verify target year exists
    const { data: targetYear, error: yearError } = await supabase
        .from('academic_years')
        .select('is_active')
        .eq('id', data.targetYearId)
        .single();

    if (yearError || !targetYear) {
        throw new Error('Invalid target academic year');
    }

    // 2. Create enrollments
    const enrollments = data.studentIds.map(studentId => ({
        student_id: studentId,
        class_id: data.targetClassId,
        academic_year_id: data.targetYearId,
        status: 'active'
    }));

    const { error: enrollError } = await supabase
        .from('enrollments')
        .upsert(enrollments, { onConflict: 'student_id, academic_year_id' });

    if (enrollError) {
        console.error('Error promoting students:', enrollError);
        throw new Error('Failed to promote students');
    }

    revalidatePath('/dashboard/students');
    revalidatePath('/dashboard/admin/promotions');
}
