"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, FileText, Palette, Layout, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveSchoolReportSettings } from "@/lib/reports/settings";

export type ReportUIType = "default" | "modern" | "classic" | "minimal";

interface SchoolReportSettings {
  enabled: boolean;
  selectedUI: ReportUIType;
}

interface SchoolReportSettingsContentProps {
  initialSettings?: SchoolReportSettings;
  onSettingsChange?: (settings: SchoolReportSettings) => void;
}

const UI_OPTIONS: Array<{
  value: ReportUIType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}> = [
  {
    value: "default",
    label: "Default UI",
    description: "Standard report format with balanced design",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "modern",
    label: "Modern UI",
    description: "Contemporary design with sleek layouts",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    value: "classic",
    label: "Classic UI",
    description: "Traditional format with timeless elegance",
    icon: Layout,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    value: "minimal",
    label: "Minimal UI",
    description: "Clean and simple design focused on content",
    icon: Palette,
    gradient: "from-slate-500 to-gray-500",
  },
];

export function SchoolReportSettingsContent({
  initialSettings,
  onSettingsChange,
}: SchoolReportSettingsContentProps) {
  const [settings, setSettings] = useState<SchoolReportSettings>(
    initialSettings || {
      enabled: true,
      selectedUI: "default",
    }
  );

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("schoolReportSettings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings) as SchoolReportSettings;
          setSettings(parsed);
        } catch (error) {
          console.error("Error loading settings:", error);
        }
      }
    }
  }, []);

  // Save settings to localStorage and notify parent
  const updateSettings = (newSettings: SchoolReportSettings) => {
    setSettings(newSettings);
    saveSchoolReportSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    updateSettings({ ...settings, enabled });
  };

  const handleUIChange = (ui: ReportUIType) => {
    updateSettings({ ...settings, selectedUI: ui });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <Settings className="h-6 w-6 text-white" />
            </div>
            School Report Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure the report generation UI and enable/disable the feature
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Feature Control
          </CardTitle>
          <CardDescription>
            Enable or disable school report generation for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-reports" className="text-base font-medium cursor-pointer">
                Enable Report Generation
              </Label>
              <p className="text-sm text-muted-foreground">
                {settings.enabled
                  ? "Report generation is currently enabled for all authorized users"
                  : "Report generation is disabled. Only admins can generate reports."}
              </p>
            </div>
            <Switch
              id="enable-reports"
              checked={settings.enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>
          {!settings.enabled && (
            <Alert className="mt-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                School report generation has been disabled.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* UI Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Report UI Selection
          </CardTitle>
          <CardDescription>
            Choose the UI template that will be used for all generated school reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.selectedUI}
            onValueChange={(value) => handleUIChange(value as ReportUIType)}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {UI_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = settings.selectedUI === option.value;

              return (
                <div key={option.value} className="relative">
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={`
                      flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer
                      transition-all duration-200 hover:scale-105 hover:shadow-lg
                      ${
                        isSelected
                          ? `border-primary bg-gradient-to-br ${option.gradient} text-white shadow-lg scale-105`
                          : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                      }
                    `}
                  >
                    <div
                      className={`
                        p-4 rounded-lg mb-3
                        ${
                          isSelected
                            ? "bg-white/20 backdrop-blur-sm"
                            : `bg-gradient-to-br ${option.gradient}`
                        }
                      `}
                    >
                      <Icon className={`h-8 w-8 ${isSelected ? "text-white" : "text-white"}`} />
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-semibold text-base mb-1 ${
                          isSelected ? "text-white" : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? "text-white/90" : "text-muted-foreground"
                        }`}
                      >
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="absolute top-2 right-2 h-5 w-5 text-white drop-shadow-lg" />
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Settings Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • The selected UI template will be applied to all school reports generated by users.
            </p>
            <p>
              • When report generation is disabled, only administrators can generate reports.
            </p>
            <p>
              • Changes to settings take effect immediately for all new report generations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

