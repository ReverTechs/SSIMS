'use server';

import { createClient } from '@/lib/supabase/server';

interface FinancialOverview {
    total_fees_assigned: number;
    total_collected: number;
    outstanding_balance: number;
    collection_rate: number;
    total_students: number;
    total_invoices: number;
    total_payments: number;
    breakdown_by_term: {
        academic_year: string;
        term: string;
        total_fees: number;
        collected: number;
        outstanding: number;
        collection_rate: number;
    }[];
    payment_methods: {
        method: string;
        count: number;
        total_amount: number;
    }[];
}

export async function getFinancialOverview() {
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

        // Get total fees assigned
        const { data: studentFees } = await supabase
            .from('student_fees')
            .select('total_amount, amount_paid, balance');

        const total_fees_assigned = (studentFees || []).reduce((sum, fee) => sum + fee.total_amount, 0);
        const total_collected = (studentFees || []).reduce((sum, fee) => sum + fee.amount_paid, 0);
        const outstanding_balance = (studentFees || []).reduce((sum, fee) => sum + fee.balance, 0);
        const collection_rate = total_fees_assigned > 0 ? (total_collected / total_fees_assigned) * 100 : 0;

        // Get student count
        const { count: total_students } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true });

        // Get invoice count
        const { count: total_invoices } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true });

        // Get payment count
        const { count: total_payments } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true });

        // Get breakdown by term
        const { data: termBreakdown } = await supabase
            .from('student_fees')
            .select(`
                total_amount,
                amount_paid,
                balance,
                academic_years (name),
                terms (name)
            `);

        const termMap = new Map<string, { total: number; paid: number; outstanding: number }>();

        (termBreakdown || []).forEach((fee) => {
            const academicYearData = fee.academic_years;
            const academicYear = Array.isArray(academicYearData) ? academicYearData[0] : academicYearData;

            const termData = fee.terms;
            const term = Array.isArray(termData) ? termData[0] : termData;

            const key = `${academicYear?.name || 'N/A'}-${term?.name || 'N/A'}`;
            const existing = termMap.get(key) || { total: 0, paid: 0, outstanding: 0 };
            termMap.set(key, {
                total: existing.total + fee.total_amount,
                paid: existing.paid + fee.amount_paid,
                outstanding: existing.outstanding + fee.balance,
            });
        });

        const breakdown_by_term = Array.from(termMap.entries()).map(([key, values]) => {
            const [academic_year, term] = key.split('-');
            return {
                academic_year,
                term,
                total_fees: values.total,
                collected: values.paid,
                outstanding: values.outstanding,
                collection_rate: values.total > 0 ? (values.paid / values.total) * 100 : 0,
            };
        });

        // Get payment methods breakdown
        const { data: payments } = await supabase
            .from('payments')
            .select('payment_method, amount');

        const methodMap = new Map<string, { count: number; total: number }>();

        (payments || []).forEach((payment) => {
            const existing = methodMap.get(payment.payment_method) || { count: 0, total: 0 };
            methodMap.set(payment.payment_method, {
                count: existing.count + 1,
                total: existing.total + payment.amount,
            });
        });

        const payment_methods = Array.from(methodMap.entries()).map(([method, values]) => ({
            method,
            count: values.count,
            total_amount: values.total,
        }));

        const overview: FinancialOverview = {
            total_fees_assigned,
            total_collected,
            outstanding_balance,
            collection_rate,
            total_students: total_students || 0,
            total_invoices: total_invoices || 0,
            total_payments: total_payments || 0,
            breakdown_by_term,
            payment_methods,
        };

        return { success: true, data: overview };
    } catch (error) {
        console.error('Error in getFinancialOverview:', error);
        return { error: 'An unexpected error occurred' };
    }
}
