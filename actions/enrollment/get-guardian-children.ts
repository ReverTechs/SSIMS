"use server";

import { createClient } from "@/lib/supabase/server";

interface GuardianChild {
  student_id: string;
  student_number: string;
  full_name: string;
  class_name: string;
  outstanding_balance: number;
  relationship: string;
  is_primary: boolean;
}

export async function getGuardianChildren() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthorized" };
    }

    // Check if user is a guardian
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "guardian") {
      return { error: "Forbidden: Only guardians can access this endpoint" };
    }

    // Get guardian record
    const { data: guardian, error: guardianError } = await supabase
      .from("guardians")
      .select("id")
      .eq("id", user.id)
      .single();

    if (guardianError || !guardian) {
      return { error: "Guardian record not found" };
    }

    // Fetch all children linked to this guardian
    const { data: children, error: childrenError } = await supabase
      .from("student_guardians")
      .select(
        `
                relationship,
                is_primary,
                students (
                    id,
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name
                    ),
                    student_fees (
                        balance
                    )
                )
            `
      )
      .eq("guardian_id", guardian.id)
      .order("is_primary", { ascending: false });

    if (childrenError) {
      console.error("Error fetching guardian children:", childrenError);
      return { error: "Failed to fetch children data" };
    }

    // Format the data
    const formattedChildren: GuardianChild[] = (children || []).map((child) => {
      const student = Array.isArray(child.students)
        ? child.students[0]
        : child.students;
      const profiles = Array.isArray(student?.profiles)
        ? student.profiles[0]
        : student?.profiles;
      const classes = Array.isArray(student?.classes)
        ? student.classes[0]
        : student?.classes;
      const totalBalance = (student?.student_fees || []).reduce(
        (sum, fee) => sum + (fee.balance || 0),
        0
      );

      return {
        student_id: student?.id || "",
        student_number: student?.student_id || "",
        full_name: profiles
          ? `${profiles.first_name} ${profiles.last_name}`
          : "Unknown",
        class_name: classes?.name || "N/A",
        outstanding_balance: totalBalance,
        relationship: child.relationship || "N/A",
        is_primary: child.is_primary || false,
      };
    });

    return { success: true, data: formattedChildren };
  } catch (error) {
    console.error("Error in getGuardianChildren:", error);
    return { error: "An unexpected error occurred" };
  }
}
