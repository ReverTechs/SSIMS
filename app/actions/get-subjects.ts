'use server'

import { createClient } from "@/lib/supabase/server";

export interface Subject {
    id: string;
    name: string;
    code: string;
}

export async function getSubjectsByDepartment(departmentId: string): Promise<Subject[]> {
    const supabase = await createClient();

    const { data: subjects, error } = await supabase
        .from("subjects")
        .select("id, name, code")
        .eq("department_id", departmentId)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching subjects:", error);
        return [];
    }

    return subjects || [];
}
