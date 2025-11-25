"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function ForceChangePasswordForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }


        try {
            // Update password and clear the must_change_password flag
            const { error } = await supabase.auth.updateUser({
                password: password,
                data: { must_change_password: false },
            });

            if (error) throw error;

            // CRITICAL: Refresh the session to ensure new metadata is loaded
            // This prevents the redirect loop by ensuring middleware sees the updated flag
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;

            setSuccess("Password updated successfully! Redirecting...");

            // Redirect to dashboard after session is refreshed
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1500);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "An error occurred");
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Change Default Password
                    </CardTitle>
                    <CardDescription className="text-center">
                        For your security, you must change your default password before continuing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <PasswordInput
                                id="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onValidityChange={setIsPasswordValid}
                                disabled={isLoading || !!success}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <PasswordInput
                                id="confirmPassword"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading || !!success}
                                placeholder="Confirm new password"
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="border-green-500 text-green-600">
                                <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading || !!success}
                        >
                            {isLoading ? "Updating Password..." : "Update Password & Continue"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div >
    );
}
