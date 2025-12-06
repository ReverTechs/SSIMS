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
import { format } from "date-fns";
import { Department } from "@/lib/data/departments";
import { updateDepartmentAction } from "@/app/actions/departments";

interface ManageBudgetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department: Department;
}

export function ManageBudgetDialog({
    open,
    onOpenChange,
    department,
}: ManageBudgetDialogProps) {
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setAmount(department.budget?.toString() || "");
            setError("");
        }
    }, [open, department]);

    const handleSave = async () => {
        setIsSubmitting(true);
        setError("");
        const formData = new FormData();
        formData.append("id", department.id);
        // We need to preserve other fields, but update action might accept partials if we are careful.
        // However, my update action in departments.ts uses `updateSchema` which requires id, and optional others.
        // But `updateDepartment` data function uses partials.
        // My action implementation:
        /* 
           const { id, name, code, budget, headOfDepartmentId } = validatedFields.data
           // ...
           await updateDepartment(id, { name, code, budget, ... })
        */
        // Wait, if I only send budget, other fields might be undefined in `validatedFields.data` and passed as undefined to `updateDepartment`, which is fine because `updateDepartment` takes partials.
        // BUT, Zod schema for update:
        /*
           const updateSchema = createSchema.partial().extend({ id: z.string()... })
        */
        // `createSchema` has `name` and `code` as required. `partial()` makes them optional.
        // So yes, I can just send budget.

        formData.append("budget", amount);

        try {
            const result = await updateDepartmentAction({}, formData);
            if (result.success) {
                onOpenChange(false);
            } else {
                setError(result.message || "Failed to update budget");
            }
        } catch (e) {
            setError("An unknown error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Budget</DialogTitle>
                    <DialogDescription>
                        Update the allocated budget for {department.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="current" className="text-right">
                            Current
                        </Label>
                        <div className="col-span-3 font-medium">
                            MWK {Number(department.budget || 0).toLocaleString()}
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Budget
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="0.00"
                            min="0"
                        />
                    </div>
                </div>
                {error && <p className="text-sm text-destructive mb-2 text-center">{error}</p>}
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Update Budget"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
