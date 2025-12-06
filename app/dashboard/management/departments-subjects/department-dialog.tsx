"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Department } from "@/lib/data/departments";
import { Subject } from "@/lib/data/subjects";
import { TeacherProfile } from "@/lib/data/teachers";
import { createDepartmentAction, updateDepartmentAction } from "@/app/actions/departments";
import { toast } from "sonner";
import { SubjectManagement } from "./subject-management";

interface DepartmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department?: Department; // If provided, edit mode
    teachers: TeacherProfile[];
    subjects?: Subject[]; // Only relevant for edit mode to manage subjects
}

export function DepartmentDialog({
    open,
    onOpenChange,
    department,
    teachers,
    subjects = [],
}: DepartmentDialogProps) {
    const isEdit = !!department;
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [headId, setHeadId] = useState<string>("none");
    const [budget, setBudget] = useState("");

    useEffect(() => {
        if (open) {
            if (department) {
                setName(department.name);
                setCode(department.code);
                setHeadId(department.head_of_department_id || "none");
                setBudget(department.budget?.toString() || "");
            } else {
                setName("");
                setCode("");
                setHeadId("none");
                setBudget("");
            }
        }
    }, [open, department]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        if (isEdit && department) {
            formData.append("id", department.id);
        }
        formData.append("name", name);
        formData.append("code", code);
        if (headId && headId !== "none") formData.append("headOfDepartmentId", headId);
        if (budget) formData.append("budget", budget);

        try {
            const action = isEdit ? updateDepartmentAction : createDepartmentAction;
            // @ts-ignore
            const result = await action({}, formData);

            if (result.success) {
                toast.success(result.message || "Success!");
                if (!isEdit) {
                    // Reset form if create
                    setName("");
                    setCode("");
                    setHeadId("none");
                    setBudget("");
                }
                onOpenChange(false);
            } else {
                toast.error(result.message || "An error occurred.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Department" : "Add Department"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update department details and manage subjects."
                            : "Create a new department and assign a head."}
                    </DialogDescription>
                </DialogHeader>

                {isEdit ? (
                    <Tabs defaultValue="details">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="subjects">Subjects ({subjects.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="py-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Department Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Sciences"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="e.g. SCI"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="head">Head of Department</Label>
                                    <Select value={headId} onValueChange={setHeadId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget (MWK)</Label>
                                    <Input
                                        id="budget"
                                        type="number"
                                        placeholder="0.00"
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </TabsContent>

                        <TabsContent value="subjects" className="py-4">
                            <SubjectManagement departmentId={department.id} subjects={subjects} />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Department Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Sciences"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. SCI"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="head">Head of Department</Label>
                            <Select value={headId} onValueChange={setHeadId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">Initial Budget (MWK)</Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="0.00"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Department"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
