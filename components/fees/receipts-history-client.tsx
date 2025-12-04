'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Download, Search, Receipt, AlertCircle, Filter } from 'lucide-react';
import { getAllReceipts } from '@/actions/fees-management/get-receipts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

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

interface ReceiptsHistoryClientProps {
    studentId: string;
}

export function ReceiptsHistoryClient({ studentId }: ReceiptsHistoryClientProps) {
    const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
    const [filteredReceipts, setFilteredReceipts] = useState<ReceiptItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        async function loadReceipts() {
            setLoading(true);
            setError(null);

            const result = await getAllReceipts(studentId);

            if (result.error) {
                setError(result.error);
            } else if (result.receipts) {
                setReceipts(result.receipts);
                setFilteredReceipts(result.receipts);
            }
            setLoading(false);
        }

        if (studentId) {
            loadReceipts();
        }
    }, [studentId]);

    // Apply filters
    useEffect(() => {
        let filtered = [...receipts];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(receipt =>
                receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Date filters
        if (startDate) {
            filtered = filtered.filter(receipt =>
                new Date(receipt.payment_date) >= new Date(startDate)
            );
        }
        if (endDate) {
            filtered = filtered.filter(receipt =>
                new Date(receipt.payment_date) <= new Date(endDate)
            );
        }

        setFilteredReceipts(filtered);
    }, [searchTerm, startDate, endDate, receipts]);

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

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                        Loading receipts...
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

    return (
        <div className="space-y-4">
            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Receipt Number</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="REC-001234"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    {(searchTerm || startDate || endDate) && (
                        <div className="mt-4">
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Receipts Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            All Receipts ({filteredReceipts.length})
                        </div>
                        {filteredReceipts.length > 0 && (
                            <div className="text-sm font-normal text-muted-foreground">
                                Total: MK {filteredReceipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                            </div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredReceipts.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {receipts.length === 0
                                    ? 'No receipts found. Receipts will appear here after payments are made.'
                                    : 'No receipts match your filters. Try adjusting your search criteria.'}
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Receipt #</TableHead>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredReceipts.map((receipt) => (
                                        <TableRow key={receipt.id}>
                                            <TableCell>{formatDate(receipt.payment_date)}</TableCell>
                                            <TableCell className="font-mono text-sm font-medium">
                                                {receipt.receipt_number}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {receipt.payments?.invoices?.invoice_number || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-green-600">
                                                MK {receipt.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{getPaymentMethodBadge(receipt.payment_method)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownloadReceipt(receipt.id)}
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
