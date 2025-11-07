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
import { ClipboardList, TrendingUp, Users } from "lucide-react";

export default function ViewClassGradesPage() {
  const classGrades = [
    {
      subject: "Mathematics",
      students: 25,
      average: 82.5,
      highest: 95,
      lowest: 65,
      gradeDistribution: {
        A: 8,
        "A-": 6,
        "B+": 5,
        B: 4,
        C: 2,
      },
    },
    {
      subject: "English",
      students: 25,
      average: 78.3,
      highest: 92,
      lowest: 58,
      gradeDistribution: {
        A: 5,
        "A-": 7,
        "B+": 6,
        B: 4,
        C: 3,
      },
    },
    {
      subject: "Physics",
      students: 25,
      average: 85.2,
      highest: 98,
      lowest: 70,
      gradeDistribution: {
        A: 10,
        "A-": 8,
        "B+": 4,
        B: 2,
        C: 1,
      },
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
        <h1 className="text-3xl font-bold tracking-tight">View Class Grades</h1>
        <p className="text-muted-foreground">
          View and analyze grades by class and subject
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Year</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
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
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classGrades.map((subject) => (
          <Card key={subject.subject}>
            <CardHeader>
              <CardTitle className="text-lg">{subject.subject}</CardTitle>
              <CardDescription>Class Performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">{subject.average}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{subject.students}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Highest</p>
                  <p className="text-lg font-semibold">{subject.highest}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lowest</p>
                  <p className="text-lg font-semibold">{subject.lowest}%</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Grade Distribution</p>
                <div className="space-y-1">
                  {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <Badge
                        className={getGradeColor(grade)}
                        variant="default"
                      >
                        {grade}
                      </Badge>
                      <span className="text-sm">{count} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


