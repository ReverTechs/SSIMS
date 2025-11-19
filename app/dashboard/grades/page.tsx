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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  Users,
  BookOpen,
  Calendar,
  FileText,
  ArrowRight,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GuardianGradesView } from "@/components/guardian/guardian-grades-view";
import { hasPermission } from "@/lib/auth/authz";
import { createClient } from "@/lib/supabase/server";
import StudentPerformanceHistoryChart from "@/components/dashboard/student-performance-history-chart";
import { StudentSubjectsPerformanceTrend } from "@/components/dashboard/student-subjects-per-chart";

// Mock function to fetch guardian's children
// In production, replace this with actual database query
async function getGuardianChildren(guardianId: string) {
  // TODO: Replace with actual database query
  // Example query structure:
  // const supabase = await createClient();
  // const { data } = await supabase
  //   .from('students')
  //   .select('id, name, class, student_id, guardian_id')
  //   .eq('guardian_id', guardianId);
  // return data || [];

  // Mock data for demonstration
  return [
    {
      id: "STU2024001",
      name: "John Doe",
      class: "Form 4A",
      studentId: "STU2024001",
      averageGrade: 87.7,
      grade: "A",
    },
    {
      id: "STU2024002",
      name: "Jane Doe",
      class: "Form 3B",
      studentId: "STU2024002",
      averageGrade: 82.3,
      grade: "A-",
    },
  ];
}

