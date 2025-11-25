import { CurriculumLevel, StreamType, SubjectCategory } from "@/types";
import { createClient } from "@/lib/supabase/client";

export interface SubjectRequirement {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    level: CurriculumLevel;
    stream?: StreamType;
    isCompulsory: boolean;
    category: SubjectCategory;
}

export function getCurriculumLevel(gradeLevel: number): CurriculumLevel {
    return gradeLevel <= 2 ? "junior" : "senior";
}

export async function getCurriculumSubjects(
    level: CurriculumLevel,
    stream?: StreamType
): Promise<SubjectRequirement[]> {
    const supabase = createClient();

    let query = supabase
        .from("curriculum_subjects")
        .select(`
      *,
      subjects (
        name,
        code
      )
    `)
        .eq("level", level);

    if (level === "senior" && stream) {
        // For senior, get subjects specific to stream OR common subjects (null stream)
        query = query.or(`stream.eq.${stream},stream.is.null`);
    } else {
        // For junior, usually stream is null (common curriculum)
        query = query.is("stream", null);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching curriculum subjects:", error);
        return [];
    }

    return data.map((item: any) => ({
        subjectId: item.subject_id,
        subjectName: item.subjects.name,
        subjectCode: item.subjects.code,
        level: item.level,
        stream: item.stream,
        isCompulsory: item.is_compulsory,
        category: item.category,
    }));
}
