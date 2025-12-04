'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, XCircle, Clock, FileCheck, Users } from 'lucide-react';
import { getPendingClearances, approveClearance } from '@/actions/fees-management/approve-clearance';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClearancesPageClientProps {
    academicYearId?: string;
    termId?: string;
    clearanceTypes: any[];
    classes: any[];
}

export function ClearancesPageClient({
    academicYearId,
    termId,
    clearanceTypes,
    classes
}: ClearancesPageClientProps) {
    const [pendingClearances, setPendingClearances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadPendingClearances();
    }, [academicYearId, termId, selectedType, selectedClass]);

    async function loadPendingClearances() {
        if (!academicYearId) return;

        setLoading(true);
        const filters: any = {
            academic_year_id: academicYearId,
        };

        if (termId) filters.term_id = termId;
        if (selectedType !== 'all') filters.clearance_type_id = selectedType;
        if (selectedClass !== 'all') filters.class_id = selectedClass;

        const result = await getPendingClearances(filters);

        if (result.error) {
            toast.error(result.error);
        } else {
            setPendingClearances(result.clearances || []);
        }
        setLoading(false);
    }

    async function handleApprove(clearanceId: string, override: boolean = false) {
        setProcessingId(clearanceId);

        const result = await approveClearance({
            clearance_request_id: clearanceId,
            approve: true,
            reason: override ? 'Administrative override' : undefined,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message);
            loadPendingClearances();
        }

        setProcessingId(null);
    }

    async function handleReject(clearanceId: string) {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;

        setProcessingId(clearanceId);

        const result = await approveClearance({
            clearance_request_id: clearanceId,
            approve: false,
            reason,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message);
            loadPendingClearances();
        }

        setProcessingId(null);
    }

    const getStatusBadge = (paymentPct: number, requiredPct: number) => {
        if (paymentPct >= requiredPct) {
            return <Badge className="bg-green-600">Eligible</Badge>;
        } else {
            return <Badge variant="destructive">Below Threshold</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fee Clearances</h1>
                <p className="text-muted-foreground">
                    Review and approve student fee clearance requests
                </p>
            </div>

            {!academicYearId && (
                <Alert>
                    <AlertDescription>
                        No active academic year found. Please set an active academic year to manage clearances.
                    </AlertDescription>
                </Alert>
            )}

            {academicYearId && (
                <Tabs defaultValue="pending" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Approvals
                        </TabsTrigger>
                        <TabsTrigger value="bulk" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Bulk Clearance
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {/* Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Filters</CardTitle>
                                <CardDescription>Filter clearance requests by type and class</CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Clearance Type</label>
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {clearanceTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.display_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Class</label>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Classes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Classes</SelectItem>
                                            {classes.map((cls) => (
                                                <SelectItem key={cls.id} value={cls.id}>
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pending Clearances Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Requests ({pendingClearances.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Loading clearance requests...
                                    </div>
                                ) : pendingClearances.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No pending clearance requests
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Class</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Payment</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Requested</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pendingClearances.map((clearance) => {
                                                const student = Array.isArray(clearance.students)
                                                    ? clearance.students[0]
                                                    : clearance.students;
                                                const profile = Array.isArray(student?.profiles)
                                                    ? student.profiles[0]
                                                    : student?.profiles;
                                                const studentClass = Array.isArray(student?.classes)
                                                    ? student.classes[0]
                                                    : student?.classes;
                                                const clearanceType = Array.isArray(clearance.clearance_types)
                                                    ? clearance.clearance_types[0]
                                                    : clearance.clearance_types;

                                                return (
                                                    <TableRow key={clearance.id}>
                                                        <TableCell className="font-medium">
                                                            {profile?.first_name} {profile?.last_name}
                                                            <div className="text-xs text-muted-foreground">
                                                                {student?.student_id}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{studentClass?.name || 'N/A'}</TableCell>
                                                        <TableCell>{clearanceType?.display_name}</TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {Math.round(clearance.payment_percentage)}%
                                                                <div className="text-xs text-muted-foreground">
                                                                    MK {clearance.amount_paid.toLocaleString()} / MK {clearance.total_fees_amount.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(
                                                                clearance.payment_percentage,
                                                                clearanceType?.minimum_payment_percentage
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {new Date(clearance.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApprove(clearance.id)}
                                                                    disabled={processingId === clearance.id}
                                                                    className="gap-1"
                                                                >
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleReject(clearance.id)}
                                                                    disabled={processingId === clearance.id}
                                                                    className="gap-1"
                                                                >
                                                                    <XCircle className="h-3 w-3" />
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bulk" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bulk Clearance</CardTitle>
                                <CardDescription>
                                    Approve clearances for multiple students at once
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <FileCheck className="h-4 w-4" />
                                    <AlertDescription>
                                        Bulk clearance feature coming soon. This will allow you to approve clearances for entire classes or groups of students based on payment thresholds.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
