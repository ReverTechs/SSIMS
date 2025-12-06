'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createDepartment, updateDepartment, deleteDepartment } from '@/lib/data/departments'

const createSchema = z.object({
    name: z.string().min(1, 'Department name is required'),
    code: z.string().min(1, 'Department code is required'),
    budget: z.coerce.number().min(0, 'Budget must be a positive number').optional(),
    headOfDepartmentId: z.string().optional().nullable(),
})

const updateSchema = createSchema.partial().extend({
    id: z.string().min(1, 'Department ID is required'),
})

export type DepartmentState = {
    errors?: {
        [key: string]: string[]
    }
    message?: string
    success?: boolean
}

export async function createDepartmentAction(
    prevState: DepartmentState,
    formData: FormData
): Promise<DepartmentState> {
    const validatedFields = createSchema.safeParse({
        name: formData.get('name'),
        code: formData.get('code'),
        budget: formData.get('budget'),
        headOfDepartmentId: formData.get('headOfDepartmentId') || null,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    const { name, code, budget, headOfDepartmentId } = validatedFields.data

    try {
        const result = await createDepartment({
            name,
            code,
            budget,
            head_of_department_id: headOfDepartmentId || undefined,
        })

        if (!result.success) {
            return {
                message: result.error || 'Failed to create department.',
                success: false,
            }
        }

        revalidatePath('/dashboard/management/departments-subjects')
        return {
            message: 'Department created successfully!',
            success: true,
        }
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong.',
            success: false,
        }
    }
}

export async function updateDepartmentAction(
    prevState: DepartmentState,
    formData: FormData
): Promise<DepartmentState> {
    const validatedFields = updateSchema.safeParse({
        id: formData.get('id'),
        name: formData.get('name'),
        code: formData.get('code'),
        budget: formData.get('budget'),
        headOfDepartmentId: formData.get('headOfDepartmentId') || null,
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please check the form for errors.',
            success: false,
        }
    }

    const { id, name, code, budget, headOfDepartmentId } = validatedFields.data

    if (!id) {
        return {
            message: 'Department ID is missing.',
            success: false,
        }
    }

    try {
        const result = await updateDepartment(id, {
            name,
            code,
            budget,
            head_of_department_id: headOfDepartmentId || undefined,
        })

        if (!result.success) {
            return {
                message: result.error || 'Failed to update department.',
                success: false,
            }
        }

        revalidatePath('/dashboard/management/departments-subjects')
        return {
            message: 'Department updated successfully!',
            success: true,
        }
    } catch (error: any) {
        return {
            message: error.message || 'Something went wrong.',
            success: false,
        }
    }
}

export async function deleteDepartmentAction(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await deleteDepartment(id)
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to delete department.' }
        }
        revalidatePath('/dashboard/management/departments-subjects')
        return { success: true, message: 'Department deleted successfully.' }
    } catch (error: any) {
        return { success: false, message: error.message || 'An error occurred.' }
    }
}
