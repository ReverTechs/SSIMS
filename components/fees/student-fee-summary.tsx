'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { getStudentFees } from '@/actions/get-student-fees';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FeeSummary {
    total_fees: number;
    total_paid: number;
    outstanding_balance: number;
    fee_breakdown: {
        academic_year: string;
        term: string;
        total_amount: number;
        amount_paid: number;
        balance: number;
    }[];
}

interface StudentFeeSummaryProps {
    studentId: string;
}

export function StudentFeeSummary({ studentId }: StudentFeeSummaryProps) {
    const [summary, setSummary] = useState<FeeSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSummary() {
            setLoading(true);
            setError(null);

            const result = await getStudentFees(studentId);

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setSummary(result.data);
            }
            setLoading(false);
        }

        if (studentId) {
            loadSummary();
        }
    }, [studentId]);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
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

    if (!summary) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No fee data available</AlertDescription>
            </Alert>
        );
    }

    const paymentProgress = summary.total_fees > 0
        ? (summary.total_paid / summary.total_fees) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Total Fees */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            MK {summary.total_fees.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            All assigned fees
                        </p>
                    </CardContent>
                </Card>

                {/* Amount Paid */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            MK {summary.total_paid.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {paymentProgress.toFixed(1)}% of total fees
                        </p>
                    </CardContent>
                </Card>

                {/* Outstanding Balance */}
                <Card className={summary.outstanding_balance > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-green-200 bg-green-50/50'}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <TrendingUp className={`h-4 w-4 ${summary.outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${summary.outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            MK {summary.outstanding_balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {summary.outstanding_balance === 0 ? 'Fully paid!' : 'Amount remaining'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Payment Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Progress value={paymentProgress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>MK {summary.total_paid.toLocaleString()} paid</span>
                        <span>MK {summary.outstanding_balance.toLocaleString()} remaining</span>
                    </div>
                </CardContent>
            </Card>

            {/* Fee Breakdown by Term */}
            {summary.fee_breakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Fee Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {summary.fee_breakdown.map((fee, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div>
                                        <p className="font-medium">{fee.academic_year} - {fee.term}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Total: MK {fee.total_amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-green-600">
                                            Paid: MK {fee.amount_paid.toLocaleString()}
                                        </p>
                                        <p className={`text-sm font-semibold ${fee.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                            Balance: MK {fee.balance.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
