'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Info } from 'lucide-react';
import { getStudentAid } from '@/actions/fees-management/student-aid';
import type { StudentFinancialAidWithDetails } from '@/types/fees';

interface StudentAidCardProps {
    studentId: string;
    academicYearId?: string;
    termId?: string;
}

export function StudentAidCard({ studentId, academicYearId, termId }: StudentAidCardProps) {
    const [aidAwards, setAidAwards] = useState<StudentFinancialAidWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAid = async () => {
            setLoading(true);
            const result = await getStudentAid(studentId, academicYearId, termId);

            if (!result.error && result.aid_awards) {
                // Filter only active aid
                const activeAid = result.aid_awards.filter(
                    award => award.status === 'active' || award.status === 'approved'
                );
                setAidAwards(activeAid);
            }
            setLoading(false);
        };

        loadAid();
    }, [studentId, academicYearId, termId]);

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Loading financial aid...</p>
                </CardContent>
            </Card>
        );
    }

    if (aidAwards.length === 0) {
        return null; // Don't show card if no aid
    }

    const totalAidAmount = aidAwards.reduce((sum, award) => sum + (award.calculated_aid_amount || 0), 0);

    const getCoverageDisplay = (award: StudentFinancialAidWithDetails) => {
        if (award.coverage_type === 'full') {
            return '100% Coverage';
        } else if (award.coverage_type === 'percentage') {
            return `${award.coverage_percentage}% Coverage`;
        } else if (award.coverage_type === 'fixed_amount') {
            return `MK ${award.coverage_amount?.toLocaleString()}`;
        } else {
            return 'Specific Items';
        }
    };

    const getStatusColor = (status: string) => {
        const colors = {
            active: 'bg-green-600',
            approved: 'bg-blue-600',
            pending: 'bg-yellow-600',
            suspended: 'bg-red-600',
            completed: 'bg-gray-600',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-600';
    };

    return (
        <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                    <Award className="h-5 w-5" />
                    Financial Aid
                </CardTitle>
                <CardDescription className="text-green-700">
                    You have {aidAwards.length} active financial aid award{aidAwards.length > 1 ? 's' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Total Aid Summary */}
                {totalAidAmount > 0 && (
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm text-muted-foreground">Total Financial Aid</p>
                        <p className="text-2xl font-bold text-green-900">
                            MK {totalAidAmount.toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Aid Awards List */}
                <div className="space-y-3">
                    {aidAwards.map((award) => (
                        <div key={award.id} className="p-3 bg-white rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium">{award.financial_aid_type.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {award.sponsor.name}
                                    </p>
                                </div>
                                <Badge className={getStatusColor(award.status)}>
                                    {award.status}
                                </Badge>
                            </div>

                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Coverage:</span>
                                    <span className="font-medium">{getCoverageDisplay(award)}</span>
                                </div>

                                {award.calculated_aid_amount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Aid Amount:</span>
                                        <span className="font-medium text-green-700">
                                            MK {award.calculated_aid_amount.toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Valid Period:</span>
                                    <span className="font-medium">
                                        {new Date(award.valid_from).toLocaleDateString()} - {new Date(award.valid_until).toLocaleDateString()}
                                    </span>
                                </div>

                                {award.term && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Term:</span>
                                        <span className="font-medium">{award.term.name}</span>
                                    </div>
                                )}

                                {award.conditions && (
                                    <div className="mt-2 pt-2 border-t">
                                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                            <span><strong>Conditions:</strong> {award.conditions}</span>
                                        </div>
                                    </div>
                                )}

                                {!award.sponsor_payment_received && award.sponsor_pays_directly && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-xs text-yellow-700 flex items-center gap-1">
                                            <Info className="h-3 w-3" />
                                            Awaiting sponsor payment
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Information Note */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900 flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                            Your invoice shows the total fees and your responsibility after financial aid has been applied.
                            You only need to pay your portion.
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
