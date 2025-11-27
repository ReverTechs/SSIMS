import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { getDepartments } from "@/lib/data/departments";
import { RegisterTeacherForm } from "./register-teacher-form";
import { BulkRegistrationCard } from "./bulk-registration-card";

export default async function RegisterTeachersPage() {
  const departments = await getDepartments();
  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Register Teachers
        </h1>
        <p className="text-muted-foreground">
          Register and verify new teachers in the system
        </p>
      </div> */}

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

        <BulkRegistrationCard />
      </div>
    </div>
  );
}





