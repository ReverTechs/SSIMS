import { redirect } from "next/navigation";
import { TeacherProfilePage } from "@/components/profile/teacher-profile-page";

// Mock data - in production, this would come from the database
const teachers: Record<string, {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  classes?: string[];
  totalStudents?: number;
  address?: string;
}> = {
  "T001": {
    id: "T001",
    name: "Mr. Banda",
    email: "banda@school.mw",
    phone: "+265 991 111 111",
    subjects: ["Mathematics"],
    department: "Mathematics",
    gender: "male",
    dateOfBirth: "1985-05-15",
    yearsOfExperience: 8,
    qualification: "M.Ed. Mathematics",
    specialization: "Pure Mathematics",
    classes: ["Form 4A", "Form 4B"],
    totalStudents: 45,
    address: "Lilongwe, Malawi",
  },
  "T002": {
    id: "T002",
    name: "Mrs. Mwale",
    email: "mwale@school.mw",
    phone: "+265 991 222 222",
    subjects: ["English"],
    department: "Languages",
    gender: "female",
    dateOfBirth: "1990-03-20",
    yearsOfExperience: 5,
    qualification: "B.Ed. English",
    specialization: "Literature",
    classes: ["Form 4A", "Form 4B", "Form 5A"],
    totalStudents: 60,
    address: "Blantyre, Malawi",
  },
  "T003": {
    id: "T003",
    name: "Mr. Phiri",
    email: "phiri@school.mw",
    phone: "+265 991 333 333",
    subjects: ["Physics"],
    department: "Sciences",
    gender: "male",
    dateOfBirth: "1988-07-10",
    yearsOfExperience: 6,
    qualification: "M.Sc. Physics",
    specialization: "Quantum Physics",
    classes: ["Form 4A", "Form 5A"],
    totalStudents: 50,
    address: "Mzuzu, Malawi",
  },
  "T004": {
    id: "T004",
    name: "Mrs. Kachale",
    email: "kachale@school.mw",
    phone: "+265 991 444 444",
    subjects: ["Chemistry"],
    department: "Sciences",
    gender: "female",
    dateOfBirth: "1992-11-25",
    yearsOfExperience: 4,
    qualification: "B.Sc. Chemistry",
    specialization: "Organic Chemistry",
    classes: ["Form 4B", "Form 5A"],
    totalStudents: 55,
    address: "Lilongwe, Malawi",
  },
  "T005": {
    id: "T005",
    name: "Mr. Mbewe",
    email: "mbewe@school.mw",
    phone: "+265 991 555 555",
    subjects: ["Biology"],
    department: "Sciences",
    gender: "male",
    dateOfBirth: "1987-09-12",
    yearsOfExperience: 7,
    qualification: "M.Sc. Biology",
    specialization: "Marine Biology",
    classes: ["Form 4A", "Form 4B"],
    totalStudents: 48,
    address: "Blantyre, Malawi",
  },
  "T006": {
    id: "T006",
    name: "Mr. Jere",
    email: "jere@school.mw",
    phone: "+265 991 666 666",
    subjects: ["History"],
    department: "Social Studies",
    gender: "male",
    dateOfBirth: "1986-02-18",
    yearsOfExperience: 9,
    qualification: "M.A. History",
    specialization: "African History",
    classes: ["Form 4A", "Form 4B", "Form 5A"],
    totalStudents: 65,
    address: "Lilongwe, Malawi",
  },
  "T007": {
    id: "T007",
    name: "Mrs. Tembo",
    email: "tembo@school.mw",
    phone: "+265 991 777 777",
    subjects: ["Geography"],
    department: "Social Studies",
    gender: "female",
    dateOfBirth: "1989-06-30",
    yearsOfExperience: 6,
    qualification: "B.Ed. Geography",
    specialization: "Physical Geography",
    classes: ["Form 4B", "Form 5A"],
    totalStudents: 52,
    address: "Mzuzu, Malawi",
  },
};

export default async function TeacherProfilePageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = teachers[id];

  if (!teacher) {
    redirect("/dashboard/teachers");
  }

  return <TeacherProfilePage teacher={teacher} />;
}



