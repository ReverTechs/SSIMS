'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type RegisterStudentState = {
    success?: boolean;
    error?: string;
    message?: string;
};

export async function registerStudent(prevState: RegisterStudentState, formData: FormData): Promise<RegisterStudentState> {
    // const supabase = await createClient(); // Unused

    const firstName = formData.get('firstName') as string;
    const middleName = formData.get('middleName') as string;
    const lastName = formData.get('lastName') as string;
    const gender = formData.get('gender') as string;
    const email = formData.get('email') as string;
    const studentId = formData.get('studentId') as string; // Note: In a real app, this might be auto-generated
    const studentType = formData.get('studentType') as string;
    const classId = formData.get('classId') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const guardian = formData.get('guardian') as string;

    // Basic validation
    if (!firstName || !lastName || !gender || !classId) {
        return { error: 'Please fill in all required fields.' };
    }

    // Create a Supabase client with the service role key to create users
    // We need to import createClient from @supabase/supabase-js for this, as the one in utils/supabase/server.ts 
    // is for the current user context (using cookies).
    // However, we can't easily mix them. 
    // Let's try to use the `supabase` client we have. If the current user is an admin, 
    // they might have permission to create users if RLS allows it, but usually `auth.users` is protected.
    // The standard way is using `supabase.auth.admin.createUser` which requires the service_role key.

    // Since we are in a server action, we can use the service role key safely if it's in env.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return { error: 'Server configuration error. Please contact support.' };
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        // 1. Create the Auth User
        // If email is not provided, we might need to generate a dummy one or require it.
        // For students, maybe we use studentId@school.com if no email?
        // Let's assume email is optional in form but required for auth.
        // If email is empty, we can't create an auth user easily without a fake email.

        let userEmail = email;
        if (!userEmail) {
            // Fallback or error? Let's generate one if missing for now, or error.
            // For this task, let's assume email is provided or we error.
            if (!studentId) {
                return { error: 'Student ID or Email is required to create an account.' };
            }
            userEmail = `${studentId.toLowerCase()}@school.mw`; // Default email format
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: userEmail,
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                role: 'student'
            }
        });

        if (authError) {
            console.error('Auth creation error:', authError);
            return { error: `Failed to create user account: ${authError.message}` };
        }

        if (!authData.user) {
            return { error: 'Failed to create user account.' };
        }

        const userId = authData.user.id;
        // 2. Create/Update Profile
        // The trigger `on_auth_user_created` *should* create the profile, but it might fail or be slow.
        // We will manually UPSERT the profile to ensure it exists and has the correct data.
        // This handles the race condition or trigger failure.

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: userEmail,
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                role: 'student',
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (profileError) {
            console.error('Profile upsert error:', profileError);
            // If profile creation fails, we can't proceed with student creation due to FK.
            // We should try to clean up the auth user.
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return { error: `Failed to create student profile: ${profileError.message}` };
        }

        // 3. Insert into Students table
        const { error: studentError } = await supabaseAdmin
            .from('students')
            .insert({
                id: userId,
                class_id: classId,
                date_of_birth: dateOfBirth || null,
                gender: gender, // Assuming gender enum matches
                student_type: studentType || 'internal',
                guardian_name: guardian,
                // address, phone_number etc if we had them
            });

        if (studentError) {
            console.error('Student insert error:', studentError);
            // Rollback auth user?
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return { error: `Failed to create student record: ${studentError.message}` };
        }

        revalidatePath('/dashboard/register-students');
        return { success: true, message: 'Student registered successfully.' };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'An unexpected error occurred.' };
    }
}
