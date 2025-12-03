'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, XCircle, Download, Plus, AlertCircle } from 'lucide-react';
import { getClearanceStatus } from '@/actions/fees-management/request-clearance';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClearanceStatusCardProps {
    studentId: string;
    academicYearId: string;
    termId?: string;
    onRequestClearance?: (typeId: string) => void;
}

export function ClearanceStatusCard({
    studentId,
    academicYearId,
    termId,
    onRequestClearance,
}: ClearanceStatusCardProps) {
    const [clearances, setClearances] = useState<any[]>([]);
    const [availableTypes, setAvailableTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadClearances() {
            setLoading(true);
            setError(null);

            const result = await getClearanceStatus(studentId, academicYearId, termId);

            if (result.error) {
                setError(result.error);
            } else {
                setClearances(result.clearances || []);
                setAvailableTypes(result.available_types || []);
            }
            setLoading(false);
        }

        if (studentId && academicYearId) {
            loadClearances();
        }
    }, [studentId, academicYearId, termId]);

    const getStatusBadge = (status: string) => {
        const configs = {
            auto_approved: {
                icon: CheckCircle2,
                label: 'Approved',
                className: 'bg-green-600 text-white',
            },
            manually_approved: {
                icon: CheckCircle2,
                label: 'Approved',
                className: 'bg-green-600 text-white',
            },
            pending: {
                icon: Clock,
                label: 'Pending',
                className: 'bg-yellow-600 text-white',
            },
            rejected: {
                icon: XCircle,
                label: 'Rejected',
                className: 'bg-red-600 text-white',
            },
            expired: {
                icon: AlertCircle,
                label: 'Expired',
                className: 'bg-gray-600 text-white',
            },
        };

        const config = configs[status as keyof typeof configs] || configs.pending;
        const Icon = config.icon;

        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getRequestableTypes = () => {
        const existingTypeIds = clearances
            .filter((c) => ['pending', 'auto_approved', 'manually_approved'].includes(c.status))
            .map((c) => c.clearance_types.name);

        return availableTypes.filter((type) => !existingTypeIds.includes(type.name));
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Fee Clearance Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                        Loading clearance status...
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

    const requestableTypes = getRequestableTypes();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Fee Clearance Status</CardTitle>
                {requestableTypes.length > 0 && onRequestClearance && (
                    <Button
                        size="sm"
                        onClick={() => onRequestClearance(requestableTypes[0].id)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Request Clearance
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {clearances.length === 0 ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No clearances requested yet. Request a clearance to get started.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        {clearances.map((clearance) => {
                            const clearanceType = Array.isArray(clearance.clearance_types)
                                ? clearance.clearance_types[0]
                                : clearance.clearance_types;

                            return (
                                <div
                                    key={clearance.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium">{clearanceType.display_name}</h4>
                                            {getStatusBadge(clearance.status)}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                Payment: {Math.round(clearance.payment_percentage)}%
                                                <span className="text-xs ml-1">
                                                    (Required: {clearanceType.minimum_payment_percentage}%)
                                                </span>
                                            </p>
                                            {clearance.certificate_number && (
                                                <p className="font-mono text-xs">
                                                    Certificate: {clearance.certificate_number}
                                                </p>
                                            )}
                                            {clearance.valid_until && (
                                                <p className="text-xs">
                                                    Valid until: {formatDate(clearance.valid_until)}
                                                </p>
                                            )}
                                            {clearance.rejection_reason && (
                                                <p className="text-xs text-red-600">
                                                    Reason: {clearance.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {clearance.certificate_number && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-2"
                                            onClick={() => {
                                                window.open(
                                                    `/api/clearance/${clearance.id}/download`,
                                                    '_blank'
                                                );
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                            Certificate
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {requestableTypes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-2">
                            Available clearance types:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {requestableTypes.map((type) => (
                                <Badge key={type.id} variant="outline">
                                    {type.display_name} ({type.minimum_payment_percentage}% required)
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
