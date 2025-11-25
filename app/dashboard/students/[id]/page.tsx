import { redirect } from "next/navigation";
import { StudentProfilePage } from "@/components/profile/student-profile-page";
import { getStudentProfileForView } from "@/lib/data/students";

export default async function StudentProfilePageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch student data from database
  const student = await getStudentProfileForView(id);

  if (!student) {
    redirect("/dashboard/students");
  }

  return <StudentProfilePage student={student} />;
}
