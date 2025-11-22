import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { getDepartments } from "@/lib/data/departments";
import { RegisterTeacherForm } from "./register-teacher-form";

export default async function RegisterTeachersPage() {
  const departments = await getDepartments();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Register Teachers
        </h1>
        <p className="text-muted-foreground">
          Register and verify new teachers in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>New Teacher Registration</CardTitle>
            </div>
            <CardDescription>
              Add a new teacher to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterTeacherForm departments={departments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Registration</CardTitle>
            <CardDescription>
              Upload a CSV file to register multiple teachers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload CSV file with teacher information
              </p>
              <Button variant="outline">Choose File</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>CSV format should include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Title, First Name, Last Name</li>
                <li>Email</li>
                <li>Employee ID</li>
                <li>Department</li>
                <li>Subjects</li>
                <li>Role</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





