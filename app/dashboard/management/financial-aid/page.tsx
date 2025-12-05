'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Award, Users } from 'lucide-react';
import { getFinancialAidTypes } from '@/actions/fees-management/financial-aid-types';
import { getAllAidAwards } from '@/actions/fees-management/student-aid';
import { AidTypeFormDialog } from '@/components/financial-aid/aid-type-form-dialog';
import { AssignAidDialog } from '@/components/financial-aid/assign-aid-dialog';
import type { FinancialAidTypeWithSponsor, StudentFinancialAidWithDetails } from '@/types/fees';
import { toast } from 'sonner';

export default function FinancialAidPage() {
    const [aidTypes, setAidTypes] = useState<FinancialAidTypeWithSponsor[]>([]);
    const [aidAwards, setAidAwards] = useState<StudentFinancialAidWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [aidTypeDialogOpen, setAidTypeDialogOpen] = useState(false);
    const [assignAidDialogOpen, setAssignAidDialogOpen] = useState(false);
    const [selectedAidType, setSelectedAidType] = useState<FinancialAidTypeWithSponsor | null>(null);

    // Load data
    const loadData = async () => {
        setLoading(true);

        const [typesResult, awardsResult] = await Promise.all([
            getFinancialAidTypes({ is_active: true }),
            getAllAidAwards({ status: 'active' }),
        ]);

        if (typesResult.error) {
            toast.error(typesResult.error);
        } else {
            setAidTypes(typesResult.aid_types || []);
        }

        if (awardsResult.error) {
            toast.error(awardsResult.error);
        } else {
            setAidAwards(awardsResult.aid_awards || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSuccess = () => {
        setAidTypeDialogOpen(false);
        setAssignAidDialogOpen(false);
        setSelectedAidType(null);
        loadData();
    };

    const getCoverageDisplay = (aidType: FinancialAidTypeWithSponsor) => {
        if (aidType.coverage_type === 'full') {
            return '100% Coverage';
        } else if (aidType.coverage_type === 'percentage') {
            return `${aidType.coverage_percentage}% Coverage`;
        } else if (aidType.coverage_type === 'fixed_amount') {
            return `MK ${aidType.coverage_amount?.toLocaleString()} Fixed`;
        } else {
            return 'Specific Items';
        }
    };

    const getStudentsWithAid = (aidTypeId: string) => {
        return aidAwards.filter(award => award.financial_aid_type_id === aidTypeId).length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Financial Aid</h1>
                    <p className="text-muted-foreground">
                        Manage scholarships, bursaries, and student aid assignments
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAssignAidDialogOpen(true)}>
                        <Users className="h-4 w-4 mr-2" />
                        Assign Aid
                    </Button>
                    <Button onClick={() => setAidTypeDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Aid Type
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aid Types</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{aidTypes.length}</div>
                        <p className="text-xs text-muted-foreground">Active aid programs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students Helped</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{aidAwards.length}</div>
                        <p className="text-xs text-muted-foreground">Active aid awards</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Aid Value</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            MK {aidAwards.reduce((sum, a) => sum + (a.calculated_aid_amount || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Calculated aid amount</p>
                    </CardContent>
                </Card>
            </div>

            {/* Aid Types List */}
            <Card>
                <CardHeader>
                    <CardTitle>Aid Types</CardTitle>
                    <CardDescription>
                        Financial aid programs available to students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading aid types...
                        </div>
                    ) : aidTypes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No aid types found. Click "Add Aid Type" to create one.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {aidTypes.map((aidType) => (
                                <div
                                    key={aidType.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium">{aidType.name}</h3>
                                            <Badge variant="outline">
                                                {aidType.sponsor.name}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{getCoverageDisplay(aidType)}</span>
                                            <span>•</span>
                                            <span>{getStudentsWithAid(aidType.id)} students</span>
                                        </div>
                                        {aidType.description && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {aidType.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedAidType(aidType);
                                            setAssignAidDialogOpen(true);
                                        }}
                                    >
                                        Assign to Student
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Aid Awards */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Aid Awards</CardTitle>
                    <CardDescription>
                        Recently assigned financial aid to students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {aidAwards.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No active aid awards yet
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {aidAwards.slice(0, 10).map((award) => (
                                <div
                                    key={award.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{award.student.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {award.student.student_id} • {award.financial_aid_type.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {award.coverage_type === 'full' ? '100%' :
                                                award.coverage_type === 'percentage' ? `${award.coverage_percentage}%` :
                                                    `MK ${award.coverage_amount?.toLocaleString()}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {award.sponsor.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <AidTypeFormDialog
                open={aidTypeDialogOpen}
                onOpenChange={setAidTypeDialogOpen}
                onSuccess={handleSuccess}
            />

            <AssignAidDialog
                open={assignAidDialogOpen}
                onOpenChange={setAssignAidDialogOpen}
                preselectedAidType={selectedAidType}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
