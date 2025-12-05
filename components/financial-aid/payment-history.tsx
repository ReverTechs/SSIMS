'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSponsorPayments, getPaymentAllocations } from '@/actions/fees-management/sponsor-payments';
import type { SponsorPayment, SponsorPaymentAllocation } from '@/types/fees';
import { DollarSign, Users, Calendar } from 'lucide-react';

interface PaymentHistoryProps {
    sponsorId: string;
}

export function PaymentHistory({ sponsorId }: PaymentHistoryProps) {
    const [payments, setPayments] = useState<SponsorPayment[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [allocations, setAllocations] = useState<SponsorPaymentAllocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, [sponsorId]);

    const loadPayments = async () => {
        setLoading(true);
        const result = await getSponsorPayments({ sponsor_id: sponsorId });

        if (!result.error && result.payments) {
            setPayments(result.payments);
        }
        setLoading(false);
    };

    const loadAllocations = async (paymentId: string) => {
        const result = await getPaymentAllocations(paymentId);

        if (!result.error && result.allocations) {
            setAllocations(result.allocations);
        }
    };

    const handlePaymentClick = async (paymentId: string) => {
        if (selectedPayment === paymentId) {
            setSelectedPayment(null);
            setAllocations([]);
        } else {
            setSelectedPayment(paymentId);
            await loadAllocations(paymentId);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Loading payment history...</p>
                </CardContent>
            </Card>
        );
    }

    if (payments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>No payments recorded yet</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>
                    {payments.length} payment{payments.length > 1 ? 's' : ''} recorded
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg">
                        {/* Payment Summary */}
                        <div
                            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => handlePaymentClick(payment.id)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{payment.payment_number}</h4>
                                        <Badge variant="outline">
                                            {payment.payment_method.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(payment.payment_date).toLocaleDateString()}
                                        </span>
                                        {payment.reference_number && (
                                            <span>Ref: {payment.reference_number}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-700">
                                        MK {payment.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Allocated: MK {payment.allocated_amount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Allocation Summary */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex-1">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-600"
                                            style={{
                                                width: `${(payment.allocated_amount / payment.amount) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {((payment.allocated_amount / payment.amount) * 100).toFixed(0)}% allocated
                                </span>
                            </div>

                            {payment.notes && (
                                <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                                    {payment.notes}
                                </p>
                            )}
                        </div>

                        {/* Allocation Details (Expandable) */}
                        {selectedPayment === payment.id && allocations.length > 0 && (
                            <div className="border-t bg-accent/20 p-4">
                                <h5 className="font-medium mb-3 text-sm">Payment Allocations</h5>
                                <div className="space-y-2">
                                    {allocations.map((allocation) => (
                                        <div
                                            key={allocation.id}
                                            className="flex items-center justify-between p-2 bg-white rounded border text-sm"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {(allocation as any).student?.full_name || 'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(allocation as any).student?.student_id}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-green-700">
                                                    MK {allocation.allocated_amount.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(allocation.allocation_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
