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
  Building2,
  Info,
} from "lucide-react";
import { UserRole } from "@/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type IconCategory =
  | "dashboard"
  | "academic"
  | "financial"
  | "reports"
  | "user"
  | "communication"
  | "management"
  | "security"
  | "information"
  | "settings";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  category: IconCategory;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
      "admin",
    ],
    category: "dashboard",
  },
  {
    title: "Grades",
    href: "/dashboard/grades",
    icon: BookOpen,
    roles: [
      "student",
      "teacher",
      "guardian",
      "headteacher",
      "deputy_headteacher",
      "admin",
    ],
    category: "academic",
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
    category: "financial",
  },
  {
    title: "School Reports",
    href: "/dashboard/reports",
    icon: FileText,
    roles: [
      "student",
      "teacher",
      "guardian",
      "headteacher",
      "deputy_headteacher",
      "admin",
    ],
    category: "reports",
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
      "admin",
    ],
    category: "user",
  },
  {
    title: "Announcements",
    href: "/dashboard/announcements",
    icon: Bell,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
    ],
    category: "communication",
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
    ],
    category: "communication",
  },
  {
    title: "Timetable",
    href: "/dashboard/timetable",
    icon: Clock,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
    ],
    category: "communication",
  },
  {
    title: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: ["teacher", "headteacher", "deputy_headteacher"],
    category: "academic",
  },
  {
    title: "Subjects",
    href: "/dashboard/subjects",
    icon: GraduationCap,
    roles: ["student", "guardian"],
    category: "academic",
  },
  {
    title: "Teachers",
    href: "/dashboard/teachers",
    icon: School,
    roles: ["teacher", "headteacher", "deputy_headteacher"],
    category: "academic",
  },
  {
    title: "School Council",
    href: "/dashboard/school-council",
    icon: Building2,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
      "admin",
    ],
    category: "information",
  },
  {
    title: "About",
    href: "/dashboard/about",
    icon: Info,
    roles: [
      "student",
      "teacher",
      "headteacher",
      "deputy_headteacher",
      "guardian",
      "admin",
    ],
    category: "information",
  },
  {
    title: "Manage Teachers",
    href: "/dashboard/manage-teachers",
    icon: Settings,
    roles: ["headteacher", "deputy_headteacher"],
    category: "management",
  },
  {
    title: "Registration",
    href: "/dashboard/registration",
    icon: Shield,
    roles: ["admin", "headteacher"],
    category: "security",
  },
  {
    title: "Generate Passwords",
    href: "/dashboard/passwords",
    icon: Key,
    roles: ["admin"],
    category: "security",
  },
  {
    title: "System Reports",
    href: "/dashboard/system-reports",
    icon: AlertCircle,
    roles: ["admin"],
    category: "reports",
  },
];

// Icon color mapping by category (Windows 11 style)
const getIconColor = (category: IconCategory, isActive: boolean) => {
  const colors: Record<IconCategory, string> = {
    dashboard: isActive
      ? "text-blue-600 dark:text-blue-400"
      : "text-blue-500 dark:text-blue-400",
    academic: isActive
      ? "text-purple-600 dark:text-purple-400"
      : "text-purple-500 dark:text-purple-400",
    financial: isActive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-emerald-500 dark:text-emerald-400",
    reports: isActive
      ? "text-orange-600 dark:text-orange-400"
      : "text-orange-500 dark:text-orange-400",
    user: isActive
      ? "text-cyan-600 dark:text-cyan-400"
      : "text-cyan-500 dark:text-cyan-400",
    communication: isActive
      ? "text-rose-600 dark:text-rose-400"
      : "text-rose-500 dark:text-rose-400",
    management: isActive
      ? "text-amber-600 dark:text-amber-400"
      : "text-amber-500 dark:text-amber-400",
    security: isActive
      ? "text-red-600 dark:text-red-400"
      : "text-red-500 dark:text-red-400",
    information: isActive
      ? "text-slate-600 dark:text-slate-400"
      : "text-slate-500 dark:text-slate-400",
    settings: isActive
      ? "text-gray-600 dark:text-gray-400"
      : "text-gray-500 dark:text-gray-400",
  };
  return colors[category];
};

interface SidebarProps {
  userRole: UserRole;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mobile?: boolean;
}

const SidebarContent = ({
  userRole,
  onLinkClick,
}: {
  userRole: UserRole;
  onLinkClick?: () => void;
}) => {
  const pathname = usePathname();
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Navigation */}
      <nav className="relative z-10 flex-1 space-y-0.5 p-3 overflow-y-auto scrollbar-thin pt-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          // Fix: For dashboard, only match exactly. For other routes, match exact or sub-paths
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/dashboard/"
              : pathname === item.href || pathname?.startsWith(item.href + "/");

          const iconColor = getIconColor(item.category, isActive);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/30 text-foreground shadow-sm border-l-2 border-blue-500 pl-2.5 pr-3"
                  : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50 px-3 border-l-2 border-transparent"
              )}
            >
              {/* Icon - colored only */}
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors duration-200",
                  iconColor
                )}
              />

              {/* Label */}
              <span className="flex-1 relative font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer decoration */}
      <div className="relative z-10 border-t border-border/50 p-4 bg-card/50 backdrop-blur-sm">
        <a
          href="https://rever-official.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <span className="font-medium">🛠️ REVER ENGINEERING</span>
        </a>
      </div>
    </>
  );
};

export function Sidebar({
  userRole,
  open,
  onOpenChange,
  mobile,
}: SidebarProps) {
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
          <div className="relative flex h-full w-full flex-col border-r border-border/50 bg-card/95 backdrop-blur-sm">
            <SidebarContent userRole={userRole} onLinkClick={handleLinkClick} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="relative hidden lg:flex h-full w-64 flex-col border-r border-border/50 bg-card/95 backdrop-blur-sm">
      <SidebarContent userRole={userRole} />
    </div>
  );
}
