'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { RecordPaymentDialog } from '@/components/fees/record-payment-dialog';
import { toast } from 'sonner';

interface Student {
    id: string;
    student_id: string;
    profiles: {
        first_name: string;
        last_name: string;
    };
    classes: {
        name: string;
    };
}

interface Invoice {
    id: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: string;
    academic_years: {
        name: string;
    };
    terms: {
        name: string;
    };
}

export function PaymentRecordingSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);

    // Search students
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter a student ID or name');
            return;
        }

        setSearching(true);
        const supabase = createClient();

        try {
            // Search by student ID only (simpler and more reliable)
            const { data, error } = await supabase
                .from('students')
                .select(`
                    id,
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name
                    )
                `)
                .ilike('student_id', `%${searchQuery}%`)
                .limit(10);

            if (error) {
                console.error('Search error:', error);
                toast.error('Failed to search students');
                return;
            }

            if (!data || data.length === 0) {
                toast.error('No students found matching your search');
                setStudents([]);
                return;
            }

            setStudents(data as any);

            // If only one result, auto-select
            if (data.length === 1) {
                handleSelectStudent(data[0] as any);
            }
        } catch (error) {
            toast.error('An error occurred while searching');
        } finally {
            setSearching(false);
        }
    };

    // Select student and load invoices
    const handleSelectStudent = async (student: Student) => {
        setSelectedStudent(student);
        setStudents([]); // Clear search results
        setSearchQuery(''); // Clear search
        await loadStudentInvoices(student.id);
    };

    // Load student's unpaid/partial invoices
    const loadStudentInvoices = async (studentId: string) => {
        setLoadingInvoices(true);
        const supabase = createClient();

        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    id,
                    invoice_number,
                    invoice_date,
                    due_date,
                    total_amount,
                    amount_paid,
                    balance,
                    status,
                    academic_years (
                        name
                    ),
                    terms (
                        name
                    )
                `)
                .eq('student_id', studentId)
                .in('status', ['unpaid', 'partial'])
                .order('invoice_date', { ascending: false });

            if (error) {
                console.error('Error loading invoices:', error);
                toast.error('Failed to load student invoices');
                return;
            }

            setInvoices((data as any) || []);
        } catch (error) {
            console.error('Error loading invoices:', error);
            toast.error('An error occurred while loading invoices');
        } finally {
            setLoadingInvoices(false);
        }
    };

    // Refresh invoices after payment
    const handlePaymentSuccess = () => {
        if (selectedStudent) {
            loadStudentInvoices(selectedStudent.id);
            toast.success('Payment recorded successfully! Invoices updated.');
        }
    };

    // Clear selection
    const handleClearSelection = () => {
        setSelectedStudent(null);
        setInvoices([]);
        setSearchQuery('');
    };

    const getStatusBadge = (status: string) => {
        const config = {
            unpaid: { className: 'bg-red-600', label: 'UNPAID' },
            partial: { className: 'bg-orange-500', label: 'PARTIAL' },
        };

        const statusConfig = config[status.toLowerCase() as keyof typeof config] || config.unpaid;

        return (
            <Badge className={statusConfig.className}>
                {statusConfig.label}
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Record Student Payment
                </CardTitle>
                <CardDescription>
                    Search for a student and record their fee payment. The system will automatically update invoices and balances.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Student Search */}
                {!selectedStudent && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="search">Search Student</Label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="search"
                                        placeholder="Enter student ID or name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch} disabled={searching}>
                                        <Search className="h-4 w-4 mr-2" />
                                        {searching ? 'Searching...' : 'Search'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {students.length > 0 && (
                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardHeader>
                                    <CardTitle className="text-sm">Search Results ({students.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {students.map((student) => {
                                            const profile = Array.isArray(student.profiles)
                                                ? student.profiles[0]
                                                : student.profiles;
                                            const studentClass = Array.isArray(student.classes)
                                                ? student.classes[0]
                                                : student.classes;

                                            return (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-500 cursor-pointer transition-colors"
                                                    onClick={() => handleSelectStudent(student)}
                                                >
                                                    <div>
                                                        <p className="font-medium">
                                                            {profile?.first_name} {profile?.last_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {student.student_id} • {studentClass?.name || 'No class'}
                                                        </p>
                                                    </div>
                                                    <Button size="sm" variant="outline">
                                                        Select
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Selected Student & Invoices */}
                {selectedStudent && (
                    <div className="space-y-4">
                        {/* Student Info */}
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-900">
                                <strong>Selected Student:</strong>{' '}
                                {(() => {
                                    const profile = Array.isArray(selectedStudent.profiles)
                                        ? selectedStudent.profiles[0]
                                        : selectedStudent.profiles;
                                    const studentClass = Array.isArray(selectedStudent.classes)
                                        ? selectedStudent.classes[0]
                                        : selectedStudent.classes;
                                    return `${profile?.first_name} ${profile?.last_name} (${selectedStudent.student_id}) - ${studentClass?.name || 'No class'}`;
                                })()}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="ml-4"
                                    onClick={handleClearSelection}
                                >
                                    Change Student
                                </Button>
                            </AlertDescription>
                        </Alert>

                        {/* Invoices Table */}
                        {loadingInvoices ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading invoices...
                            </div>
                        ) : invoices.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No unpaid or partially paid invoices found for this student.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div>
                                <h3 className="text-sm font-medium mb-3">
                                    Unpaid/Partial Invoices ({invoices.length})
                                </h3>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Invoice #</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Paid</TableHead>
                                                <TableHead>Balance</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoices.map((invoice) => {
                                                const academicYear = Array.isArray(invoice.academic_years)
                                                    ? invoice.academic_years[0]
                                                    : invoice.academic_years;
                                                const term = Array.isArray(invoice.terms)
                                                    ? invoice.terms[0]
                                                    : invoice.terms;
                                                const profile = Array.isArray(selectedStudent.profiles)
                                                    ? selectedStudent.profiles[0]
                                                    : selectedStudent.profiles;

                                                return (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell className="font-medium">
                                                            {invoice.invoice_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            {academicYear?.name} - {term?.name}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-muted-foreground">
                                                            {formatDate(invoice.invoice_date)}
                                                        </TableCell>
                                                        <TableCell>
                                                            MK {invoice.total_amount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="text-green-600">
                                                            MK {invoice.amount_paid.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-orange-600">
                                                            MK {invoice.balance.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(invoice.status)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <RecordPaymentDialog
                                                                invoice={{
                                                                    ...invoice,
                                                                    student: {
                                                                        id: selectedStudent.id,
                                                                        student_id: selectedStudent.student_id,
                                                                        full_name: `${profile?.first_name} ${profile?.last_name}`,
                                                                    },
                                                                }}
                                                                onSuccess={handlePaymentSuccess}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
