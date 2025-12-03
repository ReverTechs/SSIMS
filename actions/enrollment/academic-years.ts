'use server'

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { AcademicYear } from "@/types";

export async function getAcademicYears() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching academic years:', error);
        return [];
    }

    return data.map((year: any) => ({
        ...year,
        startDate: new Date(year.start_date),
        endDate: new Date(year.end_date),
        isActive: year.is_active,
        createdAt: new Date(year.created_at),
        updatedAt: new Date(year.updated_at)
    })) as AcademicYear[];
}

export async function getActiveAcademicYear() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

    if (error) {
        // It's possible no year is active
        return null;
    }

    return {
        ...data,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
    } as AcademicYear;
}

export async function createAcademicYear(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('academic_years')
        .insert({
            name: data.name,
            start_date: data.startDate.toISOString(),
            end_date: data.endDate.toISOString(),
            is_active: data.isActive
        });

    if (error) {
        console.error('Error creating academic year:', error);
        throw new Error('Failed to create academic year');
    }

    revalidatePath('/dashboard/admin/academic-years');
}

export async function setActiveAcademicYear(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('academic_years')
        .update({ is_active: true })
        .eq('id', id);

    if (error) {
        console.error('Error setting active academic year:', error);
        throw new Error('Failed to set active academic year');
    }

    revalidatePath('/dashboard/admin/academic-years');
}
