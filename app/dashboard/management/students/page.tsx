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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GraduationCap, Pencil, Search, Trash2, Users } from "lucide-react";

const students = [
  {
    id: "S101",
    name: "Thandiwe Moyo",
    grade: "Form 4",
    guardian: "Mr. Moyo",
    status: "active",
    fees: "Cleared",
  },
  {
    id: "S214",
    name: "Chikondi Banda",
    grade: "Form 3",
    guardian: "Mrs. Banda",
    status: "flagged",
    fees: "Outstanding",
  },
  {
    id: "S317",
    name: "Mary Phiri",
    grade: "Form 2",
    guardian: "Mr. Phiri",
    status: "active",
    fees: "Cleared",
  },
];

export default function ManagementStudentsPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Active enrolled students",
            value: "824",
            description: "Learners with complete records",
            icon: Users,
          },
          {
            label: "Graduation readiness",
            value: "91%",
            description: "Form 4 students on track",
            icon: GraduationCap,
          },
          {
            label: "Pending interventions",
            value: "23",
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
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Search roster</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Type student name or ID" className="pl-9" />
            </div>
          </div>
          <div className="w-full md:w-52">
            <label className="text-sm font-medium">Grade level</label>
            <Select defaultValue="all">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                <SelectItem value="form4">Form 4</SelectItem>
                <SelectItem value="form3">Form 3</SelectItem>
                <SelectItem value="form2">Form 2</SelectItem>
                <SelectItem value="form1">Form 1</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-52">
            <label className="text-sm font-medium">Status</label>
            <Select defaultValue="active">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full md:w-auto">Export selection</Button>
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
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>{student.guardian}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        student.status === "active"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit student</DialogTitle>
                            <DialogDescription>
                              Update record details for {student.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">
                                Guardian name
                              </label>
                              <Input defaultValue={student.guardian} />
                            </div>
                            <div>
                              <label className="text-sm font-medium">
                                Grade level
                              </label>
                              <Select defaultValue={student.grade}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Form 4">Form 4</SelectItem>
                                  <SelectItem value="Form 3">Form 3</SelectItem>
                                  <SelectItem value="Form 2">Form 2</SelectItem>
                                  <SelectItem value="Form 1">Form 1</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button>Save changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete student</DialogTitle>
                            <DialogDescription>
                              This removes {student.name}&rsquo;s record. This
                              action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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

