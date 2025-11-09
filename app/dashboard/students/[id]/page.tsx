import { redirect } from "next/navigation";
import { StudentProfilePage } from "@/components/profile/student-profile-page";

// Mock data - in production, this would come from the database
const students: Record<string, {
  id: string;
  name: string;
  email: string;
  phone?: string;
  class?: string;
  subjects?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
}> = {
  "STU2024001": {
    id: "STU2024001",
    name: "John Doe",
    email: "john.doe@school.mw",
    phone: "+265 991 123 456",
    class: "Form 4A",
    subjects: ["Mathematics", "English", "Physics"],
    gender: "male",
    dateOfBirth: "2008-05-15",
    address: "Lilongwe, Malawi",
    guardianName: "Jane Doe",
    guardianPhone: "+265 991 123 457",
    guardianRelationship: "Mother",
  },
  "STU2024002": {
    id: "STU2024002",
    name: "Jane Smith",
    email: "jane.smith@school.mw",
    phone: "+265 991 234 567",
    class: "Form 4A",
    subjects: ["Mathematics", "English", "Chemistry"],
    gender: "female",
    dateOfBirth: "2008-08-20",
    address: "Blantyre, Malawi",
    guardianName: "John Smith",
    guardianPhone: "+265 991 234 568",
    guardianRelationship: "Father",
  },
  "STU2024003": {
    id: "STU2024003",
    name: "Peter Banda",
    email: "peter.banda@school.mw",
    phone: "+265 991 345 678",
    class: "Form 4A",
    subjects: ["Mathematics", "Physics", "Biology"],
    gender: "male",
    dateOfBirth: "2008-03-10",
    address: "Mzuzu, Malawi",
    guardianName: "Mary Banda",
    guardianPhone: "+265 991 345 679",
    guardianRelationship: "Mother",
  },
  "STU2024004": {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    class: "Form 4B",
    subjects: ["English", "History", "Geography"],
    gender: "female",
    dateOfBirth: "2008-11-25",
    address: "Lilongwe, Malawi",
    guardianName: "Thomas Mwale",
    guardianPhone: "+265 991 456 790",
    guardianRelationship: "Father",
  },
  "STU2024005": {
    id: "STU2024005",
    name: "David Phiri",
    email: "david.phiri@school.mw",
    phone: "+265 991 567 890",
    class: "Form 4B",
    subjects: ["Mathematics", "Chemistry", "Biology"],
    gender: "male",
    dateOfBirth: "2008-07-18",
    address: "Blantyre, Malawi",
    guardianName: "Sarah Phiri",
    guardianPhone: "+265 991 567 891",
    guardianRelationship: "Mother",
  },
  "STU2024006": {
    id: "STU2024006",
    name: "Grace Jere",
    email: "grace.jere@school.mw",
    phone: "+265 991 678 901",
    class: "Form 4B",
    subjects: ["English", "Mathematics", "Physics"],
    gender: "female",
    dateOfBirth: "2008-09-12",
    address: "Lilongwe, Malawi",
    guardianName: "Michael Jere",
    guardianPhone: "+265 991 678 902",
    guardianRelationship: "Father",
  },
};

export default async function StudentProfilePageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = students[id];

  if (!student) {
    redirect("/dashboard/students");
  }

  return <StudentProfilePage student={student} />;
}


