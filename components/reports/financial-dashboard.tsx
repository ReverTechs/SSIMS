'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, FileText, AlertCircle } from "lucide-react";
import { getFinancialOverview } from '@/actions/fees-management/get-financial-overview';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface FinancialOverview {
    total_fees_assigned: number;
    total_collected: number;
    outstanding_balance: number;
    collection_rate: number;
    total_students: number;
    total_invoices: number;
    total_payments: number;
    breakdown_by_term: {
        academic_year: string;
        term: string;
        total_fees: number;
        collected: number;
        outstanding: number;
        collection_rate: number;
    }[];
    payment_methods: {
        method: string;
        count: number;
        total_amount: number;
    }[];
}

export function FinancialDashboard() {
    const [overview, setOverview] = useState<FinancialOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadOverview() {
            setLoading(true);
            const result = await getFinancialOverview();

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setOverview(result.data);
            }
            setLoading(false);
        }

        loadOverview();
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
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

    if (!overview) {
        return null;
    }

    const formatCurrency = (amount: number) => `MK ${amount.toLocaleString()}`;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fees Assigned</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(overview.total_fees_assigned)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {overview.total_students} students
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(overview.total_collected)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {overview.total_payments} payments
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(overview.outstanding_balance)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending collection
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {overview.collection_rate.toFixed(1)}%
                        </div>
                        <Progress value={overview.collection_rate} className="mt-2 h-2" />
                    </CardContent>
                </Card>
            </div>

            {/* Term Breakdown */}
            {overview.breakdown_by_term.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Collection by Term</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overview.breakdown_by_term.map((term, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{term.academic_year} - {term.term}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatCurrency(term.collected)} of {formatCurrency(term.total_fees)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-blue-600">
                                                {term.collection_rate.toFixed(1)}%
                                            </p>
                                            <p className="text-sm text-orange-600">
                                                {formatCurrency(term.outstanding)} outstanding
                                            </p>
                                        </div>
                                    </div>
                                    <Progress value={term.collection_rate} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Methods */}
            {overview.payment_methods.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {overview.payment_methods.map((method, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-medium capitalize">{method.method.replace('_', ' ')}</p>
                                        <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                                    </div>
                                    <p className="font-semibold text-green-600">
                                        {formatCurrency(method.total_amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
