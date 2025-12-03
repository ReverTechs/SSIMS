import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeesPageClient } from './fees-page-client';

export const metadata: Metadata = {
  title: 'My Fees | SSIMS',
  description: 'View your fee summary, invoices, and payment history',
};

export default async function FeesPage() {
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

  // Only allow students and guardians
  if (!['student', 'guardian'].includes(profile?.role || '')) {
    redirect('/dashboard');
  }

  return <FeesPageClient userId={user.id} userRole={profile?.role || 'student'} />;
}
