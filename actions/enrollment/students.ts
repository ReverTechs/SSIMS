'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getActiveAcademicYear } from './academic-years';
import { enrollStudent } from './enrollments';
import { enrollStudentInDefaultSubjects } from './student-subjects';

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
    const guardianEmail = formData.get('guardianEmail') as string;
    const stream = formData.get('stream') as string;

    // Basic validation
    if (!firstName || !lastName || !gender || !classId) {
        return { error: 'Please fill in all required fields.' };
    }

    // Validate Student ID is provided
    if (!studentId || studentId.trim() === '') {
        return { error: 'Student ID is required.' };
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

    // Check if Student ID already exists
    const { data: existingStudent, error: checkError } = await supabaseAdmin
        .from('students')
        .select('id, student_id')
        .eq('student_id', studentId)
        .maybeSingle();

    if (checkError) {
        console.error('Error checking for duplicate Student ID:', checkError);
        return { error: 'Failed to validate Student ID. Please try again.' };
    }

    if (existingStudent) {
        return { error: `Student ID "${studentId}" is already in use. Please use a unique Student ID.` };
    }

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
            password: 'Student@sssims2025', // Default password - user should change on first login
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                role: 'student',
                must_change_password: true,
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
                student_id: studentId, // Save the Student ID from the form
                class_id: classId,
                date_of_birth: dateOfBirth || null,
                gender: gender, // Assuming gender enum matches
                student_type: studentType || 'internal',
                stream: stream || null, // Save stream for senior students
                guardian_email: guardianEmail,
                // address, phone_number etc if we had them
            });

        if (studentError) {
            console.error('Student insert error:', studentError);
            // Rollback auth user?
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return { error: `Failed to create student record: ${studentError.message}` };
        }

        // 4. Create Enrollment for Active Academic Year
        try {
            const activeYear = await getActiveAcademicYear();
            if (activeYear) {
                await enrollStudent({
                    studentId: userId,
                    classId: classId,
                    academicYearId: activeYear.id,
                    status: 'active'
                });

                // 5. Enroll in Default Subjects
                await enrollStudentInDefaultSubjects(userId, classId, stream);

                // 6. Assign Fees Automatically
                try {
                    // Get active term for fee assignment
                    const { data: activeTerm } = await supabaseAdmin
                        .from('terms')
                        .select('id')
                        .eq('academic_year_id', activeYear.id)
                        .eq('is_active', true)
                        .maybeSingle();

                    if (activeTerm) {
                        const { assignStudentFees } = await import('@/actions/fees-management/assign-student-fees');
                        const feeResult = await assignStudentFees({
                            studentId: userId,
                            studentType: (studentType as 'internal' | 'external') || 'internal',
                            academicYearId: activeYear.id,
                            termId: activeTerm.id,
                        });

                        if (feeResult.feeAssigned) {
                            console.log(`[registerStudent] Fees assigned: ${feeResult.amount}`);
                        } else if (feeResult.error) {
                            console.warn(`[registerStudent] Fee assignment failed: ${feeResult.error}`);
                        } else {
                            console.log(`[registerStudent] ${feeResult.message}`);
                        }
                    } else {
                        console.warn('[registerStudent] No active term found for fee assignment');
                    }
                } catch (feeError) {
                    console.error('[registerStudent] Error during fee assignment:', feeError);
                    // Don't fail registration if fee assignment fails
                }
            }
        } catch (enrollError) {
            console.error('Enrollment error:', enrollError);
            // We don't rollback the student creation here, but we should probably alert or log it.
            // The student exists but isn't enrolled in the year history.
            // For now, we'll just log it.
        }

        revalidatePath('/dashboard/register-students');
        return { success: true, message: 'Student registered successfully.' };

    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'An unexpected error occurred.' };
    }
}
