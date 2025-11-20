"use client";

import * as React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export interface PasswordInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    onValidityChange?: (isValid: boolean) => void;
}

export const PasswordInput = React.forwardRef<
    HTMLInputElement,
    PasswordInputProps
>(({ className, onChange, onValidityChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [password, setPassword] = React.useState("");
    const [strength, setStrength] = React.useState(0);

    const requirements = [
        { re: /.{8,}/, label: "At least 8 characters" },
        { re: /[0-9]/, label: "Includes number" },
        { re: /[a-z]/, label: "Includes lowercase letter" },
        { re: /[A-Z]/, label: "Includes uppercase letter" },
        { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
    ];

    const calculateStrength = (pass: string) => {
        let score = 0;
        requirements.forEach((req) => {
            if (req.re.test(pass)) score++;
        });
        return (score / requirements.length) * 100;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPassword(val);
        const newStrength = calculateStrength(val);
        setStrength(newStrength);

        const isValid = requirements.every((req) => req.re.test(val));
        if (onValidityChange) onValidityChange(isValid);
        if (onChange) onChange(e);
    };

    const toggleVisibility = () => setShowPassword(!showPassword);

    return (
        <div className="space-y-2">
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    onChange={handleChange}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={toggleVisibility}
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                    </span>
                </Button>
            </div>

            {password && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Progress
                        value={strength}
                        className={cn(
                            "h-1.5",
                            strength <= 40
                                ? "bg-red-500/20 [&>div]:bg-red-500"
                                : strength <= 80
                                    ? "bg-amber-500/20 [&>div]:bg-amber-500"
                                    : "bg-emerald-500/20 [&>div]:bg-emerald-500"
                        )}
                    />
                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {requirements.map((req, index) => {
                            const isMet = req.re.test(password);
                            return (
                                <li
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-2 text-xs transition-colors duration-200",
                                        isMet ? "text-emerald-600" : "text-muted-foreground/60"
                                    )}
                                >
                                    {isMet ? (
                                        <Check className="h-3 w-3 shrink-0" />
                                    ) : (
                                        <X className="h-3 w-3 shrink-0" />
                                    )}
                                    <span>{req.label}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
});
PasswordInput.displayName = "PasswordInput";
