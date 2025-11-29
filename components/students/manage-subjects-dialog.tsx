'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAllSubjects } from '@/actions/subjects';
import { addStudentSubject, removeStudentSubject, getStudentSubjects } from '@/actions/student-subjects';

interface ManageSubjectsDialogProps {
    studentId: string;
    studentName: string;
    onUpdate?: () => void;
}

export function ManageSubjectsDialog({ studentId, studentName, onUpdate }: ManageSubjectsDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [enrolledSubjects, setEnrolledSubjects] = useState<any[]>([]);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allSubjects, studentSubs] = await Promise.all([
                getAllSubjects(),
                getStudentSubjects(studentId)
            ]);
            setSubjects(allSubjects);
            setEnrolledSubjects(studentSubs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSubject = async (subjectId: string, isChecked: boolean) => {
        setProcessing(subjectId);
        try {
            if (isChecked) {
                // Enroll
                const result = await addStudentSubject(studentId, subjectId);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Subject added');
                    // Refresh enrolled list locally
                    const newEnrollment = { subject_id: subjectId, student_id: studentId }; // Mock for UI
                    // Better to re-fetch or just track IDs
                    await fetchData();
                    if (onUpdate) onUpdate();
                }
            } else {
                // Remove
                // Find enrollment ID
                const enrollment = enrolledSubjects.find(s => s.subject_id === subjectId);
                if (enrollment) {
                    const result = await removeStudentSubject(enrollment.id);
                    if (result.error) {
                        toast.error(result.error);
                    } else {
                        toast.success('Subject removed');
                        await fetchData();
                        if (onUpdate) onUpdate();
                    }
                }
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setProcessing(null);
        }
    };

    const isEnrolled = (subjectId: string) => {
        return enrolledSubjects.some(s => s.subject_id === subjectId);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manage Subjects
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Subjects</DialogTitle>
                    <DialogDescription>
                        Add or remove subjects for {studentName} for the current academic year.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="flex items-center space-x-2 border p-3 rounded-md">
                                    <Checkbox
                                        id={subject.id}
                                        checked={isEnrolled(subject.id)}
                                        disabled={processing === subject.id}
                                        onCheckedChange={(checked) => handleToggleSubject(subject.id, checked as boolean)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor={subject.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {subject.name}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {subject.code} {subject.department ? `• ${subject.department}` : ''}
                                        </p>
                                    </div>
                                    {processing === subject.id && (
                                        <Loader2 className="h-3 w-3 animate-spin ml-auto" />
                                    )}
                                </div>
                            ))}
                            {subjects.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No subjects found.</p>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
}
