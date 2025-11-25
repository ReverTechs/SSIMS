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

export interface StudentListItem {
    id: string;
    name: string;
    email: string;
    phone?: string;
    class?: string;
    subjects: string[];
    gender?: "male" | "female";
    dateOfBirth?: string;
    address?: string;
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

/**
 * Fetch all students for admin dashboards
 */
export async function getAllStudents(): Promise<StudentListItem[]> {
    const supabase = await createClient();

    const { data: studentsData, error } = await supabase
        .from("students")
        .select(`
      id,
      created_at,
      date_of_birth,
      gender,
      address,
      phone_number,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      classes(name),
      student_subjects(subjects(name)),
      profiles(email, first_name, middle_name, last_name)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching students list:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: JSON.stringify(error, null, 2),
        });
        return [];
    }

    if (!studentsData) {
        return [];
    }

    return studentsData.map((student) => {
        const profile = student.profiles as any;
        const nameParts = [
            profile?.first_name,
            profile?.middle_name,
            profile?.last_name,
        ].filter(Boolean);

        const subjects = Array.isArray(student.student_subjects)
            ? student.student_subjects
                .map((ss: any) => ss?.subjects?.name)
                .filter((name: string | undefined): name is string => Boolean(name))
            : [];

        return {
            id: student.id,
            name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Student",
            email: profile?.email || "",
            phone: student.phone_number || undefined,
            class: (student.classes as any)?.name || undefined,
            subjects,
            gender: student.gender || undefined,
            dateOfBirth: student.date_of_birth || undefined,
            address: student.address || undefined,
            guardianName: student.guardian_name || undefined,
            guardianPhone: student.guardian_phone || undefined,
            guardianRelationship: student.guardian_relationship || undefined,
        };
    });
}
