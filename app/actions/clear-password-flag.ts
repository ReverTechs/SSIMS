'use server';

import { createClient } from '@/utils/supabase/server';

/**
 * Temporary utility to clear the must_change_password flag for the current user
 * This is useful for development/testing when you get stuck in the redirect loop
 */
export async function clearMustChangePasswordFlag() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return { error: 'Not authenticated' };
    }

    // Update user metadata to clear the flag
    const { error } = await supabase.auth.updateUser({
        data: { must_change_password: false }
    });

    if (error) {
        return { error: error.message };
    }

    // Refresh session
    const { error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
        return { error: refreshError.message };
    }

    return { success: true, message: 'Flag cleared successfully. Redirecting to dashboard...' };
}
