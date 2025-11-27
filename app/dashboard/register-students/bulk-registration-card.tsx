'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulkUploadDialog } from '@/components/students/bulk-upload-dialog';

export function BulkRegistrationCard() {
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleBulkUploadSuccess = () => {
        setSuccessMessage('Bulk upload completed successfully! Students have been registered.');
        // Clear message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Bulk Registration</CardTitle>
                    <CardDescription>
                        Upload a CSV or Excel file to register multiple students
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                            Upload CSV or Excel file with student information
                        </p>
                        <Button onClick={() => setBulkUploadOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Start Bulk Upload
                        </Button>
                    </div>

                    {successMessage && (
                        <div className="p-3 rounded-md text-sm bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-2">Required CSV/Excel columns:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>First Name</li>
                            <li>Last Name</li>
                            <li>Email</li>
                            <li>Student ID</li>
                            <li>Gender (male/female)</li>
                            <li>Student Type (internal/external)</li>
                            <li>Class Name</li>
                            <li>Date of Birth (YYYY-MM-DD)</li>
                            <li>Guardian Email</li>
                        </ul>
                        <p className="mt-3 text-muted-foreground">
                            Download a template from the upload dialog to get started.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Upload Dialog */}
            <BulkUploadDialog
                open={bulkUploadOpen}
                onOpenChange={setBulkUploadOpen}
                onSuccess={handleBulkUploadSuccess}
            />
        </>
    );
}
