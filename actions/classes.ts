'use server';

import { createClient } from '@/utils/supabase/server';

export async function getClasses() {
    const supabase = await createClient();

    const { data: classes, error } = await supabase
        .from('classes')
        .select('id, name, grade_level')
        .order('grade_level', { ascending: true })
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching classes:', error);
        return [];
    }

    return classes;
}
