'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createSubject, updateSubject, deleteSubject } from '@/lib/data/subjects'

const createSchema = z.object({
    name: z.string().min(1, 'Subject name is required'),
    code: z.string().min(1, 'Subject code is required'),
    departmentId: z.string().optional().nullable(),
    description: z.string().optional(),
})

const updateSchema = createSchema.partial().extend({
    id: z.string().min(1, 'Subject ID is required'),
})

export type SubjectState = {
    errors?: {
        [key: string]: string[]
    }
    message?: string
    success?: boolean
}

export async function createSubjectAction(
    prevState: SubjectState,
    formData: FormData
): Promise<SubjectState> {
    const validatedFields = createSchema.safeParse({
        name: formData.get('name'),
        code: formData.get('code'),
        departmentId: formData.get('departmentId'),
        description: formData.get('description'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    const { name, code, departmentId, description } = validatedFields.data

    try {
        const result = await createSubject({
            name,
            code,
            departmentId: departmentId || undefined,
            description: description,
        })

        if (!result.success) {
            return {
                message: result.error || 'Failed to create subject.',
                success: false,
            }
        }

        revalidatePath('/dashboard/management/departments-subjects')
        return {
            message: 'Subject created successfully!',
            success: true,
        }
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong.',
            success: false,
        }
    }
}

export async function updateSubjectAction(
    prevState: SubjectState,
    formData: FormData
): Promise<SubjectState> {
    const validatedFields = updateSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        code: formData.get('code'),
        departmentId: formData.get('departmentId'),
        description: formData.get('description'),
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    const { id, name, code, departmentId, description } = validatedFields.data

    if (!id) {
        return {
            message: 'Subject ID is missing.',
            success: false,
        }
    }

    try {
        const result = await updateSubject(id, {
            name,
            code,
            departmentId: departmentId || undefined,
            description,
        })

        if (!result.success) {
            return {
                message: result.error || 'Failed to update subject.',
                success: false,
            }
        }

        revalidatePath('/dashboard/management/departments-subjects')
        return {
            message: 'Subject updated successfully!',
            success: true,
        }
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong.',
            success: false,
        }
    }
}

export async function deleteSubjectAction(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await deleteSubject(id)
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to delete subject.' }
        }
        revalidatePath('/dashboard/management/departments-subjects')
        return { success: true, message: 'Subject deleted successfully.' }
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' }
    }
}
