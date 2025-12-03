'use server';

import { createClient } from '@supabase/supabase-js';
import type { BulkTeacherData, BulkUploadResult, BulkUploadError } from '@/types/bulk-upload-types';

const BATCH_SIZE = 50; // Smaller batch size due to multiple related inserts
const DEFAULT_PASSWORD = 'Student@sssims2025';

interface Mappings {
    departments: Record<string, string>; // name -> id
    subjects: Record<string, string>; // name -> id
    classes: Record<string, string>; // name -> id
}

export async function bulkRegisterTeachers(
    teachers: BulkTeacherData[],
    mappings: Mappings
): Promise<BulkUploadResult> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return {
            success: false,
            totalProcessed: 0,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            errors: [],
            message: 'Server configuration error. Please contact support.',
        };
    }

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const errors: BulkUploadError[] = [];

    try {
        // Step 1: Check for duplicate emails
        const emails = teachers.map(t => t.email.toLowerCase());
        const { data: existingUsers, error: checkError } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .in('email', emails);

        if (checkError) {
            return {
                success: false,
                totalProcessed: 0,
                successCount: 0,
                failureCount: 0,
                skippedCount: 0,
                errors: [{
                    row: 0,
                    error: `Database error: ${checkError.message}`,
                    type: 'database',
                }],
                message: 'Failed to check for duplicate emails.',
            };
        }

        const existingEmails = new Set(existingUsers?.map(u => u.email.toLowerCase()) || []);

        // Step 1.1: Check for duplicate employee IDs
        const employeeIds = teachers.map(t => t.employeeId).filter(Boolean);
        const { data: existingEmployeeIdsData, error: checkIdError } = await supabaseAdmin
            .from('teachers')
            .select('employee_id')
            .in('employee_id', employeeIds);

        if (checkIdError) {
            return {
                success: false,
                totalProcessed: 0,
                successCount: 0,
                failureCount: 0,
                skippedCount: 0,
                errors: [{
                    row: 0,
                    error: `Database error: ${checkIdError.message}`,
                    type: 'database',
                }],
                message: 'Failed to check for duplicate employee IDs.',
            };
        }

        const existingEmployeeIds = new Set(existingEmployeeIdsData?.map(t => t.employee_id) || []);

        // Step 2: Process in batches
        for (let i = 0; i < teachers.length; i += BATCH_SIZE) {
            const batch = teachers.slice(i, i + BATCH_SIZE);

            for (let j = 0; j < batch.length; j++) {
                const teacher = batch[j];
                const rowNumber = i + j + 2;

                try {
                    // Check duplicate email
                    if (existingEmails.has(teacher.email.toLowerCase())) {
                        skippedCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: 'Email already exists in the system',
                            type: 'duplicate',
                        });
                        continue;
                    }

                    // Check duplicate employee ID
                    if (teacher.employeeId && existingEmployeeIds.has(teacher.employeeId)) {
                        skippedCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Employee ID "${teacher.employeeId}" already exists in the system`,
                            type: 'duplicate',
                        });
                        continue;
                    }

                    // Validate Department
                    const departmentId = mappings.departments[teacher.department];
                    if (!departmentId && teacher.department) {
                        // If department is provided but not found, it's an error. 
                        // If not provided, it might be optional depending on logic, but usually required.
                        // Assuming required for now based on form.
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Department "${teacher.department}" not found`,
                            type: 'validation',
                        });
                        continue;
                    }

                    // Validate Subjects
                    const subjectNames = teacher.subjects ? teacher.subjects.split(',').map(s => s.trim()) : [];
                    const subjectIds: string[] = [];
                    const missingSubjects: string[] = [];

                    for (const name of subjectNames) {
                        if (name) {
                            const id = mappings.subjects[name];
                            if (id) subjectIds.push(id);
                            else missingSubjects.push(name);
                        }
                    }

                    if (missingSubjects.length > 0) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Subjects not found: ${missingSubjects.join(', ')}`,
                            type: 'validation',
                        });
                        continue;
                    }

                    // Validate Classes
                    const classNames = teacher.classes ? teacher.classes.split(',').map(c => c.trim()) : [];
                    const classIds: string[] = [];
                    const missingClasses: string[] = [];

                    for (const name of classNames) {
                        if (name) {
                            const id = mappings.classes[name];
                            if (id) classIds.push(id);
                            else missingClasses.push(name);
                        }
                    }

                    if (missingClasses.length > 0) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Classes not found: ${missingClasses.join(', ')}`,
                            type: 'validation',
                        });
                        continue;
                    }

                    // Step 3: Create Auth User
                    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                        email: teacher.email.toLowerCase(),
                        password: DEFAULT_PASSWORD,
                        email_confirm: true,
                        user_metadata: {
                            first_name: teacher.firstName,
                            middle_name: teacher.middleName || '',
                            last_name: teacher.lastName,
                            role: teacher.role || 'teacher',
                            must_change_password: true,
                        },
                    });

                    if (authError || !authData.user) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Auth error: ${authError?.message || 'Failed to create user'}`,
                            type: 'auth',
                        });
                        continue;
                    }

                    const userId = authData.user.id;

                    // Step 4: Create Profile
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .insert({
                            id: userId,
                            email: teacher.email.toLowerCase(),
                            first_name: teacher.firstName,
                            middle_name: teacher.middleName || null,
                            last_name: teacher.lastName,
                            role: teacher.role || 'teacher',
                            updated_at: new Date().toISOString(),
                        });

                    if (profileError) {
                        await supabaseAdmin.auth.admin.deleteUser(userId);
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Profile error: ${profileError.message}`,
                            type: 'database',
                        });
                        continue;
                    }

                    // Step 5: Create Teacher Record
                    const { error: teacherError } = await supabaseAdmin
                        .from('teachers')
                        .insert({
                            id: userId,
                            employee_id: teacher.employeeId,
                            title: teacher.title,
                            department_id: departmentId,
                            teacher_type: teacher.teacherType || 'permanent',
                            gender: teacher.gender,
                        });

                    if (teacherError) {
                        await supabaseAdmin.auth.admin.deleteUser(userId);
                        // Profile cascades delete usually, but explicit delete is safer if not set up
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: teacher.email,
                            error: `Teacher record error: ${teacherError.message}`,
                            type: 'database',
                        });
                        continue;
                    }

                    // Step 6: Insert Subjects
                    if (subjectIds.length > 0) {
                        const { error: subjectsError } = await supabaseAdmin
                            .from('teacher_subjects')
                            .insert(
                                subjectIds.map(subjectId => ({
                                    teacher_id: userId,
                                    subject_id: subjectId,
                                }))
                            );

                        if (subjectsError) {
                            // Log error but don't fail the whole registration, just report it
                            errors.push({
                                row: rowNumber,
                                email: teacher.email,
                                error: `Warning: Failed to link subjects: ${subjectsError.message}`,
                                type: 'database',
                            });
                        }
                    }

                    // Step 7: Insert Classes
                    if (classIds.length > 0) {
                        const { error: classesError } = await supabaseAdmin
                            .from('teacher_classes')
                            .insert(
                                classIds.map(classId => ({
                                    teacher_id: userId,
                                    class_id: classId,
                                }))
                            );

                        if (classesError) {
                            errors.push({
                                row: rowNumber,
                                email: teacher.email,
                                error: `Warning: Failed to link classes: ${classesError.message}`,
                                type: 'database',
                            });
                        }
                    }

                    successCount++;
                    existingEmails.add(teacher.email.toLowerCase());
                    if (teacher.employeeId) {
                        existingEmployeeIds.add(teacher.employeeId);
                    }

                } catch (error) {
                    failureCount++;
                    errors.push({
                        row: rowNumber,
                        email: teacher.email,
                        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        type: 'database',
                    });
                }
            }
        }

        const totalProcessed = successCount + failureCount + skippedCount;
        const success = successCount > 0;
        let message = '';
        if (successCount === teachers.length) {
            message = `Successfully registered all ${successCount} teachers!`;
        } else {
            message = `Registered ${successCount} out of ${teachers.length} teachers. ${failureCount} failed, ${skippedCount} skipped.`;
        }

        return {
            success,
            totalProcessed,
            successCount,
            failureCount,
            skippedCount,
            errors,
            message,
        };

    } catch (error) {
        console.error('Bulk registration error:', error);
        return {
            success: false,
            totalProcessed: 0,
            successCount: 0,
            failureCount: 0,
            skippedCount: 0,
            errors: [{
                row: 0,
                error: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'database',
            }],
            message: 'An unexpected error occurred.',
        };
    }
}

export async function getTeacherMappings(): Promise<Mappings> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { departments: {}, subjects: {}, classes: {} };

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const [deptRes, subjRes, classRes] = await Promise.all([
        supabaseAdmin.from('departments').select('id, name'),
        supabaseAdmin.from('subjects').select('id, name'),
        supabaseAdmin.from('classes').select('id, name')
    ]);

    const mappings: Mappings = {
        departments: {},
        subjects: {},
        classes: {}
    };

    deptRes.data?.forEach(d => mappings.departments[d.name] = d.id);
    subjRes.data?.forEach(s => mappings.subjects[s.name] = s.id);
    classRes.data?.forEach(c => mappings.classes[c.name] = c.id);

    return mappings;
}
