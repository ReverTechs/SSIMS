import { createClient } from "@/lib/supabase/server";

export interface GuardianProfile {
    guardianId: string;
    phoneNumber?: string;
    alternativePhone?: string;
    address?: string;
    occupation?: string;
    nationalId?: string;
    workplace?: string;
    workPhone?: string;
    preferredContactMethod?: string;
    isEmergencyContact?: boolean;
    relationship?: string; // Primary relationship or summary
    dependents: Array<{
        id: string;
        name: string;
        className?: string;
        relationship?: string;
    }>;
}

/**
 * Fetch guardian profile data by guardian ID (UUID)
 */
export async function getGuardianProfile(guardianId: string): Promise<GuardianProfile | null> {
    const supabase = await createClient();

    // Fetch guardian with basic info
    const { data: guardianData, error } = await supabase
        .from("guardians")
        .select(`
      id,
      phone_number,
      alternative_phone,
      address,
      occupation,
      national_id,
      workplace,
      work_phone,
      preferred_contact_method,
      is_emergency_contact
    `)
        .eq("id", guardianId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching guardian:", error);
        return null;
    }

    if (!guardianData) {
        return null;
    }

    // Fetch dependents (students) linked to this guardian
    const { data: dependentsData, error: dependentsError } = await supabase
        .from("student_guardians")
        .select(`
      relationship,
      students (
        id,
        classes (name),
        profiles (first_name, middle_name, last_name)
      )
    `)
        .eq("guardian_id", guardianId);

    if (dependentsError) {
        console.error("Error fetching dependents:", dependentsError);
    }

    const dependents = (dependentsData || []).map((d: any) => {
        const student = d.students;
        const profile = student?.profiles;
        const nameParts = [
            profile?.first_name,
            profile?.middle_name,
            profile?.last_name,
        ].filter(Boolean);

        return {
            id: student?.id,
            name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Student",
            className: student?.classes?.name,
            relationship: d.relationship,
        };
    });

    // Determine a primary relationship to display
    // If multiple, maybe just show the first one or "Guardian"
    const primaryRelationship = dependents.length > 0 ? dependents[0].relationship : "Guardian";

    return {
        guardianId: guardianData.id,
        phoneNumber: guardianData.phone_number || undefined,
        alternativePhone: guardianData.alternative_phone || undefined,
        address: guardianData.address || undefined,
        occupation: guardianData.occupation || undefined,
        nationalId: guardianData.national_id || undefined,
        workplace: guardianData.workplace || undefined,
        workPhone: guardianData.work_phone || undefined,
        preferredContactMethod: guardianData.preferred_contact_method || undefined,
        isEmergencyContact: guardianData.is_emergency_contact || false,
        relationship: primaryRelationship,
        dependents,
    };
}

/**
 * Fetch current user's guardian profile
 */
export async function getCurrentGuardianProfile(): Promise<GuardianProfile | null> {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    return getGuardianProfile(user.id);
}
