"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, BookOpen, Calendar } from "lucide-react";

export default function ClassGradesPage() {
  const students = [
    {
      id: "STU2024001",
      name: "John Doe",
      class: "Form 3A",
      grades: [
        { subject: "Mathematics", score: 85, maxScore: 100, grade: "A" },
        { subject: "English", score: 78, maxScore: 100, grade: "B+" },
        { subject: "Physics", score: 92, maxScore: 100, grade: "A" },
      ],
      average: 85,
    },
    {
      id: "STU2024002",
      name: "Jane Smith",
      class: "Form 3A",
      grades: [
        { subject: "Mathematics", score: 90, maxScore: 100, grade: "A" },
        { subject: "English", score: 88, maxScore: 100, grade: "A-" },
        { subject: "Physics", score: 85, maxScore: 100, grade: "A-" },
      ],
      average: 87.7,
    },
    {
      id: "STU2024003",
      name: "Peter Banda",
      class: "Form 3A",
      grades: [
        { subject: "Mathematics", score: 75, maxScore: 100, grade: "B" },
        { subject: "English", score: 82, maxScore: 100, grade: "A-" },
        { subject: "Physics", score: 80, maxScore: 100, grade: "A-" },
      ],
      average: 79,
    },
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-500";
    if (grade.startsWith("B")) return "bg-blue-500";
    if (grade.startsWith("C")) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students in Class & Grades</h1>
        <p className="text-muted-foreground">
          View all students in your classes and their grades
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="2024">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Term</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="term1">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select defaultValue="form3a">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="form3a">Form 3A</SelectItem>
                <SelectItem value="form3b">Form 3B</SelectItem>
                <SelectItem value="form4a">Form 4A</SelectItem>
                <SelectItem value="form4b">Form 4B</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Grades</CardTitle>
          <CardDescription>
            Grades for all students in Form 3A
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {students.map((student) => (
              <div key={student.id} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.id} • {student.class}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{student.average}%</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Max Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.grades.map((grade, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{grade.subject}</TableCell>
                        <TableCell>{grade.score}</TableCell>
                        <TableCell>{grade.maxScore}</TableCell>
                        <TableCell>
                          {((grade.score / grade.maxScore) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getGradeColor(grade.grade)}
                            variant="default"
                          >
                            {grade.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


