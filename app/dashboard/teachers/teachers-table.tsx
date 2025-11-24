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
import { TeacherProfile } from "@/lib/data/teachers";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TeachersTableProps {
    data: TeacherProfile[];
}

export function TeachersTable({ data }: TeachersTableProps) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns: ColumnDef<TeacherProfile>[] = [
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
                <div className="text-muted-foreground text-xs truncate max-w-[80px]">{row.getValue("id")}</div>
            ),
        },
        {
            accessorKey: "departments",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Department" />
            ),
            cell: ({ row }) => {
                const departments = row.original.departments;
                if (!departments || departments.length === 0) return <span className="text-muted-foreground">-</span>;
                return (
                    <div className="flex flex-wrap gap-1">
                        {departments.map((dept) => (
                            <Badge key={dept.id} variant="outline">{dept.name}</Badge>
                        ))}
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                if (!value || !Array.isArray(value) || value.length === 0) return true;
                const rowDepartments = row.original.departments?.map(d => d.name) || [];
                return value.some((val: string) => rowDepartments.includes(val));
            },
        },
        {
            accessorKey: "gender",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Gender" />
            ),
            cell: ({ row }) => (
                <div className="capitalize">{row.getValue("gender") || "-"}</div>
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
                if (!subjects || subjects.length === 0) return <span className="text-muted-foreground">-</span>;
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
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/teachers/${teacher.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                </Link>
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
        data,
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

    // Extract unique departments for filter
    const allDepartments = Array.from(
        new Set(
            data.flatMap((t) => t.departments?.map((d) => d.name) || [])
        )
    ).sort();

    const selectedDepartment = (table.getColumn("departments")?.getFilterValue() as string[]) || [];
    const selectedGender = (table.getColumn("gender")?.getFilterValue() as string[]) || [];

    return (
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
                                table.getColumn("departments")?.setFilterValue(undefined);
                            } else {
                                table.getColumn("departments")?.setFilterValue([value]);
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {allDepartments.map((dept) => (
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
    );
}
