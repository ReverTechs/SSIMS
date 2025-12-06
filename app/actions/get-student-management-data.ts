'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface StudentManagementStats {
    activeStudents: number
    graduationReadiness: string
    pendingInterventions: number
}

export interface StudentRecord {
    id: string
    studentId: string
    name: string
    grade: string
    guardian: string
    status: 'active' | 'inactive' | 'flagged' | 'archived'
    fees: string
}

// Helper to get distinct grades (Forms) from database
export async function getStudentGrades(): Promise<string[]> {
    const supabase = createAdminClient()
    const { data } = await supabase.from('classes').select('name')

    if (!data) return []

    // Extract unique "Form X" parts from class names like "Form 1A", "Form 1B"
    const grades = new Set<string>()
    data.forEach((c: any) => {
        const match = c.name.match(/^(Form\s*\d+)/i)
        if (match) {
            grades.add(match[1])
        } else {
            // Fallback for non-standard class names
            grades.add(c.name)
        }
    })

    return Array.from(grades).sort()
}

export async function getStudentManagementStats(): Promise<StudentManagementStats> {
    const supabase = createAdminClient()

    const [activeRes, form4Res, flaggedRes] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('students').select('*, classes!inner(name)', { count: 'exact', head: true }).eq('status', 'active').ilike('classes.name', '%Form 4%'),
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'flagged')
    ])

    const activeCount = activeRes.count || 0

    // Placeholder metric logic
    const readiness = activeCount > 0 ? '92%' : '0%'

    return {
        activeStudents: activeCount,
        graduationReadiness: readiness,
        pendingInterventions: flaggedRes.count || 0
    }
}

export async function getStudentManagementList(
    search?: string,
    grade?: string,
    status?: string
): Promise<StudentRecord[]> {
    const supabase = createAdminClient()

    let query = supabase
        .from('students')
        .select(`
      id,
      student_id,
      status,
      profiles!inner (
        first_name,
        middle_name,
        last_name
      ),
      classes!inner (
        name
      ),
      student_guardians (
        is_primary,
        guardians (
            profiles (
                first_name,
                last_name
            )
        )
      ),
      invoices (
        balance,
        total_amount
      )
    `)

    if (search) {
        query = query.ilike('student_id', `%${search}%`)
    }

    if (grade && grade !== 'all') {
        query = query.ilike('classes.name', `${grade}%`)
    }

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    const { data, error } = await query.limit(50)

    if (error) {
        console.error('Error fetching student list:', JSON.stringify(error, null, 2))
        return []
    }

    // Map to interface
    let students = (data || []).map((item: any) => {
        // Name
        const p = item.profiles
        const name = [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' ')

        // Grade
        const grade = item.classes?.name || 'Unassigned'

        // Guardian
        const guardiansList = Array.isArray(item.student_guardians) ? item.student_guardians : []
        const primaryLink = guardiansList.find((sg: any) => sg.is_primary)
        const guardianProfile = primaryLink?.guardians?.profiles
        const guardianName = guardianProfile
            ? `${guardianProfile.first_name} ${guardianProfile.last_name}`
            : 'No Primary Guardian'

        // Fees Logic
        const invoices = Array.isArray(item.invoices) ? item.invoices : []
        let feeStatus = 'No Invoices'

        if (invoices.length > 0) {
            const totalDue = invoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0)
            const currentBalance = invoices.reduce((sum: number, inv: any) => sum + (inv.balance || 0), 0)

            if (currentBalance <= 0) {
                feeStatus = 'Paid'
            } else if (currentBalance >= totalDue) {
                feeStatus = 'Not Paid'
            } else {
                feeStatus = 'Partial'
            }
        }

        return {
            id: item.id,
            studentId: item.student_id || 'N/A',
            name,
            grade,
            guardian: guardianName,
            status: item.status || 'active',
            fees: feeStatus
        }
    })

    return students
}
