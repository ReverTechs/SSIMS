'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createSponsor, updateSponsor } from '@/actions/fees-management/sponsors';
import type { Sponsor, SponsorType } from '@/types/fees';
import { toast } from 'sonner';

interface SponsorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sponsor?: Sponsor | null;
    onSuccess: () => void;
}

export function SponsorFormDialog({ open, onOpenChange, sponsor, onSuccess }: SponsorFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: sponsor?.name || '',
        sponsor_type: sponsor?.sponsor_type || ('government' as SponsorType),
        contact_person: sponsor?.contact_person || '',
        email: sponsor?.email || '',
        phone: sponsor?.phone || '',
        address: sponsor?.address || '',
        payment_terms: sponsor?.payment_terms || '',
        billing_email: sponsor?.billing_email || '',
        notes: sponsor?.notes || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = sponsor
                ? await updateSponsor(sponsor.id, formData)
                : await createSponsor(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
                onSuccess();
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{sponsor ? 'Edit Sponsor' : 'Add New Sponsor'}</DialogTitle>
                    <DialogDescription>
                        {sponsor
                            ? 'Update sponsor organization details'
                            : 'Add a new organization that provides financial aid to students'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Basic Information</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Sponsor Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="e.g., Ministry of Education"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sponsor_type">
                                    Sponsor Type <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="sponsor_type"
                                    value={formData.sponsor_type}
                                    onChange={(e) => handleChange('sponsor_type', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                >
                                    <option value="government">Government</option>
                                    <option value="ngo">NGO</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="foundation">Foundation</option>
                                    <option value="individual">Individual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Contact Information</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="contact_person">Contact Person</Label>
                                <Input
                                    id="contact_person"
                                    value={formData.contact_person}
                                    onChange={(e) => handleChange('contact_person', e.target.value)}
                                    placeholder="e.g., John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder="e.g., contact@sponsor.org"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="e.g., +265 999 123 456"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="billing_email">Billing Email</Label>
                                <Input
                                    id="billing_email"
                                    type="email"
                                    value={formData.billing_email}
                                    onChange={(e) => handleChange('billing_email', e.target.value)}
                                    placeholder="Where to send invoices"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Physical address"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Payment Terms</h3>

                        <div className="space-y-2">
                            <Label htmlFor="payment_terms">Payment Terms</Label>
                            <Textarea
                                id="payment_terms"
                                value={formData.payment_terms}
                                onChange={(e) => handleChange('payment_terms', e.target.value)}
                                placeholder="e.g., Quarterly payment in arrears, within 30 days of invoice"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                placeholder="Additional notes or comments"
                                rows={3}
                            />
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
                            {loading ? 'Saving...' : sponsor ? 'Update Sponsor' : 'Create Sponsor'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
