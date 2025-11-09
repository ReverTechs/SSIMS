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
import { ArrowUpDown, MoreHorizontal, Eye } from "lucide-react";

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
import { useRouter } from "next/navigation";

export type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  department: string;
  gender: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  classes?: string[];
  totalStudents?: number;
  address?: string;
};

const teachers: Teacher[] = [
  {
    id: "T001",
    name: "Mr. Banda",
    email: "banda@school.mw",
    phone: "+265 991 111 111",
    subjects: ["Mathematics"],
    department: "Mathematics",
    gender: "male",
    dateOfBirth: "1985-05-15",
    yearsOfExperience: 8,
    qualification: "M.Ed. Mathematics",
    specialization: "Pure Mathematics",
    classes: ["Form 4A", "Form 4B"],
    totalStudents: 45,
    address: "Lilongwe, Malawi",
  },
  {
    id: "T002",
    name: "Mrs. Mwale",
    email: "mwale@school.mw",
    phone: "+265 991 222 222",
    subjects: ["English"],
    department: "Languages",
    gender: "female",
    dateOfBirth: "1990-03-20",
    yearsOfExperience: 5,
    qualification: "B.Ed. English",
    specialization: "Literature",
    classes: ["Form 4A", "Form 4B", "Form 5A"],
    totalStudents: 60,
    address: "Blantyre, Malawi",
  },
  {
    id: "T003",
    name: "Mr. Phiri",
    email: "phiri@school.mw",
    phone: "+265 991 333 333",
    subjects: ["Physics"],
    department: "Sciences",
    gender: "male",
    dateOfBirth: "1988-07-10",
    yearsOfExperience: 6,
    qualification: "M.Sc. Physics",
    specialization: "Quantum Physics",
    classes: ["Form 4A", "Form 5A"],
    totalStudents: 50,
    address: "Mzuzu, Malawi",
  },
  {
    id: "T004",
    name: "Mrs. Kachale",
    email: "kachale@school.mw",
    phone: "+265 991 444 444",
    subjects: ["Chemistry"],
    department: "Sciences",
    gender: "female",
    dateOfBirth: "1992-11-25",
    yearsOfExperience: 4,
    qualification: "B.Sc. Chemistry",
    specialization: "Organic Chemistry",
    classes: ["Form 4B", "Form 5A"],
    totalStudents: 55,
    address: "Lilongwe, Malawi",
  },
  {
    id: "T005",
    name: "Mr. Mbewe",
    email: "mbewe@school.mw",
    phone: "+265 991 555 555",
    subjects: ["Biology"],
    department: "Sciences",
    gender: "male",
    dateOfBirth: "1987-09-12",
    yearsOfExperience: 7,
    qualification: "M.Sc. Biology",
    specialization: "Marine Biology",
    classes: ["Form 4A", "Form 4B"],
    totalStudents: 48,
    address: "Blantyre, Malawi",
  },
  {
    id: "T006",
    name: "Mr. Jere",
    email: "jere@school.mw",
    phone: "+265 991 666 666",
    subjects: ["History"],
    department: "Social Studies",
    gender: "male",
    dateOfBirth: "1986-02-18",
    yearsOfExperience: 9,
    qualification: "M.A. History",
    specialization: "African History",
    classes: ["Form 4A", "Form 4B", "Form 5A"],
    totalStudents: 65,
    address: "Lilongwe, Malawi",
  },
  {
    id: "T007",
    name: "Mrs. Tembo",
    email: "tembo@school.mw",
    phone: "+265 991 777 777",
    subjects: ["Geography"],
    department: "Social Studies",
    gender: "female",
    dateOfBirth: "1989-06-30",
    yearsOfExperience: 6,
    qualification: "B.Ed. Geography",
    specialization: "Physical Geography",
    classes: ["Form 4B", "Form 5A"],
    totalStudents: 52,
    address: "Mzuzu, Malawi",
  },
];

export default function TeachersPage() {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<Teacher>[] = [
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
      header: "ID",
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Department" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("department")}</Badge>
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
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("gender")}</div>
      ),
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        return value.includes(row.getValue(id));
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
        const teacher = row.original;

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
                  router.push(`/dashboard/teachers/${teacher.id}`);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Send Email</DropdownMenuItem>
              <DropdownMenuItem>View Classes</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: teachers,
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

  const departments = Array.from(new Set(teachers.map((t) => t.department)));
  const selectedDepartment = (table.getColumn("department")?.getFilterValue() as string[]) || [];
  const selectedGender = (table.getColumn("gender")?.getFilterValue() as string[]) || [];

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <p className="text-muted-foreground">
          View and manage all teachers in the system
        </p>
      </div> */}

      <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200">
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            Complete list of all teachers with sorting and filtering options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4 gap-4 flex-wrap">
            <Input
              placeholder="Search teachers..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select
              value={selectedDepartment.length > 0 ? selectedDepartment[0] : "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("department")?.setFilterValue(undefined);
                } else {
                  table.getColumn("department")?.setFilterValue([value]);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
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
    </div>
  );
}





