import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { AboutSchoolContent } from "./about-school-content";

export default async function AboutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <AboutSchoolContent userRole={user.role} />
    </div>
  );
}



