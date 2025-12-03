'use server'

import { createClient } from "@/utils/supabase/server";

export async function checkEnrollmentsForeignKey() {
    const supabase = await createClient();

    // Check if enrollments table exists and has data
    const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .limit(5);

    console.log('Enrollments check:', {
        count: enrollments?.length,
        enrollments,
        enrollError
    });

    // Check academic years
    const { data: years, error: yearsError } = await supabase
        .from('academic_years')
        .select('*');

    console.log('Academic years:', { years, yearsError });

    // Check classes
    const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .limit(5);

    console.log('Classes:', { classes, classesError });

    // Try with first foreign key
    const { data: joinData1, error: joinError1 } = await supabase
        .from('enrollments')
        .select(`
            *,
            students!enrollments_student_id_fkey (
                id,
                first_name,
                last_name
            )
        `)
        .limit(1);

    console.log('FK 1 (enrollments_student_id_fkey):', {
        joinData1,
        error: joinError1 ? {
            message: joinError1.message,
            details: joinError1.details,
            hint: joinError1.hint,
            code: joinError1.code
        } : null
    });

    // Try with second foreign key
    const { data: joinData2, error: joinError2 } = await supabase
        .from('enrollments')
        .select(`
            *,
            students!fk_enrollments_student (
                id,
                first_name,
                last_name
            )
        `)
        .limit(1);

    console.log('FK 2 (fk_enrollments_student):', {
        joinData2,
        error: joinError2 ? {
            message: joinError2.message,
            details: joinError2.details,
            hint: joinError2.hint,
            code: joinError2.code
        } : null
    });

    return {
        enrollmentsCount: enrollments?.length || 0,
        yearsCount: years?.length || 0,
        classesCount: classes?.length || 0,
        fk1Works: !joinError1,
        fk2Works: !joinError2,
        fk1Data: joinData1,
        fk2Data: joinData2,
        errors: {
            fk1: joinError1 ? {
                message: joinError1.message,
                code: joinError1.code
            } : null,
            fk2: joinError2 ? {
                message: joinError2.message,
                code: joinError2.code
            } : null
        }
    };
}
