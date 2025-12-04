import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FeesPageClient } from './fees-page-client';
import { getActiveAcademicYear } from '@/actions/enrollment/academic-years';

export const metadata: Metadata = {
  title: 'My Fees | SSIMS',
  description: 'View your fee summary, invoices, payment history, and clearance status',
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

  // Get active academic year for clearance status
  const activeYear = await getActiveAcademicYear();

  // Get current term (if any)
  let currentTermId: string | undefined;
  if (activeYear) {
    const { data: currentTerm } = await supabase
      .from('terms')
      .select('id')
      .eq('academic_year_id', activeYear.id)
      .eq('is_active', true)
      .single();

    currentTermId = currentTerm?.id;
  }

  return (
    <FeesPageClient
      userId={user.id}
      userRole={profile?.role || 'student'}
      academicYearId={activeYear?.id}
      termId={currentTermId}
    />
  );
}
