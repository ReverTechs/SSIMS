"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChildrenSelectionList } from "./children-selection-list";
import { useBreadcrumb } from "@/components/dashboard/breadcrumb-context";

interface Child {
  id: string;
  name: string;
  class: string;
  studentId: string;
  averageGrade?: number;
  grade?: string;
}

interface Grade {
  subject: string;
  term1: number;
  term2: number;
  term3: number;
  overall: number;
  grade: string;
}

interface GuardianGradesViewProps {
  children: Child[];
  // Function to fetch grades for a specific child
  // In production, this would be a server action or API call
  getChildGrades?: (childId: string) => Promise<Grade[]>;
}

// Mock function to get grades - replace with actual database query
const getMockGrades = async (childId: string): Promise<Grade[]> => {
  // Different grades for different children for demo purposes
  const gradeSets: Record<string, Grade[]> = {
    default: [
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
    ],
  };

  return gradeSets[childId] || gradeSets.default;
};

export function GuardianGradesView({ children, getChildGrades = getMockGrades }: GuardianGradesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDynamicBreadcrumbName } = useBreadcrumb();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    searchParams.get("child") || null
  );
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);

  // Load grades when child is selected
  useEffect(() => {
    if (selectedChildId) {
      setLoading(true);
      // Simulate async fetch
      Promise.resolve(getChildGrades(selectedChildId))
        .then((childGrades) => {
          setGrades(childGrades);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [selectedChildId, getChildGrades]);

  const handleChildSelect = (childId: string) => {
    setSelectedChildId(childId);
    // Update URL without page reload
    router.push(`/dashboard/grades?child=${childId}`, { scroll: false });
  };


  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-500";
    if (grade.startsWith("B")) return "bg-blue-500";
    if (grade.startsWith("C")) return "bg-yellow-500";
    return "bg-red-500";
  };

  const selectedChild = children.find((child) => child.id === selectedChildId);

  // Update breadcrumb when child is selected or deselected
  useEffect(() => {
    if (selectedChild) {
      setDynamicBreadcrumbName(selectedChild.name);
    } else {
      setDynamicBreadcrumbName(null);
    }
    // Cleanup: clear breadcrumb when component unmounts
    return () => {
      setDynamicBreadcrumbName(null);
    };
  }, [selectedChild, setDynamicBreadcrumbName]);

  // If no children, show empty state
  if (children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">
            View your children's academic performance
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No children found in the system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If only one child, show their grades directly
  useEffect(() => {
    if (children.length === 1 && !selectedChildId) {
      handleChildSelect(children[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children.length, selectedChildId]);

  if (children.length === 1 && !selectedChildId) {
    return null; // Will re-render with selected child
  }

  // If multiple children and none selected, show selection
  if (children.length > 1 && !selectedChildId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grades</h1>
          <p className="text-muted-foreground">
            Select a child to view their academic performance
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <ChildrenSelectionList
              children={children}
              selectedChildId={selectedChildId || undefined}
              onChildSelect={handleChildSelect}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show selected child's grades
  if (selectedChildId && selectedChild) {
    const overallAverage = grades.length > 0
      ? grades.reduce((sum, g) => sum + g.overall, 0) / grades.length
      : 0;
    const bestSubject = grades.length > 0
      ? grades.reduce((best, current) => (current.overall > best.overall ? current : best), grades[0])
      : null;
    const worstSubject = grades.length > 0
      ? grades.reduce((worst, current) => (current.overall < worst.overall ? current : worst), grades[0])
      : null;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedChild.name}'s Grades
          </h1>
          <p className="text-muted-foreground">
            Academic performance for {selectedChild.class}
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading grades...</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="term1">Term 1</TabsTrigger>
              <TabsTrigger value="term2">Term 2</TabsTrigger>
              <TabsTrigger value="term3">Term 3</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  <CardDescription>
                    {selectedChild.name}'s grades across all subjects for the academic year
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
                      {grades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No grades available
                          </TableCell>
                        </TableRow>
                      ) : (
                        grades.map((grade) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {grades.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overall Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {overallAverage.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Grade: {overallAverage >= 90 ? "A" : overallAverage >= 80 ? "A-" : overallAverage >= 70 ? "B+" : "B"}
                      </p>
                    </CardContent>
                  </Card>
                  {bestSubject && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Best Subject</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{bestSubject.subject}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {bestSubject.overall.toFixed(1)}% ({bestSubject.grade})
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {worstSubject && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Needs Improvement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{worstSubject.subject}</div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {worstSubject.overall.toFixed(1)}% ({worstSubject.grade})
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
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
                      {grades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No grades available
                          </TableCell>
                        </TableRow>
                      ) : (
                        grades.map((grade) => (
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
                        ))
                      )}
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
                      {grades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No grades available
                          </TableCell>
                        </TableRow>
                      ) : (
                        grades.map((grade) => (
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
                        ))
                      )}
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
                      {grades.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            No grades available
                          </TableCell>
                        </TableRow>
                      ) : (
                        grades.map((grade) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Grade History</CardTitle>
                  <CardDescription>
                    Historical academic performance across previous academic years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Grade history feature coming soon. This will show historical grades from previous academic years.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    );
  }

  return null;
}

