import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save } from "lucide-react";

export default function EnterGradesPage() {
  const students = [
    {
      id: "STU2024001",
      name: "John Doe",
      currentGrade: 85,
    },
    {
      id: "STU2024002",
      name: "Jane Smith",
      currentGrade: 78,
    },
    {
      id: "STU2024003",
      name: "Peter Banda",
      currentGrade: 92,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enter Grades</h1>
        <p className="text-muted-foreground">
          Record and manage student grades for your subjects
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Grade Entry</CardTitle>
              <CardDescription>
                Enter grades for your students
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="math">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="term1">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="term1">Term 1</SelectItem>
                  <SelectItem value="term2">Term 2</SelectItem>
                  <SelectItem value="term3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const maxScore = 100;
                const percentage = student.currentGrade;
                const getGrade = (percent: number) => {
                  if (percent >= 90) return "A";
                  if (percent >= 80) return "A-";
                  if (percent >= 70) return "B+";
                  if (percent >= 60) return "B";
                  if (percent >= 50) return "C";
                  return "F";
                };
                const grade = getGrade(percentage);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={student.currentGrade}
                        className="w-20"
                        min="0"
                        max={maxScore}
                      />
                    </TableCell>
                    <TableCell>{maxScore}</TableCell>
                    <TableCell className="font-semibold">
                      {percentage}%
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          grade === "A" || grade === "A-"
                            ? "bg-green-500"
                            : grade === "B+" || grade === "B"
                            ? "bg-blue-500"
                            : grade === "C"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }
                      >
                        {grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-4">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Grades
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              In this class
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                students.reduce((sum, s) => sum + s.currentGrade, 0) /
                  students.length
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Class average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...students.map((s) => s.currentGrade))}%
            </div>
            <p className="text-xs text-muted-foreground">
              Top performer
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



