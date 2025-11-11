"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Shield, 
  Award, 
  BookOpen, 
  GraduationCap,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define staff roles hierarchy for secondary school
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
  avatar?: string;
}

// Role hierarchy order (lower number = higher rank)
const roleHierarchy: Record<StaffRole, number> = {
  "Headteacher": 1,
  "Deputy Headteacher": 2,
  "Senior Teacher": 3,
  "Head of Department": 4,
  "Subject Teacher": 5,
  "Librarian": 6,
  "Guidance Counselor": 7,
  "School Secretary": 8,
  "Bursar": 9,
  "Laboratory Technician": 10,
  "IT Coordinator": 11,
};

// Role icons mapping
const roleIcons: Record<StaffRole, typeof Crown> = {
  "Headteacher": Crown,
  "Deputy Headteacher": Shield,
  "Senior Teacher": Award,
  "Head of Department": GraduationCap,
  "Subject Teacher": BookOpen,
  "Librarian": BookOpen,
  "Guidance Counselor": UserCheck,
  "School Secretary": UserCheck,
  "Bursar": UserCheck,
  "Laboratory Technician": UserCheck,
  "IT Coordinator": UserCheck,
};

// Role colors mapping
const roleColors: Record<StaffRole, string> = {
  "Headteacher": "from-amber-500 to-orange-600",
  "Deputy Headteacher": "from-blue-500 to-indigo-600",
  "Senior Teacher": "from-purple-500 to-pink-600",
  "Head of Department": "from-emerald-500 to-teal-600",
  "Subject Teacher": "from-cyan-500 to-blue-600",
  "Librarian": "from-violet-500 to-purple-600",
  "Guidance Counselor": "from-rose-500 to-pink-600",
  "School Secretary": "from-slate-500 to-gray-600",
  "Bursar": "from-green-500 to-emerald-600",
  "Laboratory Technician": "from-orange-500 to-red-600",
  "IT Coordinator": "from-indigo-500 to-blue-600",
};

// Mock data - teachers with roles
const staffMembers: StaffMember[] = [
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
  {
    id: "T004",
    name: "Mrs. Mary Kachale",
    email: "mary.kachale@school.mw",
    phone: "+265 991 444 444",
    role: "Head of Department",
    department: "Sciences",
    subjects: ["Chemistry"],
  },
  {
    id: "T005",
    name: "Mr. David Mbewe",
    email: "david.mbewe@school.mw",
    phone: "+265 991 555 555",
    role: "Head of Department",
    department: "Languages",
    subjects: ["English"],
  },
  {
    id: "T006",
    name: "Mr. John Jere",
    email: "john.jere@school.mw",
    phone: "+265 991 666 666",
    role: "Head of Department",
    department: "Social Studies",
    subjects: ["History", "Geography"],
  },
  {
    id: "T007",
    name: "Mrs. Grace Tembo",
    email: "grace.tembo@school.mw",
    phone: "+265 991 777 777",
    role: "Subject Teacher",
    department: "Sciences",
    subjects: ["Biology"],
  },
  {
    id: "T008",
    name: "Mr. Michael Chisale",
    email: "michael.chisale@school.mw",
    phone: "+265 991 888 888",
    role: "Subject Teacher",
    department: "Mathematics",
    subjects: ["Mathematics"],
  },
  {
    id: "T009",
    name: "Mrs. Linda Nkhoma",
    email: "linda.nkhoma@school.mw",
    phone: "+265 991 999 999",
    role: "Librarian",
    department: "Library",
  },
  {
    id: "T010",
    name: "Mr. Robert Kamanga",
    email: "robert.kamanga@school.mw",
    phone: "+265 991 000 000",
    role: "Guidance Counselor",
    department: "Student Services",
  },
  {
    id: "T011",
    name: "Mrs. Patricia Mvula",
    email: "patricia.mvula@school.mw",
    phone: "+265 992 111 111",
    role: "School Secretary",
    department: "Administration",
  },
  {
    id: "T012",
    name: "Mr. Charles Banda",
    email: "charles.banda@school.mw",
    phone: "+265 992 222 222",
    role: "Bursar",
    department: "Finance",
  },
  {
    id: "T013",
    name: "Mrs. Agnes Phiri",
    email: "agnes.phiri@school.mw",
    phone: "+265 992 333 333",
    role: "Laboratory Technician",
    department: "Sciences",
  },
  {
    id: "T014",
    name: "Mr. Thomas Mwale",
    email: "thomas.mwale@school.mw",
    phone: "+265 992 444 444",
    role: "IT Coordinator",
    department: "Technology",
  },
];

// Group staff by role and sort by hierarchy
const groupedStaff = staffMembers.reduce((acc, member) => {
  if (!acc[member.role]) {
    acc[member.role] = [];
  }
  acc[member.role].push(member);
  return acc;
}, {} as Record<StaffRole, StaffMember[]>);

// Sort roles by hierarchy
const sortedRoles = Object.keys(groupedStaff).sort(
  (a, b) => roleHierarchy[a as StaffRole] - roleHierarchy[b as StaffRole]
) as StaffRole[];

export function StaffRolesContent() {
  return (
    <div className="space-y-6">
      {sortedRoles.map((role, roleIndex) => {
        const members = groupedStaff[role];
        const Icon = roleIcons[role];
        const colorGradient = roleColors[role];

        return (
          <Card
            key={role}
            className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden"
            style={{
              animationDelay: `${(roleIndex + 1) * 100}ms`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient}/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
            
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-lg text-white shadow-lg",
                  `bg-gradient-to-br ${colorGradient}`
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {role}
                    <Badge variant="outline" className="ml-2">
                      {members.length} {members.length === 1 ? "member" : "members"}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {roleHierarchy[role] === 1 && "Chief administrator and academic leader"}
                    {roleHierarchy[role] === 2 && "Assists headteacher in administrative duties"}
                    {roleHierarchy[role] === 3 && "Experienced teacher with additional responsibilities"}
                    {roleHierarchy[role] === 4 && "Leads subject department and curriculum"}
                    {roleHierarchy[role] === 5 && "Teaches specific subjects"}
                    {roleHierarchy[role] === 6 && "Manages library resources and services"}
                    {roleHierarchy[role] === 7 && "Provides student guidance and counseling"}
                    {roleHierarchy[role] === 8 && "Handles administrative documentation"}
                    {roleHierarchy[role] === 9 && "Manages school finances and accounts"}
                    {roleHierarchy[role] === 10 && "Supports science laboratory activities"}
                    {roleHierarchy[role] === 11 && "Manages IT infrastructure and systems"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {members.map((member, memberIndex) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border bg-card/50 hover:bg-accent/30 transition-all duration-200 group/item"
                    style={{
                      animationDelay: `${(roleIndex * 100) + (memberIndex * 50)}ms`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className={cn(
                          "text-white font-semibold",
                          `bg-gradient-to-br ${colorGradient}`
                        )}>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate group-hover/item:text-primary transition-colors">
                          {member.name}
                        </h3>
                        {member.department && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {member.department}
                          </p>
                        )}
                        {member.subjects && member.subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.subjects.map((subject) => (
                              <Badge
                                key={subject}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

