"use client";

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
  // Flatten all members with their role info for individual cards
  const allMembersWithRoleInfo = staffMembers.map((member) => {
    const Icon = roleIcons[member.role];
    const colorGradient = roleColors[member.role];
    const hierarchy = roleHierarchy[member.role];
    
    const roleDescription = 
      hierarchy === 1 ? "Chief administrator and academic leader" :
      hierarchy === 2 ? "Assists headteacher in administrative duties" :
      hierarchy === 3 ? "Experienced teacher with additional responsibilities" :
      hierarchy === 4 ? "Leads subject department and curriculum" :
      hierarchy === 5 ? "Teaches specific subjects" :
      hierarchy === 6 ? "Manages library resources and services" :
      hierarchy === 7 ? "Provides student guidance and counseling" :
      hierarchy === 8 ? "Handles administrative documentation" :
      hierarchy === 9 ? "Manages school finances and accounts" :
      hierarchy === 10 ? "Supports science laboratory activities" :
      "Manages IT infrastructure and systems";
    
    return {
      ...member,
      Icon,
      colorGradient,
      hierarchy,
      roleDescription,
    };
  });

  // Sort by hierarchy first, then by name
  const sortedMembers = allMembersWithRoleInfo.sort((a, b) => {
    if (a.hierarchy !== b.hierarchy) {
      return a.hierarchy - b.hierarchy;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8">
      {/* Role Summary Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedRoles.map((role) => {
          const members = groupedStaff[role];
          const Icon = roleIcons[role];
          const colorGradient = roleColors[role];
          
          return (
            <div
              key={role}
              className="relative group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient}/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative flex items-center gap-3">
                <div className={cn(
                  "p-2.5 rounded-xl text-white shadow-md",
                  `bg-gradient-to-br ${colorGradient}`
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{role}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {members.length} {members.length === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Position Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Staff Positions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedMembers.map((member, index) => {
            const { Icon, colorGradient, roleDescription } = member;
            
            return (
              <div
                key={member.id}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 30}ms`,
                }}
              >
                {/* Gradient Background Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colorGradient}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative p-5 space-y-4">
                  {/* Role Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn(
                      "p-3 rounded-xl text-white shadow-lg flex-shrink-0",
                      `bg-gradient-to-br ${colorGradient}`
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs font-medium bg-background/50 backdrop-blur-sm border-border/50"
                    >
                      {member.role}
                    </Badge>
                  </div>

                  {/* Member Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-border/50 shadow-sm">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className={cn(
                          "text-white font-semibold text-sm",
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
                        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                          {member.name}
                        </h3>
                        {member.department && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {member.department}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {roleDescription}
                    </p>

                    {/* Subjects */}
                    {member.subjects && member.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {member.subjects.map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="text-xs font-normal bg-muted/50"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1.5 pt-2 border-t border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}






