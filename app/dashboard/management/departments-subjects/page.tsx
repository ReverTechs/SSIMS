import { Suspense } from "react";
import { getDepartments } from "@/lib/data/departments";
import { getSubjects } from "@/lib/data/subjects";
import { getAllTeachers } from "@/lib/data/teachers";
import DepartmentsClient from "./departments-client";

export default async function ManagementDepartment() {
  const [departments, subjects, teachers] = await Promise.all([
    getDepartments(),
    getSubjects(),
    getAllTeachers(),
  ]);

  return (
    <DepartmentsClient
      departments={departments}
      allSubjects={subjects}
      teachers={teachers}
    />
  );
}
