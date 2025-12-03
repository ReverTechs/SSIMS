'use client';

import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { getGuardianChildren } from '@/actions/get-guardian-children';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GuardianChild {
    student_id: string;
    student_number: string;
    full_name: string;
    class_name: string;
    outstanding_balance: number;
    relationship: string;
    is_primary: boolean;
}

interface GuardianChildSelectorProps {
    onChildSelect: (studentId: string) => void;
    selectedChildId?: string;
}

export function GuardianChildSelector({ onChildSelect, selectedChildId }: GuardianChildSelectorProps) {
    const [children, setChildren] = useState<GuardianChild[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadChildren() {
            setLoading(true);
            const result = await getGuardianChildren();

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setChildren(result.data);
                // Auto-select primary child or first child
                if (!selectedChildId && result.data.length > 0) {
                    const primaryChild = result.data.find(c => c.is_primary);
                    const defaultChild = primaryChild || result.data[0];
                    onChildSelect(defaultChild.student_id);
                }
            }
            setLoading(false);
        }

        loadChildren();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 animate-pulse" />
                        <span>Loading children...</span>
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

    if (children.length === 0) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    No children found. Please contact the school administrator.
                </AlertDescription>
            </Alert>
        );
    }

    // If only one child, show simple card instead of dropdown
    if (children.length === 1) {
        const child = children[0];
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-primary" />
                            <div>
                                <p className="font-semibold">{child.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {child.student_number} • {child.class_name}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className={`font-semibold ${child.outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                MK {child.outstanding_balance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Multiple children - show dropdown selector
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Select Child
                    </label>
                    <Select
                        value={selectedChildId}
                        onValueChange={onChildSelect}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a child" />
                        </SelectTrigger>
                        <SelectContent>
                            {children.map((child) => (
                                <SelectItem key={child.student_id} value={child.student_id}>
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <div className="flex-1">
                                            <p className="font-medium">{child.full_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {child.student_number} • {child.class_name}
                                                {child.is_primary && ' • Primary'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-semibold ${child.outstanding_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                MK {child.outstanding_balance.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
}
