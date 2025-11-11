import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { UserRole } from "@/types";
import Link from "next/link";
import { StaffRolesContent } from "./staff-roles-content";

export default async function StaffRolesPage() {
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

  const hasEditPermission = canEditPositions.includes(user.role);

  return (
    <div className="space-y-6 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Roles</h1>
          <p className="text-muted-foreground mt-2">
            Organizational hierarchy of teaching and administrative staff
          </p>
        </div>
        {hasEditPermission && (
          <Link href="/dashboard/school-council/staff-roles/edit">
            <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Edit className="h-4 w-4" />
              Edit Positions
            </Button>
          </Link>
        )}
      </div>

      <StaffRolesContent />
    </div>
  );
}

