"use server";

import { createClient } from "@/lib/supabase/server";

export interface TeacherStudent {
    id: string;
    studentId: string; // school student ID
    name: string;
    email: string;
    className?: string;
    classId?: string;
    subjects?: string[];
}

interface GetTeacherStudentsOptions {
    teacherId: string;
    classId?: string;
    subjectId?: string;
}

/**
 * Fetch students for a specific teacher with optional filtering by class and subject
 * Optimized to reduce database queries
 */
export async function getTeacherStudents({
    teacherId,
    classId,
    subjectId,
}: GetTeacherStudentsOptions): Promise<TeacherStudent[]> {
    const supabase = await createClient();

    try {
        // Get active academic year
        const { data: activeYear } = await supabase
            .from("academic_years")
            .select("id")
            .eq("is_active", true)
            .maybeSingle();

        const activeYearId = (activeYear as any)?.id;
        if (!activeYearId) {
            console.warn("No active academic year found");
            return [];
        }

        let studentIds: string[] = [];

        // Determine which students to fetch based on filters
        if (classId) {
            // Filter by specific class
            const { data: enrollments } = await supabase
                .from("enrollments")
                .select("student_id")
                .eq("class_id", classId)
                .eq("academic_year_id", activeYearId)
                .eq("status", "active");

            if (!enrollments || enrollments.length === 0) {
                return [];
            }

            studentIds = enrollments.map((e) => e.student_id);
        } else if (subjectId) {
            // Filter by specific subject
            const { data: studentSubjects } = await supabase
                .from("student_subjects")
                .select("student_id")
                .eq("subject_id", subjectId)
                .eq("academic_year_id", activeYearId);

            if (!studentSubjects || studentSubjects.length === 0) {
                return [];
            }

            studentIds = studentSubjects.map((ss) => ss.student_id);
        } else {
            // No filter - get all students from teacher's classes
            const { data: teacherClasses } = await supabase
                .from("teacher_classes")
                .select("class_id")
                .eq("teacher_id", teacherId);

            if (!teacherClasses || teacherClasses.length === 0) {
                return [];
            }

            const classIds = teacherClasses.map((tc) => tc.class_id);

            const { data: enrollments } = await supabase
                .from("enrollments")
                .select("student_id")
                .in("class_id", classIds)
                .eq("academic_year_id", activeYearId)
                .eq("status", "active");

            if (!enrollments || enrollments.length === 0) {
                return [];
            }

            // Remove duplicates
            studentIds = [...new Set(enrollments.map((e) => e.student_id))];
        }

        if (studentIds.length === 0) {
            return [];
        }

        // Fetch all student data in parallel for better performance
        const [studentsResult, enrollmentsResult, subjectsResult] = await Promise.all([
            // Fetch student profiles
            supabase
                .from("students")
                .select("id, student_id, profiles!inner(email, first_name, middle_name, last_name)")
                .in("id", studentIds),

            // Fetch enrollments with class info
            supabase
                .from("enrollments")
                .select("student_id, class_id, classes(id, name)")
                .in("student_id", studentIds)
                .eq("academic_year_id", activeYearId)
                .eq("status", "active"),

            // Fetch student subjects
            supabase
                .from("student_subjects")
                .select("student_id, subjects(name)")
                .in("student_id", studentIds)
                .eq("academic_year_id", activeYearId),
        ]);

        if (studentsResult.error) {
            console.error("Error fetching students:", studentsResult.error);
            return [];
        }

        if (!studentsResult.data || studentsResult.data.length === 0) {
            return [];
        }

        // Create maps for efficient lookup
        const enrollmentMap: Record<string, { classId: string; className: string }> = {};
        if (enrollmentsResult.data) {
            enrollmentsResult.data.forEach((e: any) => {
                if (e.student_id && e.classes) {
                    enrollmentMap[e.student_id] = {
                        classId: e.classes.id,
                        className: e.classes.name,
                    };
                }
            });
        }

        const subjectsMap: Record<string, string[]> = {};
        if (subjectsResult.data) {
            subjectsResult.data.forEach((ss: any) => {
                if (ss.student_id && ss.subjects?.name) {
                    if (!subjectsMap[ss.student_id]) {
                        subjectsMap[ss.student_id] = [];
                    }
                    subjectsMap[ss.student_id].push(ss.subjects.name);
                }
            });
        }

        // Map and sort the data
        const students = studentsResult.data.map((student) => {
            const profile = student.profiles as any;
            const nameParts = [
                profile?.first_name,
                profile?.middle_name,
                profile?.last_name,
            ].filter(Boolean);

            const enrollment = enrollmentMap[student.id];

            return {
                id: student.id,
                studentId: student.student_id || "N/A",
                name: nameParts.length > 0 ? nameParts.join(" ") : "Unknown Student",
                email: profile?.email || "",
                className: enrollment?.className,
                classId: enrollment?.classId,
                subjects: subjectsMap[student.id] || [],
            };
        });

        // Sort by name
        students.sort((a, b) => a.name.localeCompare(b.name));

        return students;
    } catch (error) {
        console.error("Error in getTeacherStudents:", error);
        return [];
    }
}
