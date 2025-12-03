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

export async function getActiveTerm() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('terms')
        .select(`
            *,
            academic_years (
                id,
                name,
                start_date,
                end_date,
                is_active
            )
        `)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching active term:', error);
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        isActive: data.is_active,
        academicYear: data.academic_years ? {
            id: data.academic_years.id,
            name: data.academic_years.name,
            startDate: new Date(data.academic_years.start_date),
            endDate: new Date(data.academic_years.end_date),
            isActive: data.academic_years.is_active,
        } : null
    };
}

