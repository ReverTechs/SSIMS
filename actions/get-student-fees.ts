"use server";

import { createClient } from "@/lib/supabase/server";

interface FeeSummary {
  total_fees: number;
  total_paid: number;
  outstanding_balance: number;
  fee_breakdown: {
    academic_year: string;
    term: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
  }[];
}

export async function getStudentFees(studentId: string) {
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

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isStudent = profile?.role === "student" && user.id === studentId;
    const isAdminOrStaff = ["admin", "staff"].includes(profile?.role || "");

    // Check if user is a guardian of this student
    let isGuardian = false;
    if (profile?.role === "guardian") {
      const { data: guardianData } = await supabase
        .from("guardians")
        .select("id")
        .eq("id", user.id)
        .single();

      if (guardianData) {
        const { data: relationship } = await supabase
          .from("student_guardians")
          .select("id")
          .eq("student_id", studentId)
          .eq("guardian_id", guardianData.id)
          .single();

        isGuardian = !!relationship;
      }
    }

    if (!isStudent && !isGuardian && !isAdminOrStaff) {
      return {
        error:
          "Forbidden: You do not have permission to view this student's fees",
      };
    }

    // Fetch student fee summary
    const { data: studentFees, error: feesError } = await supabase
      .from("student_fees")
      .select(
        `
                id,
                total_amount,
                amount_paid,
                balance,
                academic_years (name),
                terms (name)
            `
      )
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (feesError) {
      console.error("Error fetching student fees:", feesError);
      return { error: "Failed to fetch fee data" };
    }

    // Calculate totals and breakdown
    let total_fees = 0;
    let total_paid = 0;
    let outstanding_balance = 0;

    const fee_breakdown = (studentFees || []).map((fee) => {
      total_fees += fee.total_amount;
      total_paid += fee.amount_paid;
      outstanding_balance += fee.balance;

      const academicYear = Array.isArray(fee.academic_years)
        ? fee.academic_years[0]
        : fee.academic_years;
      const term = Array.isArray(fee.terms) ? fee.terms[0] : fee.terms;

      return {
        academic_year: academicYear?.name || "N/A",
        term: term?.name || "N/A",
        total_amount: fee.total_amount,
        amount_paid: fee.amount_paid,
        balance: fee.balance,
      };
    });

    const summary: FeeSummary = {
      total_fees,
      total_paid,
      outstanding_balance,
      fee_breakdown,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error in getStudentFees:", error);
    return { error: "An unexpected error occurred" };
  }
}
