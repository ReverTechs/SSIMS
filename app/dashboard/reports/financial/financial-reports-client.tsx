'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialDashboard } from '@/components/reports/financial-dashboard';
import { OutstandingFeesTable } from '@/components/reports/outstanding-fees-table';
import { BarChart3, AlertTriangle, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { exportFinancialOverviewToExcel } from '@/actions/fees-management/export-to-excel';
import { toast } from 'sonner';
import { useState } from 'react';

export function FinancialReportsClient() {
    const [exporting, setExporting] = useState(false);

    async function handleExportPaymentHistory() {
        setExporting(true);
        const result = await exportFinancialOverviewToExcel();

        if (result.error) {
            toast.error(result.error);
        } else if (result.data) {
            // Create download link
            const link = document.createElement('a');
            link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data.base64}`;
            link.download = result.data.filename;
            link.click();
            toast.success('Payment history exported successfully!');
        }
        setExporting(false);
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                    <p className="text-muted-foreground">
                        Monitor fee collection, track outstanding balances, and analyze payment trends
                    </p>
                </div>
                <Button onClick={handleExportPaymentHistory} disabled={exporting} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export Payment History'}
                </Button>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="dashboard" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="outstanding" className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Outstanding Fees
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                    <FinancialDashboard />
                </TabsContent>

                <TabsContent value="outstanding">
                    <OutstandingFeesTable />
                </TabsContent>
            </Tabs>
        </div>
    );
}
