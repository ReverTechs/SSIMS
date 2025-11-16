import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { GenerateSchoolReportDialog } from "@/components/reports/generate-school-report-dialog";
import { ReportGenerationStatus } from "@/components/reports/report-generation-status";
import Link from "next/link";

export default async function ReportsPage() {
  const user = await getCurrentUser();

  // Check if user can generate reports (headteacher, deputy_headteacher, teacher, or admin)
  const canGenerateReports =
    user &&
    (user.role === "headteacher" ||
      user.role === "deputy_headteacher" ||
      user.role === "teacher" ||
      user.role === "admin");

  const reports = [
    {
      id: "1",
      title: "Term 1 Report Card",
      academicYear: "2024",
      term: "Term 1",
      generatedAt: "2024-03-15",
      overallGrade: "A-",
    },
    {
      id: "2",
      title: "Term 2 Report Card",
      academicYear: "2024",
      term: "Term 2",
      generatedAt: "2024-06-15",
      overallGrade: "A",
    },
    {
      id: "3",
      title: "Mid-Year Progress Report",
      academicYear: "2024",
      term: "Mid-Year",
      generatedAt: "2024-05-01",
      overallGrade: "A-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Reports</h1>
          <p className="text-muted-foreground">
            Download your academic reports and progress cards
          </p>
        </div>
        {canGenerateReports && user && (
          <GenerateSchoolReportDialog userRole={user.role} />
        )}
      </div>

      <ReportGenerationStatus />

      {/* School Report Settings Navigation Card - Only visible to headteacher and deputy_headteacher */}
      {user &&
        (user.role === "headteacher" || user.role === "deputy_headteacher") && (
          <Link href="/dashboard/reports/settings">
            <Card className="group relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 via-amber-50/50 to-orange-50/50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-orange-950/20 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        School Report Settings
                        <Sparkles className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                      </CardTitle>
                      <CardDescription className="text-base mt-1">
                        Configure report generation UI and enable/disable the
                        feature
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform duration-300">
                    <span className="font-semibold hidden sm:inline">
                      Manage Settings
                    </span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>UI Template Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Feature Control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-orange-400" />
                    <span>Report Customization</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {report.overallGrade}
                </span>
              </div>
              <CardTitle className="mt-2">{report.title}</CardTitle>
              <CardDescription>
                {report.term} - {report.academicYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Generated: {new Date(report.generatedAt).toLocaleDateString()}
                </div>
                <Button className="w-full" variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Report Format:</strong> PDF documents containing detailed
              academic performance, attendance, and teacher remarks.
            </p>
            <p>
              <strong>Availability:</strong> Reports are generated at the end of
              each term and are available for download.
            </p>
            <p>
              <strong>Note:</strong> If you need a report that is not listed
              here, please contact the school administration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
