import { redirect } from "next/navigation";
import { TeacherProfilePage } from "@/components/profile/teacher-profile-page";
import { getTeacherProfile } from "@/lib/data/teachers";

export default async function TeacherProfilePageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Fetch teacher data from database
  const teacher = await getTeacherProfile(id);

  if (!teacher) {
    redirect("/dashboard/teachers");
  }

  return <TeacherProfilePage teacher={teacher} />;
}



