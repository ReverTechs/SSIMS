'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, School } from 'lucide-react'
import { format } from 'date-fns'

interface Enrollment {
    id: string
    status: string
    academic_year: {
        name: string
        start_date: string
        end_date: string
        is_active: boolean
    }
    class: {
        name: string
    }
}

export function StudentEnrollmentHistory({ studentId }: { studentId: string }) {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('enrollments')
                .select(`
          id,
          status,
          academic_year:academic_years (
            name,
            start_date,
            end_date,
            is_active
          ),
          class:classes (
            name
          )
        `)
                .eq('student_id', studentId)
                .order('academic_year(start_date)', { ascending: false })

            if (!error && data) {
                setEnrollments(data as any)
            }
            setLoading(false)
        }

        fetchHistory()
    }, [studentId])

    if (loading) {
        return <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading history...</div>
    }

    if (enrollments.length === 0) {
        return <div className="text-sm text-muted-foreground">No enrollment history found.</div>
    }

    return (
        <div className="space-y-4">
            {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{enrollment.academic_year.name}</span>
                            {enrollment.academic_year.is_active && (
                                <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">Current</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <School className="h-3 w-3" />
                            <span>{enrollment.class?.name || 'Unknown Class'}</span>
                        </div>
                    </div>
                    <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {enrollment.status}
                    </Badge>
                </div>
            ))}
        </div>
    )
}
