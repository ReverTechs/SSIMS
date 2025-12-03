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
import { Download, AlertCircle } from "lucide-react";
import { getStudentInvoices } from '@/actions/get-student-invoices';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    academic_year: string;
    term: string;
}

interface StudentInvoicesTableProps {
    studentId: string;
}

export function StudentInvoicesTable({ studentId }: StudentInvoicesTableProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadInvoices() {
            setLoading(true);
            setError(null);

            const result = await getStudentInvoices(studentId);

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setInvoices(result.data);
            }
            setLoading(false);
        }

        if (studentId) {
            loadInvoices();
        }
    }, [studentId]);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            paid: { variant: 'default' as const, className: 'bg-green-600' },
            unpaid: { variant: 'destructive' as const, className: '' },
            partial: { variant: 'secondary' as const, className: 'bg-orange-500 text-white' },
            overdue: { variant: 'destructive' as const, className: 'bg-red-700' },
        };

        const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.unpaid;

        return (
            <Badge variant={config.variant} className={config.className}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDownloadPDF = (invoiceId: string, invoiceNumber: string) => {
        // Open PDF download in new tab
        window.open(`/api/invoices/${invoiceId}/download`, '_blank');
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Loading invoices...
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

    if (invoices.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No invoices found. Invoices will appear here once fees are assigned.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invoices ({invoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Academic Year / Term</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p className="font-medium">{invoice.academic_year}</p>
                                            <p className="text-muted-foreground">{invoice.term}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        MK {invoice.total_amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600">
                                        MK {invoice.amount_paid.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${invoice.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        MK {invoice.balance.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            PDF
                                        </Button>
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
