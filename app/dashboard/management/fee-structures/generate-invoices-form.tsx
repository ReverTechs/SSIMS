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
import { FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { generateInvoices, previewInvoiceGeneration } from '@/actions/fees-management/generate-invoices';
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

interface GenerateInvoicesFormProps {
    academicYears: AcademicYear[];
    terms: Term[];
}

interface PreviewData {
    total_invoices: number;
    internal_count: number;
    external_count: number;
    total_amount: number;
    already_generated: number;
}

export function GenerateInvoicesForm({ academicYears, terms }: GenerateInvoicesFormProps) {
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
        const result = await previewInvoiceGeneration({
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
            toast.error('Please preview the generation first');
            return;
        }

        if (preview.total_invoices === 0) {
            toast.error('No invoices to generate');
            return;
        }

        startTransition(async () => {
            const result = await generateInvoices({
                academic_year_id: formData.academicYearId,
                term_id: formData.termId,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Invoices generated successfully!');
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
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Generate Invoices</CardTitle>
                </div>
                <CardDescription>
                    Create invoices from assigned student fees with auto-generated invoice numbers
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
                                Preview Invoice Generation
                            </>
                        )}
                    </Button>

                    {/* Preview Results */}
                    {preview && (
                        <div className="space-y-4">
                            {preview.already_generated > 0 && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {preview.already_generated} invoice{preview.already_generated > 1 ? 's' : ''} already generated for this term and will be skipped.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Total Invoices</p>
                                            <p className="text-3xl font-bold text-blue-900">{preview.total_invoices}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Internal</p>
                                            <p className="text-3xl font-bold text-blue-700">{preview.internal_count}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">External</p>
                                            <p className="text-3xl font-bold text-green-700">{preview.external_count}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground">Total Amount</p>
                                            <p className="text-2xl font-bold text-primary">
                                                MK {preview.total_amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-white/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground text-center">
                                            Invoice numbers will be auto-generated in format: <span className="font-mono font-semibold">INV-2024-T1-000001</span>
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {preview.total_invoices > 0 && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-900">
                                        Ready to generate {preview.total_invoices} invoice{preview.total_invoices > 1 ? 's' : ''} with detailed line items
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        className="w-full"
                        disabled={isPending || !preview || preview.total_invoices === 0}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Invoices...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate {preview?.total_invoices || 0} Invoice{preview && preview.total_invoices !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
