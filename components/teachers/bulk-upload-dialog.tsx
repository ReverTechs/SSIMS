'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { BulkTeacherUploadDropzone } from './bulk-upload-dropzone';
import { BulkTeacherUploadPreviewTable } from './bulk-upload-preview-table';
import { bulkRegisterTeachers, getTeacherMappings } from '@/actions/enrollment/bulk-register-teachers';
import { exportBulkErrorsToCSV, calculateUploadStats } from '@/lib/utils/bulk-upload-helpers';
import type { ParsedFileData, BulkUploadResult, BulkTeacherData } from '@/types/bulk-upload-types';

interface BulkTeacherUploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function BulkTeacherUploadDialog({ open, onOpenChange, onSuccess }: BulkTeacherUploadDialogProps) {
    const [step, setStep] = useState<'upload' | 'preview' | 'processing' | 'result'>('upload');
    const [parsedData, setParsedData] = useState<ParsedFileData<BulkTeacherData> | null>(null);
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
    const [mappings, setMappings] = useState<any>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep('upload');
                setParsedData(null);
                setUploadResult(null);
            }, 300);
        } else {
            // Fetch mappings when dialog opens
            getTeacherMappings().then(setMappings);
        }
    }, [open]);

    const handleFilesParsed = (data: ParsedFileData<BulkTeacherData>) => {
        setParsedData(data);
        setStep('preview');
    };

    const handleUpload = async () => {
        if (!parsedData || !mappings) return;

        setStep('processing');
        try {
            const result = await bulkRegisterTeachers(parsedData.data, mappings);
            setUploadResult(result);
            setStep('result');

            if (result.successCount > 0) {
                onSuccess();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadResult({
                success: false,
                totalProcessed: 0,
                successCount: 0,
                failureCount: 0,
                skippedCount: 0,
                errors: [],
                message: 'An unexpected error occurred during upload.',
            });
            setStep('result');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] h-[95vh] p-0 flex flex-col gap-0">
                <div className="sr-only">
                    <DialogTitle>Bulk Teacher Registration</DialogTitle>
                    <DialogDescription>
                        Upload a CSV or Excel file to register multiple teachers at once
                    </DialogDescription>
                </div>

                {/* Header Section - Custom styled */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-lg font-semibold">Bulk Teacher Registration</h2>
                        <p className="text-sm text-muted-foreground">
                            {step === 'upload' && 'Upload your teacher data file'}
                            {step === 'preview' && 'Review data before registration'}
                            {step === 'processing' && 'Registering teachers...'}
                            {step === 'result' && 'Upload Results'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {step === 'preview' && (
                            <>
                                <Button variant="outline" onClick={() => setStep('upload')}>
                                    Back
                                </Button>
                                <Button onClick={handleUpload} disabled={!parsedData?.validRowCount}>
                                    Upload {parsedData?.validRowCount} Teachers
                                </Button>
                            </>
                        )}
                        {step === 'result' && (
                            <Button onClick={handleClose}>Close</Button>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-hidden bg-muted/10 p-6 flex flex-col min-h-0">
                    {step === 'upload' && (
                        <div className="max-w-2xl mx-auto w-full">
                            <BulkTeacherUploadDropzone
                                onFilesParsed={handleFilesParsed}
                                onError={(error) => console.error(error)}
                            />
                        </div>
                    )}

                    {step === 'preview' && parsedData && (
                        <div className="space-y-6 flex-1 flex flex-col min-h-0">
                            <BulkTeacherUploadPreviewTable
                                data={parsedData.data}
                                errors={parsedData.errors}
                            />
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <div className="text-center">
                                <h3 className="text-lg font-medium">Processing Upload...</h3>
                                <p className="text-muted-foreground">
                                    Please wait while we register the teachers.
                                    This may take a few moments.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'result' && uploadResult && (
                        <div className="max-w-2xl mx-auto w-full space-y-6">
                            <Alert variant={uploadResult.success ? 'default' : 'destructive'}>
                                {uploadResult.success ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <AlertTitle>
                                    {uploadResult.success ? 'Upload Complete' : 'Upload Completed with Errors'}
                                </AlertTitle>
                                <AlertDescription>
                                    {uploadResult.message}
                                </AlertDescription>
                            </Alert>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center border border-green-200 dark:border-green-900">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {uploadResult.successCount}
                                    </div>
                                    <div className="text-sm text-green-800 dark:text-green-300">Registered</div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center border border-red-200 dark:border-red-900">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {uploadResult.failureCount}
                                    </div>
                                    <div className="text-sm text-red-800 dark:text-red-300">Failed</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center border border-yellow-200 dark:border-yellow-900">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {uploadResult.skippedCount}
                                    </div>
                                    <div className="text-sm text-yellow-800 dark:text-yellow-300">Skipped</div>
                                </div>
                            </div>

                            {uploadResult.errors.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Error Details</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => exportBulkErrorsToCSV(uploadResult.errors)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Error Log
                                        </Button>
                                    </div>
                                    <ScrollArea className="h-[300px] rounded-md border p-4">
                                        <div className="space-y-4">
                                            {uploadResult.errors.map((error, index) => (
                                                <div key={index} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                                                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="font-medium text-destructive">
                                                            Row {error.row} • {error.type}
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                            {error.error}
                                                        </div>
                                                        {error.email && (
                                                            <div className="text-xs text-muted-foreground mt-1">
                                                                Email: {error.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
