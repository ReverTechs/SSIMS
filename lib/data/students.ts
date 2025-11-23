import { createClient } from "@/lib/supabase/server";

export interface StudentProfile {
    studentId: string;
    className?: string;
    subjects?: string[];
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
    studentType?: "internal" | "external";
    guardianName?: string;
    guardianPhone?: string;
    guardianRelationship?: string;
}

/**
 * Fetch student profile data by student ID (UUID)
 */
export async function getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    const supabase = await createClient();

    // Fetch student with all related data
    const { data: studentData, error } = await supabase
        .from("students")
        .select(`
      id,
      date_of_birth,
      gender,
      student_type,
      address,
      phone_number,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      classes(name),
      student_subjects(subjects(name))
    `)
        .eq("id", studentId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching student:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            studentId,
            fullError: JSON.stringify(error, null, 2),
        });
        return null;
    }

    if (!studentData) {
        console.warn(`Student record not found for ID: ${studentId}`);
        return null;
    }

    // Extract subjects array
    const subjects = Array.isArray(studentData.student_subjects)
        ? studentData.student_subjects
            .map((ss: any) => ss?.subjects?.name)
            .filter((name: string | undefined): name is string => Boolean(name))
        : [];

    return {
        studentId: studentData.id,
        className: (studentData.classes as any)?.name || undefined,
        subjects: subjects.length > 0 ? subjects : undefined,
        phoneNumber: studentData.phone_number || undefined,
        address: studentData.address || undefined,
        dateOfBirth: studentData.date_of_birth || undefined,
        gender: studentData.gender || undefined,
        studentType: studentData.student_type || undefined,
        guardianName: studentData.guardian_name || undefined,
        guardianPhone: studentData.guardian_phone || undefined,
        guardianRelationship: studentData.guardian_relationship || undefined,
    };
}

/**
 * Fetch current user's student profile
 */
export async function getCurrentStudentProfile(): Promise<StudentProfile | null> {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    return getStudentProfile(user.id);
}
