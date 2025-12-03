"use server";

import { createClient } from "@/lib/supabase/server";

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  invoice_number: string;
  receipt_number: string;
  receipt_id: string;
  balance_after: number;
}

export async function getStudentPayments(studentId: string) {
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
          "Forbidden: You do not have permission to view this student's payments",
      };
    }

    // Fetch payments with receipts
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(
        `
                id,
                payment_number,
                payment_date,
                amount,
                payment_method,
                reference_number,
                invoices (
                    invoice_number,
                    balance
                ),
                receipts (
                    id,
                    receipt_number
                )
            `
      )
      .eq("student_id", studentId)
      .order("payment_date", { ascending: false });

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
      return { error: "Failed to fetch payment history" };
    }

    // Format the data
    const formattedPayments: Payment[] = (payments || []).map((payment) => {
      const invoice = Array.isArray(payment.invoices)
        ? payment.invoices[0]
        : payment.invoices;
      const receipt = Array.isArray(payment.receipts)
        ? payment.receipts[0]
        : payment.receipts;

      return {
        id: payment.id,
        payment_number: payment.payment_number,
        payment_date: payment.payment_date,
        amount: payment.amount,
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        invoice_number: invoice?.invoice_number || "N/A",
        receipt_number: receipt?.receipt_number || "N/A",
        receipt_id: receipt?.id || "",
        balance_after: invoice?.balance || 0,
      };
    });

    return { success: true, data: formattedPayments };
  } catch (error) {
    console.error("Error in getStudentPayments:", error);
    return { error: "An unexpected error occurred" };
  }
}
