'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recordSponsorPayment } from '@/actions/fees-management/sponsor-payments';
import type { Sponsor } from '@/types/fees';
import { toast } from 'sonner';
import { Loader2, DollarSign, Calendar, CreditCard, FileText, Banknote } from 'lucide-react';

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

        // Basic validation
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            setLoading(false);
            return;
        }

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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Banknote className="h-5 w-5 text-primary" />
                        Record Sponsor Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record a new payment from <span className="font-medium text-foreground">{sponsor.name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 max-h-[60vh] overflow-y-auto">
                    <form id="record-payment-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="amount" className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Amount (MK) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => handleChange('amount', e.target.value)}
                                    placeholder="e.g. 5,000,000"
                                    className="text-lg font-medium"
                                    required
                                />
                            </div>

                            {/* Payment Date */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Date <span className="text-red-500">*</span>
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
                                <Label htmlFor="payment_method" className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    Method <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.payment_method}
                                    onValueChange={(value) => handleChange('payment_method', value)}
                                >
                                    <SelectTrigger id="payment_method">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Reference Number */}
                            <div className="space-y-2">
                                <Label htmlFor="reference_number" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    Reference No.
                                </Label>
                                <Input
                                    id="reference_number"
                                    value={formData.reference_number}
                                    onChange={(e) => handleChange('reference_number', e.target.value)}
                                    placeholder="e.g. TXN-12345"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Add any relevant details about this payment..."
                                className="resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Auto-allocate Option */}
                        <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border">
                            <input
                                type="checkbox"
                                id="auto_allocate"
                                checked={formData.auto_allocate}
                                onChange={(e) => handleChange('auto_allocate', e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="space-y-1 leading-none">
                                <Label
                                    htmlFor="auto_allocate"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    Auto-allocate to students
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    If checked, the system will automatically distribute this payment to students with active financial aid from this sponsor.
                                </p>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <DialogFooter className="p-6 pt-4 border-t gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="record-payment-form"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Record Payment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
