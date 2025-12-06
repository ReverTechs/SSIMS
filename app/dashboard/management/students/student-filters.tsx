'use client'

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

interface StudentFiltersProps {
    grades: string[]
}

export function StudentFilters({ grades }: StudentFiltersProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('query', term)
        } else {
            params.delete('query')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleGradeChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set('grade', value)
        } else {
            params.delete('grade')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    const handleStatusChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set('status', value)
        } else {
            params.delete('status')
        }
        replace(`${pathname}?${params.toString()}`)
    }

    const handleExport = () => {
        const params = new URLSearchParams(searchParams)
        const url = `/api/students/export?${params.toString()}`
        window.open(url, '_blank')
    }

    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
                <label className="text-sm font-medium">Search roster</label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Type student name or ID"
                        className="pl-9"
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('query')?.toString()}
                    />
                </div>
            </div>
            <div className="w-full md:w-52">
                <label className="text-sm font-medium">Grade level</label>
                <Select defaultValue={searchParams.get('grade')?.toString() || "all"} onValueChange={handleGradeChange}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All grades</SelectItem>
                        {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full md:w-52">
                <label className="text-sm font-medium">Status</label>
                <Select defaultValue={searchParams.get('status')?.toString() || "active"} onValueChange={handleStatusChange}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="flagged">Flagged</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button className="w-full md:w-auto" onClick={handleExport}>Export selection</Button>
        </div>
    )
}
