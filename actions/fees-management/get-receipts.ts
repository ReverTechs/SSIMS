'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Get recent receipts for a student (last 5)
 */
export async function getRecentReceipts(studentId: string) {
    try {
        const supabase = await createClient();

        const { data: receipts, error } = await supabase
            .from('receipts')
            .select(`
                id,
                receipt_number,
                amount,
                payment_date,
                payment_method,
                payment_id,
                invoice_id
            `)
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching recent receipts:', error);
            return { error: 'Failed to fetch recent receipts' };
        }

        // Fetch payment and invoice details for each receipt
        const enrichedReceipts = await Promise.all(
            (receipts || []).map(async (receipt) => {
                const { data: payment } = await supabase
                    .from('payments')
                    .select('payment_number, invoice_id')
                    .eq('id', receipt.payment_id)
                    .single();

                const { data: invoice } = await supabase
                    .from('invoices')
                    .select('invoice_number')
                    .eq('id', receipt.invoice_id)
                    .single();

                return {
                    ...receipt,
                    payments: payment ? {
                        payment_number: payment.payment_number,
                        invoices: invoice ? { invoice_number: invoice.invoice_number } : { invoice_number: 'N/A' }
                    } : null
                };
            })
        );

        return { success: true, receipts: enrichedReceipts };
    } catch (error) {
        console.error('Error in getRecentReceipts:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get all receipts for a student with optional filters
 */
export async function getAllReceipts(
    studentId: string,
    filters?: {
        startDate?: string;
        endDate?: string;
        searchTerm?: string;
    }
) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('receipts')
            .select(`
                id,
                receipt_number,
                amount,
                payment_date,
                payment_method,
                payment_id,
                invoice_id
            `)
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false });

        // Apply date filters
        if (filters?.startDate) {
            query = query.gte('payment_date', filters.startDate);
        }
        if (filters?.endDate) {
            query = query.lte('payment_date', filters.endDate);
        }

        const { data: receipts, error } = await query;

        if (error) {
            console.error('Error fetching receipts:', error);
            return { error: 'Failed to fetch receipts' };
        }

        // Fetch payment and invoice details for each receipt
        const enrichedReceipts = await Promise.all(
            (receipts || []).map(async (receipt) => {
                const { data: payment } = await supabase
                    .from('payments')
                    .select('payment_number, invoice_id')
                    .eq('id', receipt.payment_id)
                    .single();

                const { data: invoice } = await supabase
                    .from('invoices')
                    .select('invoice_number')
                    .eq('id', receipt.invoice_id)
                    .single();

                return {
                    ...receipt,
                    payments: payment ? {
                        payment_number: payment.payment_number,
                        invoices: invoice ? { invoice_number: invoice.invoice_number } : { invoice_number: 'N/A' }
                    } : null
                };
            })
        );

        // Apply search filter on client side (for receipt number)
        let filteredReceipts = enrichedReceipts;
        if (filters?.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredReceipts = filteredReceipts.filter(receipt =>
                receipt.receipt_number.toLowerCase().includes(searchLower)
            );
        }

        return { success: true, receipts: filteredReceipts };
    } catch (error) {
        console.error('Error in getAllReceipts:', error);
        return { error: 'An unexpected error occurred' };
    }
}
