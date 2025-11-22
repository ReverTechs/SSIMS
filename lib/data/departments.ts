import { createClient } from "@/lib/supabase/server";

export interface Department {
  id: string;
  name: string;
  code: string;
}

/**
 * Fetch all departments from the database
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, code")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: JSON.stringify(error, null, 2),
    });
    return [];
  }

  return departments || [];
}

