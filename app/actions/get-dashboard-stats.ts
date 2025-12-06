'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface DashboardStats {
    studentCount: number
    teacherCount: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = createAdminClient()

    const [studentsResponse, teachersResponse] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ])

    if (studentsResponse.error) {
        console.error('Error fetching student count:', studentsResponse.error)
    }

    if (teachersResponse.error) {
        console.error('Error fetching teacher count:', teachersResponse.error)
    }

    return {
        studentCount: studentsResponse.count || 0,
        teacherCount: teachersResponse.count || 0,
    }
}
