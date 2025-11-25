'use server'

import { createClient } from '@/lib/supabase/server'

export interface StudentOption {
    id: string
    name: string
    studentId?: string
    class?: string
    classId?: string
}

/**
 * Fetch all students for selection in guardian registration
 * Returns student ID, full name, and class information
 */
export async function getStudents(): Promise<StudentOption[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('students')
        .select(`
      id,
      profiles!inner (
        first_name,
        middle_name,
        last_name
      ),
      classes:class_id (
        id,
        name
      )
    `)

    if (error) {
        console.error('Error fetching students:', error)
        return []
    }

    if (!data) {
        return []
    }

    // Map and sort the results
    const students = data.map((student: any) => {
        const profile = student.profiles
        const classInfo = student.classes

        // Build full name
        const nameParts = [
            profile?.first_name,
            profile?.middle_name,
            profile?.last_name
        ].filter(Boolean)

        const fullName = nameParts.join(' ') || 'Unknown Student'

        return {
            id: student.id,
            name: fullName,
            class: classInfo?.name,
            classId: classInfo?.id,
        }
    })

    // Sort by name
    return students.sort((a, b) => a.name.localeCompare(b.name))
}
