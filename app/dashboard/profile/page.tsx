import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { TeacherProfileContent } from "./teacher-profile-content";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Mock teacher data - in production, this would come from the database
  const teacherData = {
    teacherId: "T001",
    department: "Mathematics",
    subjects: ["Mathematics", "Advanced Mathematics", "Statistics"],
    phoneNumber: "+265 991 234 567",
    address: "Lilongwe, Malawi",
    dateOfBirth: "1985-05-15",
    yearsOfExperience: 8,
    qualification: "M.Ed. Mathematics",
    specialization: "Pure Mathematics",
    classes: ["Form 4A", "Form 4B", "Form 5A"],
    totalStudents: 120,
  };

  return (
    <div className="space-y-6">
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div> */}

      {user.role === "teacher" || 
       user.role === "headteacher" || 
       user.role === "deputy_headteacher" ? (
        <TeacherProfileContent user={user} teacherData={teacherData} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Student profile view coming soon
          </p>
        </div>
      )}
    </div>
  );
}
