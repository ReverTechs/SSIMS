import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import { EditStaffRolesForm } from "./edit-staff-roles-form";

export default async function EditStaffRolesPage() {
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
    redirect("/dashboard/school-council/staff-roles");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Staff Positions</h1>
        <p className="text-muted-foreground mt-2">
          Update staff members assigned to each position
        </p>
      </div>

      <EditStaffRolesForm />
    </div>
  );
}


