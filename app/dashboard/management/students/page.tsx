import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap, Pencil, Trash2, Users } from "lucide-react";
import { getStudentManagementStats, getStudentManagementList, getStudentGrades } from "@/app/actions/get-student-management-data";
import { StudentFilters } from "./student-filters";

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ManagementStudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = typeof params.query === 'string' ? params.query : undefined;
  const grade = typeof params.grade === 'string' ? params.grade : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;

  const stats = await getStudentManagementStats();
  const students = await getStudentManagementList(search, grade, status);
  const grades = await getStudentGrades();

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-2.5 sm:gap-3 md:grid-cols-3">
        {[
          {
            label: "Active enrolled students",
            value: stats.activeStudents.toLocaleString(),
            description: "Learners with complete records",
            icon: Users,
          },
          {
            label: "Graduation readiness",
            value: stats.graduationReadiness,
            description: "Form 4 students on track",
            icon: GraduationCap,
          },
          {
            label: "Pending interventions",
            value: stats.pendingInterventions.toLocaleString(),
            description: "Students flagged for review",
            icon: Pencil,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border border-border/60 bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{item.label}</CardDescription>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-semibold">
                  {item.value}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters & quick actions</CardTitle>
          <CardDescription>
            Narrow down cohorts and launch workflows instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentFilters grades={grades} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student records</CardTitle>
          <CardDescription>
            Update enrollment, guardians, and academic placement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.grade}</TableCell>
                    <TableCell>{student.guardian}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          student.status === "active"
                            ? "bg-emerald-500"
                            : student.status === "flagged" ? "bg-amber-500" : "bg-gray-500"
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.fees}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}




