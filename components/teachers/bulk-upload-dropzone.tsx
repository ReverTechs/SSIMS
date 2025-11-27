'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseTeacherFile } from '@/lib/utils/csv-parser-teachers';
import { downloadTeacherCSVTemplate, downloadTeacherExcelTemplate } from '@/lib/utils/bulk-upload-helpers';
import type { ParsedFileData, BulkTeacherData } from '@/types/bulk-upload-types';

interface BulkUploadDropzoneProps {
    onFilesParsed: (data: ParsedFileData<BulkTeacherData>) => void;
    onError: (error: string) => void;
}

export function BulkTeacherUploadDropzone({ onFilesParsed, onError }: BulkUploadDropzoneProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState<File | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setCurrentFile(file);
        setIsProcessing(true);
        setProgress(10);

        try {
            // Simulate progress for better UX
            setProgress(30);

            // Parse the file
            const parsedData = await parseTeacherFile(file);

            setProgress(100);
            onFilesParsed(parsedData);

        } catch (error) {
            console.error('File parsing error:', error);
            onError(error instanceof Error ? error.message : 'Failed to parse file');
            setCurrentFile(null);
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    }, [onFilesParsed, onError]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        disabled: isProcessing,
    });

    const clearFile = () => {
        setCurrentFile(null);
        setProgress(0);
    };

    return (
        <div className="space-y-4">
            {/* Template Download Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Download className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium mb-1">Download Template</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Start by downloading a template with the correct format and sample data
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadTeacherCSVTemplate(true)}
                                >
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    CSV Template
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadTeacherExcelTemplate(true)}
                                >
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    Excel Template
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card>
                <CardContent className="pt-6">
                    <div
                        {...getRootProps()}
                        className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
            `}
                    >
                        <input {...getInputProps()} />

                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

                        {isDragActive ? (
                            <p className="text-lg font-medium">Drop the file here...</p>
                        ) : (
                            <>
                                <p className="text-lg font-medium mb-2">
                                    Drag & drop your file here, or click to browse
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Supports CSV, XLSX, XLS files (Max 10MB)
                                </p>
                            </>
                        )}
                    </div>

                    {/* Processing Progress */}
                    {isProcessing && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Processing file...</span>
                                <span className="font-medium">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {/* Current File Display */}
                    {currentFile && !isProcessing && (
                        <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">{currentFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(currentFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Important Notes */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                    <strong>Important:</strong> All teachers will receive the default password{' '}
                    <code className="bg-muted px-1 py-0.5 rounded">Student@sssims2025</code> and must change it on first login.
                    Duplicate emails will be skipped.
                </AlertDescription>
            </Alert>
        </div>
    );
}
