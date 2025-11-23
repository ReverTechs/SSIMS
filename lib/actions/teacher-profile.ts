"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateTeacherProfileData {
  // Profile fields
  title?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  // Teacher fields
  phoneNumber?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  address?: string;
  // Teaching fields
  departmentIds?: string[];
  subjectIds?: string[];
  classIds?: string[];
}

export interface UpdateTeacherProfileResult {
  success: boolean;
  error?: string;
}

/**
 * Update teacher profile information
 * Updates both profiles and teachers tables
 */
export async function updateTeacherProfile(
  teacherId: string,
  data: UpdateTeacherProfileData
): Promise<UpdateTeacherProfileResult> {
  try {
    const supabase = await createClient();

    // Verify the user is authenticated and is the teacher being updated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized: Please log in" };
    }

    if (user.id !== teacherId) {
      return { success: false, error: "Unauthorized: You can only edit your own profile" };
    }

    // Prepare profile updates
    const profileUpdates: Record<string, any> = {};
    if (data.firstName !== undefined) profileUpdates.first_name = data.firstName.trim();
    if (data.middleName !== undefined) profileUpdates.middle_name = data.middleName.trim() || null;
    if (data.lastName !== undefined) profileUpdates.last_name = data.lastName.trim();
    if (data.email !== undefined) profileUpdates.email = data.email.trim().toLowerCase();
    profileUpdates.updated_at = new Date().toISOString();

    // Prepare teacher updates
    const teacherUpdates: Record<string, any> = {};
    if (data.title !== undefined) teacherUpdates.title = data.title.trim() || null;
    if (data.phoneNumber !== undefined) teacherUpdates.phone_number = data.phoneNumber.trim() || null;
    if (data.gender !== undefined) teacherUpdates.gender = data.gender;
    if (data.dateOfBirth !== undefined) teacherUpdates.date_of_birth = data.dateOfBirth || null;
    if (data.yearsOfExperience !== undefined) {
      const years = Number(data.yearsOfExperience);
      teacherUpdates.years_of_experience = isNaN(years) || years < 0 ? 0 : years;
    }
    if (data.qualification !== undefined) teacherUpdates.qualification = data.qualification.trim() || null;
    if (data.specialization !== undefined) teacherUpdates.specialization = data.specialization.trim() || null;
    if (data.address !== undefined) teacherUpdates.address = data.address.trim() || null;
    teacherUpdates.updated_at = new Date().toISOString();

    // Validate required fields
    if (profileUpdates.first_name !== undefined && !profileUpdates.first_name) {
      return { success: false, error: "First name is required" };
    }
    if (profileUpdates.last_name !== undefined && !profileUpdates.last_name) {
      return { success: false, error: "Last name is required" };
    }
    if (profileUpdates.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileUpdates.email)) {
        return { success: false, error: "Invalid email format" };
      }
    }

    // Update profiles table if there are changes
    if (Object.keys(profileUpdates).length > 1) {
      // More than just updated_at
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", teacherId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return { success: false, error: `Failed to update profile: ${profileError.message}` };
      }

      // If email is being updated, also update auth.users
      if (data.email !== undefined) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileUpdates.email,
        });

        if (emailError) {
          console.error("Error updating email:", emailError);
          return { success: false, error: `Failed to update email: ${emailError.message}` };
        }
      }
    }

    // Update teachers table if there are changes
    if (Object.keys(teacherUpdates).length > 1) {
      // More than just updated_at
      const { error: teacherError } = await supabase
        .from("teachers")
        .update(teacherUpdates)
        .eq("id", teacherId);

      if (teacherError) {
        console.error("Error updating teacher:", teacherError);
        return { success: false, error: `Failed to update teacher data: ${teacherError.message}` };
      }
    }

    // Update department if provided
    // Update teacher departments if provided
    if (data.departmentIds !== undefined) {
      // First, delete all existing teacher_departments for this teacher
      const { error: deleteError } = await supabase
        .from("teacher_departments")
        .delete()
        .eq("teacher_id", teacherId);

      if (deleteError) {
        console.error("Error deleting existing departments:", deleteError);
        return { success: false, error: `Failed to update departments: ${deleteError.message}` };
      }

      // Then, insert new teacher_departments if any are provided
      if (data.departmentIds.length > 0) {
        const teacherDepartments = data.departmentIds.map((deptId) => ({
          teacher_id: teacherId,
          department_id: deptId,
        }));

        const { error: insertError } = await supabase
          .from("teacher_departments")
          .insert(teacherDepartments);

        if (insertError) {
          console.error("Error inserting departments:", insertError);
          return { success: false, error: `Failed to update departments: ${insertError.message}` };
        }
      }

      // Update the main department_id in teachers table for backward compatibility
      // Use the first department as the primary one, or null if none
      const primaryDepartmentId = data.departmentIds.length > 0 ? data.departmentIds[0] : null;
      const { error: updateError } = await supabase
        .from("teachers")
        .update({ department_id: primaryDepartmentId, updated_at: new Date().toISOString() })
        .eq("id", teacherId);

      if (updateError) {
        console.error("Error updating primary department:", updateError);
        // Don't fail the whole operation if this fails, as it's just for backward compatibility
      }
    }

    // Update teacher subjects if provided
    if (data.subjectIds !== undefined) {
      // First, delete all existing teacher_subjects for this teacher
      const { error: deleteError } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("teacher_id", teacherId);

      if (deleteError) {
        console.error("Error deleting existing subjects:", deleteError);
        return { success: false, error: `Failed to update subjects: ${deleteError.message}` };
      }

      // Then, insert new teacher_subjects if any are provided
      if (data.subjectIds.length > 0) {
        const teacherSubjects = data.subjectIds.map((subjectId) => ({
          teacher_id: teacherId,
          subject_id: subjectId,
        }));

        const { error: insertError } = await supabase
          .from("teacher_subjects")
          .insert(teacherSubjects);

        if (insertError) {
          console.error("Error inserting subjects:", insertError);
          return { success: false, error: `Failed to update subjects: ${insertError.message}` };
        }
      }
    }

    // Update teacher classes if provided
    if (data.classIds !== undefined) {
      // First, delete all existing teacher_classes for this teacher
      const { error: deleteError } = await supabase
        .from("teacher_classes")
        .delete()
        .eq("teacher_id", teacherId);

      if (deleteError) {
        console.error("Error deleting existing classes:", deleteError);
        return { success: false, error: `Failed to update classes: ${deleteError.message}` };
      }

      // Then, insert new teacher_classes if any are provided
      if (data.classIds.length > 0) {
        const teacherClasses = data.classIds.map((classId) => ({
          teacher_id: teacherId,
          class_id: classId,
          role: "subject_teacher" as const,
        }));

        const { error: insertError } = await supabase
          .from("teacher_classes")
          .insert(teacherClasses);

        if (insertError) {
          console.error("Error inserting classes:", insertError);
          return { success: false, error: `Failed to update classes: ${insertError.message}` };
        }
      }
    }

    // Revalidate the profile page to show updated data
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating teacher profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

