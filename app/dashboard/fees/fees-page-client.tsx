'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuardianChildSelector } from '@/components/fees/guardian-child-selector';
import { StudentFeeSummary } from '@/components/fees/student-fee-summary';
import { StudentInvoicesTable } from '@/components/fees/student-invoices-table';
import { StudentPaymentsTable } from '@/components/fees/student-payments-table';
import { Receipt, FileText, DollarSign } from 'lucide-react';

interface FeesPageClientProps {
    userId: string;
    userRole: string;
}

export function FeesPageClient({ userId, userRole }: FeesPageClientProps) {
    const [selectedStudentId, setSelectedStudentId] = useState<string>(
        userRole === 'student' ? userId : ''
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Fees</h1>
                <p className="text-muted-foreground">
                    View your fee summary, invoices, and payment history
                </p>
            </div>

            {/* Guardian Child Selector (only for guardians) */}
            {userRole === 'guardian' && (
                <GuardianChildSelector
                    onChildSelect={setSelectedStudentId}
                    selectedChildId={selectedStudentId}
                />
            )}

            {/* Main Content - Only show if student is selected */}
            {selectedStudentId && selectedStudentId.trim() !== '' ? (
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Invoices
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Payments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <StudentFeeSummary studentId={selectedStudentId} />
                    </TabsContent>

                    <TabsContent value="invoices">
                        <StudentInvoicesTable studentId={selectedStudentId} />
                    </TabsContent>

                    <TabsContent value="payments">
                        <StudentPaymentsTable studentId={selectedStudentId} />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    Please select a child to view their fee information
                </div>
            )}
        </div>
    );
}
