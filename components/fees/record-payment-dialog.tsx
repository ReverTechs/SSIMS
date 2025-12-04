'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { recordPayment, getPaymentMethods } from '@/actions/fees-management/record-payment';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    student: {
        id: string;
        student_id: string;
        full_name: string;
    };
}

interface PaymentMethod {
    id: string;
    method_name: string;
    method_type: string;
    account_number?: string;
    account_name?: string;
    instructions?: string;
}

interface RecordPaymentDialogProps {
    invoice: Invoice;
    onSuccess?: () => void;
}

export function RecordPaymentDialog({ invoice, onSuccess }: RecordPaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [formData, setFormData] = useState({
        amount: invoice.balance.toString(),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        referenceNumber: '',
        notes: '',
    });
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

    // Load payment methods
    useEffect(() => {
        async function loadPaymentMethods() {
            const result = await getPaymentMethods();
            if (result.success && result.methods) {
                // Deduplicate by method_type to prevent duplicate key errors
                const uniqueMethods = result.methods.reduce((acc: PaymentMethod[], method) => {
                    if (!acc.find(m => m.method_type === method.method_type)) {
                        acc.push(method);
                    }
                    return acc;
                }, []);
                setPaymentMethods(uniqueMethods);
            }
        }
        loadPaymentMethods();
    }, []);

    // Update selected method details
    useEffect(() => {
        const method = paymentMethods.find(m => m.method_type === formData.paymentMethod);
        setSelectedMethod(method || null);
    }, [formData.paymentMethod, paymentMethods]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid payment amount');
            return;
        }

        if (amount > invoice.balance) {
            toast.error(`Payment amount cannot exceed outstanding balance (MK ${invoice.balance.toLocaleString()})`);
            return;
        }

        if (!formData.paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        startTransition(async () => {
            const result = await recordPayment({
                invoice_id: invoice.id,
                amount,
                payment_date: formData.paymentDate,
                payment_method: formData.paymentMethod as any,
                reference_number: formData.referenceNumber || undefined,
                notes: formData.notes || undefined,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Payment recorded successfully!');
                setOpen(false);
                // Reset form
                setFormData({
                    amount: invoice.balance.toString(),
                    paymentDate: new Date().toISOString().split('T')[0],
                    paymentMethod: '',
                    referenceNumber: '',
                    notes: '',
                });
                onSuccess?.();
            }
        });
    };

    const amountValue = parseFloat(formData.amount) || 0;
    const isPartialPayment = amountValue > 0 && amountValue < invoice.balance;
    const newBalance = invoice.balance - amountValue;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Invoice: {invoice.invoice_number} - {invoice.student.full_name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Invoice Summary */}
                    <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Total Amount</p>
                                    <p className="font-semibold">MK {invoice.total_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Paid</p>
                                    <p className="font-semibold text-green-600">MK {invoice.amount_paid.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Outstanding</p>
                                    <p className="font-semibold text-orange-600">MK {invoice.balance.toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Payment Amount (MK) *</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                min="0"
                                max={invoice.balance}
                                step="0.01"
                                required
                            />
                            {isPartialPayment && (
                                <p className="text-xs text-orange-600">
                                    Partial payment - New balance: MK {newBalance.toLocaleString()}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paymentDate">Payment Date *</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select
                            value={formData.paymentMethod}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, paymentMethod: val }))}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method.id} value={method.method_type}>
                                        {method.method_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedMethod && selectedMethod.instructions && (
                            <Alert className="mt-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-xs">
                                    {selectedMethod.instructions}
                                    {selectedMethod.account_number && (
                                        <span className="block mt-1 font-mono">
                                            {selectedMethod.account_name}: {selectedMethod.account_number}
                                        </span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="referenceNumber">Reference Number</Label>
                        <Input
                            id="referenceNumber"
                            placeholder="e.g., Transaction ID, Cheque number"
                            value={formData.referenceNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional but recommended for tracking
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    {/* Summary */}
                    {amountValue > 0 && (
                        <Alert className="bg-blue-50 border-blue-200">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-900">
                                <strong>Summary:</strong> Recording payment of MK {amountValue.toLocaleString()}
                                {isPartialPayment && ` (Partial payment - ${((amountValue / invoice.balance) * 100).toFixed(1)}%)`}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isPending || amountValue <= 0}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Record Payment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
