'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { recordSponsorPayment } from '@/actions/fees-management/sponsor-payments';
import type { Sponsor } from '@/types/fees';
import { toast } from 'sonner';

interface RecordPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sponsor: Sponsor;
    onSuccess: () => void;
}

export function RecordPaymentDialog({ open, onOpenChange, sponsor, onSuccess }: RecordPaymentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        amount: string;
        payment_date: string;
        payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'wire_transfer';
        reference_number: string;
        notes: string;
        auto_allocate: boolean;
    }>({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        reference_number: '',
        notes: '',
        auto_allocate: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await recordSponsorPayment({
                sponsor_id: sponsor.id,
                amount: parseFloat(formData.amount),
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number || undefined,
                notes: formData.notes || undefined,
                auto_allocate: formData.auto_allocate,
            });

            if ('error' in result) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
                onSuccess();
                // Reset form
                setFormData({
                    amount: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'bank_transfer',
                    reference_number: '',
                    notes: '',
                    auto_allocate: true,
                });
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Record Sponsor Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment from {sponsor.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Payment Amount (MK) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => handleChange('amount', e.target.value)}
                            placeholder="e.g., 5000000"
                            required
                        />
                    </div>

                    {/* Payment Date */}
                    <div className="space-y-2">
                        <Label htmlFor="payment_date">
                            Payment Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={formData.payment_date}
                            onChange={(e) => handleChange('payment_date', e.target.value)}
                            required
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label htmlFor="payment_method">
                            Payment Method <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="payment_method"
                            value={formData.payment_method}
                            onChange={(e) => handleChange('payment_method', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                        >
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="cash">Cash</option>
                            <option value="wire_transfer">Wire Transfer</option>
                        </select>
                    </div>

                    {/* Reference Number */}
                    <div className="space-y-2">
                        <Label htmlFor="reference_number">Reference Number</Label>
                        <Input
                            id="reference_number"
                            value={formData.reference_number}
                            onChange={(e) => handleChange('reference_number', e.target.value)}
                            placeholder="e.g., TXN123456, Cheque #789"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Additional notes about this payment"
                            rows={3}
                        />
                    </div>

                    {/* Auto-allocate Option */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="auto_allocate"
                                checked={formData.auto_allocate}
                                onChange={(e) => handleChange('auto_allocate', e.target.checked)}
                                className="mt-1 rounded"
                            />
                            <div className="flex-1">
                                <Label htmlFor="auto_allocate" className="cursor-pointer font-medium">
                                    Automatically allocate to students
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    The system will automatically distribute this payment to students with active aid from this sponsor.
                                    Uncheck if you want to manually allocate later.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Recording...' : 'Record Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
