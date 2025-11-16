"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { isReportGenerationEnabled } from "@/lib/reports/settings";

export function ReportGenerationStatus() {
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const enabled = isReportGenerationEnabled();
      setIsDisabled(!enabled);
    }
  }, []);

  if (!isDisabled) {
    return null;
  }

  return (
    <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
        School report generation has been disabled.
      </AlertDescription>
    </Alert>
  );
}

