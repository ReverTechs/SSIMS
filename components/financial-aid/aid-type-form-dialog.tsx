'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createFinancialAidType } from '@/actions/fees-management/financial-aid-types';
import { getSponsors } from '@/actions/fees-management/sponsors';
import type { Sponsor, AidCoverageType } from '@/types/fees';
import { toast } from 'sonner';

interface AidTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AidTypeFormDialog({ open, onOpenChange, onSuccess }: AidTypeFormDialogProps) {
    const [loading, setLoading] = useState(false);
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [formData, setFormData] = useState({
        sponsor_id: '',
        name: '',
        description: '',
        coverage_type: 'full' as AidCoverageType,
        coverage_percentage: '',
        coverage_amount: '',
        covered_items: '',
        eligibility_criteria: '',
        requires_application: false,
    });

    // Load sponsors
    useEffect(() => {
        const loadSponsors = async () => {
            const result = await getSponsors({ is_active: true });
            if (!result.error) {
                setSponsors(result.sponsors || []);
            }
        };

        if (open) {
            loadSponsors();
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data based on coverage type
            const submitData: any = {
                sponsor_id: formData.sponsor_id,
                name: formData.name,
                description: formData.description || undefined,
                coverage_type: formData.coverage_type,
                eligibility_criteria: formData.eligibility_criteria || undefined,
                requires_application: formData.requires_application,
            };

            if (formData.coverage_type === 'percentage') {
                submitData.coverage_percentage = parseFloat(formData.coverage_percentage);
            } else if (formData.coverage_type === 'fixed_amount') {
                submitData.coverage_amount = parseFloat(formData.coverage_amount);
            } else if (formData.coverage_type === 'specific_items') {
                submitData.covered_items = formData.covered_items.split(',').map(item => item.trim());
            }

            const result = await createFinancialAidType(submitData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
                onSuccess();
                // Reset form
                setFormData({
                    sponsor_id: '',
                    name: '',
                    description: '',
                    coverage_type: 'full',
                    coverage_percentage: '',
                    coverage_amount: '',
                    covered_items: '',
                    eligibility_criteria: '',
                    requires_application: false,
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Financial Aid Type</DialogTitle>
                    <DialogDescription>
                        Create a new scholarship or bursary program
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="sponsor">
                                Sponsor <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="sponsor"
                                value={formData.sponsor_id}
                                onChange={(e) => handleChange('sponsor_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select sponsor...</option>
                                {sponsors.map((sponsor) => (
                                    <option key={sponsor.id} value={sponsor.id}>
                                        {sponsor.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Aid Type Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="e.g., Government Bursary, Merit Scholarship"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Brief description of this aid program"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Coverage Configuration */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Coverage Configuration</h3>

                        <div className="space-y-2">
                            <Label htmlFor="coverage_type">
                                Coverage Type <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="coverage_type"
                                value={formData.coverage_type}
                                onChange={(e) => handleChange('coverage_type', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="full">Full Coverage (100%)</option>
                                <option value="percentage">Percentage Coverage</option>
                                <option value="fixed_amount">Fixed Amount</option>
                                <option value="specific_items">Specific Fee Items</option>
                            </select>
                        </div>

                        {/* Conditional fields based on coverage type */}
                        {formData.coverage_type === 'percentage' && (
                            <div className="space-y-2">
                                <Label htmlFor="coverage_percentage">
                                    Coverage Percentage <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="coverage_percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.coverage_percentage}
                                    onChange={(e) => handleChange('coverage_percentage', e.target.value)}
                                    placeholder="e.g., 50"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter percentage (0-100)
                                </p>
                            </div>
                        )}

                        {formData.coverage_type === 'fixed_amount' && (
                            <div className="space-y-2">
                                <Label htmlFor="coverage_amount">
                                    Coverage Amount (MK) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="coverage_amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.coverage_amount}
                                    onChange={(e) => handleChange('coverage_amount', e.target.value)}
                                    placeholder="e.g., 250000"
                                    required
                                />
                            </div>
                        )}

                        {formData.coverage_type === 'specific_items' && (
                            <div className="space-y-2">
                                <Label htmlFor="covered_items">
                                    Covered Items <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="covered_items"
                                    value={formData.covered_items}
                                    onChange={(e) => handleChange('covered_items', e.target.value)}
                                    placeholder="e.g., tuition, boarding, books"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter comma-separated list of fee items
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Eligibility */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Eligibility</h3>

                        <div className="space-y-2">
                            <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
                            <Textarea
                                id="eligibility_criteria"
                                value={formData.eligibility_criteria}
                                onChange={(e) => handleChange('eligibility_criteria', e.target.value)}
                                placeholder="e.g., Minimum 70% average, Family income < MK 500,000"
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="requires_application"
                                checked={formData.requires_application}
                                onChange={(e) => handleChange('requires_application', e.target.checked)}
                                className="rounded"
                            />
                            <Label htmlFor="requires_application" className="cursor-pointer">
                                Requires application from students
                            </Label>
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
                            {loading ? 'Creating...' : 'Create Aid Type'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
