"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function Toaster() {
    const { theme } = useTheme();

    return (
        <Sonner
            theme={theme as "light" | "dark" | "system"}
            position="top-right"
            closeButton
            richColors
            expand={false}
            duration={4000}
            toastOptions={{
                classNames: {
                    toast: "rounded-xl border shadow-lg",
                    title: "font-medium",
                    description: "text-sm opacity-90",
                    actionButton: "rounded-lg",
                    cancelButton: "rounded-lg",
                    closeButton: "rounded-lg",
                    success: "border-green-200 dark:border-green-800",
                    error: "border-red-200 dark:border-red-800",
                    info: "border-blue-200 dark:border-blue-800",
                    warning: "border-yellow-200 dark:border-yellow-800",
                },
            }}
        />
    );
}
