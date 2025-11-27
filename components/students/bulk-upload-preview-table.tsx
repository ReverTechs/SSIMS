'use client';

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { ArrowUpDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BulkStudentData, ValidationError } from '@/types/bulk-upload-types';

interface BulkUploadPreviewTableProps {
    data: BulkStudentData[];
    errors: ValidationError[];
}

export function BulkUploadPreviewTable({ data, errors }: BulkUploadPreviewTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    // Create error lookup map for quick access
    const errorMap = useMemo(() => {
        const map = new Map<number, ValidationError[]>();
        errors.forEach(error => {
            const existing = map.get(error.row) || [];
            existing.push(error);
            map.set(error.row, existing);
        });
        return map;
    }, [errors]);

    // Define columns with compact styling
    const columns = useMemo<ColumnDef<BulkStudentData>[]>(
        () => [
            {
                accessorKey: 'firstName',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="h-8 px-2 hover:bg-muted/50"
                    >
                        First Name
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => <div className="font-medium px-2">{row.getValue('firstName')}</div>,
            },
            {
                accessorKey: 'lastName',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        className="h-8 px-2 hover:bg-muted/50"
                    >
                        Last Name
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => <div className="px-2">{row.getValue('lastName')}</div>,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground px-2">{row.getValue('email')}</div>
                ),
            },
            {
                accessorKey: 'studentId',
                header: 'Student ID',
                cell: ({ row }) => (
                    <div className="font-mono text-sm px-2">{row.getValue('studentId')}</div>
                ),
            },
            {
                accessorKey: 'gender',
                header: 'Gender',
                cell: ({ row }) => {
                    const gender = row.getValue('gender') as string;
                    return (
                        <div className="px-2">
                            <Badge variant="outline" className="capitalize">
                                {gender}
                            </Badge>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'className',
                header: 'Class',
                cell: ({ row }) => (
                    <div className="font-medium px-2">{row.getValue('className')}</div>
                ),
            },
            {
                accessorKey: 'studentType',
                header: 'Type',
                cell: ({ row }) => {
                    const type = row.getValue('studentType') as string;
                    return (
                        <div className="px-2">
                            <Badge variant={type === 'internal' ? 'default' : 'secondary'} className="capitalize">
                                {type}
                            </Badge>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'dateOfBirth',
                header: 'Date of Birth',
                cell: ({ row }) => (
                    <div className="text-sm px-2">{row.getValue('dateOfBirth')}</div>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            globalFilter,
        },
    });

    const { rows } = table.getRowModel();

    return (
        <div className="space-y-4 flex-1 flex flex-col h-full min-h-0">
            {/* Search/Filter */}
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search students..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{data.length} valid records</span>
                    {errors.length > 0 && (
                        <>
                            <AlertCircle className="h-4 w-4 text-destructive ml-4" />
                            <span className="text-destructive">{errors.length} errors</span>
                        </>
                    )}
                </div>
            </div>

            {/* Table with proper scrolling */}
            <div className="rounded-md border flex-1 overflow-hidden bg-background">
                <ScrollArea className="h-full">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 border-b">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="font-semibold">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        className={`
                                            ${index % 2 === 0 ? 'bg-white dark:bg-background' : 'bg-gray-50 dark:bg-muted/30'}
                                            hover:bg-gray-100 dark:hover:bg-muted/50 transition-colors
                                            border-b last:border-b-0
                                        `}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <h3 className="font-semibold text-destructive">Validation Errors</h3>
                    </div>
                    <ScrollArea className="max-h-[200px]">
                        <div className="space-y-2 pr-4">
                            {errors.slice(0, 50).map((error, index) => (
                                <div key={index} className="text-sm flex gap-2">
                                    <span className="font-mono text-muted-foreground">Row {error.row}:</span>
                                    <span className="font-medium">{error.field}</span>
                                    <span className="text-muted-foreground">-</span>
                                    <span className="text-destructive">{error.message}</span>
                                </div>
                            ))}
                            {errors.length > 50 && (
                                <p className="text-sm text-muted-foreground italic">
                                    ...and {errors.length - 50} more errors
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
