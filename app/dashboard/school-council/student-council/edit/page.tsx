import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import { EditStudentCouncilForm } from "./edit-student-council-form";

export default async function EditStudentCouncilPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Define roles that can edit positions
  const canEditPositions: UserRole[] = [
    "headteacher",
    "deputy_headteacher",
    "admin",
  ];

  if (!canEditPositions.includes(user.role)) {
    redirect("/dashboard/school-council/student-council");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Student Council Positions</h1>
        <p className="text-muted-foreground mt-2">
          Update students assigned to each leadership position
        </p>
      </div>

      <EditStudentCouncilForm />
    </div>
  );
}





