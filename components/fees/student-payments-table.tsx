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
import { Download, AlertCircle, Receipt } from "lucide-react";
import { getStudentPayments } from '@/actions/fees-management/get-student-payments';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
    id: string;
    payment_number: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number: string | null;
    invoice_number: string;
    receipt_number: string;
    receipt_id: string;
    balance_after: number;
}

interface StudentPaymentsTableProps {
    studentId: string;
}

export function StudentPaymentsTable({ studentId }: StudentPaymentsTableProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPayments() {
            setLoading(true);
            setError(null);

            const result = await getStudentPayments(studentId);

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setPayments(result.data);
            }
            setLoading(false);
        }

        if (studentId) {
            loadPayments();
        }
    }, [studentId]);

    const getPaymentMethodBadge = (method: string) => {
        const methodConfig = {
            cash: { variant: 'default' as const, label: 'Cash' },
            bank_transfer: { variant: 'secondary' as const, label: 'Bank Transfer' },
            mobile_money: { variant: 'outline' as const, label: 'Mobile Money' },
            cheque: { variant: 'secondary' as const, label: 'Cheque' },
            card: { variant: 'outline' as const, label: 'Card' },
        };

        const config = methodConfig[method as keyof typeof methodConfig] || { variant: 'outline' as const, label: method };

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleDownloadReceipt = (receiptId: string, receiptNumber: string) => {
        if (receiptId) {
            window.open(`/api/receipts/${receiptId}/download`, '_blank');
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Loading payment history...
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

    if (payments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No payments recorded yet. Payment history will appear here once payments are made.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Payment History ({payments.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Payment #</TableHead>
                                <TableHead>Invoice #</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Receipt #</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                                    <TableCell className="font-medium">{payment.payment_number}</TableCell>
                                    <TableCell className="font-mono text-sm">{payment.invoice_number}</TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        MK {payment.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>{getPaymentMethodBadge(payment.payment_method)}</TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {payment.reference_number || '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{payment.receipt_number}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDownloadReceipt(payment.receipt_id, payment.receipt_number)}
                                            disabled={!payment.receipt_id}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Receipt
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Total Summary */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-medium">Total Payments:</span>
                        <span className="text-xl font-bold text-green-600">
                            MK {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
