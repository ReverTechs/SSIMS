import { createClient } from "@/lib/supabase/server";

import { StreamType } from "@/types";

export interface StudentProfile {
  studentId: string;
  className?: string;
  subjects?: string[];
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "male" | "female";
  studentType?: "internal" | "external";
  guardianEmail?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  guardianDetails?: {
    name: string;
    email: string;
    phone?: string;
    alternativePhone?: string;
    address?: string;
    occupation?: string;
    workplace?: string;
  };
  stream?: StreamType;
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
  guardianEmail?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  guardianDetails?: {
    name: string;
    email: string;
    phone?: string;
    alternativePhone?: string;
    address?: string;
    occupation?: string;
    workplace?: string;
  };
  studentType?: "internal" | "external";
  stream?: StreamType;
}

/**
 * Fetch student profile data by student ID (UUID)
 */
export async function getStudentProfile(
  studentId: string
): Promise<StudentProfile | null> {
  const supabase = await createClient();

  // Fetch student with all related data
  const { data: studentData, error } = await supabase
    .from("students")
    .select(
      `
      id,
      date_of_birth,
      gender,
      student_type,
      address,
      phone_number,
      guardian_email,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      stream,
      classes(name),
      student_subjects(subjects(name))
    `
    )
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

  // Fetch guardian details if guardian_email is provided
  let guardianDetails = undefined;
  if (studentData.guardian_email) {
    const { data: guardianData } = await supabase
      .from("guardians")
      .select(
        `
                id,
                phone_number,
                alternative_phone,
                address,
                occupation,
                workplace,
                profiles(email, first_name, middle_name, last_name)
            `
      )
      .eq(
        "id",
        supabase
          .from("profiles")
          .select("id")
          .eq("email", studentData.guardian_email)
          .single()
      )
      .maybeSingle();

    // Alternative: Direct query using email join
    const { data: guardianByEmail } = await supabase
      .from("profiles")
      .select(
        `
                id,
                email,
                first_name,
                middle_name,
                last_name,
                guardians(
                    phone_number,
                    alternative_phone,
                    address,
                    occupation,
                    workplace
                )
            `
      )
      .eq("email", studentData.guardian_email)
      .maybeSingle();

    if (guardianByEmail && guardianByEmail.guardians) {
      const guardian = Array.isArray(guardianByEmail.guardians)
        ? guardianByEmail.guardians[0]
        : guardianByEmail.guardians;
      const nameParts = [
        guardianByEmail.first_name,
        guardianByEmail.middle_name,
        guardianByEmail.last_name,
      ].filter(Boolean);

      guardianDetails = {
        name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Guardian",
        email: guardianByEmail.email,
        phone: guardian?.phone_number,
        alternativePhone: guardian?.alternative_phone,
        address: guardian?.address,
        occupation: guardian?.occupation,
        workplace: guardian?.workplace,
      };
    }
  }

  // Prefer enrolled class from active enrollment (new academic year/enrollment system)
  let enrolledClassName: string | undefined = undefined;
  try {
    const { data: activeYear } = await supabase
      .from("academic_years")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    const activeYearId = (activeYear as any)?.id;
    if (activeYearId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select(`class_id, classes(name)`)
        .eq("student_id", studentId)
        .eq("academic_year_id", activeYearId)
        .eq("status", "active")
        .maybeSingle();

      enrolledClassName = (enrollment as any)?.classes?.name;
    }
  } catch (err) {
    console.warn("Error fetching active enrollment for student profile:", err);
  }

  return {
    studentId: studentData.id,
    className:
      enrolledClassName || (studentData.classes as any)?.name || undefined,
    subjects: subjects.length > 0 ? subjects : undefined,
    phoneNumber: studentData.phone_number || undefined,
    address: studentData.address || undefined,
    dateOfBirth: studentData.date_of_birth || undefined,
    gender: studentData.gender || undefined,
    studentType: studentData.student_type || undefined,
    guardianEmail: studentData.guardian_email || undefined,
    guardianName: studentData.guardian_name || undefined,
    guardianPhone: studentData.guardian_phone || undefined,
    guardianRelationship: studentData.guardian_relationship || undefined,
    guardianDetails,
    stream: studentData.stream || undefined,
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
    .select(
      `
      id,
      created_at,
      date_of_birth,
      gender,
      student_type,
      address,
      phone_number,
      guardian_email,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      classes(name),
      student_subjects(subjects(name)),
      profiles(email, first_name, middle_name, last_name)
    `
    )
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

  // Attempt to fetch active academic year and enrollments in bulk for these students
  let enrollmentMap: Record<string, string | undefined> = {};
  try {
    const studentIds = (studentsData as any[]).map((s) => s.id).filter(Boolean);
    if (studentIds.length > 0) {
      const { data: activeYear } = await supabase
        .from("academic_years")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      const activeYearId = (activeYear as any)?.id;
      if (activeYearId) {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("student_id, class_id, classes(name)")
          .in("student_id", studentIds)
          .eq("academic_year_id", activeYearId)
          .eq("status", "active");

        if (Array.isArray(enrollments)) {
          enrollments.forEach((e: any) => {
            if (e?.student_id) {
              enrollmentMap[e.student_id] = e?.classes?.name;
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error fetching enrollments for students list:", err);
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
      class:
        enrollmentMap[student.id] ||
        (student.classes as any)?.name ||
        undefined,
      subjects,
      gender: student.gender || undefined,
      dateOfBirth: student.date_of_birth || undefined,
      address: student.address || undefined,
      guardianEmail: student.guardian_email || undefined,
      guardianName: student.guardian_name || undefined,
      guardianPhone: student.guardian_phone || undefined,
      guardianRelationship: student.guardian_relationship || undefined,
      studentType: student.student_type || undefined,
    };
  });
}

/**
 * Fetch student profile for display in profile view page
 * Returns data in format expected by StudentProfilePage component
 */
export async function getStudentProfileForView(
  studentId: string
): Promise<StudentListItem | null> {
  const supabase = await createClient();

  // Fetch student with all related data
  const { data: studentData, error } = await supabase
    .from("students")
    .select(
      `
      id,
      date_of_birth,
      gender,
      student_type,
      address,
      phone_number,
      guardian_email,
      guardian_name,
      guardian_phone,
      guardian_relationship,
      classes(name),
      student_subjects(subjects(name)),
      profiles(email, first_name, middle_name, last_name)
    `
    )
    .eq("id", studentId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching student for view:", {
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

  const profile = studentData.profiles as any;
  const nameParts = [
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name,
  ].filter(Boolean);

  const subjects = Array.isArray(studentData.student_subjects)
    ? studentData.student_subjects
        .map((ss: any) => ss?.subjects?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
    : [];

  // Fetch guardian details if guardian_email is provided
  let guardianDetails = undefined;
  if (studentData.guardian_email) {
    const { data: guardianByEmail } = await supabase
      .from("profiles")
      .select(
        `
                id,
                email,
                first_name,
                middle_name,
                last_name,
                guardians(
                    phone_number,
                    alternative_phone,
                    address,
                    occupation,
                    workplace
                )
            `
      )
      .eq("email", studentData.guardian_email)
      .maybeSingle();

    if (guardianByEmail && guardianByEmail.guardians) {
      const guardian = Array.isArray(guardianByEmail.guardians)
        ? guardianByEmail.guardians[0]
        : guardianByEmail.guardians;
      const nameParts = [
        guardianByEmail.first_name,
        guardianByEmail.middle_name,
        guardianByEmail.last_name,
      ].filter(Boolean);

      guardianDetails = {
        name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Guardian",
        email: guardianByEmail.email,
        phone: guardian?.phone_number,
        alternativePhone: guardian?.alternative_phone,
        address: guardian?.address,
        occupation: guardian?.occupation,
        workplace: guardian?.workplace,
      };
    }
  }
  // Prefer enrolled class from active enrollment (new academic year/enrollment system)
  let enrolledClassName: string | undefined = undefined;
  try {
    const { data: activeYear } = await supabase
      .from("academic_years")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    const activeYearId = (activeYear as any)?.id;
    if (activeYearId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select(`class_id, classes(name)`)
        .eq("student_id", studentId)
        .eq("academic_year_id", activeYearId)
        .eq("status", "active")
        .maybeSingle();

      enrolledClassName = (enrollment as any)?.classes?.name;
    }
  } catch (err) {
    console.warn("Error fetching active enrollment for student view:", err);
  }

  return {
    id: studentData.id,
    name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Student",
    email: profile?.email || "",
    phone: studentData.phone_number || undefined,
    class: enrolledClassName || (studentData.classes as any)?.name || undefined,
    subjects,
    gender: studentData.gender || undefined,
    dateOfBirth: studentData.date_of_birth || undefined,
    address: studentData.address || undefined,
    guardianEmail: studentData.guardian_email || undefined,
    guardianName: studentData.guardian_name || undefined,
    guardianPhone: studentData.guardian_phone || undefined,
    guardianRelationship: studentData.guardian_relationship || undefined,
    guardianDetails,
    studentType: studentData.student_type || undefined,
  };
}
