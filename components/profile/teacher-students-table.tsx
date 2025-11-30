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
import { Eye, User, GraduationCap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { TeacherStudent } from "@/lib/actions/get-teacher-students";

interface TeacherStudentsTableProps {
    students: TeacherStudent[];
    classes: Array<{ id: string; name: string }>;
    subjects: Array<{ id: string; name: string }>;
    onFilterChange?: (classId?: string, subjectId?: string) => void;
}

export function TeacherStudentsTable({
    students,
    classes,
    subjects,
    onFilterChange,
}: TeacherStudentsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [selectedClass, setSelectedClass] = React.useState<string>("all");
    const [selectedSubject, setSelectedSubject] = React.useState<string>("all");

    const columns: ColumnDef<TeacherStudent>[] = [
        {
            id: "icon",
            header: "",
            cell: () => (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Student Name" />
            ),
            cell: ({ row }) => (
                <div className="font-medium text-foreground">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "studentId",
            header: "Student ID",
            cell: ({ row }) => (
                <div className="text-muted-foreground">{row.getValue("studentId")}</div>
            ),
        },
        {
            accessorKey: "className",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Class" />
            ),
            cell: ({ row }) => (
                <div className="text-foreground">{row.getValue("className") || "-"}</div>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                const student = row.original;

                return (
                    <Link href={`/dashboard/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-2">
                            <Eye className="h-4 w-4" />
                            View
                        </Button>
                    </Link>
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        const classId = value === "all" ? undefined : value;
        const subjectId = selectedSubject === "all" ? undefined : selectedSubject;
        onFilterChange?.(classId, subjectId);
    };

    const handleSubjectChange = (value: string) => {
        setSelectedSubject(value);
        const classId = selectedClass === "all" ? undefined : selectedClass;
        const subjectId = value === "all" ? undefined : value;
        onFilterChange?.(classId, subjectId);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Input
                    placeholder="Search students..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm h-8 text-xs"
                />
                <Select value={selectedClass} onValueChange={handleClassChange}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                        <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="overflow-x-auto rounded-md border">
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
                                    No students found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="py-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
