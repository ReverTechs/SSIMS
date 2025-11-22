import { createClient } from "@/lib/supabase/server";

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  classes?: string[];
  totalStudents?: number;
  address?: string;
}

/**
 * Fetch teacher profile data by teacher ID (UUID)
 */
export async function getTeacherProfile(teacherId: string): Promise<TeacherProfile | null> {
  const supabase = await createClient();

  // Fetch teacher with all related data
  // Using maybeSingle() instead of single() to avoid errors when no row is found
  // Using departments!teachers_department_id_fkey to specify the exact relationship
  // (there are two relationships: one for department_id and one for head_of_department_id)
  const { data: teacherData, error } = await supabase
    .from("teachers")
    .select(`
      id,
      phone_number,
      gender,
      date_of_birth,
      years_of_experience,
      qualification,
      specialization,
      address,
      employee_id,
      title,
      departments!teachers_department_id_fkey(name),
      teacher_subjects(subjects(name)),
      teacher_classes(classes(name))
    `)
    .eq("id", teacherId)
    .maybeSingle();

  if (error) {
    // Log detailed error information
    console.error("Error fetching teacher:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      teacherId,
      fullError: JSON.stringify(error, null, 2),
    });
    return null;
  }

  if (!teacherData) {
    console.warn(`Teacher record not found for ID: ${teacherId}`);
    return null;
  }

  // Fetch profile for email and name
  // Using maybeSingle() instead of single() to avoid errors when no row is found
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, first_name, middle_name, last_name")
    .eq("id", teacherId)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code,
      teacherId,
      fullError: JSON.stringify(profileError, null, 2),
    });
    return null;
  }

  if (!profile) {
    console.warn(`Profile not found for teacher ID: ${teacherId}`);
    return null;
  }

  // Construct full name with title
  const titleMap: Record<string, string> = {
    Mr: "Mr.",
    Mrs: "Mrs.",
    Ms: "Ms.",
    Dr: "Dr.",
    Prof: "Prof.",
    Rev: "Rev.",
  };
  const title = teacherData.title ? titleMap[teacherData.title] || "" : "";
  const middleName = profile.middle_name ? ` ${profile.middle_name}` : "";
  const fullName = `${title} ${profile.first_name}${middleName} ${profile.last_name}`.trim();

  // Extract subjects array
  const subjects = Array.isArray(teacherData.teacher_subjects)
    ? teacherData.teacher_subjects
        .map((ts: any) => ts?.subjects?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
    : [];

  // Extract classes array
  const classes = Array.isArray(teacherData.teacher_classes)
    ? teacherData.teacher_classes
        .map((tc: any) => tc?.classes?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
    : [];

  // Count total students (if students table exists)
  let totalStudents = 0;
  try {
    const classIds = Array.isArray(teacherData.teacher_classes)
      ? teacherData.teacher_classes.map((tc: any) => tc?.classes?.id).filter(Boolean)
      : [];
    
    if (classIds.length > 0) {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .in("class_id", classIds);
      totalStudents = count || 0;
    }
  } catch (error) {
    // Students table might not exist yet, that's okay
    console.log("Students table not available or error counting students:", error);
  }

  return {
    id: teacherData.id,
    name: fullName,
    email: profile.email,
    phone: teacherData.phone_number || undefined,
    department: (teacherData.departments as any)?.name || undefined,
    subjects: subjects.length > 0 ? subjects : undefined,
    gender: teacherData.gender || undefined,
    dateOfBirth: teacherData.date_of_birth || undefined,
    yearsOfExperience: teacherData.years_of_experience || undefined,
    qualification: teacherData.qualification || undefined,
    specialization: teacherData.specialization || undefined,
    classes: classes.length > 0 ? classes : undefined,
    totalStudents: totalStudents > 0 ? totalStudents : undefined,
    address: teacherData.address || undefined,
  };
}

/**
 * Fetch current user's teacher profile
 */
export async function getCurrentTeacherProfile(): Promise<TeacherProfile | null> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return getTeacherProfile(user.id);
}

