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
    DialogHeader,
    DialogTitle,
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
    Pencil,
    Trash2,
    Eye,
    Coins,
} from "lucide-react";
import { Department } from "@/lib/data/departments";
import { Subject } from "@/lib/data/subjects";
import { TeacherProfile } from "@/lib/data/teachers";
import { DepartmentDialog } from "./department-dialog";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { ManageBudgetDialog } from "./manage-budget-dialog";
import { SubjectManagementDialog } from "./subject-management-dialog";

interface DepartmentsClientProps {
    departments: Department[];
    allSubjects: Subject[];
    teachers: TeacherProfile[];
}

export default function DepartmentsClient({
    departments,
    allSubjects,
    teachers,
}: DepartmentsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
        null
    );
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

    // Filter departments
    const filteredDepartments = departments.filter((dept) => {
        const headName =
            teachers.find((t) => t.id === dept.head_of_department_id)?.name || "";
        return (
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            headName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Calculate stats
    const totalBudget = departments.reduce(
        (acc, curr) => acc + (Number(curr.budget) || 0),
        0
    );

    // Count teachers per department properly
    const getTeacherCount = (deptId: string) => {
        return teachers.filter(t => t.departments?.some(d => d.id === deptId)).length;
    };

    const getStudentCount = (deptId: string) => {
        // This requires aggregation not available in current props easily without more data
        // For now, mock or leave as 0 if data missing
        return 0; // Placeholder
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-MW", {
            style: "currency",
            currency: "MWK",
        }).format(amount);
    };

    const handleEdit = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsDeleteDialogOpen(true);
    };

    const handleManageBudget = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsBudgetDialogOpen(true);
    };

    const handleViewDetails = (dept: Department) => {
        setSelectedDepartment(dept);
        setIsViewDetailsOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground">
                        Manage school departments & subjects, heads, and resource allocations.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
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
                        <p className="text-sm text-muted-foreground">Across various disciplines</p>
                    </CardContent>
                </Card>
                <Card className="border border-border/60 bg-card/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Total Subjects</CardDescription>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-3xl font-semibold">
                            {allSubjects.length}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Active subjects offered</p>
                    </CardContent>
                </Card>
                <Card className="border border-border/60 bg-card/60">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Total Budget</CardDescription>
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="text-3xl font-semibold">
                            {formatCurrency(totalBudget)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Allocated for current year</p>
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
                                <TableHead>Subjects</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDepartments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No departments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDepartments.map((dept) => {
                                    const head = teachers.find((t) => t.id === dept.head_of_department_id);
                                    const deptSubjects = allSubjects.filter(s => s.departmentId === dept.id);
                                    const teacherCount = getTeacherCount(dept.id);

                                    return (
                                        <TableRow key={dept.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{dept.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {dept.code}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{head ? head.name : "N/A"}</TableCell>
                                            <TableCell>{teacherCount}</TableCell>
                                            <TableCell>{deptSubjects.length}</TableCell>
                                            <TableCell>{formatCurrency(Number(dept.budget) || 0)}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                                                >
                                                    Active
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
                                                        <DropdownMenuItem onClick={() => handleViewDetails(dept)}>
                                                            <Eye className="mr-2 h-4 w-4" /> View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(dept)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit department
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleManageBudget(dept)}>
                                                            <Coins className="mr-2 h-4 w-4" /> Manage budget
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(dept)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete department
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <DepartmentDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                teachers={teachers}
            />

            {/* Edit Dialog - includes subject management */}
            {selectedDepartment && (
                <DepartmentDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    department={selectedDepartment}
                    teachers={teachers}
                    subjects={allSubjects.filter(s => s.departmentId === selectedDepartment.id)}
                />
            )}

            {/* Manage Budget Dialog */}
            {selectedDepartment && (
                <ManageBudgetDialog
                    open={isBudgetDialogOpen}
                    onOpenChange={setIsBudgetDialogOpen}
                    department={selectedDepartment}
                />
            )}

            {/* Delete Confirmation Dialog */}
            {selectedDepartment && (
                <DeleteDepartmentDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    department={selectedDepartment}
                />
            )}

            {/* View Details Dialog */}
            {selectedDepartment && (
                <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedDepartment.name} Details</DialogTitle>
                            <DialogDescription>
                                Detailed information for {selectedDepartment.code}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-medium text-right">Name:</span>
                                <span className="col-span-3">{selectedDepartment.name}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-medium text-right">Code:</span>
                                <span className="col-span-3">{selectedDepartment.code}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-medium text-right">Head:</span>
                                <span className="col-span-3">
                                    {teachers.find(t => t.id === selectedDepartment.head_of_department_id)?.name || "N/A"}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-medium text-right">Budget:</span>
                                <span className="col-span-3">{formatCurrency(Number(selectedDepartment.budget) || 0)}</span>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <span className="font-medium text-right">Subjects:</span>
                                <span className="col-span-3">
                                    {allSubjects.filter(s => s.departmentId === selectedDepartment.id).map(s => s.name).join(", ") || "None"}
                                </span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

        </div>
    );
}
