/**
 * =====================================================================
 * ROLE UTILITIES - Helper functions for dual-role support
 * =====================================================================
 * These utilities help manage scenarios where users have multiple roles
 * Example: A teacher who is also a guardian for their own children
 * =====================================================================
 */

import { createClient } from '@/utils/supabase/server';

/**
 * Check if a user has a guardian record
 * Use case: Determine if a teacher is also a guardian
 */
export async function isGuardian(userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('guardians')
        .select('id')
        .eq('id', userId)
        .single();

    return !error && !!data;
}

/**
 * Check if a user has a teacher record
 * Use case: Determine if a guardian is also a teacher
 */
export async function isTeacher(userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', userId)
        .single();

    return !error && !!data;
}

/**
 * Check if a user has a student record
 * Use case: Determine if someone is a student
 */
export async function isStudent(userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('id', userId)
        .single();

    return !error && !!data;
}

/**
 * Get all roles for a user
 * Returns an array of role names that the user has
 * Example: ['teacher', 'guardian'] for a teacher who is also a guardian
 */
export async function getUserRoles(userId: string): Promise<string[]> {
    const roles: string[] = [];

    const supabase = await createClient();

    // Check profile role (primary role)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (profile?.role) {
        roles.push(profile.role);
    }

    // Check for additional role records
    const [hasTeacher, hasGuardian, hasStudent] = await Promise.all([
        isTeacher(userId),
        isGuardian(userId),
        isStudent(userId)
    ]);

    if (hasTeacher && !roles.includes('teacher')) roles.push('teacher');
    if (hasGuardian && !roles.includes('guardian')) roles.push('guardian');
    if (hasStudent && !roles.includes('student')) roles.push('student');

    return roles;
}

/**
 * Check if a user has multiple roles (dual-role scenario)
 */
export async function hasDualRole(userId: string): Promise<boolean> {
    const roles = await getUserRoles(userId);
    return roles.length > 1;
}

/**
 * Get guardian's students
 * Returns all students associated with a guardian
 */
export async function getGuardianStudents(guardianId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_guardians')
        .select(`
      *,
      students:student_id (
        id,
        profiles:id (
          first_name,
          middle_name,
          last_name,
          email
        ),
        class_id,
        date_of_birth,
        gender,
        student_type
      )
    `)
        .eq('guardian_id', guardianId);

    if (error) {
        console.error('Error fetching guardian students:', error);
        return [];
    }

    return data || [];
}

/**
 * Get student's guardians
 * Returns all guardians associated with a student
 */
export async function getStudentGuardians(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_guardians')
        .select(`
      *,
      guardians:guardian_id (
        id,
        phone_number,
        alternative_phone,
        address,
        occupation,
        national_id,
        workplace,
        work_phone,
        preferred_contact_method,
        is_emergency_contact,
        profiles:id (
          first_name,
          middle_name,
          last_name,
          email
        )
      )
    `)
        .eq('student_id', studentId);

    if (error) {
        console.error('Error fetching student guardians:', error);
        return [];
    }

    return data || [];
}

/**
 * Get primary guardian for a student
 */
export async function getPrimaryGuardian(studentId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_guardians')
        .select(`
      *,
      guardians:guardian_id (
        id,
        phone_number,
        alternative_phone,
        address,
        occupation,
        profiles:id (
          first_name,
          middle_name,
          last_name,
          email
        )
      )
    `)
        .eq('student_id', studentId)
        .eq('is_primary', true)
        .single();

    if (error) {
        console.error('Error fetching primary guardian:', error);
        return null;
    }

    return data;
}

/**
 * Check if a guardian can perform a specific action for a student
 */
export async function canGuardianPerformAction(
    guardianId: string,
    studentId: string,
    action: 'pickup' | 'financial' | 'emergency'
): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('student_guardians')
        .select('can_pickup, financial_responsibility, is_emergency_contact')
        .eq('guardian_id', guardianId)
        .eq('student_id', studentId)
        .single();

    if (error || !data) return false;

    switch (action) {
        case 'pickup':
            return data.can_pickup;
        case 'financial':
            return data.financial_responsibility;
        case 'emergency':
            return data.is_emergency_contact;
        default:
            return false;
    }
}
