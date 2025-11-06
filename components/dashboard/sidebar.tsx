"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  DollarSign,
  FileText,
  User,
  Bell,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Settings,
  Shield,
  AlertCircle,
  Key,
  School,
} from "lucide-react";
import { UserRole } from "@/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "teacher", "headteacher", "deputy_headteacher", "guardian", "admin"],
  },
  {
    title: "Grades",
    href: "/dashboard/grades",
    icon: BookOpen,
    roles: ["student", "teacher", "guardian"],
  },
  {
    title: "Enter Grades",
    href: "/dashboard/enter-grades",
    icon: BookOpen,
    roles: ["teacher", "headteacher", "deputy_headteacher"],
  },
  {
    title: "Fees",
    href: "/dashboard/fees",
    icon: DollarSign,
    roles: ["student"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    roles: ["student", "teacher", "guardian"],
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["student", "teacher", "headteacher", "deputy_headteacher", "guardian", "admin"],
  },
  {
    title: "Announcements",
    href: "/dashboard/announcements",
    icon: Bell,
    roles: ["student", "teacher", "headteacher", "deputy_headteacher", "guardian"],
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    roles: ["student", "teacher", "headteacher", "deputy_headteacher", "guardian"],
  },
  {
    title: "Timetable",
    href: "/dashboard/timetable",
    icon: Clock,
    roles: ["student", "teacher", "headteacher", "deputy_headteacher", "guardian"],
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["teacher", "headteacher", "deputy_headteacher"],
  },
  {
    title: "Subjects",
    href: "/dashboard/subjects",
    icon: GraduationCap,
    roles: ["student", "guardian"],
  },
  {
    title: "Teachers",
    href: "/dashboard/teachers",
    icon: School,
    roles: ["student", "guardian", "headteacher", "deputy_headteacher"],
  },
  {
    title: "Manage Teachers",
    href: "/dashboard/manage-teachers",
    icon: Settings,
    roles: ["headteacher", "deputy_headteacher"],
  },
  {
    title: "Register Students",
    href: "/dashboard/register-students",
    icon: Shield,
    roles: ["admin"],
  },
  {
    title: "Register Teachers",
    href: "/dashboard/register-teachers",
    icon: Shield,
    roles: ["admin"],
  },
  {
    title: "Generate Passwords",
    href: "/dashboard/passwords",
    icon: Key,
    roles: ["admin"],
  },
  {
    title: "System Reports",
    href: "/dashboard/system-reports",
    icon: AlertCircle,
    roles: ["admin"],
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">SSIMS</h2>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

