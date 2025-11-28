"use server";

import { createClient } from "@/utils/supabase/server";

export async function getEnrolledStudents(opts: {
  academicYearId: string;
  classId: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      class_id,
      students!enrollments_student_id_fkey (
        id,
        profiles (
          first_name,
          last_name
        )
      )
    `
    )
    .eq("academic_year_id", opts.academicYearId)
    .eq("class_id", opts.classId)
    .eq("status", "active");

  if (error) {
    console.error("Error in getEnrolledStudents:", error);
    throw error;
  }

  // Normalize to simple shape
  return (data || [])
    .filter((row: any) => row.students && row.students.profiles)
    .map((row: any) => ({
      id: row.students.id,
      first_name: row.students.profiles.first_name,
      last_name: row.students.profiles.last_name,
      class_id: row.class_id,
    }));
}
