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
  FileCheck,
  AlertCircle,
  Key,
  School,
  Building2,
  Info,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Cog,
  Menu,
} from "lucide-react";
import { UserRole } from "@/types";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

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
    roles: ["teacher", "headteacher", "deputy_headteacher", "admin"],
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
    roles: ["teacher", "headteacher", "deputy_headteacher", "admin"],
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
    title: "Management",
    href: "/dashboard/management",
    icon: Settings,
    roles: ["headteacher", "deputy_headteacher"],
    category: "management",
  },
  {
    title: "Registration",
    href: "/dashboard/registration",
    icon: FileCheck,
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
  {
    title: "Academic Settings",
    href: "/dashboard/admin/academic-years",
    icon: Cog,
    roles: ["admin"],
    category: "management",
  },
  {
    title: "Promotions",
    href: "/dashboard/admin/promotions",
    icon: UserPlus,
    roles: ["admin"],
    category: "management",
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
  collapsed?: boolean;
  onCollapse?: () => void;
}

const SidebarContent = ({
  userRole,
  onLinkClick,
  collapsed,
  onCollapse,
  mobile,
}: {
  userRole: UserRole;
  onLinkClick?: () => void;
  collapsed?: boolean;
  onCollapse?: () => void;
  mobile?: boolean;
}) => {
  const pathname = usePathname();
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header / Logo Area */}
      <div
        className={cn(
          "flex items-center p-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
              <Image
                src="/images/Coat_of_arms_of_Malawi.svg.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold leading-none text-sm text-foreground">
                {" "}
                Wynberg Boys' High School
              </span>
              {/* <span className="font-bold leading-none text-sm text-foreground">
                University
              </span> */}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
            <Image
              src="/images/Coat_of_arms_of_Malawi.svg.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        )}

        {!mobile && !collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
            onClick={onCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
        {!mobile && collapsed && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
              onClick={onCollapse}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}

        <TooltipProvider delayDuration={0}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

            const iconColor = getIconColor(item.category, isActive);

            if (collapsed && !mobile) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onLinkClick}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto mb-2",
                        isActive
                          ? "bg-accent text-primary"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary" />
                      )}
                      <Icon
                        className={cn(
                          "h-5 w-5",
                          isActive ? "text-primary" : iconColor
                        )}
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 h-5 w-1 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : iconColor
                  )}
                />
                <span className="flex-1 truncate">{item.title}</span>
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Footer decoration */}
      {!collapsed && (
        <div className="p-4 mt-auto">
          <div className="rounded-xl bg-accent/50 p-4 border border-border/50">
            <p className="text-xs font-medium text-center text-muted-foreground">
              © 2024 SSIMS
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export function Sidebar({
  userRole,
  open,
  onOpenChange,
  mobile,
  collapsed,
  onCollapse,
}: SidebarProps) {
  const handleLinkClick = () => {
    if (mobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="w-72 p-0 border-r-0 bg-card text-foreground"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="h-full w-full bg-card">
            <SidebarContent
              userRole={userRole}
              onLinkClick={handleLinkClick}
              mobile
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300"
        // Glassmorphism effect if desired, but solid dark is safer for contrast
        // "bg-opacity-90 backdrop-blur-xl"
      )}
    >
      <SidebarContent
        userRole={userRole}
        collapsed={collapsed}
        onCollapse={onCollapse}
      />
    </div>
  );
}
