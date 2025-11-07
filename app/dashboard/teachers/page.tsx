"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
} from "lucide-react";

export default function TeachersPage() {
  const teachers = [
    {
      id: "T001",
      name: "Mr. Banda",
      email: "banda@school.mw",
      phone: "+265 991 111 111",
      subjects: ["Mathematics"],
      department: "Mathematics",
    },
    {
      id: "T002",
      name: "Mrs. Mwale",
      email: "mwale@school.mw",
      phone: "+265 991 222 222",
      subjects: ["English"],
      department: "Languages",
    },
    {
      id: "T003",
      name: "Mr. Phiri",
      email: "phiri@school.mw",
      phone: "+265 991 333 333",
      subjects: ["Physics"],
      department: "Sciences",
    },
    {
      id: "T004",
      name: "Mrs. Kachale",
      email: "kachale@school.mw",
      phone: "+265 991 444 444",
      subjects: ["Chemistry"],
      department: "Sciences",
    },
    {
      id: "T005",
      name: "Mr. Mbewe",
      email: "mbewe@school.mw",
      phone: "+265 991 555 555",
      subjects: ["Biology"],
      department: "Sciences",
    },
    {
      id: "T006",
      name: "Mr. Jere",
      email: "jere@school.mw",
      phone: "+265 991 666 666",
      subjects: ["History"],
      department: "Social Studies",
    },
    {
      id: "T007",
      name: "Mrs. Tembo",
      email: "tembo@school.mw",
      phone: "+265 991 777 777",
      subjects: ["Geography"],
      department: "Social Studies",
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
        <h1 className="text-3xl font-bold tracking-tight">Subject Teachers</h1>
        <p className="text-muted-foreground">
          View all teachers and their subject assignments
        </p>
      </div>

      {/* Teachers List */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight mb-1">All Teachers</h2>
          <p className="text-sm text-muted-foreground">
            View all teachers and their subject assignments
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="group relative border bg-card hover:bg-accent/50 transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={undefined} alt={teacher.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{teacher.name}</CardTitle>
                    <CardDescription>{teacher.id}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Department
                    </p>
                    <Badge variant="outline">{teacher.department}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{teacher.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{teacher.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Teachers Directory Table */}
      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200">
        <CardHeader>
          <CardTitle>Teachers Directory</CardTitle>
          <CardDescription>
            Complete list of all teachers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.id}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">{teacher.email}</span>
                      <span className="text-xs text-muted-foreground">
                        {teacher.phone}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}





