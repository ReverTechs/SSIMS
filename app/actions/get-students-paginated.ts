'use server'

import { createClient } from '@/lib/supabase/server'

export interface StudentOption {
    id: string
    name: string
    studentId?: string
    class?: string
    classId?: string
}

export interface PaginatedStudentsResult {
    students: StudentOption[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface GetStudentsPaginatedParams {
    searchQuery?: string
    classId?: string
    page?: number
    pageSize?: number
}

/**
 * Fetch students with pagination, search, and filtering
 * @param params - Search query, class filter, page number, and page size
 * @returns Paginated student results
 */
export async function getStudentsPaginated(
    params: GetStudentsPaginatedParams = {}
): Promise<PaginatedStudentsResult> {
    const {
        searchQuery = '',
        classId = '',
        page = 1,
        pageSize = 20
    } = params

    const supabase = await createClient()

    // Build the query
    let query = supabase
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
        `, { count: 'exact' })

    // Apply class filter
    if (classId) {
        query = query.eq('class_id', classId)
    }

    // Apply search filter (search in student_id and name)
    if (searchQuery) {
        // For searching in profile names, we need to use a more complex approach
        // Since we can't directly filter on joined tables in a simple way,
        // we'll fetch and filter in memory for now
        // In production, consider creating a materialized view or using full-text search
    }

    // Get total count first (before pagination)
    const { count: totalCount } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq(classId ? 'class_id' : 'id', classId || undefined)

    const total = totalCount || 0

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    query = query.range(from, to)

    const { data, error } = await query

    if (error) {
        console.error('Error fetching students:', error)
        return {
            students: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0
        }
    }

    if (!data) {
        return {
            students: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0
        }
    }

    // Map the results
    let students = data.map((student: any) => {
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

    // Apply search filter in memory (filter by name or student ID)
    if (searchQuery) {
        const query = searchQuery.toLowerCase()
        students = students.filter(student =>
            student.name.toLowerCase().includes(query)
        )
    }

    // Sort by name
    students.sort((a, b) => a.name.localeCompare(b.name))

    const totalPages = Math.ceil(total / pageSize)

    return {
        students,
        total,
        page,
        pageSize,
        totalPages
    }
}

/**
 * Get all unique classes for filtering
 */
export async function getClassesForFilter(): Promise<Array<{ id: string; name: string }>> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name')

    if (error) {
        console.error('Error fetching classes:', error)
        return []
    }

    return data || []
}
