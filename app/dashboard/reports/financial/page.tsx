import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FinancialReportsClient } from './financial-reports-client';

export const metadata: Metadata = {
    title: 'Financial Reports | SSIMS',
    description: 'View financial dashboard, collection reports, and outstanding fees',
};

export default async function FinancialReportsPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    // Only allow admin and staff
    if (!['admin', 'staff'].includes(profile?.role || '')) {
        redirect('/dashboard');
    }

    return <FinancialReportsClient />;
}
