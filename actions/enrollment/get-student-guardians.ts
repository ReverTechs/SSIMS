"use server";

import { createClient } from "@/lib/supabase/server";

export interface StudentGuardian {
    id: string;
    name: string;
    email: string;
    phone: string;
    relationship: string;
    is_primary: boolean;
    is_emergency_contact: boolean;
    occupation?: string;
    workplace?: string;
    address?: string;
}

export async function getStudentGuardians(studentId: string) {
    try {
        const supabase = await createClient();

        const { data: guardians, error } = await supabase
            .from("student_guardians")
            .select(`
        relationship,
        is_primary,
        is_emergency_contact,
        guardians (
          id,
          phone_number,
          occupation,
          workplace,
          address,
          profiles (
            first_name,
            last_name,
            email
          )
        )
      `)
            .eq("student_id", studentId);

        if (error) {
            console.error("Error fetching student guardians:", error);
            return { error: "Failed to fetch guardians" };
        }

        const formattedGuardians: StudentGuardian[] = guardians.map((g: any) => ({
            id: g.guardians.id,
            name: `${g.guardians.profiles.first_name} ${g.guardians.profiles.last_name}`,
            email: g.guardians.profiles.email,
            phone: g.guardians.phone_number,
            relationship: g.relationship,
            is_primary: g.is_primary,
            is_emergency_contact: g.is_emergency_contact,
            occupation: g.guardians.occupation,
            workplace: g.guardians.workplace,
            address: g.guardians.address,
        }));

        return { success: true, data: formattedGuardians };
    } catch (error) {
        console.error("Error in getStudentGuardians:", error);
        return { error: "An unexpected error occurred" };
    }
}
