"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { syncStudentSubjects } from "@/actions/sync-subjects";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SyncSubjectsButtonProps {
    studentId: string;
}

export function SyncSubjectsButton({ studentId }: SyncSubjectsButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setLoading(true);
        setShowConfirm(false);

        try {
            const result = await syncStudentSubjects(studentId);

            if (result.success) {
                toast.success(result.message || "Subjects synced successfully");
                if (result.data?.enrolledCount) {
                    toast.info(`Enrolled in ${result.data.enrolledCount} subject${result.data.enrolledCount !== 1 ? 's' : ''}`);
                }
                router.refresh();
            } else {
                toast.error(result.error || "Failed to sync subjects");
            }
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(true)}
                disabled={loading}
                className="gap-2"
            >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Sync Defaults
            </Button>

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sync Default Subjects?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will enroll the student in all compulsory subjects based on their current class and stream.
                            Existing enrollments will not be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSync}>
                            Sync Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
