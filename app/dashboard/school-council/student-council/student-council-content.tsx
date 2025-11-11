"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Shield, 
  Award, 
  Star,
  Users,
  BookOpen,
  Mail,
  Phone,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define student council roles hierarchy for secondary school
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
  avatar?: string;
}

// Role hierarchy order (lower number = higher rank)
const roleHierarchy: Record<StudentRole, number> = {
  "Head Boy": 1,
  "Head Girl": 1,
  "Deputy Head Boy": 2,
  "Deputy Head Girl": 2,
  "Senior Prefect": 3,
  "Prefect": 4,
  "Class Monitor": 5,
  "Sports Captain": 6,
  "Library Prefect": 7,
  "Dining Hall Prefect": 8,
  "Health Prefect": 9,
  "Environmental Prefect": 10,
};

// Role icons mapping
const roleIcons: Record<StudentRole, typeof Crown> = {
  "Head Boy": Crown,
  "Head Girl": Crown,
  "Deputy Head Boy": Shield,
  "Deputy Head Girl": Shield,
  "Senior Prefect": Award,
  "Prefect": Star,
  "Class Monitor": Users,
  "Sports Captain": Award,
  "Library Prefect": BookOpen,
  "Dining Hall Prefect": Users,
  "Health Prefect": Users,
  "Environmental Prefect": Users,
};

// Role colors mapping
const roleColors: Record<StudentRole, string> = {
  "Head Boy": "from-amber-500 to-orange-600",
  "Head Girl": "from-pink-500 to-rose-600",
  "Deputy Head Boy": "from-blue-500 to-indigo-600",
  "Deputy Head Girl": "from-purple-500 to-pink-600",
  "Senior Prefect": "from-emerald-500 to-teal-600",
  "Prefect": "from-cyan-500 to-blue-600",
  "Class Monitor": "from-violet-500 to-purple-600",
  "Sports Captain": "from-orange-500 to-red-600",
  "Library Prefect": "from-indigo-500 to-blue-600",
  "Dining Hall Prefect": "from-green-500 to-emerald-600",
  "Health Prefect": "from-rose-500 to-pink-600",
  "Environmental Prefect": "from-teal-500 to-cyan-600",
};

// Mock data - students with roles
const studentMembers: StudentMember[] = [
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
  {
    id: "STU2024004",
    name: "Mary Mwale",
    email: "mary.mwale@school.mw",
    phone: "+265 991 456 789",
    role: "Deputy Head Girl",
    class: "Form 5A",
  },
  {
    id: "STU2024005",
    name: "David Phiri",
    email: "david.phiri@school.mw",
    phone: "+265 991 567 890",
    role: "Senior Prefect",
    class: "Form 5A",
  },
  {
    id: "STU2024006",
    name: "Grace Jere",
    email: "grace.jere@school.mw",
    phone: "+265 991 678 901",
    role: "Senior Prefect",
    class: "Form 5B",
  },
  {
    id: "STU2024007",
    name: "Michael Chisale",
    email: "michael.chisale@school.mw",
    phone: "+265 991 789 012",
    role: "Prefect",
    class: "Form 4A",
  },
  {
    id: "STU2024008",
    name: "Linda Nkhoma",
    email: "linda.nkhoma@school.mw",
    phone: "+265 991 890 123",
    role: "Prefect",
    class: "Form 4B",
  },
  {
    id: "STU2024009",
    name: "Robert Kamanga",
    email: "robert.kamanga@school.mw",
    phone: "+265 991 901 234",
    role: "Prefect",
    class: "Form 4A",
  },
  {
    id: "STU2024010",
    name: "Patricia Mvula",
    email: "patricia.mvula@school.mw",
    phone: "+265 992 012 345",
    role: "Class Monitor",
    class: "Form 4A",
  },
  {
    id: "STU2024011",
    name: "Charles Banda",
    email: "charles.banda@school.mw",
    phone: "+265 992 123 456",
    role: "Class Monitor",
    class: "Form 4B",
  },
  {
    id: "STU2024012",
    name: "Agnes Phiri",
    email: "agnes.phiri@school.mw",
    phone: "+265 992 234 567",
    role: "Sports Captain",
    class: "Form 5A",
  },
  {
    id: "STU2024013",
    name: "Thomas Mwale",
    email: "thomas.mwale@school.mw",
    phone: "+265 992 345 678",
    role: "Library Prefect",
    class: "Form 4A",
  },
  {
    id: "STU2024014",
    name: "Sarah Tembo",
    email: "sarah.tembo@school.mw",
    phone: "+265 992 456 789",
    role: "Dining Hall Prefect",
    class: "Form 4B",
  },
  {
    id: "STU2024015",
    name: "James Kachale",
    email: "james.kachale@school.mw",
    phone: "+265 992 567 890",
    role: "Health Prefect",
    class: "Form 5A",
  },
  {
    id: "STU2024016",
    name: "Ruth Jere",
    email: "ruth.jere@school.mw",
    phone: "+265 992 678 901",
    role: "Environmental Prefect",
    class: "Form 4A",
  },
];

// Group students by role and sort by hierarchy
const groupedStudents = studentMembers.reduce((acc, member) => {
  if (!acc[member.role]) {
    acc[member.role] = [];
  }
  acc[member.role].push(member);
  return acc;
}, {} as Record<StudentRole, StudentMember[]>);

// Sort roles by hierarchy
const sortedRoles = Object.keys(groupedStudents).sort(
  (a, b) => roleHierarchy[a as StudentRole] - roleHierarchy[b as StudentRole]
) as StudentRole[];

export function StudentCouncilContent() {
  return (
    <div className="space-y-6">
      {sortedRoles.map((role, roleIndex) => {
        const members = groupedStudents[role];
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
                    {roleHierarchy[role] === 1 && "Highest student leadership position, represents all students"}
                    {roleHierarchy[role] === 2 && "Assists Head Boy/Girl in leadership duties"}
                    {roleHierarchy[role] === 3 && "Senior student leader with additional responsibilities"}
                    {roleHierarchy[role] === 4 && "Student leader responsible for discipline and order"}
                    {roleHierarchy[role] === 5 && "Class representative and liaison with teachers"}
                    {roleHierarchy[role] === 6 && "Leads sports activities and teams"}
                    {roleHierarchy[role] === 7 && "Manages library activities and resources"}
                    {roleHierarchy[role] === 8 && "Oversees dining hall operations and cleanliness"}
                    {roleHierarchy[role] === 9 && "Promotes health and wellness initiatives"}
                    {roleHierarchy[role] === 10 && "Leads environmental conservation and cleanliness"}
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">
                            {member.class}
                          </Badge>
                        </div>
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

