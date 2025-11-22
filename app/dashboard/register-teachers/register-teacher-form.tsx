"use client";

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

interface RegisterTeacherFormProps {
  departments: Department[];
}

export function RegisterTeacherForm({ departments }: RegisterTeacherFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Select>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="middleName">
            Middle Name <span className="text-muted-foreground text-xs">(Optional)</span>
          </Label>
          <Input id="middleName" placeholder="D." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select required>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="teacher@school.mw" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employeeId">Employee ID</Label>
        <Input id="employeeId" placeholder="EMP001" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Select>
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="subjects">Subjects</Label>
        <Input
          id="subjects"
          placeholder="Mathematics, Physics (comma separated)"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select>
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
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="verify" />
        <Label htmlFor="verify" className="text-sm">
          Verify teacher information
        </Label>
      </div>
      <Button className="w-full">
        <Shield className="h-4 w-4 mr-2" />
        Register Teacher
      </Button>
    </div>
  );
}

