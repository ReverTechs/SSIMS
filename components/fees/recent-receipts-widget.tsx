'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Receipt, AlertCircle } from 'lucide-react';
import { getRecentReceipts } from '@/actions/fees-management/get-receipts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

interface ReceiptItem {
    id: string;
    receipt_number: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    payments: {
        payment_number: string;
        invoices: {
            invoice_number: string;
        };
    } | null;
}

interface RecentReceiptsWidgetProps {
    studentId: string;
}

export function RecentReceiptsWidget({ studentId }: RecentReceiptsWidgetProps) {
    const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadReceipts() {
            setLoading(true);
            setError(null);

            const result = await getRecentReceipts(studentId);

            if (result.error) {
                setError(result.error);
            } else if (result.receipts) {
                setReceipts(result.receipts);
            }
            setLoading(false);
        }

        if (studentId) {
            loadReceipts();
        }
    }, [studentId]);

    const handleDownloadReceipt = (receiptId: string) => {
        window.open(`/api/receipts/${receiptId}/download`, '_blank');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Recent Receipts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        Loading receipts...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Recent Receipts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (receipts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Recent Receipts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No receipts yet. Receipts will appear here after payments are made.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Recent Receipts
                    </div>
                    <Link href="/dashboard/fees/receipts">
                        <Button variant="ghost" size="sm">
                            View All
                        </Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {receipts.map((receipt) => (
                        <div
                            key={receipt.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-medium">
                                        {receipt.receipt_number}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(receipt.payment_date)}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Invoice: {receipt.payments?.invoices?.invoice_number || 'N/A'}
                                </div>
                                <div className="text-sm font-semibold text-green-600 mt-1">
                                    MK {receipt.amount.toLocaleString()}
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadReceipt(receipt.id)}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
