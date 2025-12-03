'use server';

import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export async function exportOutstandingFeesToExcel() {
    try {
        const supabase = await createClient();

        // Get current user and check permissions
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!['admin', 'staff'].includes(profile?.role || '')) {
            return { error: 'Forbidden: Admin or staff access required' };
        }

        // Get outstanding fees data
        const { data: invoices } = await supabase
            .from('invoices')
            .select(`
                student_id,
                invoice_number,
                invoice_date,
                due_date,
                balance,
                students (
                    student_id,
                    phone_number,
                    profiles (
                        first_name,
                        last_name
                    ),
                    classes (
                        name
                    )
                )
            `)
            .gt('balance', 0)
            .order('balance', { ascending: false });

        // Format data for Excel
        const excelData = (invoices || []).map((invoice) => {
            const studentData = invoice.students;
            const student = Array.isArray(studentData) ? studentData[0] : studentData;

            const profileData = student?.profiles;
            const profile = Array.isArray(profileData) ? profileData[0] : profileData;

            const classData = student?.classes;
            const studentClass = Array.isArray(classData) ? classData[0] : classData;

            const daysOverdue = Math.floor(
                (new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                'Student ID': student?.student_id || 'N/A',
                'Student Name': profile
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Unknown',
                'Class': studentClass?.name || 'N/A',
                'Invoice Number': invoice.invoice_number,
                'Invoice Date': new Date(invoice.invoice_date).toLocaleDateString('en-GB'),
                'Due Date': new Date(invoice.due_date).toLocaleDateString('en-GB'),
                'Outstanding Amount (MK)': invoice.balance,
                'Days Overdue': daysOverdue > 0 ? daysOverdue : 0,
                'Phone Number': student?.phone_number || 'N/A',
            };
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 }, // Student ID
            { wch: 25 }, // Student Name
            { wch: 15 }, // Class
            { wch: 18 }, // Invoice Number
            { wch: 15 }, // Invoice Date
            { wch: 15 }, // Due Date
            { wch: 20 }, // Outstanding Amount
            { wch: 15 }, // Days Overdue
            { wch: 15 }, // Phone Number
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Outstanding Fees');

        // Add summary sheet
        const totalOutstanding = excelData.reduce((sum, row) => sum + row['Outstanding Amount (MK)'], 0);
        const summaryData = [
            { Metric: 'Total Students with Outstanding Fees', Value: excelData.length },
            { Metric: 'Total Outstanding Amount (MK)', Value: totalOutstanding },
            { Metric: 'Report Generated', Value: new Date().toLocaleString('en-GB') },
        ];

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 35 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Convert to buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Convert buffer to base64 for client download
        const base64 = Buffer.from(excelBuffer).toString('base64');

        return {
            success: true,
            data: {
                base64,
                filename: `Outstanding_Fees_${new Date().toISOString().split('T')[0]}.xlsx`,
            },
        };
    } catch (error) {
        console.error('Error in exportOutstandingFeesToExcel:', error);
        return { error: 'Failed to generate Excel file' };
    }
}

export async function exportFinancialOverviewToExcel() {
    try {
        const supabase = await createClient();

        // Get current user and check permissions
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!['admin', 'staff'].includes(profile?.role || '')) {
            return { error: 'Forbidden: Admin or staff access required' };
        }

        // Get all payments
        const { data: payments } = await supabase
            .from('payments')
            .select(`
                payment_number,
                payment_date,
                amount,
                payment_method,
                reference_number,
                students (
                    student_id,
                    profiles (
                        first_name,
                        last_name
                    )
                ),
                invoices (
                    invoice_number
                )
            `)
            .order('payment_date', { ascending: false });

        // Format data for Excel
        const excelData = (payments || []).map((payment) => {
            const studentData = payment.students;
            const student = Array.isArray(studentData) ? studentData[0] : studentData;

            const profileData = student?.profiles;
            const profile = Array.isArray(profileData) ? profileData[0] : profileData;

            const invoiceData = payment.invoices;
            const invoice = Array.isArray(invoiceData) ? invoiceData[0] : invoiceData;

            return {
                'Payment Number': payment.payment_number,
                'Date': new Date(payment.payment_date).toLocaleDateString('en-GB'),
                'Student ID': student?.student_id || 'N/A',
                'Student Name': profile
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Unknown',
                'Invoice Number': invoice?.invoice_number || 'N/A',
                'Amount (MK)': payment.amount,
                'Payment Method': payment.payment_method,
                'Reference Number': payment.reference_number || 'N/A',
            };
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 18 }, // Payment Number
            { wch: 15 }, // Date
            { wch: 12 }, // Student ID
            { wch: 25 }, // Student Name
            { wch: 18 }, // Invoice Number
            { wch: 15 }, // Amount
            { wch: 18 }, // Payment Method
            { wch: 20 }, // Reference Number
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Payment History');

        // Add summary
        const totalCollected = excelData.reduce((sum, row) => sum + row['Amount (MK)'], 0);
        const summaryData = [
            { Metric: 'Total Payments', Value: excelData.length },
            { Metric: 'Total Amount Collected (MK)', Value: totalCollected },
            { Metric: 'Report Generated', Value: new Date().toLocaleString('en-GB') },
        ];

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        summaryWs['!cols'] = [{ wch: 35 }, { wch: 25 }];
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

        // Convert to buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        const base64 = Buffer.from(excelBuffer).toString('base64');

        return {
            success: true,
            data: {
                base64,
                filename: `Payment_History_${new Date().toISOString().split('T')[0]}.xlsx`,
            },
        };
    } catch (error) {
        console.error('Error in exportFinancialOverviewToExcel:', error);
        return { error: 'Failed to generate Excel file' };
    }
}
