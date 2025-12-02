"use client";

import { useActionState, useState, useEffect } from "react";
import { registerTeacher } from "@/app/actions/register-teacher";
import { getSubjectsByDepartment, Subject } from "@/app/actions/get-subjects";
import { getClasses, Class } from "@/app/actions/get-classes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield } from "lucide-react";
import { Department } from "@/lib/data/departments";
import { toast } from 'sonner';

interface RegisterTeacherFormProps {
  departments: Department[];
}

export function RegisterTeacherForm({ departments }: RegisterTeacherFormProps) {
  const [state, action, isPending] = useActionState(registerTeacher, {
    message: "",
    errors: {},
    success: false,
  });
  const [isVerified, setIsVerified] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      const classes = await getClasses();
      setAvailableClasses(classes);
    };
    fetchClasses();
  }, []);

  // Show toast and reset form on success
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || 'Teacher registered successfully!');
      const form = document.querySelector("form") as HTMLFormElement;
      if (form) form.reset();
      setIsVerified(false);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.success, state.message]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Select name="title" defaultValue="mr">
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mr">Mr.</SelectItem>
              <SelectItem value="mrs">Mrs.</SelectItem>
              <SelectItem value="ms">Ms.</SelectItem>
              <SelectItem value="dr">Dr.</SelectItem>
              <SelectItem value="prof">Prof.</SelectItem>
              <SelectItem value="rev">Rev.</SelectItem>
            </SelectContent>
          </Select>
          {state.errors?.title && (
            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" placeholder="John" />
          {state.errors?.firstName && (
            <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="middleName">
            Middle Name <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <Input id="middleName" name="middleName" placeholder="D." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" placeholder="Doe" />
          {state.errors?.lastName && (
            <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select name="gender" required>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.gender && (
          <p className="text-sm text-red-500">{state.errors.gender[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="teacher@school.mw" />
        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input id="employeeId" name="employeeId" placeholder="EMP001" />
        {state.errors?.employeeId && (
          <p className="text-sm text-red-500">{state.errors.employeeId[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select
          name="department"
          onValueChange={async (value) => {
            if (value && value !== 'no-departments') {
              const fetchedSubjects = await getSubjectsByDepartment(value);
              setAvailableSubjects(fetchedSubjects);
            } else {
              setAvailableSubjects([]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-departments" disabled>
                No departments available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        {state.errors?.department && (
          <p className="text-sm text-red-500">{state.errors.department[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Subjects <span className="text-red-500">*</span></Label>
        <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
          {availableSubjects.length > 0 ? (
            availableSubjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject.id}`}
                  name="subjectIds"
                  value={subject.id}
                />
                <Label htmlFor={`subject-${subject.id}`} className="text-sm font-normal cursor-pointer">
                  {subject.name} ({subject.code})
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Select a department to view subjects</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Select all subjects this teacher is qualified for.</p>
        {state.errors?.subjectIds && (
          <p className="text-sm text-red-500">{state.errors.subjectIds[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Teaching Classes <span className="text-red-500">*</span></Label>
        <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
          {availableClasses.length > 0 ? (
            availableClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`class-${classItem.id}`}
                  name="classIds"
                  value={classItem.id}
                />
                <Label htmlFor={`class-${classItem.id}`} className="text-sm font-normal cursor-pointer">
                  {classItem.name} (Grade {classItem.gradeLevel}, {classItem.academicYear})
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No classes available</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Select all classes this teacher will teach.</p>
        {state.errors?.classIds && (
          <p className="text-sm text-red-500">{state.errors.classIds[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role">
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="headteacher">Headteacher</SelectItem>
            <SelectItem value="deputy_headteacher">
              Deputy Headteacher
            </SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.role && (
          <p className="text-sm text-red-500">{state.errors.role[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="teacherType">Teacher Type</Label>
        <Select name="teacherType" defaultValue="permanent">
          <SelectTrigger>
            <SelectValue placeholder="Select teacher type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="temporary">Temporary</SelectItem>
            <SelectItem value="tp">TP (Teaching Practice)</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.teacherType && (
          <p className="text-sm text-red-500">{state.errors.teacherType[0]}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="verify"
          checked={isVerified}
          onCheckedChange={(checked) => setIsVerified(checked as boolean)}
        />
        <Label htmlFor="verify" className="text-sm">
          Verify teacher information
        </Label>
      </div>
      <Button className="w-full" disabled={!isVerified || isPending}>
        <Shield className="h-4 w-4 mr-2" />
        {isPending ? "Registering..." : "Register Teacher"}
      </Button>
    </form>
  );
}

