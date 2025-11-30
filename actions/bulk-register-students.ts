'use server';

import { createClient } from '@supabase/supabase-js';
import type { BulkStudentData, BulkUploadResult, BulkUploadError } from '@/types/bulk-upload-types';

/**
 * Batch size for processing students
 */
const BATCH_SIZE = 500;

/**
 * Default password for bulk-registered students
 */
const DEFAULT_PASSWORD = 'Student@sssims2025';

/**
 * Bulk register students from CSV/Excel upload
 * Processes in batches, handles duplicates, and provides detailed error reporting
 */
export async function bulkRegisterStudents(
    students: BulkStudentData[],
    classMapping: Record<string, string> // className -> classId mapping
): Promise<BulkUploadResult> {
    // Validate service role key
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

    // Create admin client
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
        // Step 1: Check for duplicate emails in the database
        const emails = students.map(s => s.email.toLowerCase());
        const { data: existingUsers, error: checkError } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .in('email', emails);

        if (checkError) {
            console.error('Error checking existing users:', checkError);
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

        // Step 1.1: Check for duplicate student IDs in the database
        const studentIds = students.map(s => s.studentId).filter(Boolean);
        const { data: existingStudentIdsData, error: checkIdError } = await supabaseAdmin
            .from('students')
            .select('student_id')
            .in('student_id', studentIds);

        if (checkIdError) {
            console.error('Error checking existing student IDs:', checkIdError);
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
                message: 'Failed to check for duplicate student IDs.',
            };
        }

        const existingStudentIds = new Set(existingStudentIdsData?.map(s => s.student_id) || []);

        // Step 1.5: Get Active Academic Year
        const { data: activeYear, error: yearError } = await supabaseAdmin
            .from('academic_years')
            .select('id')
            .eq('is_active', true)
            .single();

        if (yearError) {
            console.warn('No active academic year found. Students will be registered but not enrolled in a year.');
        }

        // Step 2: Process students in batches
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
            const batch = students.slice(i, i + BATCH_SIZE);

            for (let j = 0; j < batch.length; j++) {
                const student = batch[j];
                const rowNumber = i + j + 2; // +2 for header row and 0-indexing

                try {
                    // Check if email already exists
                    if (existingEmails.has(student.email.toLowerCase())) {
                        skippedCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: 'Email already exists in the system',
                            type: 'duplicate',
                        });
                        continue;
                    }

                    // Check if student ID already exists
                    if (student.studentId && existingStudentIds.has(student.studentId)) {
                        skippedCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: `Student ID "${student.studentId}" already exists in the system`,
                            type: 'duplicate',
                        });
                        continue;
                    }

                    // Map class name to class ID
                    const classId = classMapping[student.className];
                    if (!classId) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: `Class "${student.className}" not found in the system`,
                            type: 'validation',
                        });
                        continue;
                    }

                    // Step 3: Create auth user
                    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                        email: student.email.toLowerCase(),
                        password: DEFAULT_PASSWORD,
                        email_confirm: true,
                        user_metadata: {
                            first_name: student.firstName,
                            middle_name: student.middleName || '',
                            last_name: student.lastName,
                            role: 'student',
                            must_change_password: true,
                        },
                    });

                    if (authError) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: `Auth error: ${authError.message}`,
                            type: 'auth',
                        });
                        continue;
                    }

                    if (!authData.user) {
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: 'Failed to create user account',
                            type: 'auth',
                        });
                        continue;
                    }

                    const userId = authData.user.id;

                    // Step 4: Create/Update profile
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .upsert({
                            id: userId,
                            email: student.email.toLowerCase(),
                            first_name: student.firstName,
                            middle_name: student.middleName || null,
                            last_name: student.lastName,
                            role: 'student',
                            updated_at: new Date().toISOString(),
                        })
                        .select()
                        .single();

                    if (profileError) {
                        // Rollback: delete auth user
                        await supabaseAdmin.auth.admin.deleteUser(userId);
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: `Profile error: ${profileError.message}`,
                            type: 'database',
                        });
                        continue;
                    }

                    // Step 5: Insert into students table
                    const { error: studentError } = await supabaseAdmin
                        .from('students')
                        .insert({
                            id: userId,
                            class_id: classId,
                            date_of_birth: student.dateOfBirth || null,
                            gender: student.gender,
                            student_type: student.studentType,
                            guardian_email: student.guardianEmail.toLowerCase(),
                            address: student.address || null,
                            phone_number: student.phoneNumber || null,
                        });

                    if (studentError) {
                        // Rollback: delete auth user and profile
                        await supabaseAdmin.auth.admin.deleteUser(userId);
                        failureCount++;
                        errors.push({
                            row: rowNumber,
                            email: student.email,
                            studentId: student.studentId,
                            error: `Student record error: ${studentError.message}`,
                            type: 'database',
                        });
                        continue;
                    }

                    // Step 6: Create Enrollment if active year exists
                    if (activeYear) {
                        const { error: enrollmentError } = await supabaseAdmin
                            .from('enrollments')
                            .insert({
                                student_id: userId,
                                class_id: classId,
                                academic_year_id: activeYear.id,
                                status: 'active'
                            });

                        if (enrollmentError) {
                            console.error(`Enrollment error for ${student.email}:`, enrollmentError);
                            // We don't fail the whole registration, just log it.
                            errors.push({
                                row: rowNumber,
                                email: student.email,
                                studentId: student.studentId,
                                error: `Registered but failed to enroll in active year: ${enrollmentError.message}`,
                                type: 'database',
                            });
                        }
                    }

                    // Success!
                    successCount++;
                    // Add to existing emails set to prevent duplicates within the same batch
                    existingEmails.add(student.email.toLowerCase());
                    if (student.studentId) {
                        existingStudentIds.add(student.studentId);
                    }

                } catch (error) {
                    failureCount++;
                    errors.push({
                        row: rowNumber,
                        email: student.email,
                        studentId: student.studentId,
                        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                        type: 'database',
                    });
                }
            }
        }

        // Step 6: Return results
        const totalProcessed = successCount + failureCount + skippedCount;
        const success = successCount > 0;

        let message = '';
        if (successCount === students.length) {
            message = `Successfully registered all ${successCount} students!`;
        } else if (successCount > 0) {
            message = `Registered ${successCount} out of ${students.length} students. ${failureCount} failed, ${skippedCount} skipped.`;
        } else {
            message = `Failed to register any students. ${failureCount} failed, ${skippedCount} skipped.`;
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
            successCount,
            failureCount,
            skippedCount,
            errors: [{
                row: 0,
                error: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'database',
            }],
            message: 'An unexpected error occurred during bulk registration.',
        };
    }
}

/**
 * Get class name to ID mapping for bulk upload
 */
export async function getClassMapping(): Promise<Record<string, string>> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
        return {};
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

    const { data: classes, error } = await supabaseAdmin
        .from('classes')
        .select('id, name');

    if (error) {
        console.error('Error fetching classes:', error);
        return {};
    }

    const mapping: Record<string, string> = {};
    classes?.forEach(c => {
        mapping[c.name] = c.id;
    });

    return mapping;
}
