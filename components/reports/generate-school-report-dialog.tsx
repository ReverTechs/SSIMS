"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Download, Settings } from "lucide-react";
import { UserRole } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getSchoolReportSettings, getSelectedReportUI, saveSchoolReportSettings } from "@/lib/reports/settings";

interface GenerateSchoolReportDialogProps {
  userRole: UserRole;
}

// Mock class options - in production, these would come from the database
const classOptions = [
  { value: "general", label: "General (All Sections)" },
  { value: "form1a", label: "Form 1A" },
  { value: "form1b", label: "Form 1B" },
  { value: "form1", label: "Form 1 (All Sections)" },
  { value: "form2a", label: "Form 2A" },
  { value: "form2b", label: "Form 2B" },
  { value: "form2", label: "Form 2 (All Sections)" },
  { value: "form3a", label: "Form 3A" },
  { value: "form3b", label: "Form 3B" },
  { value: "form3", label: "Form 3 (All Sections)" },
  { value: "form4a", label: "Form 4A" },
  { value: "form4b", label: "Form 4B" },
  { value: "form4", label: "Form 4 (All Sections)" },
  { value: "form5a", label: "Form 5A" },
  { value: "form5b", label: "Form 5B" },
  { value: "form5", label: "Form 5 (All Sections)" },
];

// Mock academic years - in production, these would come from the database
const academicYears = ["2024", "2023", "2025"];

const terms = [
  { value: "term1", label: "Term 1" },
  { value: "term2", label: "Term 2" },
  { value: "term3", label: "Term 3" },
];

const feePaymentOptions = [
  { value: "any", label: "Any Students" },
  { value: "fully_paid", label: "Fully Paid Fees Only" },
  { value: "half_paid", label: "Half Paid Fees or More" },
];

export function GenerateSchoolReportDialog({
  userRole,
}: GenerateSchoolReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [formData, setFormData] = useState({
    academicYear: "2024",
    term: "term1",
    className: "general",
    feePaymentStatus: "any",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user can disable the feature (headteacher or deputy headteacher)
  const canDisableFeature = userRole === "headteacher" || userRole === "deputy_headteacher";

  // Load disabled state from settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const settings = getSchoolReportSettings();
      setIsDisabled(!settings.enabled);
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleDisable = (checked: boolean) => {
    setIsDisabled(checked);
    // Save to settings (in production, this would be saved to the database)
    if (typeof window !== "undefined") {
      const currentSettings = getSchoolReportSettings();
      saveSchoolReportSettings({
        ...currentSettings,
        enabled: !checked,
      });
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDisabled && userRole !== "admin" && !canDisableFeature) {
      return; // Prevent generation if disabled and user can't override
    }

    setIsGenerating(true);

    // Get the selected UI type from settings
    const selectedUI = getSelectedReportUI();

    // Simulate report generation
    setTimeout(() => {
      console.log("Generating report with:", {
        ...formData,
        uiType: selectedUI, // Include the selected UI type
      });
      // In production, this would call an API endpoint to generate the report
      // The endpoint would:
      // 1. Filter students based on className (if "general", get all sections like Form 4A, 4B, etc.)
      // 2. Filter by fee payment status
      // 3. Generate reports for each student using the selected UI template (selectedUI)
      // 4. Return a downloadable PDF or ZIP file
      setIsGenerating(false);
      setOpen(false);
      // Show success message or download the report
    }, 2000);
  };

  // If feature is disabled and user cannot disable it and is not admin, don't show the button
  // Note: We check this in useEffect after localStorage loads, so we need to handle it differently
  // For now, we'll show the button but disable it if the feature is disabled

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg"
          disabled={isDisabled && userRole !== "admin" && !canDisableFeature}
        >
          <FileText className="h-4 w-4" />
          Generate School Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-semibold">
                Generate School Report
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Configure parameters to generate comprehensive school reports
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isDisabled && (
          <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
              Report generation has been disabled by the administration. Please contact your headteacher or deputy headteacher to enable this feature.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2">
          <form
            id="report-form"
            onSubmit={handleGenerate}
            className="space-y-6 pb-6"
          >
            <div className="space-y-5">
              {/* Academic Year and Term Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Academic Year Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="academicYear"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <span>Academic Year</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.academicYear}
                    onValueChange={(value) =>
                      handleInputChange("academicYear", value)
                    }
                  >
                    <SelectTrigger id="academicYear" className="w-full">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor="term"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <span>Term</span>
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.term}
                    onValueChange={(value) => handleInputChange("term", value)}
                  >
                    <SelectTrigger id="term" className="w-full">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class Selection */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="className"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <span>Class</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.className}
                  onValueChange={(value) =>
                    handleInputChange("className", value)
                  }
                >
                  <SelectTrigger id="className" className="w-full">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.className === "general"
                    ? "General will generate reports for all students across all classes and sections"
                    : formData.className.match(/^form[1-5]$/)
                    ? `This will generate reports for all students in ${formData.className.toUpperCase()} regardless of section (e.g., includes ${formData.className.toUpperCase()}A, ${formData.className.toUpperCase()}B, etc.)`
                    : "Select a specific class section to generate reports for that section only"}
                </p>
              </div>

              {/* Fee Payment Status Filter */}
              <div className="space-y-2.5">
                <Label
                  htmlFor="feePaymentStatus"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <span>Fee Payment Filter</span>
                </Label>
                <Select
                  value={formData.feePaymentStatus}
                  onValueChange={(value) =>
                    handleInputChange("feePaymentStatus", value)
                  }
                >
                  <SelectTrigger id="feePaymentStatus" className="w-full">
                    <SelectValue placeholder="Select fee payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    {feePaymentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Filter students based on their fee payment status for the
                  selected term
                </p>
              </div>

              {/* Disable Feature Toggle (Only for headteacher/deputy headteacher) */}
              {canDisableFeature && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <CardTitle className="text-sm font-semibold">
                        Feature Control
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Disable report generation for all users (except admins)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label
                          htmlFor="disable-feature"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Disable Report Generation
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          When enabled, only admins can generate reports
                        </p>
                      </div>
                      <Switch
                        id="disable-feature"
                        checked={isDisabled}
                        onCheckedChange={handleToggleDisable}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="report-form"
            className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
            disabled={isGenerating || (isDisabled && userRole !== "admin" && !canDisableFeature)}
          >
            {isGenerating ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

