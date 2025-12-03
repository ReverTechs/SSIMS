import { getClasses } from "@/actions/enrollment/classes";
import { RegisterStudentForm } from "./register-student-form";
import { BulkRegistrationCard } from "./bulk-registration-card";

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
        <BulkRegistrationCard />
      </div>
    </div>
  );
}






