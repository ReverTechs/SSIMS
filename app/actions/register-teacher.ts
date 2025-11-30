'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const schema = z.object({
    title: z.enum(['mr', 'mrs', 'ms', 'dr', 'prof', 'rev']),
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    gender: z.enum(['male', 'female']),
    email: z.string().email('Invalid email address'),
    employeeId: z.string().min(1, 'Employee ID is required'),
    department: z.string().min(1, 'Department is required'),
    role: z.enum(['teacher', 'headteacher', 'deputy_headteacher']),
    teacherType: z.enum(['permanent', 'temporary', 'tp']),
})

export type RegisterTeacherState = {
    errors?: {
        [key: string]: string[]
    }
    message?: string
    success?: boolean
}

export async function registerTeacher(
    prevState: RegisterTeacherState,
    formData: FormData
): Promise<RegisterTeacherState> {
    const validatedFields = schema.safeParse({
        title: formData.get('title'),
        firstName: formData.get('firstName'),
        middleName: formData.get('middleName'),
        lastName: formData.get('lastName'),
        gender: formData.get('gender'),
        email: formData.get('email'),
        employeeId: formData.get('employeeId'),
        department: formData.get('department'),
        role: formData.get('role'),
        teacherType: formData.get('teacherType'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    // Get subject IDs and class IDs from form data
    const subjectIds = formData.getAll('subjectIds').filter((id): id is string => typeof id === 'string' && id.length > 0)
    const classIds = formData.getAll('classIds').filter((id): id is string => typeof id === 'string' && id.length > 0)

    // Validate that at least one subject is selected
    if (subjectIds.length === 0) {
        return {
            errors: { subjectIds: ['At least one subject must be selected'] },
            message: 'Please select at least one subject.',
            success: false,
        }
    }

    // Validate that at least one class is selected
    if (classIds.length === 0) {
        return {
            errors: { classIds: ['At least one class must be selected'] },
            message: 'Please select at least one class.',
            success: false,
        }
    }

    const {
        email,
        firstName,
        middleName,
        lastName,
        role,
        employeeId,
        title,
        gender,
        department,
        teacherType,
    } = validatedFields.data

    const supabase = createAdminClient()

    // Check current user role
    const cookieSupabase = await createClient()
    const { data: { user: currentUser } } = await cookieSupabase.auth.getUser()

    if (!currentUser) {
        return {
            message: 'You must be logged in to register a teacher.',
            success: false,
        }
    }

    const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single()

    const allowedRoles = ['admin', 'headteacher', 'deputy_headteacher']

    if (!currentProfile || !allowedRoles.includes(currentProfile.role)) {
        return {
            message: 'You do not have permission to register teachers.',
            success: false,
        }
    }

    // Check if Employee ID already exists
    const { data: existingTeacher, error: checkError } = await supabase
        .from('teachers')
        .select('employee_id')
        .eq('employee_id', employeeId)
        .maybeSingle()

    if (checkError) {
        console.error('Error checking for duplicate Employee ID:', checkError)
        return {
            message: 'Failed to validate Employee ID. Please try again.',
            success: false,
        }
    }

    if (existingTeacher) {
        return {
            errors: { employeeId: ['Employee ID is already in use'] },
            message: 'Employee ID is already in use.',
            success: false,
        }
    }

    try {
        // 1. Create Auth User
        // Note: We manually create the profile after auth user creation
        // since the trigger was dropped for better control and error handling
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'ChangeMe123!', // Default password - user should change on first login
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                must_change_password: true,
            },
        })

        if (authError) {
            if (authError.message.includes('already registered') || authError.status === 422) {
                return {
                    errors: { email: ['Email is already registered'] },
                    message: 'Email is already registered.',
                    success: false,
                }
            }
            console.error('Auth creation error:', authError)
            return {
                message: 'Failed to create user account: ' + authError.message,
                success: false,
            }
        }

        if (!authData.user) {
            return {
                message: 'Failed to create user: No user data returned',
                success: false,
            }
        }

        const userId = authData.user.id

        // 2. Create Profile manually (trigger was dropped, so we handle it explicitly)
        // Check if profile exists first (in case trigger still exists)
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single()

        let profileError = null
        if (existingProfile) {
            // Profile exists (trigger created it), so update it
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    role: role,
                    middle_name: middleName || null,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                })
                .eq('id', userId)
            profileError = updateError
        } else {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    first_name: firstName,
                    middle_name: middleName || null,
                    last_name: lastName,
                    role: role,
                })
            profileError = insertError
        }

        if (profileError) {
            console.error('Profile creation/update error:', profileError)
            // Rollback: Delete auth user
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }
            return {
                message: 'Failed to create user profile: ' + profileError.message,
                success: false,
            }
        }

        // 3. Create Teacher Record
        const titleMap: Record<string, string> = {
            mr: 'Mr',
            mrs: 'Mrs',
            ms: 'Ms',
            dr: 'Dr',
            prof: 'Prof',
            rev: 'Rev',
        }

        const { error: teacherError } = await supabase.from('teachers').insert({
            id: userId,
            employee_id: employeeId,
            title: titleMap[title],
            gender: gender,
            department_id: department === 'no-departments' ? null : department,
            specialization: null, // Keep specialization field but set to null - subjects are stored in teacher_subjects table
            teacher_type: teacherType,
            status: 'active',
        })

        if (teacherError) {
            console.error('Teacher insert error:', teacherError)
            // Rollback: Delete auth user (cascade should delete profile)
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }

            return {
                message: 'Failed to create teacher record: ' + teacherError.message,
                success: false,
            }
        }

        // 4. Insert Teacher Subjects (junction table)
        const teacherSubjects = subjectIds.map(subjectId => ({
            teacher_id: userId,
            subject_id: subjectId,
        }))

        const { error: subjectsError } = await supabase
            .from('teacher_subjects')
            .insert(teacherSubjects)

        if (subjectsError) {
            console.error('Teacher subjects insert error:', subjectsError)
            // Rollback: Delete auth user (cascade should delete profile and teacher)
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }

            return {
                message: 'Failed to assign subjects: ' + subjectsError.message,
                success: false,
            }
        }

        // 5. Insert Teacher Classes (junction table)
        const teacherClasses = classIds.map(classId => ({
            teacher_id: userId,
            class_id: classId,
            role: 'subject_teacher' as const, // Default role, can be updated later
        }))

        const { error: classesError } = await supabase
            .from('teacher_classes')
            .insert(teacherClasses)

        if (classesError) {
            console.error('Teacher classes insert error:', classesError)
            // Rollback: Delete auth user (cascade should delete profile, teacher, and teacher_subjects)
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }

            return {
                message: 'Failed to assign classes: ' + classesError.message,
                success: false,
            }
        }

        revalidatePath('/dashboard/register-teachers')

        return {
            message: 'Teacher registered successfully!',
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
