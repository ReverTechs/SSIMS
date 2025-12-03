"use server";

import { createClient } from "@/lib/supabase/server";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: string;
  academic_year: string;
  term: string;
  items: {
    item_name: string;
    description: string | null;
    quantity: number;
    unit_price: number;
    total_amount: number;
  }[];
}

export async function getStudentInvoices(studentId: string) {
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

    // Check permissions (same logic as getStudentFees)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isStudent = profile?.role === "student" && user.id === studentId;
    const isAdminOrStaff = ["admin", "staff"].includes(profile?.role || "");

    let isGuardian = false;
    if (profile?.role === "guardian") {
      const { data: relationship } = await supabase
        .from("student_guardians")
        .select("student_id, guardian_id")
        .eq("student_id", studentId)
        .eq("guardian_id", user.id)
        .single();

      isGuardian = !!relationship;
    }

    if (!isStudent && !isGuardian && !isAdminOrStaff) {
      return {
        error:
          "Forbidden: You do not have permission to view this student's invoices",
      };
    }

    // Fetch invoices with items
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        `
                id,
                invoice_number,
                invoice_date,
                due_date,
                total_amount,
                amount_paid,
                balance,
                status,
                academic_years (name),
                terms (name),
                invoice_items (
                    item_name,
                    description,
                    quantity,
                    unit_price,
                    total_amount
                )
            `
      )
      .eq("student_id", studentId)
      .order("invoice_date", { ascending: false });

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError);
      return { error: "Failed to fetch invoices" };
    }

    // Format the data
    const formattedInvoices: Invoice[] = (invoices || []).map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount,
      amount_paid: invoice.amount_paid,
      balance: invoice.balance,
      status: invoice.status,
      academic_year: (invoice.academic_years as any)?.name || "N/A",
      term: (invoice.terms as any)?.name || "N/A",
      items: (invoice.invoice_items || []).map((item) => ({
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_amount: item.total_amount,
      })),
    }));

    return { success: true, data: formattedInvoices };
  } catch (error) {
    console.error("Error in getStudentInvoices:", error);
    return { error: "An unexpected error occurred" };
  }
}
