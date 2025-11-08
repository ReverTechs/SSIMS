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
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

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
  // {
  //   title: "Enter Grades",
  //   href: "/dashboard/enter-grades",
  //   icon: BookOpen,
  //   roles: ["teacher", "headteacher", "deputy_headteacher"],
  // },
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
    roles: ["guardian", "headteacher", "deputy_headteacher"],
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mobile?: boolean;
}

const SidebarContent = ({ userRole, onLinkClick }: { userRole: UserRole; onLinkClick?: () => void }) => {
  const pathname = usePathname();
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin pt-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          // Fix: For dashboard, only match exactly. For other routes, match exact or sub-paths
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-normal transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-muted/50"
              )}
            >
              {/* Active indicator - subtle left border */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary" />
              )}
              
              {/* Icon */}
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              
              {/* Label */}
              <span className="flex-1 relative">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer decoration */}
      <div className="relative z-10 border-t border-border p-3 bg-card">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="font-normal">School Information System</span>
        </div>
      </div>
    </>
  );
};

export function Sidebar({ userRole, open, onOpenChange, mobile }: SidebarProps) {
  const handleLinkClick = () => {
    if (mobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="relative flex h-full w-full flex-col border-r border-border bg-card">
            <SidebarContent userRole={userRole} onLinkClick={handleLinkClick} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="relative hidden lg:flex h-full w-64 flex-col border-r border-border bg-card">
      <SidebarContent userRole={userRole} />
    </div>
  );
}

