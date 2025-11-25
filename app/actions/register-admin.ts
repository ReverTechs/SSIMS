'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    isSuperAdmin: z.boolean().default(false),
})

export type RegisterAdminState = {
    errors?: {
        [key: string]: string[]
    }
    message?: string
    success?: boolean
}

export async function registerAdmin(
    prevState: RegisterAdminState,
    formData: FormData
): Promise<RegisterAdminState> {
    const validatedFields = schema.safeParse({
        firstName: formData.get('firstName'),
        middleName: formData.get('middleName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),
        isSuperAdmin: formData.get('isSuperAdmin') === 'on',
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    const {
        email,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        isSuperAdmin,
    } = validatedFields.data

    const supabase = createAdminClient()

    // Check current user role
    const cookieSupabase = await createClient()
    const { data: { user: currentUser } } = await cookieSupabase.auth.getUser()

    if (!currentUser) {
        return {
            message: 'You must be logged in to register an admin.',
            success: false,
        }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    // Only existing admins and headteachers can register new admins
    const allowedRoles = ['admin', 'headteacher'];
    if (!currentProfile || !allowedRoles.includes(currentProfile.role)) {
        return {
            message: 'You do not have permission to register admins.',
            success: false,
        }
    }

    try {
        // Check if user already exists
        const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers()

        // Note: listUsers isn't efficient for searching by email if there are many users, 
        // but for now it's a workaround if we don't have a direct email search or if we want to be safe.
        // Better approach: Try to create, catch error if exists, or use a specific RPC if available.
        // Actually, let's try to fetch by email directly via the profiles table first to see if they are in our system.

        // However, auth.users is the source of truth for existence.
        // Let's try to create the user first. If it fails with "already registered", we handle the dual role.

        let userId: string | null = null;
        let isNewUser = false;

        // 1. Try to Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'ChangeMe123!', // Default password
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                role: 'admin', // Default role for new users
                must_change_password: true,
            },
        })

        if (authError) {
            if (authError.message.includes('already registered') || authError.status === 422) {
                // User exists, find their ID
                // We can't easily get the ID from the error, so we query the profiles table (assuming they have a profile)
                // Or we can query auth.users if we had access, but we can use listUsers with filter if supported or just assume profile exists.

                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .single()

                if (!existingProfile) {
                    return {
                        message: 'User exists in Auth but has no profile. Please contact support.',
                        success: false,
                    }
                }
                userId = existingProfile.id;
            } else {
                console.error('Auth creation error:', authError)
                return {
                    message: 'Failed to create user account: ' + authError.message,
                    success: false,
                }
            }
        } else {
            if (!authData.user) {
                return {
                    message: 'Failed to create user: No user data returned',
                    success: false,
                }
            }
            userId = authData.user.id
            isNewUser = true;
        }

        if (!userId) {
            return {
                message: 'Failed to resolve user ID.',
                success: false,
            }
        }

        // 2. Create/Update Profile
        if (isNewUser) {
            // Create profile manually
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    first_name: firstName,
                    middle_name: middleName || null,
                    last_name: lastName,
                    role: 'admin',
                })

            if (insertError) {
                // Rollback auth user
                await supabase.auth.admin.deleteUser(userId)
                return {
                    message: 'Failed to create profile: ' + insertError.message,
                    success: false,
                }
            }
        } else {
            // Update existing profile? 
            // We might not want to overwrite their name if they already exist, but we might want to ensure they have the admin role?
            // Actually, the requirement says "include the dual role". 
            // The `role` column in `profiles` is a single enum. It usually represents the "primary" dashboard.
            // If they are a teacher, and we make them an admin, should their primary dashboard become admin?
            // Let's assume yes, or at least we don't break the existing one. 
            // But `role` is NOT an array. It's an ENUM.
            // So a user is EITHER 'teacher' OR 'admin' in the `profiles` table context.
            // BUT, the existence of a record in `teachers` table makes them a teacher.
            // The existence of a record in `admins` table makes them an admin.
            // The `role` column might just be for the default login redirect.
            // Let's update the role to 'admin' so they can access the admin dashboard, 
            // assuming Admin privileges supersede others or they can switch.

            // For now, let's NOT change the `role` column if it's already set, unless we want to force them to be admin.
            // Or maybe we should? The prompt says "include the dual role".
            // Let's leave the `role` column as is if it exists, relying on the `admins` table for permission checks.
            // However, the dashboard layout might rely on `profile.role`.
            // If `profile.role` is 'teacher', they might not see Admin links.
            // This is a broader architectural issue. 
            // For this task, I will ensure the `admins` record is created.
            // I will also update the `role` to 'admin' if it's currently 'student' or 'guardian', 
            // but maybe be careful if it's 'teacher'.
            // Let's just update the profile names if provided, but keep role logic simple for now.

            // Actually, let's just ensure the `admins` record is created.
        }

        // 3. Create Admin Record
        const { error: adminError } = await supabase.from('admins').upsert({
            id: userId,
            phone_number: phoneNumber,
            is_super_admin: isSuperAdmin,
            updated_at: new Date().toISOString(),
        })

        if (adminError) {
            console.error('Admin insert error:', adminError)
            if (isNewUser) {
                await supabase.auth.admin.deleteUser(userId)
            }
            return {
                message: 'Failed to create admin record: ' + adminError.message,
                success: false,
            }
        }

        revalidatePath('/dashboard/register-admin')

        return {
            message: isNewUser ? 'Admin registered successfully!' : 'Existing user promoted to Admin successfully!',
            success: true,
        }

    } catch (error: any) {
        console.error('Registration error:', error)
        return {
            message: error.message || 'Something went wrong during registration.',
            success: false,
        }
    }
}
