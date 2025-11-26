"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    getStudentsPaginated,
    getClassesForFilter,
    type StudentOption,
} from "@/app/actions/get-students-paginated";

interface StudentSelectorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedStudentIds: Set<string>;
    onStudentsSelected: (studentIds: string[]) => void;
    // We need the full student objects to display them in the "Selected" column
    // even if they are not on the current page of the search results
    initialSelectedStudents: StudentOption[];
}

export function StudentSelectorDialog({
    open,
    onOpenChange,
    selectedStudentIds,
    onStudentsSelected,
    initialSelectedStudents,
}: StudentSelectorDialogProps) {
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Store selected students as a Map to keep their details
    const [selectedStudentsMap, setSelectedStudentsMap] = useState<Map<string, StudentOption>>(new Map());

    const pageSize = 15;

    // Load classes on mount
    useEffect(() => {
        if (open) {
            loadClasses();
            // Initialize map from props
            const newMap = new Map<string, StudentOption>();
            initialSelectedStudents.forEach(s => newMap.set(s.id, s));
            setSelectedStudentsMap(newMap);
        }
    }, [open, initialSelectedStudents]);

    // Load students when filters change
    useEffect(() => {
        if (open) {
            loadStudents();
        }
    }, [open, searchQuery, selectedClassId, currentPage]);

    const loadClasses = async () => {
        const classesData = await getClassesForFilter();
        setClasses(classesData);
    };

    const loadStudents = async () => {
        setLoading(true);
        try {
            const result = await getStudentsPaginated({
                searchQuery,
                classId: selectedClassId,
                page: currentPage,
                pageSize,
            });

            setStudents(result.students);
            setTotalPages(result.totalPages);
            setTotal(result.total);
        } catch (error) {
            console.error("Error loading students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page on search
    }, []);

    const handleClassFilterChange = useCallback((value: string) => {
        setSelectedClassId(value);
        setCurrentPage(1); // Reset to first page on filter change
    }, []);

    const handleStudentToggle = (studentId: string) => {
        const newMap = new Map(selectedStudentsMap);

        if (newMap.has(studentId)) {
            newMap.delete(studentId);
        } else {
            // Find student details from current list
            const student = students.find(s => s.id === studentId);
            if (student) {
                newMap.set(studentId, student);
            }
        }
        setSelectedStudentsMap(newMap);
    };

    const handleConfirm = () => {
        onStudentsSelected(Array.from(selectedStudentsMap.keys()));
        onOpenChange(false);
    };

    const handleCancel = () => {
        // Reset to initial state
        const newMap = new Map<string, StudentOption>();
        initialSelectedStudents.forEach(s => newMap.set(s.id, s));
        setSelectedStudentsMap(newMap);
        onOpenChange(false);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedClassId("");
        setCurrentPage(1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[75vw] sm:max-w-[75vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Select Students</DialogTitle>
                    <DialogDescription>
                        Search and select students to link with this guardian.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 grid grid-cols-2 divide-x overflow-hidden">
                    {/* Left Column: Available Students */}
                    <div className="flex flex-col h-full overflow-hidden bg-muted/10">
                        <div className="p-4 space-y-4 border-b bg-background">
                            <div className="space-y-2">
                                <Label htmlFor="search" className="text-sm">Search Students</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Search by name..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={selectedClassId || "all"}
                                        onValueChange={(value) => handleClassFilterChange(value === "all" ? "" : value)}
                                    >
                                        <SelectTrigger id="class-filter" className="w-full">
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
                                </div>
                                {(searchQuery || selectedClassId) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={clearFilters}
                                        title="Clear filters"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <p className="text-muted-foreground">Loading students...</p>
                                </div>
                            ) : students.length > 0 ? (
                                <>
                                    {students.map((student) => {
                                        const isSelected = selectedStudentsMap.has(student.id);
                                        return (
                                            <div
                                                key={student.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                                    ? "bg-primary/5 border-primary/50 opacity-50"
                                                    : "bg-background hover:border-primary/50 cursor-pointer"
                                                    }`}
                                                onClick={() => !isSelected && handleStudentToggle(student.id)}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{student.name}</p>
                                                    {student.class && (
                                                        <Badge variant="secondary" className="mt-1 text-xs">
                                                            {student.class}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant={isSelected ? "secondary" : "outline"}
                                                    className="ml-2 shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStudentToggle(student.id);
                                                    }}
                                                >
                                                    {isSelected ? (
                                                        <span className="text-xs">Selected</span>
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })}

                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4 mt-2 border-t">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Prev
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                                    <Search className="h-8 w-8 mb-2 opacity-20" />
                                    <p>No students found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Selected Students */}
                    <div className="flex flex-col h-full bg-background">
                        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">
                                    {selectedStudentsMap.size}
                                </span>
                                Selected Students
                            </h3>
                            {selectedStudentsMap.size > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                    onClick={() => setSelectedStudentsMap(new Map())}
                                >
                                    Clear All
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {selectedStudentsMap.size > 0 ? (
                                Array.from(selectedStudentsMap.values()).map((student) => {
                                    return (
                                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm animate-in fade-in slide-in-from-left-2">
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                {student.class && (
                                                    <Badge variant="outline" className="mt-1 text-xs">
                                                        {student.class}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => handleStudentToggle(student.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg m-4">
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <ChevronRight className="h-6 w-6 opacity-50" />
                                    </div>
                                    <p className="font-medium">No students selected</p>
                                    <p className="text-sm mt-1">Select students from the left list to add them here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center p-4 border-t bg-muted/10">
                    <div className="text-sm text-muted-foreground">
                        {selectedStudentsMap.size} student{selectedStudentsMap.size !== 1 ? 's' : ''} ready to add
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={selectedStudentsMap.size === 0}>
                            Confirm Selection
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
