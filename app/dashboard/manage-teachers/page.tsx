import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ManageTeachersPage() {
  const teachers = [
    {
      id: "T001",
      name: "Mr. Banda",
      email: "banda@school.mw",
      subjects: ["Mathematics"],
      department: "Mathematics",
      status: "active",
    },
    {
      id: "T002",
      name: "Mrs. Mwale",
      email: "mwale@school.mw",
      subjects: ["English"],
      department: "Languages",
      status: "active",
    },
    {
      id: "T003",
      name: "Mr. Phiri",
      email: "phiri@school.mw",
      subjects: ["Physics"],
      department: "Sciences",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Total teachers",
            value: "56",
            description: "Active profiles in the system",
          },
          {
            label: "Subject coverage",
            value: "92%",
            description: "Teachers with at least 2 subjects",
          },
          {
            label: "Class coverage",
            value: "88%",
            description: "Classes assigned for next term",
          },
        ].map((item) => (
          <Card key={item.label} className="border border-border/60 bg-card/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.label}
              </CardDescription>
              <CardTitle className="text-3xl font-semibold">{item.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>All Teachers</CardTitle>
              <CardDescription>
                Review teacher accounts, subject coverage, and quick actions.
              </CardDescription>
            </div>
            <div className="relative md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {teacher.name}
                    </div>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        teacher.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {teacher.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Teacher</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete {teacher.name}? This
                            action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button variant="destructive">Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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





