"use client";

import { useActionState, useState, useEffect } from "react";
import { registerAdmin } from "@/app/actions/register-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";

export function RegisterAdminForm() {
    const [state, action, isPending] = useActionState(registerAdmin, {
        message: "",
        errors: {},
        success: false,
    });
    const [isVerified, setIsVerified] = useState(false);

    // Reset form on success
    useEffect(() => {
        if (state.success) {
            const form = document.querySelector("form") as HTMLFormElement;
            if (form) form.reset();
            setIsVerified(false);
        }
    }, [state.success]);

    return (
        <form action={action} className="space-y-4">
            {state.message && (
                <div
                    className={`p-4 rounded-md ${state.success
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {state.message}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required />
                    {state.errors?.firstName && (
                        <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="middleName">
                        Middle Name <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input id="middleName" name="middleName" placeholder="D." />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                    {state.errors?.lastName && (
                        <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" name="phoneNumber" placeholder="+265..." required />
                    {state.errors?.phoneNumber && (
                        <p className="text-sm text-red-500">{state.errors.phoneNumber[0]}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@school.mw" required />
                {state.errors?.email && (
                    <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                )}
            </div>

            <div className="flex items-center space-x-2 border p-4 rounded-md">
                <Checkbox id="isSuperAdmin" name="isSuperAdmin" />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="isSuperAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Super Admin Privileges
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Grant full system access including sensitive configurations.
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="verify"
                    checked={isVerified}
                    onCheckedChange={(checked) => setIsVerified(checked as boolean)}
                />
                <Label htmlFor="verify" className="text-sm">
                    Verify admin information
                </Label>
            </div>

            <Button className="w-full" disabled={!isVerified || isPending}>
                <Shield className="h-4 w-4 mr-2" />
                {isPending ? "Registering..." : "Register Admin"}
            </Button>
        </form>
    );
}
