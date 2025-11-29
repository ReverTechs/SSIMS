import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MyStudentsContent } from "./my-students-content";
import { Loader2 } from "lucide-react";

export default async function MyStudentsPage() {
    const supabase = await createClient();

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/auth/login");
    }

    // Check if user is a teacher
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "teacher") {
        redirect("/dashboard");
    }

    // Get teacher data
    const { data: teacherData } = await supabase
        .from("teachers")
        .select("id")
        .eq("id", user.id)
        .single();

    if (!teacherData) {
        redirect("/dashboard");
    }

    // Fetch teacher's classes and subjects
    const [classesResult, subjectsResult] = await Promise.all([
        supabase
            .from("teacher_classes")
            .select("class_id, classes(id, name)")
            .eq("teacher_id", teacherData.id),
        supabase
            .from("teacher_subjects")
            .select("subject_id, subjects(id, name)")
            .eq("teacher_id", teacherData.id),
    ]);

    const classes =
        classesResult.data?.map((tc: any) => ({
            id: tc.classes.id,
            name: tc.classes.name,
        })) || [];

    const subjects =
        subjectsResult.data?.map((ts: any) => ({
            id: ts.subjects.id,
            name: ts.subjects.name,
        })) || [];

    return (
        <div className="container mx-auto py-6 space-y-6">
            <Suspense
                fallback={
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                }
            >
                <MyStudentsContent
                    teacherId={teacherData.id}
                    classes={classes}
                    subjects={subjects}
                />
            </Suspense>
        </div>
    );
}
