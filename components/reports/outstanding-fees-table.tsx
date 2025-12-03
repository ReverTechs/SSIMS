'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertCircle, Phone } from "lucide-react";
import { getOutstandingFees } from '@/actions/get-outstanding-fees';
import { exportOutstandingFeesToExcel } from '@/actions/export-to-excel';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

interface OutstandingFee {
    student_id: string;
    student_number: string;
    full_name: string;
    class_name: string;
    total_outstanding: number;
    oldest_invoice_date: string;
    days_overdue: number;
    phone_number: string | null;
    guardian_phone: string | null;
}

export function OutstandingFeesTable() {
    const [fees, setFees] = useState<OutstandingFee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadFees();
    }, []);

    async function loadFees() {
        setLoading(true);
        const result = await getOutstandingFees();

        if (result.error) {
            setError(result.error);
        } else if (result.data) {
            setFees(result.data);
        }
        setLoading(false);
    }

    async function handleExportToExcel() {
        setExporting(true);
        const result = await exportOutstandingFeesToExcel();

        if (result.error) {
            toast.error(result.error);
        } else if (result.data) {
            // Create download link
            const link = document.createElement('a');
            link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data.base64}`;
            link.download = result.data.filename;
            link.click();
            toast.success('Excel file downloaded successfully!');
        }
        setExporting(false);
    }

    const formatCurrency = (amount: number) => `MK ${amount.toLocaleString()}`;
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB');

    const totalOutstanding = fees.reduce((sum, fee) => sum + fee.total_outstanding, 0);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Fees</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Loading outstanding fees...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    if (fees.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Fees</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No outstanding fees! All students have paid in full.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Outstanding Fees ({fees.length} students)</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Total Outstanding: <span className="font-semibold text-orange-600">{formatCurrency(totalOutstanding)}</span>
                        </p>
                    </div>
                    <Button onClick={handleExportToExcel} disabled={exporting}>
                        <Download className="h-4 w-4 mr-2" />
                        {exporting ? 'Exporting...' : 'Export to Excel'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead className="text-right">Outstanding</TableHead>
                                <TableHead className="text-right">Days Overdue</TableHead>
                                <TableHead>Contact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.map((fee) => (
                                <TableRow key={fee.student_id}>
                                    <TableCell className="font-mono">{fee.student_number}</TableCell>
                                    <TableCell className="font-medium">{fee.full_name}</TableCell>
                                    <TableCell>{fee.class_name}</TableCell>
                                    <TableCell className={`text-right font-semibold ${fee.total_outstanding > 100000 ? 'text-red-600' : 'text-orange-600'
                                        }`}>
                                        {formatCurrency(fee.total_outstanding)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {fee.days_overdue > 0 ? (
                                            <Badge variant={fee.days_overdue > 30 ? 'destructive' : 'secondary'}>
                                                {fee.days_overdue} days
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            {fee.phone_number && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="font-mono">{fee.phone_number}</span>
                                                </div>
                                            )}
                                            {fee.guardian_phone && (
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="font-mono">{fee.guardian_phone}</span>
                                                </div>
                                            )}
                                            {!fee.phone_number && !fee.guardian_phone && (
                                                <span className="text-muted-foreground">No contact</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
