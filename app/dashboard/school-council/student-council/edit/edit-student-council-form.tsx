"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type StudentRole = 
  | "Head Boy"
  | "Head Girl"
  | "Deputy Head Boy"
  | "Deputy Head Girl"
  | "Senior Prefect"
  | "Prefect"
  | "Class Monitor"
  | "Sports Captain"
  | "Library Prefect"
  | "Dining Hall Prefect"
  | "Health Prefect"
  | "Environmental Prefect";

interface StudentMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StudentRole;
  class: string;
}

// Mock data - in real app, this would come from the database
const initialStudentMembers: StudentMember[] = [
  {
    id: "STU2024001",
    name: "John Doe",
    email: "john.doe@school.mw",
    phone: "+265 991 123 456",
    role: "Head Boy",
    class: "Form 5A",
  },
  {
    id: "STU2024002",
    name: "Jane Smith",
    email: "jane.smith@school.mw",
    phone: "+265 991 234 567",
    role: "Head Girl",
    class: "Form 5A",
  },
  {
    id: "STU2024003",
    name: "Peter Banda",
    email: "peter.banda@school.mw",
    phone: "+265 991 345 678",
    role: "Deputy Head Boy",
    class: "Form 5B",
  },
];

const studentRoles: StudentRole[] = [
  "Head Boy",
  "Head Girl",
  "Deputy Head Boy",
  "Deputy Head Girl",
  "Senior Prefect",
  "Prefect",
  "Class Monitor",
  "Sports Captain",
  "Library Prefect",
  "Dining Hall Prefect",
  "Health Prefect",
  "Environmental Prefect",
];

const classOptions = [
  "Form 1A",
  "Form 1B",
  "Form 2A",
  "Form 2B",
  "Form 3A",
  "Form 3B",
  "Form 4A",
  "Form 4B",
  "Form 5A",
  "Form 5B",
];

export function EditStudentCouncilForm() {
  const router = useRouter();
  const [studentMembers, setStudentMembers] = useState<StudentMember[]>(initialStudentMembers);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewPosition, setShowNewPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    positionName: "",
    name: "",
    email: "",
    phone: "",
    class: "Form 1A",
  });

  const groupedByRole = studentMembers.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<StudentRole, StudentMember[]>);

  // Get all unique roles from members and combine with predefined roles
  const allRoles = [
    ...new Set([
      ...studentRoles,
      ...studentMembers.map((m) => m.role),
    ]),
  ] as StudentRole[];

  const handleAddMember = (role: StudentRole) => {
    const newMember: StudentMember = {
      id: `STU${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      role,
      class: "Form 1A",
    };
    setStudentMembers([...studentMembers, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    setStudentMembers(studentMembers.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: keyof StudentMember, value: string) => {
    setStudentMembers(
      studentMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleAddNewPosition = () => {
    if (newPosition.positionName.trim() && newPosition.name.trim() && newPosition.email.trim()) {
      const newMember: StudentMember = {
        id: `STU${Date.now()}`,
        name: newPosition.name,
        email: newPosition.email,
        phone: newPosition.phone || "",
        role: newPosition.positionName as StudentRole,
        class: newPosition.class,
      };
      setStudentMembers([...studentMembers, newMember]);
      // Reset form
      setNewPosition({
        positionName: "",
        name: "",
        email: "",
        phone: "",
        class: "Form 1A",
      });
      setShowNewPosition(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    router.push("/dashboard/school-council/student-council");
  };

  return (
    <div className="space-y-6">
      {allRoles.map((role) => {
        const members = groupedByRole[role] || [];
        return (
          <Card key={role}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{role}</CardTitle>
                  <CardDescription>
                    Manage students assigned to this position
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddMember(role)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No students assigned to this position
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 border rounded-lg space-y-4 bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{role}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${member.id}`}>Full Name</Label>
                        <Input
                          id={`name-${member.id}`}
                          value={member.name}
                          onChange={(e) =>
                            handleUpdateMember(member.id, "name", e.target.value)
                          }
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`email-${member.id}`}>Email</Label>
                        <Input
                          id={`email-${member.id}`}
                          type="email"
                          value={member.email}
                          onChange={(e) =>
                            handleUpdateMember(member.id, "email", e.target.value)
                          }
                          placeholder="email@school.mw"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${member.id}`}>Phone</Label>
                        <Input
                          id={`phone-${member.id}`}
                          value={member.phone || ""}
                          onChange={(e) =>
                            handleUpdateMember(member.id, "phone", e.target.value)
                          }
                          placeholder="+265 991 000 000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`class-${member.id}`}>Class</Label>
                        <Select
                          value={member.class}
                          onValueChange={(value) =>
                            handleUpdateMember(member.id, "class", value)
                          }
                        >
                          <SelectTrigger id={`class-${member.id}`}>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions.map((classOption) => (
                              <SelectItem key={classOption} value={classOption}>
                                {classOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Add New Position Section */}
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Position</CardTitle>
              <CardDescription>
                Create a new student council position and assign a student to it
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewPosition(!showNewPosition)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {showNewPosition ? "Hide Form" : "Add New Position"}
            </Button>
          </div>
        </CardHeader>
        {showNewPosition && (
          <CardContent>
            <div className="p-4 border rounded-lg space-y-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">New Position</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="new-position-name">Position Name</Label>
                  <Input
                    id="new-position-name"
                    value={newPosition.positionName}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, positionName: e.target.value })
                    }
                    placeholder="Enter new position name (e.g., Music Prefect)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-name">Full Name</Label>
                  <Input
                    id="new-name"
                    value={newPosition.name}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newPosition.email}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, email: e.target.value })
                    }
                    placeholder="email@school.mw"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Phone</Label>
                  <Input
                    id="new-phone"
                    value={newPosition.phone}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, phone: e.target.value })
                    }
                    placeholder="+265 991 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-class">Class</Label>
                  <Select
                    value={newPosition.class}
                    onValueChange={(value) =>
                      setNewPosition({ ...newPosition, class: value })
                    }
                  >
                    <SelectTrigger id="new-class">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classOptions.map((classOption) => (
                        <SelectItem key={classOption} value={classOption}>
                          {classOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewPosition(false);
                    setNewPosition({
                      positionName: "",
                      name: "",
                      email: "",
                      phone: "",
                      class: "Form 1A",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddNewPosition} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Position
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-between pt-4 border-t">
        <Link href="/dashboard/school-council/student-council">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

