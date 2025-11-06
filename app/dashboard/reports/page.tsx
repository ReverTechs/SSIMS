import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function ReportsPage() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School Reports</h1>
        <p className="text-muted-foreground">
          Download your academic reports and progress cards
        </p>
      </div>

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
              <strong>Availability:</strong> Reports are generated at the end
              of each term and are available for download.
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



