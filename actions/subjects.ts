'use server';

import { createClient } from '@/utils/supabase/server';

export async function getAllSubjects() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching subjects:', error);
        return [];
    }

    return data;
}
