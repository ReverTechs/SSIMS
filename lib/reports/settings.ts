import { ReportUIType } from "@/components/reports/school-report-settings-content";

export interface SchoolReportSettings {
  enabled: boolean;
  selectedUI: ReportUIType;
}

const DEFAULT_SETTINGS: SchoolReportSettings = {
  enabled: true,
  selectedUI: "default",
};

/**
 * Get the current school report settings from localStorage
 * This should be replaced with a database call in production
 */
export function getSchoolReportSettings(): SchoolReportSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem("schoolReportSettings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings) as SchoolReportSettings;
      return {
        enabled: parsed.enabled ?? true,
        selectedUI: parsed.selectedUI ?? "default",
      };
    }

    // Fallback to legacy format for backward compatibility
    const legacyDisabled = localStorage.getItem("reportGenerationDisabled");
    if (legacyDisabled === "true") {
      return {
        ...DEFAULT_SETTINGS,
        enabled: false,
      };
    }
  } catch (error) {
    console.error("Error loading school report settings:", error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save school report settings to localStorage
 * This should be replaced with a database call in production
 */
export function saveSchoolReportSettings(settings: SchoolReportSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("schoolReportSettings", JSON.stringify(settings));
    // Also update legacy format for backward compatibility
    localStorage.setItem("reportGenerationDisabled", (!settings.enabled).toString());
  } catch (error) {
    console.error("Error saving school report settings:", error);
  }
}

/**
 * Get the selected UI type for report generation
 */
export function getSelectedReportUI(): ReportUIType {
  const settings = getSchoolReportSettings();
  return settings.selectedUI;
}

/**
 * Check if report generation is enabled
 */
export function isReportGenerationEnabled(): boolean {
  const settings = getSchoolReportSettings();
  return settings.enabled;
}






