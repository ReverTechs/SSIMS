import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

export default function SubjectsPage() {
  const subjects = [
    {
      id: "1",
      name: "Mathematics",
      code: "MATH",
      teacher: "Mr. Banda",
      teacherId: "T001",
      class: "Form 4A",
      description: "Advanced mathematics including algebra, calculus, and statistics",
    },
    {
      id: "2",
      name: "English",
      code: "ENG",
      teacher: "Mrs. Mwale",
      teacherId: "T002",
      class: "Form 4A",
      description: "English language and literature",
    },
    {
      id: "3",
      name: "Physics",
      code: "PHY",
      teacher: "Mr. Phiri",
      teacherId: "T003",
      class: "Form 4A",
      description: "Physics principles and applications",
    },
    {
      id: "4",
      name: "Chemistry",
      code: "CHEM",
      teacher: "Mrs. Kachale",
      teacherId: "T004",
      class: "Form 4A",
      description: "Chemical principles and laboratory work",
    },
    {
      id: "5",
      name: "Biology",
      code: "BIO",
      teacher: "Mr. Mbewe",
      teacherId: "T005",
      class: "Form 4A",
      description: "Biological sciences and life processes",
    },
    {
      id: "6",
      name: "History",
      code: "HIST",
      teacher: "Mr. Jere",
      teacherId: "T006",
      class: "Form 4A",
      description: "Malawi and world history",
    },
    {
      id: "7",
      name: "Geography",
      code: "GEO",
      teacher: "Mrs. Tembo",
      teacherId: "T007",
      class: "Form 4A",
      description: "Physical and human geography",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">
          View all your subjects and their teachers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{subject.name}</CardTitle>
                  <CardDescription>{subject.code}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm">{subject.description}</p>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt={subject.teacher} />
                    <AvatarFallback className="text-xs">
                      {getInitials(subject.teacher)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{subject.teacher}</p>
                    <p className="text-xs text-muted-foreground">Teacher</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{subject.code}</Badge>
                  </TableCell>
                  <TableCell>{subject.teacher}</TableCell>
                  <TableCell>{subject.class}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}



