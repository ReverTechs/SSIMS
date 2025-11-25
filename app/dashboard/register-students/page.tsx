import { getClasses } from "@/actions/classes";
import { RegisterStudentForm } from "./register-student-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function RegisterStudentsPage() {
  const classes = await getClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Register Students
        </h1>
        <p className="text-muted-foreground">
          Register and verify new students in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RegisterStudentForm classes={classes} />

        <Card>
          <CardHeader>
            <CardTitle>Bulk Registration</CardTitle>
            <CardDescription>
              Upload a CSV file to register multiple students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload CSV file with student information
              </p>
              <Button variant="outline">Choose File</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>CSV format should include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>First Name</li>
                <li>Last Name</li>
                <li>Email</li>
                <li>Student ID</li>
                <li>Student Type (Internal/External)</li>
                <li>Class</li>
                <li>Date of Birth</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






