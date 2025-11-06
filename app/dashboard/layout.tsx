import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current authenticated user with their role
  const user = await getCurrentUser();

  // Redirect to login if user is not authenticated
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout userRole={user.role} user={user}>
      {children}
    </DashboardLayout>
  );
}

