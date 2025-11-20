"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";

// Mock data for departments
const initialDepartments = [
  {
    id: "DEPT-01",
    name: "Sciences",
    head: "Dr. Sarah Mwale",
    teachers: 12,
    students: 450,
    budget: "MK 15M",
    status: "Active",
  },
  {
    id: "DEPT-02",
    name: "Humanities",
    head: "Mr. John Banda",
    teachers: 8,
    students: 320,
    budget: "MK 8M",
    status: "Active",
  },
  {
    id: "DEPT-03",
    name: "Languages",
    head: "Mrs. Grace Phiri",
    teachers: 10,
    students: 410,
    budget: "MK 10M",
    status: "Active",
  },
  {
    id: "DEPT-04",
    name: "Mathematics",
    head: "Mr. Peter Chibwe",
    teachers: 9,
    students: 450,
    budget: "MK 12M",
    status: "Active",
  },
  {
    id: "DEPT-05",
    name: "Sports & PE",
    head: "Mr. David Tembo",
    teachers: 4,
    students: 824,
    budget: "MK 5M",
    status: "Active",
  },
];

export default function ManagementDepartment() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage school departments, heads, and resource allocations.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new department and assign a head.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input placeholder="e.g. Computer Science" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Head of Department</label>
                <Input placeholder="Search for a teacher..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Budget</label>
                <Input placeholder="MK 0.00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create Department</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Departments</CardDescription>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-semibold">
              {departments.length}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Across 2 campuses
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Staff</CardDescription>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-semibold">
              {departments.reduce((acc, curr) => acc + curr.teachers, 0)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Active teaching staff
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border/60 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Budget</CardDescription>
            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-3xl font-semibold">MK 50M</CardTitle>
            <p className="text-sm text-muted-foreground">
              Allocated for 2024
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Departments</CardTitle>
              <CardDescription>
                A list of all departments in the school.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Head of Dept</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{dept.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {dept.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{dept.head}</TableCell>
                  <TableCell>{dept.teachers}</TableCell>
                  <TableCell>{dept.students}</TableCell>
                  <TableCell>{dept.budget}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        dept.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Edit department</DropdownMenuItem>
                        <DropdownMenuItem>Manage budget</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete department
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
