import { getAllTeachers } from "@/lib/data/teachers";
import { TeachersTable } from "./teachers-table";

export default async function TeachersPage() {
  const teachers = await getAllTeachers();

  return (
    <div className="space-y-6">
      <TeachersTable data={teachers} />
    </div>
  );
}





