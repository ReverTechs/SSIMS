import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClearancesPageClient } from './clearances-page-client';
import { getActiveAcademicYear } from '@/actions/enrollment/academic-years';

export const metadata: Metadata = {
    title: 'Fee Clearances | SSIMS',
    description: 'Manage student fee clearance requests and approvals',
};

export default async function ClearancesPage() {
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

    // Only allow admin and teachers
    if (!['admin', 'teacher', 'headteacher', 'deputy_headteacher'].includes(profile?.role || '')) {
        redirect('/dashboard');
    }

    // Get active academic year
    const activeYear = await getActiveAcademicYear();

    // Get current term (if any)
    let currentTermId: string | undefined;
    if (activeYear) {
        const { data: currentTerm } = await supabase
            .from('terms')
            .select('id, name')
            .eq('academic_year_id', activeYear.id)
            .eq('is_active', true)
            .single();

        currentTermId = currentTerm?.id;
    }

    // Get all clearance types
    const { data: clearanceTypes } = await supabase
        .from('clearance_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

    // Get all classes for filtering
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .order('name');

    return (
        <ClearancesPageClient
            academicYearId={activeYear?.id}
            termId={currentTermId}
            clearanceTypes={clearanceTypes || []}
            classes={classes || []}
        />
    );
}
