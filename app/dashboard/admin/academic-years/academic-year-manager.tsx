'use client'

import { useState, useEffect } from 'react'
import { AcademicYear, Term } from '@/types'
import { createAcademicYear, setActiveAcademicYear, getAcademicYears } from '@/actions/enrollment/academic-years'
import { createTerm, setActiveTerm, getTerms } from '@/actions/enrollment/terms'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { Loader2, Plus, Calendar, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function AcademicYearManager({ initialYears }: { initialYears: AcademicYear[] }) {
    const [years, setYears] = useState<AcademicYear[]>(initialYears)
    const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(initialYears.find(y => y.isActive) || initialYears[0] || null)
    const [terms, setTerms] = useState<Term[]>([])
    const [loadingTerms, setLoadingTerms] = useState(false)
    const [isCreateYearOpen, setIsCreateYearOpen] = useState(false)
    const [isCreateTermOpen, setIsCreateTermOpen] = useState(false)

    // Form states
    const [newYearName, setNewYearName] = useState('')
    const [newYearStart, setNewYearStart] = useState('')
    const [newYearEnd, setNewYearEnd] = useState('')

    const [newTermName, setNewTermName] = useState('')
    const [newTermStart, setNewTermStart] = useState('')
    const [newTermEnd, setNewTermEnd] = useState('')

    useEffect(() => {
        if (selectedYear) {
            fetchTerms(selectedYear.id)
        }
    }, [selectedYear])

    async function fetchTerms(yearId: string) {
        setLoadingTerms(true)
        try {
            const data = await getTerms(yearId)
            setTerms(data)
        } catch (error) {
            toast.error('Failed to load terms')
        } finally {
            setLoadingTerms(false)
        }
    }

    async function handleCreateYear() {
        try {
            await createAcademicYear({
                name: newYearName,
                startDate: new Date(newYearStart),
                endDate: new Date(newYearEnd),
                isActive: false // Default to false
            })
            toast.success('Academic Year created')
            setIsCreateYearOpen(false)
            // Refresh list
            const updatedYears = await getAcademicYears()
            setYears(updatedYears)
        } catch (error) {
            toast.error('Failed to create academic year')
        }
    }

    async function handleCreateTerm() {
        if (!selectedYear) return
        try {
            await createTerm({
                academicYearId: selectedYear.id,
                name: newTermName,
                startDate: new Date(newTermStart),
                endDate: new Date(newTermEnd),
                isActive: false
            })
            toast.success('Term created')
            setIsCreateTermOpen(false)
            fetchTerms(selectedYear.id)
        } catch (error) {
            toast.error('Failed to create term')
        }
    }

    async function handleSetActiveYear(id: string) {
        try {
            await setActiveAcademicYear(id)
            toast.success('Active academic year updated')
            const updatedYears = await getAcademicYears()
            setYears(updatedYears)
            // Update selected year to the new active one
            const newActive = updatedYears.find(y => y.id === id)
            if (newActive) setSelectedYear(newActive)
        } catch (error) {
            toast.error('Failed to update active year')
        }
    }

    async function handleSetActiveTerm(id: string) {
        try {
            await setActiveTerm(id)
            toast.success('Active term updated')
            if (selectedYear) fetchTerms(selectedYear.id)
        } catch (error) {
            toast.error('Failed to update active term')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Academic Years</h2>
                <Dialog open={isCreateYearOpen} onOpenChange={setIsCreateYearOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Academic Year
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Academic Year</DialogTitle>
                            <DialogDescription>Define a new academic year period.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input placeholder="e.g. 2025-2026" value={newYearName} onChange={e => setNewYearName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={newYearStart} onChange={e => setNewYearStart(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={newYearEnd} onChange={e => setNewYearEnd(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateYear}>Create Year</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Years</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {years.map((year) => (
                                <button
                                    key={year.id}
                                    onClick={() => setSelectedYear(year)}
                                    className={`flex items-center justify-between p-4 text-sm transition-colors hover:bg-muted/50 ${selectedYear?.id === year.id ? 'bg-muted font-medium' : ''
                                        }`}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span>{year.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(year.startDate, 'MMM yyyy')} - {format(year.endDate, 'MMM yyyy')}
                                        </span>
                                    </div>
                                    {year.isActive && (
                                        <span className="flex h-2 w-2 rounded-full bg-green-500" title="Active Year" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {selectedYear ? (
                        <>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle>{selectedYear.name}</CardTitle>
                                        <CardDescription>
                                            {format(selectedYear.startDate, 'MMMM d, yyyy')} - {format(selectedYear.endDate, 'MMMM d, yyyy')}
                                        </CardDescription>
                                    </div>
                                    {!selectedYear.isActive && (
                                        <Button variant="outline" size="sm" onClick={() => handleSetActiveYear(selectedYear.id)}>
                                            Set as Active Year
                                        </Button>
                                    )}
                                    {selectedYear.isActive && (
                                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Active Academic Year
                                        </div>
                                    )}
                                </CardHeader>
                            </Card>

                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Terms</h3>
                                <Dialog open={isCreateTermOpen} onOpenChange={setIsCreateTermOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" /> Add Term
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Term to {selectedYear.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Name</Label>
                                                <Input placeholder="e.g. Term 1" value={newTermName} onChange={e => setNewTermName(e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input type="date" value={newTermStart} onChange={e => setNewTermStart(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <Input type="date" value={newTermEnd} onChange={e => setNewTermEnd(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleCreateTerm}>Create Term</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-4">
                                {loadingTerms ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : terms.length === 0 ? (
                                    <div className="text-center p-8 border rounded-lg border-dashed text-muted-foreground">
                                        No terms found for this academic year.
                                    </div>
                                ) : (
                                    terms.map((term) => (
                                        <Card key={term.id}>
                                            <CardContent className="flex items-center justify-between p-6">
                                                <div className="space-y-1">
                                                    <h4 className="font-semibold">{term.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(term.startDate, 'MMM d')} - {format(term.endDate, 'MMM d, yyyy')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {term.isActive ? (
                                                        <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Active Term</span>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => handleSetActiveTerm(term.id)}>
                                                            Set Active
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                            Select an academic year to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
