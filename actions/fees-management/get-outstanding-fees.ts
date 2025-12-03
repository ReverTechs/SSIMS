"use server";

import { createClient } from "@/lib/supabase/server";

interface OutstandingFee {
  student_id: string;
  student_number: string;
  full_name: string;
  class_name: string;
  total_outstanding: number;
  oldest_invoice_date: string;
  days_overdue: number;
  phone_number: string | null;
  guardian_phone: string | null;
}

export async function getOutstandingFees() {
  try {
    const supabase = await createClient();

    // Get current user and check permissions
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthorized" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "staff"].includes(profile?.role || "")) {
      return { error: "Forbidden: Admin or staff access required" };
    }

    // Get all invoices with outstanding balances
    const { data: invoices, error: invoicesError } = await supabase
      .from("invoices")
      .select(
        `
                student_id,
                invoice_date,
                balance,
                students (
                    id,
                    student_id,
                    phone_number,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name
                    )
                )
            `
      )
      .gt("balance", 0)
      .order("invoice_date", { ascending: true });

    if (invoicesError) {
      console.error("Error fetching outstanding fees:", invoicesError);
      return { error: "Failed to fetch outstanding fees" };
    }

    // Group by student and calculate totals
    const studentMap = new Map<
      string,
      {
        student_id: string;
        student_number: string;
        full_name: string;
        class_name: string;
        total_outstanding: number;
        oldest_invoice_date: string;
        phone_number: string | null;
      }
    >();

    (invoices || []).forEach((invoice) => {
      const student = Array.isArray(invoice.students)
        ? invoice.students[0]
        : invoice.students;
      if (!student) return;

      const profiles = Array.isArray(student.profiles)
        ? student.profiles[0]
        : student.profiles;
      const classes = Array.isArray(student.classes)
        ? student.classes[0]
        : student.classes;

      const existing = studentMap.get(student.id);

      if (existing) {
        existing.total_outstanding += invoice.balance;
        // Keep the oldest invoice date
        if (
          new Date(invoice.invoice_date) <
          new Date(existing.oldest_invoice_date)
        ) {
          existing.oldest_invoice_date = invoice.invoice_date;
        }
      } else {
        studentMap.set(student.id, {
          student_id: student.id,
          student_number: student.student_id,
          full_name: profiles
            ? `${profiles.first_name} ${profiles.last_name}`
            : "Unknown",
          class_name: classes?.name || "N/A",
          total_outstanding: invoice.balance,
          oldest_invoice_date: invoice.invoice_date,
          phone_number: student.phone_number,
        });
      }
    });

    // Get guardian phone numbers for students
    const studentIds = Array.from(studentMap.keys());
    const { data: guardianData } = await supabase
      .from("student_guardians")
      .select(
        `
                student_id,
                guardians (
                    phone_number
                )
            `
      )
      .in("student_id", studentIds)
      .eq("is_primary", true);

    const guardianPhoneMap = new Map<string, string>();
    (guardianData || []).forEach((sg) => {
      const guardian = Array.isArray(sg.guardians)
        ? sg.guardians[0]
        : sg.guardians;
      if (guardian?.phone_number) {
        guardianPhoneMap.set(sg.student_id, guardian.phone_number);
      }
    });

    // Calculate days overdue and format result
    const today = new Date();
    const outstandingFees: OutstandingFee[] = Array.from(
      studentMap.values()
    ).map((student) => {
      const oldestDate = new Date(student.oldest_invoice_date);
      const daysOverdue = Math.floor(
        (today.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...student,
        days_overdue: daysOverdue,
        guardian_phone: guardianPhoneMap.get(student.student_id) || null,
      };
    });

    // Sort by outstanding amount (highest first)
    outstandingFees.sort((a, b) => b.total_outstanding - a.total_outstanding);

    return { success: true, data: outstandingFees };
  } catch (error) {
    console.error("Error in getOutstandingFees:", error);
    return { error: "An unexpected error occurred" };
  }
}
