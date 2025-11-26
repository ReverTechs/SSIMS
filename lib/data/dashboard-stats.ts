import { createClient } from "@/lib/supabase/server";

export interface GenderStats {
    male: number;
    female: number;
}

export interface DashboardStats {
    students: GenderStats;
    teachers: GenderStats;
}

export async function getGenderStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Fetch student gender counts
    const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("gender");

    if (studentError) {
        console.error("Error fetching student stats:", studentError);
    }

    // Fetch teacher gender counts
    const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("gender");

    if (teacherError) {
        console.error("Error fetching teacher stats:", teacherError);
    }

    // Process student stats
    const studentStats = {
        male: 0,
        female: 0,
    };

    if (studentData) {
        studentStats.male = studentData.filter((s) => s.gender === "male").length;
        studentStats.female = studentData.filter((s) => s.gender === "female").length;
    }

    // Process teacher stats
    const teacherStats = {
        male: 0,
        female: 0,
    };

    if (teacherData) {
        teacherStats.male = teacherData.filter((t) => t.gender === "male").length;
        teacherStats.female = teacherData.filter((t) => t.gender === "female").length;
    }

    return {
        students: studentStats,
        teachers: teacherStats,
    };
}
