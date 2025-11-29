"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherStudentsTable } from "@/components/profile/teacher-students-table";
import { getTeacherStudents, TeacherStudent } from "@/lib/actions/get-teacher-students";
import { Loader2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MyStudentsContentProps {
    teacherId: string;
    classes: Array<{ id: string; name: string }>;
    subjects: Array<{ id: string; name: string }>;
}

export function MyStudentsContent({
    teacherId,
    classes,
    subjects,
}: MyStudentsContentProps) {
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStudents = async (classId?: string, subjectId?: string) => {
        setIsLoading(true);
        try {
            const data = await getTeacherStudents({
                teacherId,
                classId,
                subjectId,
            });
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [teacherId]);

    const handleFilterChange = (classId?: string, subjectId?: string) => {
        fetchStudents(classId, subjectId);
    };

    return (
        <Card className="bg-card border rounded-xl shadow-sm">
            <CardHeader>

            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <TeacherStudentsTable
                        students={students}
                        classes={classes}
                        subjects={subjects}
                        onFilterChange={handleFilterChange}
                    />
                )}
            </CardContent>
        </Card>
    );
}
