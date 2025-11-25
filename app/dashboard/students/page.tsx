import { getAllStudents } from "@/lib/data/students";
import { StudentsTable } from "./students-table";

export default async function StudentsPage() {
  const students = await getAllStudents();

  return (
    <div className="space-y-6">
      <StudentsTable students={students} />
    </div>
  );
}









