import { createClient } from "./server";
import { User, UserRole } from "@/types";

/**
 * Format a name part to proper case (first letter capitalized, rest lowercase)
 */
function formatNamePart(name: string): string {
  if (!name || name.trim().length === 0) return "";
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Format a title to ensure it's capitalized and has a period
 */
function formatTitle(title: string): string {
  if (!title || title.trim().length === 0) return "";
  const trimmed = title.trim();
  // Capitalize the title
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  // Ensure it ends with a period
  return capitalized.endsWith(".") ? capitalized : capitalized + ".";
}

/**
 * Get the current authenticated user with their profile (including role)
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  // Get the authenticated user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  // Get user profile with role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    // If profile doesn't exist, create one with default role
    // This can happen if the trigger didn't fire or user was created before migration
    const defaultRole = (authUser.user_metadata?.role || "student") as UserRole;
    const defaultProfile = {
      id: authUser.id,
      email: authUser.email || "",
      first_name: authUser.user_metadata?.first_name || "New",
      middle_name: authUser.user_metadata?.middle_name || null,
      last_name: authUser.user_metadata?.last_name || "User",
      role: defaultRole,
      avatar_url: authUser.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Fetch title if user is a teacher, headteacher, or deputy_headteacher
    let title = "";
    if (["teacher", "headteacher", "deputy_headteacher"].includes(defaultRole)) {
      const { data: teacherData } = await supabase
        .from("teachers")
        .select("title")
        .eq("id", authUser.id)
        .single();

      if (teacherData?.title) {
        title = formatTitle(teacherData.title);
      }
    }

    // Try to insert the profile
    const { error: insertError } = await supabase
      .from("profiles")
      .insert(defaultProfile);

    // Construct fullName with title, first_name, middle_name, and last_name
    // Format names professionally (capitalize first letter, lowercase rest)
    const firstName = formatNamePart(defaultProfile.first_name || "");
    const middleName = formatNamePart(defaultProfile.middle_name || "");
    const lastName = formatNamePart(defaultProfile.last_name || "");
    const fullName = [title, firstName, middleName, lastName]
      .filter((part) => part && typeof part === "string" && part.trim().length > 0)
      .join(" ");

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      // Return user with default role even if insert fails
      return {
        id: authUser.id,
        email: authUser.email || "",
        fullName: fullName,
        role: defaultProfile.role,
        avatar: defaultProfile.avatar_url || undefined,
        createdAt: new Date(),
      };
    }

    return {
      id: defaultProfile.id,
      email: defaultProfile.email,
      fullName: fullName,
      role: defaultProfile.role,
      avatar: defaultProfile.avatar_url || undefined,
      createdAt: new Date(defaultProfile.created_at),
    };
  }

  // Fetch title if user is a teacher, headteacher, or deputy_headteacher
  let title = "";
  if (["teacher", "headteacher", "deputy_headteacher"].includes(profile.role)) {
    const { data: teacherData } = await supabase
      .from("teachers")
      .select("title")
      .eq("id", profile.id)
      .single();

    if (teacherData?.title) {
      title = formatTitle(teacherData.title);
    }
  }

  // Get name parts from profile and format them professionally
  // Format names to proper case (capitalize first letter, lowercase rest)
  const firstName = formatNamePart(profile.first_name || "");
  const middleName = formatNamePart(profile.middle_name || "");
  const lastName = formatNamePart(profile.last_name || "");

  // Construct fullName with title, first_name, middle_name, and last_name
  // Filter out empty strings and null values (but keep middle_name if it has a value)
  const fullName = [title, firstName, middleName, lastName]
    .filter((part) => part && typeof part === "string" && part.trim().length > 0)
    .join(" ");

  return {
    id: profile.id,
    email: profile.email,
    fullName: fullName,
    role: profile.role as UserRole,
    avatar: profile.avatar_url || undefined,
    createdAt: new Date(profile.created_at),
  };
}

/**
 * Update user role (admin only - you should add permission checks)
 * This is useful for manually changing roles
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}



