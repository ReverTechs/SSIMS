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
      {/* Decorative gradient overlay - subtle solid color */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-pink-950/20 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-2 p-4 overflow-y-auto scrollbar-thin pt-6">
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
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 border border-sky-400/50"
                  : "text-foreground hover:bg-muted hover:text-foreground border border-transparent hover:border-border"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-white/40 shadow-lg" />
              )}
              
              {/* Icon container */}
              <div
                className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  isActive
                    ? "bg-white/25 shadow-md"
                    : "bg-muted group-hover:bg-muted/80"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    isActive ? "text-white" : "text-foreground"
                  )}
                />
              </div>
              
              {/* Label */}
              <span className="flex-1 relative font-medium">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer decoration */}
      <div className="relative z-10 border-t border-border p-4 bg-card">
        <div className="flex items-center justify-center gap-2 text-xs text-foreground/70">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-light">School Information System</span>
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
    <div className="relative hidden lg:flex h-full w-72 flex-col border-r border-border bg-card">
      <SidebarContent userRole={userRole} />
    </div>
  );
}

