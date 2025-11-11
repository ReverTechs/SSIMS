import { getCurrentUser } from "@/lib/supabase/user";
import { redirect } from "next/navigation";
import { TeacherProfileContent } from "./teacher-profile-content";
import { StudentProfileContent } from "./student-profile-content";
import { GuardianProfileContent } from "./guardian-profile-content";
import { AdminProfileContent } from "./admin-profile-content";

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

  // Mock student data
  const studentData = {
    studentId: "S001",
    className: "Form 3A",
    subjects: ["Mathematics", "English", "Biology", "Geography"],
    phoneNumber: "+265 998 765 432",
    address: "Blantyre, Malawi",
    dateOfBirth: "2007-08-23",
    guardianName: "John Banda",
    guardianPhone: "+265 991 111 222",
    guardianRelationship: "Father",
  };

  // Mock guardian data
  const guardianData = {
    guardianId: "G001",
    relationship: "Mother",
    phoneNumber: "+265 992 222 333",
    address: "Mzuzu, Malawi",
    dependents: [
      { id: "S001", name: "Blessings Chilemba", className: "Form 3A" },
      { id: "S045", name: "Mary Chilemba", className: "Form 1B" },
    ],
  };

  // Mock admin data
  const adminData = {
    adminId: "A001",
    phoneNumber: "+265 993 333 444",
    address: "Zomba, Malawi",
    permissions: [
      "manage_users",
      "generate_passwords",
      "view_system_reports",
      "assign_roles",
    ],
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
      ) : user.role === "student" ? (
        <StudentProfileContent user={user} studentData={studentData} />
      ) : user.role === "guardian" ? (
        <GuardianProfileContent user={user} guardianData={guardianData} />
      ) : user.role === "admin" ? (
        <AdminProfileContent user={user} adminData={adminData} />
      ) : null}
    </div>
  );
}
