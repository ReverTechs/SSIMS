import { createClient } from "@/lib/supabase/server";

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface SubjectWithAudit extends Subject {
  department_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
  deleted_by_name?: string;
  status?: "active" | "deleted";
}

/**
 * Fetch all active (non-deleted) subjects from the database
 */
export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, code, department_id, description, created_at, updated_at, created_by, updated_by")
    .is("deleted_at", null) // Only fetch active subjects
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
    created_at: s.created_at,
    updated_at: s.updated_at,
    created_by: s.created_by,
    updated_by: s.updated_by,
  }));
}

/**
 * Fetch all subjects including deleted ones (admin only)
 */
export async function getAllSubjects(): Promise<Subject[]> {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, code, department_id, description, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all subjects:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return (subjects || []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    departmentId: s.department_id,
    description: s.description,
    created_at: s.created_at,
    updated_at: s.updated_at,
    created_by: s.created_by,
    updated_by: s.updated_by,
    deleted_at: s.deleted_at,
    deleted_by: s.deleted_by,
  }));
}

/**
 * Fetch subjects with full audit trail information
 */
export async function getSubjectsWithAudit(): Promise<SubjectWithAudit[]> {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects_with_audit")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subjects with audit:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }

  return subjects || [];
}

/**
 * Fetch a single subject by ID
 */
export async function getSubjectById(id: string): Promise<Subject | null> {
  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    console.error("Error fetching subject:", error);
    return null;
  }

  if (!subject) return null;

  return {
    id: subject.id,
    name: subject.name,
    code: subject.code,
    departmentId: subject.department_id,
    description: subject.description,
    created_at: subject.created_at,
    updated_at: subject.updated_at,
    created_by: subject.created_by,
    updated_by: subject.updated_by,
  };
}

/**
 * Fetch subjects by department ID
 */
export async function getSubjectsByDepartment(departmentId: string): Promise<Subject[]> {
  const supabase = await createClient();

  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("id, name, code, department_id, description, created_at, updated_at, created_by, updated_by")
    .eq("department_id", departmentId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching subjects by department:", error);
    return [];
  }

  return (subjects || []).map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    departmentId: s.department_id,
    description: s.description,
    created_at: s.created_at,
    updated_at: s.updated_at,
    created_by: s.created_by,
    updated_by: s.updated_by,
  }));
}

/**
 * Create a new subject
 * Note: created_by and updated_by are automatically set by database trigger
 */
export async function createSubject(data: {
  name: string;
  code: string;
  departmentId?: string;
  description?: string;
}): Promise<{ success: boolean; data?: Subject; error?: string }> {
  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("subjects")
    .insert({
      name: data.name,
      code: data.code,
      department_id: data.departmentId,
      description: data.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating subject:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      departmentId: subject.department_id,
      description: subject.description,
      created_at: subject.created_at,
      updated_at: subject.updated_at,
      created_by: subject.created_by,
      updated_by: subject.updated_by,
    },
  };
}

/**
 * Update an existing subject
 * Note: updated_by is automatically set by database trigger
 */
export async function updateSubject(
  id: string,
  data: {
    name?: string;
    code?: string;
    departmentId?: string;
    description?: string;
  }
): Promise<{ success: boolean; data?: Subject; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.code !== undefined) updateData.code = data.code;
  if (data.departmentId !== undefined) updateData.department_id = data.departmentId;
  if (data.description !== undefined) updateData.description = data.description;

  const { data: subject, error } = await supabase
    .from("subjects")
    .update(updateData)
    .eq("id", id)
    .is("deleted_at", null) // Only update active subjects
    .select()
    .single();

  if (error) {
    console.error("Error updating subject:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      departmentId: subject.department_id,
      description: subject.description,
      created_at: subject.created_at,
      updated_at: subject.updated_at,
      created_by: subject.created_by,
      updated_by: subject.updated_by,
    },
  };
}

/**
 * Soft delete a subject
 * Note: deleted_by is automatically set by database trigger
 */
export async function deleteSubject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subjects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null); // Only delete if not already deleted

  if (error) {
    console.error("Error deleting subject:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Restore a soft-deleted subject (admin only)
 */
export async function restoreSubject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("subjects")
    .update({
      deleted_at: null,
      deleted_by: null,
    })
    .eq("id", id)
    .not("deleted_at", "is", null); // Only restore if deleted

  if (error) {
    console.error("Error restoring subject:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}














