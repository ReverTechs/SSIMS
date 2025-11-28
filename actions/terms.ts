'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Term } from "@/types";

export async function getTerms(academicYearId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('terms')
        .select('*')
        .eq('academic_year_id', academicYearId)
        .order('start_date', { ascending: true });

    if (error) {
        console.error('Error fetching terms:', error);
        return [];
    }

    return data.map((term: any) => ({
        ...term,
        academicYearId: term.academic_year_id,
        startDate: new Date(term.start_date),
        endDate: new Date(term.end_date),
        isActive: term.is_active,
        createdAt: new Date(term.created_at),
        updatedAt: new Date(term.updated_at)
    })) as Term[];
}

export async function createTerm(data: {
    academicYearId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('terms')
        .insert({
            academic_year_id: data.academicYearId,
            name: data.name,
            start_date: data.startDate.toISOString(),
            end_date: data.endDate.toISOString(),
            is_active: data.isActive
        });

    if (error) {
        console.error('Error creating term:', error);
        throw new Error('Failed to create term');
    }

    revalidatePath('/dashboard/admin/academic-years');
}

export async function setActiveTerm(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('terms')
        .update({ is_active: true })
        .eq('id', id);

    if (error) {
        console.error('Error setting active term:', error);
        throw new Error('Failed to set active term');
    }

    revalidatePath('/dashboard/admin/academic-years');
}
