import { createClient } from "./server";
import { User, UserRole } from "@/types";

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

  // Get user profile with role from user_profiles table
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError || !profile) {
    // If profile doesn't exist, create one with default role
    // This can happen if the trigger didn't fire or user was created before migration
    const defaultProfile = {
      id: authUser.id,
      email: authUser.email || "",
      full_name: authUser.user_metadata?.full_name || authUser.email || "User",
      role: (authUser.user_metadata?.role || "student") as UserRole,
      avatar: authUser.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to insert the profile
    const { error: insertError } = await supabase
      .from("user_profiles")
      .insert(defaultProfile);

    if (insertError) {
      console.error("Error creating user profile:", insertError);
      // Return user with default role even if insert fails
      return {
        id: authUser.id,
        email: authUser.email || "",
        fullName: defaultProfile.full_name,
        role: defaultProfile.role,
        avatar: defaultProfile.avatar || undefined,
        createdAt: new Date(),
      };
    }

    return {
      id: defaultProfile.id,
      email: defaultProfile.email,
      fullName: defaultProfile.full_name,
      role: defaultProfile.role,
      avatar: defaultProfile.avatar || undefined,
      createdAt: new Date(defaultProfile.created_at),
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as UserRole,
    avatar: profile.avatar || undefined,
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
    .from("user_profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}



