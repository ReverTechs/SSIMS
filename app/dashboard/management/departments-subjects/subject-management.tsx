"use client";

import { useState } from "react";
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
import { Plus, Trash2, Save, X, Pencil } from "lucide-react";
import { Subject } from "@/lib/data/subjects";
import { createSubjectAction, updateSubjectAction, deleteSubjectAction } from "@/app/actions/subjects";
import { Label } from "@/components/ui/label";

interface SubjectManagementProps {
    departmentId: string;
    subjects: Subject[];
}

export function SubjectManagement({ departmentId, subjects }: SubjectManagementProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // New Subject State
    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");

    // Editing State
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");

    const [loading, setLoading] = useState(false);

    const handleAddStart = () => {
        setIsAdding(true);
        setNewName("");
        setNewCode("");
    };

    const handleAddCancel = () => {
        setIsAdding(false);
        setNewName("");
        setNewCode("");
    };

    const handleAddSave = async () => {
        if (!newName.trim() || !newCode.trim()) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("name", newName);
        formData.append("code", newCode);
        formData.append("departmentId", departmentId);

        try {
            await createSubjectAction({}, formData);
            setIsAdding(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (subject: Subject) => {
        setEditingId(subject.id);
        setEditName(subject.name);
        setEditCode(subject.code);
    };

    const handleEditCancel = () => {
        setEditingId(null);
    };

    const handleEditSave = async (id: string) => {
        if (!editName.trim() || !editCode.trim()) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("id", id);
        formData.append("name", editName);
        formData.append("code", editCode);
        formData.append("departmentId", departmentId);

        try {
            await updateSubjectAction({}, formData);
            setEditingId(null);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        setLoading(true);
        try {
            await deleteSubjectAction(id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Subjects in Department</h3>
                {!isAdding && (
                    <Button size="sm" onClick={handleAddStart} variant="secondary">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Subject
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="flex items-end gap-2 p-2 border rounded-md bg-muted/50">
                    <div className="space-y-1 flex-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Subject Name"
                            className="h-8"
                        />
                    </div>
                    <div className="space-y-1 w-24">
                        <Label className="text-xs">Code</Label>
                        <Input
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="Code"
                            className="h-8"
                        />
                    </div>
                    <Button size="icon" className="h-8 w-8" onClick={handleAddSave} disabled={loading}>
                        <Save className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="w-24">Code</TableHead>
                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-20">
                                    No subjects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subjects.map((subject) => (
                                <TableRow key={subject.id}>
                                    <TableCell>
                                        {editingId === subject.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8"
                                            />
                                        ) : (
                                            subject.name
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === subject.id ? (
                                            <Input
                                                value={editCode}
                                                onChange={(e) => setEditCode(e.target.value)}
                                                className="h-8"
                                            />
                                        ) : (
                                            <span className="font-mono text-xs">{subject.code}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {editingId === subject.id ? (
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditSave(subject.id)} disabled={loading}>
                                                    <Save className="h-4 w-4 text-emerald-500" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleEditCancel}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-1">
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditStart(subject)} disabled={loading}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(subject.id)} disabled={loading}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
