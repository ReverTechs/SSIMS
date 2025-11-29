"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherStudentsTable } from "./teacher-students-table";
import { getTeacherStudents, TeacherStudent } from "@/lib/actions/get-teacher-students";
import { Loader2, ChevronRight } from "lucide-react";

interface TeacherStudentsWidgetProps {
    teacherId: string;
    classes: Array<{ id: string; name: string }>;
    subjects: Array<{ id: string; name: string }>;
}

export function TeacherStudentsWidget({
    teacherId,
    classes,
    subjects,
}: TeacherStudentsWidgetProps) {
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentClassId, setCurrentClassId] = useState<string | undefined>();
    const [currentSubjectId, setCurrentSubjectId] = useState<string | undefined>();

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
        setCurrentClassId(classId);
        setCurrentSubjectId(subjectId);
        fetchStudents(classId, subjectId);
    };

    return (
        <Card className="bg-card border rounded-xl shadow-sm">
            <CardHeader>
                <div className="space-y-2">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span>Profile</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground font-medium">My Students</span>
                    </div>

                    <div>
                        <CardTitle className="text-xl">Students Enrolled</CardTitle>
                        <CardDescription>
                            View and manage students in your classes
                        </CardDescription>
                    </div>
                </div>
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
