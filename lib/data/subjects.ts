import { createClient } from "@/lib/supabase/server";

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  description?: string;
}

/**
 * Fetch all subjects from the database
 */
export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, code, department_id, description")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subjects:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2),
    });
    return [];
  }

  return (subjects || []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    departmentId: s.department_id,
    description: s.description,
  }));
}



