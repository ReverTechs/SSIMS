"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CurriculumLevel, StreamType, SubjectCategory } from "@/types";
import { getCurriculumLevel, getCurriculumSubjects, SubjectRequirement } from "@/lib/curriculum/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Check, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface StudentSubjectsManagerProps {
    studentId: string;
    className: string;
    currentSubjects: string[]; // Array of subject names
    stream?: StreamType;
    onUpdate?: () => void;
}

export function StudentSubjectsManager({
    studentId,
    className,
    currentSubjects,
    stream,
    onUpdate,
}: StudentSubjectsManagerProps) {
    const [loading, setLoading] = useState(true);
    const [availableSubjects, setAvailableSubjects] = useState<SubjectRequirement[]>([]);
    const [selectedStream, setSelectedStream] = useState<StreamType | undefined>(stream);
    const [isSenior, setIsSenior] = useState(false);

    // Parse grade level from class name (e.g., "Form 1A" -> 1)
    const gradeLevel = parseInt(className.replace(/\D/g, ""));
    const level = getCurriculumLevel(gradeLevel);

    useEffect(() => {
        setIsSenior(level === "senior");
        fetchCurriculum();
    }, [level, selectedStream]);

    const fetchCurriculum = async () => {
        setLoading(true);
        try {
            const subjects = await getCurriculumSubjects(level, selectedStream);
            setAvailableSubjects(subjects);
        } catch (error) {
            console.error("Error fetching curriculum:", error);
            toast.error("Failed to load curriculum subjects");
        } finally {
            setLoading(false);
        }
    };

    const handleStreamChange = async (value: StreamType) => {
        setSelectedStream(value);
        // Update student stream in DB
        const supabase = createClient();
        const { error } = await supabase
            .from("students")
            .update({ stream: value })
            .eq("id", studentId);

        if (error) {
            toast.error("Failed to update stream");
            return;
        }
        toast.success("Stream updated");
        if (onUpdate) onUpdate();
    };

    const handleSubjectToggle = async (subject: SubjectRequirement, isEnrolled: boolean) => {
        if (subject.isCompulsory) return; // Cannot toggle compulsory subjects

        const supabase = createClient();
        if (isEnrolled) {
            // Remove subject
            // First get the subject ID from the subjects table using the name if needed, 
            // but here we have subjectId from the requirement
            const { error } = await supabase
                .from("student_subjects")
                .delete()
                .eq("student_id", studentId)
                .eq("subject_id", subject.subjectId);

            if (error) {
                toast.error("Failed to remove subject");
                return;
            }
        } else {
            // Add subject
            const { error } = await supabase
                .from("student_subjects")
                .insert({
                    student_id: studentId,
                    subject_id: subject.subjectId,
                });

            if (error) {
                toast.error("Failed to add subject");
                return;
            }
        }

        if (onUpdate) onUpdate();
    };

    if (loading) return <div>Loading subjects...</div>;

    // Group subjects by category
    const groupedSubjects = availableSubjects.reduce((acc, subject) => {
        const category = subject.category || "other";
        if (!acc[category]) acc[category] = [];
        acc[category].push(subject);
        return acc;
    }, {} as Record<string, SubjectRequirement[]>);

    return (
        <div className="space-y-6">
            {isSenior && (
                <div className="flex items-center gap-4">
                    <Label>Stream:</Label>
                    <Select
                        value={selectedStream}
                        onValueChange={(val) => handleStreamChange(val as StreamType)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Stream" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sciences">Sciences</SelectItem>
                            <SelectItem value="humanities">Humanities</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedSubjects).map(([category, subjects]) => (
                    <Card key={category} className="border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                                {category}
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {subjects.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {subjects.map((subject) => {
                                const isEnrolled = currentSubjects.includes(subject.subjectName);
                                return (
                                    <div
                                        key={subject.subjectId}
                                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                                    >
                                        <span className="text-sm font-medium">{subject.subjectName}</span>
                                        {subject.isCompulsory ? (
                                            <Badge variant="secondary" className="text-[10px]">Compulsory</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant={isEnrolled ? "destructive" : "outline"}
                                                className="h-7 px-2 text-xs"
                                                onClick={() => handleSubjectToggle(subject, isEnrolled)}
                                            >
                                                {isEnrolled ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                                                {isEnrolled ? "Remove" : "Add"}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
