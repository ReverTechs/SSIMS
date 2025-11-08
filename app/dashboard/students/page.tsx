"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { MoreHorizontal, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { StudentProfileView } from "@/components/profile/student-profile-view";

export type Student = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  class: string;
  subjects: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
};

const students: Student[] = [
  {
    id: "STU2024001",
    name: "John Doe",
    email: "john.doe@school.mw",
    phone: "+265 991 123 456",
    class: "Form 4A",
    subjects: ["Mathematics", "English", "Physics"],
    gender: "male",
    dateOfBirth: "2008-05-15",
    address: "Lilongwe, Malawi",
    guardianName: "Jane Doe",
    guardianPhone: "+265 991 123 457",
    guardianRelationship: "Mother",
  },
  {
    id: "STU2024002",
    name: "Jane Smith",
    email: "jane.smith@school.mw",
    phone: "+265 991 234 567",
    class: "Form 4A",
    subjects: ["Mathematics", "English", "Chemistry"],
    gender: "female",
    dateOfBirth: "2008-08-20",
    address: "Blantyre, Malawi",
    guardianName: "John Smith",
    guardianPhone: "+265 991 234 568",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024003",
    name: "Peter Banda",
    email: "peter.banda@school.mw",
    phone: "+265 991 345 678",
    class: "Form 4A",
    subjects: ["Mathematics", "Physics", "Biology"],
    gender: "male",
    dateOfBirth: "2008-03-10",
    address: "Mzuzu, Malawi",
    guardianName: "Mary Banda",
    guardianPhone: "+265 991 345 679",
    guardianRelationship: "Mother",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024005",
    name: "David Phiri",
    email: "david.phiri@school.mw",
    phone: "+265 991 567 890",
    class: "Form 4B",
    subjects: ["Mathematics", "Chemistry", "Biology"],
    gender: "male",
    dateOfBirth: "2008-07-18",
    address: "Blantyre, Malawi",
    guardianName: "Sarah Phiri",
    guardianPhone: "+265 991 567 891",
    guardianRelationship: "Mother",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  {
    id: "STU2024006",
    name: "Grace Jere",
    email: "grace.jere@school.mw",
    phone: "+265 991 678 901",
    class: "Form 4B",
    subjects: ["English", "Mathematics", "Physics"],
    gender: "female",
    dateOfBirth: "2008-09-12",
    address: "Lilongwe, Malawi",
    guardianName: "Michael Jere",
    guardianPhone: "+265 991 678 902",
    guardianRelationship: "Father",
  },
];

export default function StudentsPage() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "id",
      header: "Student ID",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Class" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("class")}</Badge>
      ),
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Gender" />
      ),
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return gender ? (
          <div className="capitalize">{gender}</div>
        ) : (
          <div className="text-muted-foreground">-</div>
        );
      },
      filterFn: (row, id, value) => {
        const rowValue = row.getValue(id);
        if (!value || value.length === 0) return true;
        return value.includes(rowValue);
      },
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }) => {
        const subjects = row.getValue("subjects") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {subjects.map((subject) => (
              <Badge key={subject} variant="secondary" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStudent(student);
                  setProfileOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Send Email</DropdownMenuItem>
              <DropdownMenuItem>View Grades</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: students,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const classes = Array.from(new Set(students.map((s) => s.class)));
  const selectedClass = (table.getColumn("class")?.getFilterValue() as string[]) || [];
  const selectedGender = (table.getColumn("gender")?.getFilterValue() as string[]) || [];

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">
          View and manage all registered students
        </p>
      </div> */}

      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            Complete list of all students with sorting and filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4 gap-4 flex-wrap">
            <Input
              placeholder="Search students..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select
              value={selectedClass.length > 0 ? selectedClass[0] : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("class")?.setFilterValue(undefined);
                } else {
                  table.getColumn("class")?.setFilterValue([value]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedGender.length > 0 ? selectedGender[0] : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("gender")?.setFilterValue(undefined);
                } else {
                  table.getColumn("gender")?.setFilterValue([value]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <DataTableViewOptions table={table} />
          </div>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="py-4">
            <DataTablePagination table={table} />
          </div>
        </CardContent>
      </Card>

      <StudentProfileView
        student={selectedStudent}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />
    </div>
  );
}





