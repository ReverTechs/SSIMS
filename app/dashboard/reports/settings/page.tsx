import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { SchoolReportSettingsContent } from "@/components/reports/school-report-settings-content";

export default async function SchoolReportSettingsPage() {
  const user = await getCurrentUser();

  // Only headteacher and deputy_headteacher can access this page
  if (!user || (user.role !== "headteacher" && user.role !== "deputy_headteacher")) {
    redirect("/dashboard/reports");
  }

  return (
    <SchoolReportSettingsContent />
  );
}