export default async function GradesPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;

  if (!user) {
    redirect("/auth/login");
  }

  // For guardians (or roles with capability), show child selection and grades
  if (hasPermission(user, "grades:view_children")) {
    const children = await getGuardianChildren(user.id);
    return <GuardianGradesView children={children} />;
  }

  // For teachers (or roles with capability), show grade management
  if (hasPermission(user, "grades:manage")) {
    const gradeFeatures = [
      {
        title: "Upload Grades",
        description: "Upload student grades from CSV or Excel files",
        href: "/dashboard/grades/upload-grades",
        icon: Upload,
        gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
        iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
        borderGradient: "border-blue-500/20",
      },
      {
        title: "Students in Class & Grades",
        description: "View all students in your classes and their grades",
        href: "/dashboard/grades/class-grades",
        icon: Users,
        gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
        iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
        borderGradient: "border-emerald-500/20",
      },
      {
        title: "Enter Grades",
        description: "Manually enter grades for your students",
        href: "/dashboard/enter-grades",
        icon: BookOpen,
        gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
        iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
        borderGradient: "border-amber-500/20",
      },
      {
        title: "Academic Year & Term",
        description: "Manage academic year and term settings",
        href: "/dashboard/grades/academic-settings",
        icon: Calendar,
        gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
        iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
        borderGradient: "border-pink-500/20",
      },
      {
        title: "View Class Grades",
        description: "View and analyze grades by class and subject",
        href: "/dashboard/grades/view-class-grades",
        icon: ClipboardList,
        gradient: "from-indigo-500/20 via-indigo-600/20 to-blue-600/20",
        iconBg: "bg-gradient-to-br from-indigo-500 to-blue-600",
        borderGradient: "border-indigo-500/20",
      },
      {
        title: "Grade Reports",
        description: "Generate comprehensive grade reports and analytics",
        href: "/dashboard/reports",
        icon: FileText,
        gradient: "from-violet-500/20 via-violet-600/20 to-purple-600/20",
        iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
        borderGradient: "border-violet-500/20",
      },
      {
        title: "Grade Trends",
        description: "Analyze grade trends and student performance",
        href: "/dashboard/grades/grade-trends",
        icon: TrendingUp,
        gradient: "from-cyan-500/20 via-cyan-600/20 to-blue-600/20",
        iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
        borderGradient: "border-cyan-500/20",
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Grade Management
          </h1>
          <p className="text-muted-foreground">
            Access all grade-related features and tools
          </p>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {gradeFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href} className="group">
                <Card
                  className={cn(
                    "relative border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer h-full",
                    feature.borderGradient
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">
                      {feature.title}
                    </CardTitle>
                    <div className={cn("p-1.5 rounded-md", feature.iconBg)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CardDescription className="text-xs">
                      {feature.description}
                    </CardDescription>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // For students (or any role without manage/view_children), show the student view
  const grades = [
    {
      subject: "Mathematics",
      term1: 85,
      term2: 88,
      term3: 90,
      overall: 87.7,
      grade: "A",
    },
    {
      subject: "English",
      term1: 78,
      term2: 82,
      term3: 85,
      overall: 81.7,
      grade: "B+",
    },
    {
      subject: "Physics",
      term1: 92,
      term2: 90,
      term3: 93,
      overall: 91.7,
      grade: "A",
    },
    {
      subject: "Chemistry",
      term1: 80,
      term2: 85,
      term3: 88,
      overall: 84.3,
      grade: "A-",
    },
    {
      subject: "Biology",
      term1: 75,
      term2: 78,
      term3: 80,
      overall: 77.7,
      grade: "B",
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
        <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
        <p className="text-muted-foreground">
          View your academic performance across all subjects
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="term1">Term 1</TabsTrigger>
          <TabsTrigger value="term2">Term 2</TabsTrigger>
          <TabsTrigger value="term3">Term 3</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>
                Your grades across all subjects for the academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="min-w-full divide-y divide-muted/10">
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Subject
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Term 1
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Term 2
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Term 3
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Overall
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject} className="group">
                      <TableCell className="font-medium text-foreground">
                        {grade.subject}
                      </TableCell>
                      <TableCell className="text-sm">{grade.term1}%</TableCell>
                      <TableCell className="text-sm">{grade.term2}%</TableCell>
                      <TableCell className="text-sm">{grade.term3}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold w-14">
                            {grade.overall.toFixed(1)}%
                          </div>
                          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${grade.overall}%`,
                                background:
                                  grade.overall >= 85
                                    ? "#34d399"
                                    : grade.overall >= 75
                                    ? "#60a5fa"
                                    : "#f59e0b",
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getGradeColor(grade.grade) + " text-white"}
                          variant="default"
                        >
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Overall Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">84.6%</div>
                <p className="text-sm text-muted-foreground mt-2">Grade: A-</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Best Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Physics</div>
                <p className="text-sm text-muted-foreground mt-2">91.7% (A)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Biology</div>
                <p className="text-sm text-muted-foreground mt-2">77.7% (B)</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="term1">
          <Card>
            <CardHeader>
              <CardTitle>Term 1 Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="min-w-full divide-y divide-muted/10">
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Subject
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject} className="group">
                      <TableCell className="font-medium text-foreground">
                        {grade.subject}
                      </TableCell>
                      <TableCell className="text-sm">{grade.term1}%</TableCell>
                      <TableCell>
                        <Badge
                          className={getGradeColor(grade.grade) + " text-white"}
                          variant="default"
                        >
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="term2">
          <Card>
            <CardHeader>
              <CardTitle>Term 2 Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="min-w-full divide-y divide-muted/10">
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Subject
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject} className="group">
                      <TableCell className="font-medium text-foreground">
                        {grade.subject}
                      </TableCell>
                      <TableCell className="text-sm">{grade.term2}%</TableCell>
                      <TableCell>
                        <Badge
                          className={getGradeColor(grade.grade) + " text-white"}
                          variant="default"
                        >
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="term3">
          <Card>
            <CardHeader>
              <CardTitle>Term 3 Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="min-w-full divide-y divide-muted/10">
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Subject
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Score
                    </TableHead>
                    <TableHead className="text-muted-foreground uppercase text-xs tracking-wider">
                      Grade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject} className="group">
                      <TableCell className="font-medium text-foreground">
                        {grade.subject}
                      </TableCell>
                      <TableCell className="text-sm">{grade.term3}%</TableCell>
                      <TableCell>
                        <Badge
                          className={getGradeColor(grade.grade) + " text-white"}
                          variant="default"
                        >
                          {grade.grade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <StudentPerformanceHistoryChart />
      </div>
      <div className="mt-6">
        <StudentSubjectsPerformanceTrend />
      </div>
    </div>
  );
}
