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

type StaffRole = 
  | "Headteacher"
  | "Deputy Headteacher"
  | "Senior Teacher"
  | "Head of Department"
  | "Subject Teacher"
  | "Librarian"
  | "Guidance Counselor"
  | "School Secretary"
  | "Bursar"
  | "Laboratory Technician"
  | "IT Coordinator";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  department?: string;
  subjects?: string[];
}

// Mock data - in real app, this would come from the database
const initialStaffMembers: StaffMember[] = [
  {
    id: "T001",
    name: "Dr. James Banda",
    email: "james.banda@school.mw",
    phone: "+265 991 111 111",
    role: "Headteacher",
    department: "Administration",
  },
  {
    id: "T002",
    name: "Mrs. Sarah Mwale",
    email: "sarah.mwale@school.mw",
    phone: "+265 991 222 222",
    role: "Deputy Headteacher",
    department: "Administration",
  },
  {
    id: "T003",
    name: "Mr. Peter Phiri",
    email: "peter.phiri@school.mw",
    phone: "+265 991 333 333",
    role: "Senior Teacher",
    department: "Sciences",
    subjects: ["Physics", "Mathematics"],
  },
];

const staffRoles: StaffRole[] = [
  "Headteacher",
  "Deputy Headteacher",
  "Senior Teacher",
  "Head of Department",
  "Subject Teacher",
  "Librarian",
  "Guidance Counselor",
  "School Secretary",
  "Bursar",
  "Laboratory Technician",
  "IT Coordinator",
];

export function EditStaffRolesForm() {
  const router = useRouter();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewPosition, setShowNewPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    positionName: "",
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  const groupedByRole = staffMembers.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<StaffRole, StaffMember[]>);

  // Get all unique roles from members and combine with predefined roles
  const allRoles = [
    ...new Set([
      ...staffRoles,
      ...staffMembers.map((m) => m.role),
    ]),
  ] as StaffRole[];

  const handleAddMember = (role: StaffRole) => {
    const newMember: StaffMember = {
      id: `T${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      role,
      department: "",
      subjects: [],
    };
    setStaffMembers([...staffMembers, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    setStaffMembers(staffMembers.filter((m) => m.id !== id));
  };

  const handleUpdateMember = (id: string, field: keyof StaffMember, value: string | string[]) => {
    setStaffMembers(
      staffMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleAddNewPosition = () => {
    if (newPosition.positionName.trim() && newPosition.name.trim() && newPosition.email.trim()) {
      const newMember: StaffMember = {
        id: `T${Date.now()}`,
        name: newPosition.name,
        email: newPosition.email,
        phone: newPosition.phone || "",
        role: newPosition.positionName as StaffRole,
        department: newPosition.department || "",
        subjects: [],
      };
      setStaffMembers([...staffMembers, newMember]);
      // Reset form
      setNewPosition({
        positionName: "",
        name: "",
        email: "",
        phone: "",
        department: "",
      });
      setShowNewPosition(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    router.push("/dashboard/school-council/staff-roles");
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
                    Manage staff members assigned to this position
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
                  No members assigned to this position
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
                        <Label htmlFor={`department-${member.id}`}>Department</Label>
                        <Input
                          id={`department-${member.id}`}
                          value={member.department || ""}
                          onChange={(e) =>
                            handleUpdateMember(member.id, "department", e.target.value)
                          }
                          placeholder="Department name"
                        />
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
                Create a new staff position and assign a member to it
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
                    placeholder="Enter new position name (e.g., Assistant Headteacher)"
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
                  <Label htmlFor="new-department">Department</Label>
                  <Input
                    id="new-department"
                    value={newPosition.department}
                    onChange={(e) =>
                      setNewPosition({ ...newPosition, department: e.target.value })
                    }
                    placeholder="Department name"
                  />
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
                      department: "",
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
        <Link href="/dashboard/school-council/staff-roles">
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

