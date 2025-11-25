import { createClient } from "@/lib/supabase/server";

export interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  academicYear: string;
  capacity?: number;
}

/**
 * Fetch all classes from the database
 */
export async function getClasses(): Promise<Class[]> {
  const supabase = await createClient();

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, name, grade_level, academic_year, capacity")
    .order("grade_level", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching classes:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2),
    });
    return [];
  }

  return (classes || []).map((c) => ({
    id: c.id,
    name: c.name,
    gradeLevel: c.grade_level,
    academicYear: c.academic_year,
    capacity: c.capacity,
  }));
}










