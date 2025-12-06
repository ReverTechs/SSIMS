import { createClient } from "@/lib/supabase/server";

export interface Department {
  id: string;
  name: string;
  code: string;
  budget: number;
  head_of_department_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface DepartmentWithAudit extends Department {
  created_by_name?: string;
  updated_by_name?: string;
  deleted_by_name?: string;
  status?: "active" | "deleted";
}

/**
 * Fetch all active (non-deleted) departments from the database
 */
export async function getDepartments(): Promise<Department[]> {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, code, budget, head_of_department_id, created_at, updated_at, created_by, updated_by")
    .is("deleted_at", null) // Only fetch active departments
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

/**
 * Fetch all departments including deleted ones (admin only)
 */
export async function getAllDepartments(): Promise<Department[]> {
  const supabase = await createClient();

  const { data: departments, error } = await supabase
    .from("departments")
    .select("id, name, code, budget, head_of_department_id, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all departments:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return departments || [];
}

/**
 * Fetch departments with full audit trail information
 */
export async function getDepartmentsWithAudit(): Promise<DepartmentWithAudit[]> {
  const supabase = await createClient();

  // Note: departments_with_audit view might update automatically if it selects * from departments,
  // but if it defines columns explicitly, it might need refreshing.
  // For now, we assume the underlying table change propagates or we just select what's available.
  // If we need budget in audit trail specifically and strict typing, we should update the view definition too.
  // But usually for simple UI display, fetching from base table or just hoping view reflects it is a start.
  // However, `getDepartments` is main one used.

  const { data: departments, error } = await supabase
    .from("departments_with_audit")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching departments with audit:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return departments || [];
}

/**
 * Fetch a single department by ID
 */
export async function getDepartmentById(id: string): Promise<Department | null> {
  const supabase = await createClient();

  const { data: department, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching department:", error);
    return null;
  }

  return department;
}

/**
 * Create a new department
 * Note: created_by and updated_by are automatically set by database trigger
 */
export async function createDepartment(data: {
  name: string;
  code: string;
  budget?: number;
  head_of_department_id?: string;
}): Promise<{ success: boolean; data?: Department; error?: string }> {
  const supabase = await createClient();

  const { data: department, error } = await supabase
    .from("departments")
    .insert({
      name: data.name,
      code: data.code,
      budget: data.budget || 0,
      head_of_department_id: data.head_of_department_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating department:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: department };
}

/**
 * Update an existing department
 * Note: updated_by is automatically set by database trigger
 */
export async function updateDepartment(
  id: string,
  data: {
    name?: string;
    code?: string;
    budget?: number;
    head_of_department_id?: string;
  }
): Promise<{ success: boolean; data?: Department; error?: string }> {
  const supabase = await createClient();

  const { data: department, error } = await supabase
    .from("departments")
    .update(data)
    .eq("id", id)
    .is("deleted_at", null) // Only update active departments
    .select()
    .single();

  if (error) {
    console.error("Error updating department:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data: department };
}

/**
 * Soft delete a department
 * Note: deleted_by is automatically set by database trigger
 */
export async function deleteDepartment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("departments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null); // Only delete if not already deleted

  if (error) {
    console.error("Error deleting department:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Restore a soft-deleted department (admin only)
 */
export async function restoreDepartment(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("departments")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .not("deleted_at", "is", null); // Only restore if deleted

  if (error) {
    console.error("Error restoring department:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

