import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GradesPage() {
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Term 1</TableHead>
                    <TableHead>Term 2</TableHead>
                    <TableHead>Term 3</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">
                        {grade.subject}
                      </TableCell>
                      <TableCell>{grade.term1}%</TableCell>
                      <TableCell>{grade.term2}%</TableCell>
                      <TableCell>{grade.term3}%</TableCell>
                      <TableCell className="font-semibold">
                        {grade.overall.toFixed(1)}%
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
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Overall Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">84.6%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Grade: A-
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Best Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Physics</div>
                <p className="text-sm text-muted-foreground mt-2">
                  91.7% (A)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Biology</div>
                <p className="text-sm text-muted-foreground mt-2">
                  77.7% (B)
                </p>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">
                        {grade.subject}
                      </TableCell>
                      <TableCell>{grade.term1}%</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="term2">
          <Card>
            <CardHeader>
              <CardTitle>Term 2 Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">
                        {grade.subject}
                      </TableCell>
                      <TableCell>{grade.term2}%</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="term3">
          <Card>
            <CardHeader>
              <CardTitle>Term 3 Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">
                        {grade.subject}
                      </TableCell>
                      <TableCell>{grade.term3}%</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



