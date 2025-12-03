'use client';

import { useState, useTransition } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, DollarSign } from "lucide-react";
import { toast } from 'sonner';
import { createFeeStructure } from '@/actions/fees-management/create-fee-structure';
import { StudentType } from '@/types/fees';
import { Textarea } from "@/components/ui/textarea";

interface AcademicYear {
    id: string;
    name: string;
}

interface Term {
    id: string;
    name: string;
    academic_year_id: string;
}

interface CreateFeeStructureFormProps {
    academicYears: AcademicYear[];
    terms: Term[];
}

interface FeeItem {
    id: string;
    item_name: string;
    description: string;
    amount: string;
    is_mandatory: boolean;
    display_order: number;
}

export function CreateFeeStructureForm({ academicYears, terms }: CreateFeeStructureFormProps) {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        academicYearId: '',
        termId: '',
        studentType: '',
        dueDate: '',
        notes: '',
    });

    const [feeItems, setFeeItems] = useState<FeeItem[]>([
        {
            id: '1',
            item_name: 'Tuition',
            description: '',
            amount: '',
            is_mandatory: true,
            display_order: 1,
        },
    ]);

    const filteredTerms = terms.filter(t => t.academic_year_id === formData.academicYearId);
    const totalAmount = feeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const addFeeItem = () => {
        const newItem: FeeItem = {
            id: Date.now().toString(),
            item_name: '',
            description: '',
            amount: '',
            is_mandatory: true,
            display_order: feeItems.length + 1,
        };
        setFeeItems([...feeItems, newItem]);
    };

    const removeFeeItem = (id: string) => {
        if (feeItems.length === 1) {
            toast.error('You must have at least one fee item');
            return;
        }
        setFeeItems(feeItems.filter(item => item.id !== id));
    };

    const updateFeeItem = (id: string, field: keyof FeeItem, value: string | boolean | number) => {
        setFeeItems(feeItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.academicYearId || !formData.termId || !formData.studentType || !formData.dueDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (feeItems.some(item => !item.item_name || !item.amount)) {
            toast.error('Please fill in all fee item names and amounts');
            return;
        }

        if (totalAmount <= 0) {
            toast.error('Total amount must be greater than zero');
            return;
        }

        startTransition(async () => {
            const result = await createFeeStructure({
                academic_year_id: formData.academicYearId,
                term_id: formData.termId,
                student_type: formData.studentType as StudentType,
                due_date: formData.dueDate,
                notes: formData.notes,
                items: feeItems.map(item => ({
                    item_name: item.item_name,
                    description: item.description,
                    amount: parseFloat(item.amount),
                    is_mandatory: item.is_mandatory,
                    display_order: item.display_order,
                })),
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Fee structure created successfully!');
                // Reset form
                setFormData({
                    academicYearId: '',
                    termId: '',
                    studentType: '',
                    dueDate: '',
                    notes: '',
                });
                setFeeItems([
                    {
                        id: '1',
                        item_name: 'Tuition',
                        description: '',
                        amount: '',
                        is_mandatory: true,
                        display_order: 1,
                    },
                ]);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <CardTitle>Create Fee Structure</CardTitle>
                </div>
                <CardDescription>
                    Define fees for {formData.studentType === 'internal' ? 'internal (boarder)' : formData.studentType === 'external' ? 'external (day scholar)' : ''} students
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="academicYear">Academic Year *</Label>
                            <Select
                                value={formData.academicYearId}
                                onValueChange={(val) => {
                                    setFormData(prev => ({ ...prev, academicYearId: val, termId: '' }));
                                }}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select academic year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map((year) => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="term">Term *</Label>
                            <Select
                                value={formData.termId}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, termId: val }))}
                                required
                                disabled={!formData.academicYearId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select term" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredTerms.map((term) => (
                                        <SelectItem key={term.id} value={term.id}>
                                            {term.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentType">Student Type *</Label>
                            <Select
                                value={formData.studentType}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, studentType: val }))}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">Internal (Boarder)</SelectItem>
                                    <SelectItem value="external">External (Day Scholar)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date *</Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes about this fee structure..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    {/* Fee Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">Fee Items</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addFeeItem}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {feeItems.map((item, index) => (
                                <Card key={item.id} className="p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <div className="md:col-span-3 space-y-2">
                                            <Label>Item Name *</Label>
                                            <Input
                                                placeholder="e.g., Tuition"
                                                value={item.item_name}
                                                onChange={(e) => updateFeeItem(item.id, 'item_name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                placeholder="Optional description"
                                                value={item.description}
                                                onChange={(e) => updateFeeItem(item.id, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label>Amount (MK) *</Label>
                                            <Input
                                                type="number"
                                                placeholder="0.00"
                                                value={item.amount}
                                                onChange={(e) => updateFeeItem(item.id, 'amount', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex items-end">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeFeeItem(item.id)}
                                                disabled={feeItems.length === 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Total Amount Display */}
                    <div className="flex justify-end">
                        <div className="bg-primary/10 px-6 py-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">
                                MK {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        disabled={isPending || totalAmount <= 0}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Fee Structure...
                            </>
                        ) : (
                            <>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Create Fee Structure
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
