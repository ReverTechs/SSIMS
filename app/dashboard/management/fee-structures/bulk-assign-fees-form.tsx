'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { toast } from 'sonner';
import { bulkAssignFees, previewBulkAssignment } from '@/actions/fees-management/bulk-assign-fees';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AcademicYear {
    id: string;
    name: string;
}

interface Term {
    id: string;
    name: string;
    academic_year_id: string;
}

interface BulkAssignFeesFormProps {
    academicYears: AcademicYear[];
    terms: Term[];
}

interface PreviewData {
    internal: {
        count: number;
        amount_per_student: number;
        total: number;
        structure_name: string;
    };
    external: {
        count: number;
        amount_per_student: number;
        total: number;
        structure_name: string;
    };
    total_students: number;
    total_expected_revenue: number;
    already_assigned: number;
}

export function BulkAssignFeesForm({ academicYears, terms }: BulkAssignFeesFormProps) {
    const [isPending, startTransition] = useTransition();
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [formData, setFormData] = useState({
        academicYearId: '',
        termId: '',
    });
    const [preview, setPreview] = useState<PreviewData | null>(null);

    const filteredTerms = terms.filter(t => t.academic_year_id === formData.academicYearId);

    const handlePreview = async () => {
        if (!formData.academicYearId || !formData.termId) {
            toast.error('Please select both academic year and term');
            return;
        }

        setIsLoadingPreview(true);
        const result = await previewBulkAssignment({
            academic_year_id: formData.academicYearId,
            term_id: formData.termId,
        });
        setIsLoadingPreview(false);

        if (result.error) {
            toast.error(result.error);
            setPreview(null);
        } else if (result.preview) {
            setPreview(result.preview);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.academicYearId || !formData.termId) {
            toast.error('Please select both academic year and term');
            return;
        }

        if (!preview) {
            toast.error('Please preview the assignment first');
            return;
        }

        if (preview.total_students === 0) {
            toast.error('No students to assign fees to');
            return;
        }

        startTransition(async () => {
            const result = await bulkAssignFees({
                academic_year_id: formData.academicYearId,
                term_id: formData.termId,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Fees assigned successfully!');
                // Reset
                setFormData({ academicYearId: '', termId: '' });
                setPreview(null);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Bulk Fee Assignment</CardTitle>
                </div>
                <CardDescription>
                    Automatically assign fees to all students based on their type (internal/external)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year *</Label>
                            <Select
                                value={formData.academicYearId}
                                onValueChange={(val) => {
                                    setFormData({ academicYearId: val, termId: '' });
                                    setPreview(null);
                                }}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select academic year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="term">Term *</Label>
                            <Select
                                value={formData.termId}
                                onValueChange={(val) => {
                                    setFormData(prev => ({ ...prev, termId: val }));
                                    setPreview(null);
                                }}
                                required
                                disabled={!formData.academicYearId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredTerms.map((term) => (
                                        <SelectItem key={term.id} value={term.id}>
                                            {term.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Preview Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handlePreview}
                        disabled={!formData.academicYearId || !formData.termId || isLoadingPreview}
                    >
                        {isLoadingPreview ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading Preview...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Preview Assignment
                            </>
                        )}
                    </Button>

                    {/* Preview Results */}
                    {preview && (
                        <div className="space-y-4">
                            {preview.already_assigned > 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {preview.already_assigned} student{preview.already_assigned > 1 ? 's' : ''} already {preview.already_assigned > 1 ? 'have' : 'has'} fees assigned for this term and will be skipped.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Internal Students */}
                                <Card className="border-blue-200 bg-blue-50/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-blue-900">
                                            Internal Students (Boarders)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Students:</span>
                                            <span className="font-semibold">{preview.internal.count}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Amount each:</span>
                                            <span className="font-semibold">
                                                MK {preview.internal.amount_per_student.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-bold text-blue-900">
                                                MK {preview.internal.total.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {preview.internal.structure_name}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* External Students */}
                                <Card className="border-green-200 bg-green-50/50">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium text-green-900">
                                            External Students (Day Scholars)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Students:</span>
                                            <span className="font-semibold">{preview.external.count}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Amount each:</span>
                                            <span className="font-semibold">
                                                MK {preview.external.amount_per_student.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t">
                                            <span className="text-muted-foreground">Total:</span>
                                            <span className="font-bold text-green-900">
                                                MK {preview.external.total.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {preview.external.structure_name}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Grand Total */}
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Students</p>
                                            <p className="text-2xl font-bold">{preview.total_students}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Expected Revenue</p>
                                            <p className="text-2xl font-bold text-primary">
                                                MK {preview.total_expected_revenue.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        className="w-full"
                        disabled={isPending || !preview || preview.total_students === 0}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning Fees...
                            </>
                        ) : (
                            <>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Assign Fees to {preview?.total_students || 0} Students
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
