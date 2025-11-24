import { createClient } from "@/lib/supabase/server";

export interface TeacherProfile {
  id: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  departments?: { id: string; name: string }[];
  subjects?: string[];
  subjectIds?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  classes?: string[];
  classIds?: string[];
  totalStudents?: number;
  address?: string;
  teacherType?: "permanent" | "temporary" | "tp";
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
      teacher_type,
      department_id,
      departments!teachers_department_id_fkey(id, name),
      teacher_departments(departments(id, name)),
      teacher_subjects(subjects(id, name)),
      teacher_classes(classes(id, name))
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

  // Extract subjects array and IDs
  const subjects = Array.isArray(teacherData.teacher_subjects)
    ? teacherData.teacher_subjects
      .map((ts: any) => ts?.subjects?.name)
      .filter((name: string | undefined): name is string => Boolean(name))
    : [];
  const subjectIds = Array.isArray(teacherData.teacher_subjects)
    ? teacherData.teacher_subjects
      .map((ts: any) => ts?.subjects?.id)
      .filter((id: string | undefined): id is string => Boolean(id))
    : [];

  // Extract classes array and IDs
  const classes = Array.isArray(teacherData.teacher_classes)
    ? teacherData.teacher_classes
      .map((tc: any) => tc?.classes?.name)
      .filter((name: string | undefined): name is string => Boolean(name))
    : [];
  const classIds = Array.isArray(teacherData.teacher_classes)
    ? teacherData.teacher_classes
      .map((tc: any) => tc?.classes?.id)
      .filter((id: string | undefined): id is string => Boolean(id))
    : [];

  // Extract departments
  const departments = Array.isArray(teacherData.teacher_departments)
    ? teacherData.teacher_departments
      .map((td: any) => ({
        id: td?.departments?.id,
        name: td?.departments?.name,
      }))
      .filter((d: { id: string; name: string }) => Boolean(d.id && d.name))
    : [];

  // Fallback for backward compatibility if migration hasn't run or data is mixed
  if (departments.length === 0 && teacherData.department_id && (teacherData.departments as any)?.name) {
    departments.push({
      id: teacherData.department_id,
      name: (teacherData.departments as any).name,
    });
  }

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
    title: teacherData.title || undefined,
    email: profile.email,
    phone: teacherData.phone_number || undefined,
    departments: departments.length > 0 ? departments : undefined,
    subjects: subjects.length > 0 ? subjects : undefined,
    subjectIds: subjectIds.length > 0 ? subjectIds : undefined,
    gender: teacherData.gender || undefined,
    dateOfBirth: teacherData.date_of_birth || undefined,
    yearsOfExperience: teacherData.years_of_experience || undefined,
    qualification: teacherData.qualification || undefined,
    specialization: teacherData.specialization || undefined,
    classes: classes.length > 0 ? classes : undefined,
    classIds: classIds.length > 0 ? classIds : undefined,
    totalStudents: totalStudents > 0 ? totalStudents : undefined,
    address: teacherData.address || undefined,
    teacherType: teacherData.teacher_type || undefined,
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


/**
 * Fetch all teachers with their profile data
 */
export async function getAllTeachers(): Promise<TeacherProfile[]> {
  const supabase = await createClient();

  const { data: teachersData, error } = await supabase
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
      teacher_type,
      department_id,
      departments!teachers_department_id_fkey(id, name),
      teacher_departments(departments(id, name)),
      teacher_subjects(subjects(id, name)),
      teacher_classes(classes(id, name))
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  if (!teachersData) {
    return [];
  }

  // Fetch profiles for all teachers
  const teacherIds = teachersData.map((t) => t.id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, first_name, middle_name, last_name")
    .in("id", teacherIds);

  if (profilesError) {
    console.error("Error fetching teacher profiles:", profilesError);
    return [];
  }

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]));

  const titleMap: Record<string, string> = {
    Mr: "Mr.",
    Mrs: "Mrs.",
    Ms: "Ms.",
    Dr: "Dr.",
    Prof: "Prof.",
    Rev: "Rev.",
  };

  return teachersData.map((teacher) => {
    const profile = profilesMap.get(teacher.id);
    const title = teacher.title ? titleMap[teacher.title] || "" : "";
    const middleName = profile?.middle_name ? ` ${profile.middle_name}` : "";
    const fullName = profile
      ? `${title} ${profile.first_name}${middleName} ${profile.last_name}`.trim()
      : "Unknown Teacher";

    // Extract subjects
    const subjects = Array.isArray(teacher.teacher_subjects)
      ? teacher.teacher_subjects
        .map((ts: any) => ts?.subjects?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
      : [];

    const subjectIds = Array.isArray(teacher.teacher_subjects)
      ? teacher.teacher_subjects
        .map((ts: any) => ts?.subjects?.id)
        .filter((id: string | undefined): id is string => Boolean(id))
      : [];

    // Extract classes
    const classes = Array.isArray(teacher.teacher_classes)
      ? teacher.teacher_classes
        .map((tc: any) => tc?.classes?.name)
        .filter((name: string | undefined): name is string => Boolean(name))
      : [];

    const classIds = Array.isArray(teacher.teacher_classes)
      ? teacher.teacher_classes
        .map((tc: any) => tc?.classes?.id)
        .filter((id: string | undefined): id is string => Boolean(id))
      : [];

    // Extract departments
    const departments = Array.isArray(teacher.teacher_departments)
      ? teacher.teacher_departments
        .map((td: any) => ({
          id: td?.departments?.id,
          name: td?.departments?.name,
        }))
        .filter((d: { id: string; name: string }) => Boolean(d.id && d.name))
      : [];

    // Fallback for backward compatibility
    if (departments.length === 0 && teacher.department_id && (teacher.departments as any)?.name) {
      departments.push({
        id: teacher.department_id,
        name: (teacher.departments as any).name,
      });
    }

    return {
      id: teacher.id,
      name: fullName,
      title: teacher.title || undefined,
      email: profile?.email || "",
      phone: teacher.phone_number || undefined,
      departments: departments.length > 0 ? departments : undefined,
      subjects: subjects.length > 0 ? subjects : undefined,
      subjectIds: subjectIds.length > 0 ? subjectIds : undefined,
      gender: teacher.gender || undefined,
      dateOfBirth: teacher.date_of_birth || undefined,
      yearsOfExperience: teacher.years_of_experience || undefined,
      qualification: teacher.qualification || undefined,
      specialization: teacher.specialization || undefined,
      classes: classes.length > 0 ? classes : undefined,
      classIds: classIds.length > 0 ? classIds : undefined,
      address: teacher.address || undefined,
      teacherType: teacher.teacher_type || undefined,
    };
  });
}
