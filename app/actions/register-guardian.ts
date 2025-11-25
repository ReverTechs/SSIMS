'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Validation schema for guardian registration
const guardianSchema = z.object({
    title: z.enum(['mr', 'mrs', 'ms', 'dr', 'prof', 'rev']),
    firstName: z.string().min(1, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last name is required'),
    gender: z.enum(['male', 'female']),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    alternativePhone: z.string().optional(),
    nationalId: z.string().min(1, 'National ID is required'),
    address: z.string().optional(),
    occupation: z.string().optional(),
    workplace: z.string().optional(),
    workPhone: z.string().optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']).optional(),
    isEmergencyContact: z.boolean().optional(),
})

// Student-guardian relationship schema
const studentGuardianSchema = z.object({
    studentId: z.string(),
    relationship: z.enum([
        'father', 'mother', 'stepfather', 'stepmother',
        'grandfather', 'grandmother', 'uncle', 'aunt',
        'brother', 'sister', 'legal_guardian', 'foster_parent', 'other'
    ]),
    isPrimary: z.boolean(),
    isEmergencyContact: z.boolean(),
    canPickup: z.boolean(),
    financialResponsibility: z.boolean(),
    receivesReportCard: z.boolean(),
    receivesNotifications: z.boolean(),
    notes: z.string().optional(),
})

export type RegisterGuardianState = {
    errors?: {
        [key: string]: string[]
    }
    message?: string
    success?: boolean
}

export async function registerGuardian(
    prevState: RegisterGuardianState,
    formData: FormData
): Promise<RegisterGuardianState> {
    // Validate guardian fields
    const validatedFields = guardianSchema.safeParse({
        title: formData.get('title'),
        firstName: formData.get('firstName'),
        middleName: formData.get('middleName'),
        lastName: formData.get('lastName'),
        gender: formData.get('gender'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),
        alternativePhone: formData.get('alternativePhone'),
        nationalId: formData.get('nationalId'),
        address: formData.get('address'),
        occupation: formData.get('occupation'),
        workplace: formData.get('workplace'),
        workPhone: formData.get('workPhone'),
        preferredContactMethod: formData.get('preferredContactMethod'),
        isEmergencyContact: formData.get('isEmergencyContact') === 'true',
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    // Get student IDs and their relationship data
    const studentIds = formData.getAll('studentIds').filter((id): id is string => typeof id === 'string' && id.length > 0)

    if (studentIds.length === 0) {
        return {
            errors: { studentIds: ['At least one student must be selected'] },
            message: 'Please select at least one student.',
            success: false,
        }
    }

    // Parse student-guardian relationships
    const studentGuardians: z.infer<typeof studentGuardianSchema>[] = []

    for (const studentId of studentIds) {
        const relationship = formData.get(`relationship_${studentId}`) as string

        if (!relationship) {
            return {
                errors: { [`relationship_${studentId}`]: ['Relationship is required for each student'] },
                message: 'Please specify the relationship for all selected students.',
                success: false,
            }
        }

        studentGuardians.push({
            studentId,
            relationship: relationship as any,
            isPrimary: formData.get(`isPrimary_${studentId}`) === 'true',
            isEmergencyContact: formData.get(`isEmergencyContact_${studentId}`) === 'true',
            canPickup: formData.get(`canPickup_${studentId}`) === 'true',
            financialResponsibility: formData.get(`financialResponsibility_${studentId}`) === 'true',
            receivesReportCard: formData.get(`receivesReportCard_${studentId}`) === 'true',
            receivesNotifications: formData.get(`receivesNotifications_${studentId}`) === 'true',
            notes: formData.get(`notes_${studentId}`) as string || undefined,
        })
    }

    const {
        email,
        firstName,
        middleName,
        lastName,
        title,
        gender,
        phoneNumber,
        alternativePhone,
        nationalId,
        address,
        occupation,
        workplace,
        workPhone,
        preferredContactMethod,
        isEmergencyContact,
    } = validatedFields.data

    const supabase = createAdminClient()

    // Check current user permissions
    const cookieSupabase = await createClient()
    const { data: { user: currentUser } } = await cookieSupabase.auth.getUser()

    if (!currentUser) {
        return {
            message: 'You must be logged in to register a guardian.',
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
            message: 'You do not have permission to register guardians.',
            success: false,
        }
    }

    try {
        // 1. Check if national ID already exists
        const { data: existingGuardian } = await supabase
            .from('guardians')
            .select('id')
            .eq('national_id', nationalId)
            .single()

        if (existingGuardian) {
            return {
                errors: { nationalId: ['This National ID is already registered'] },
                message: 'National ID is already registered.',
                success: false,
            }
        }

        // 2. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: 'Student@sssims2025', // Default password - user should change on first login
            email_confirm: true,
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
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

        // 3. Create Profile
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
                    role: 'guardian',
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
                    role: 'guardian',
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

        // 4. Create Guardian Record
        const titleMap: Record<string, string> = {
            mr: 'Mr',
            mrs: 'Mrs',
            ms: 'Ms',
            dr: 'Dr',
            prof: 'Prof',
            rev: 'Rev',
        }

        const { error: guardianError } = await supabase.from('guardians').insert({
            id: userId,
            phone_number: phoneNumber,
            alternative_phone: alternativePhone || null,
            address: address || null,
            occupation: occupation || null,
            national_id: nationalId,
            workplace: workplace || null,
            work_phone: workPhone || null,
            preferred_contact_method: preferredContactMethod || null,
            is_emergency_contact: isEmergencyContact ?? true,
        })

        if (guardianError) {
            console.error('Guardian insert error:', guardianError)
            // Rollback: Delete auth user (cascade should delete profile)
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }

            return {
                message: 'Failed to create guardian record: ' + guardianError.message,
                success: false,
            }
        }

        // 5. Insert Student-Guardian Relationships
        const relationships = studentGuardians.map(sg => ({
            student_id: sg.studentId,
            guardian_id: userId,
            relationship: sg.relationship,
            is_primary: sg.isPrimary,
            is_emergency_contact: sg.isEmergencyContact,
            can_pickup: sg.canPickup,
            financial_responsibility: sg.financialResponsibility,
            receives_report_card: sg.receivesReportCard,
            receives_notifications: sg.receivesNotifications,
            notes: sg.notes || null,
        }))

        const { error: relationshipsError } = await supabase
            .from('student_guardians')
            .insert(relationships)

        if (relationshipsError) {
            console.error('Student-guardian relationships insert error:', relationshipsError)
            // Rollback: Delete auth user (cascade should delete profile and guardian)
            try {
                await supabase.auth.admin.deleteUser(userId)
            } catch (deleteError) {
                console.error('Failed to rollback user creation:', deleteError)
            }

            return {
                message: 'Failed to create student-guardian relationships: ' + relationshipsError.message,
                success: false,
            }
        }

        revalidatePath('/dashboard/register-guardians')

        return {
            message: 'Guardian registered successfully!',
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
