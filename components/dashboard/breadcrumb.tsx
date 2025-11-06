"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Map route segments to display names
const routeNameMap: Record<string, string> = {
  dashboard: "Home",
  students: "Students",
  teachers: "Teachers",
  subjects: "Subjects",
  grades: "Grades",
  "enter-grades": "Enter Grades",
  fees: "Fees",
  reports: "Reports",
  profile: "Profile",
  announcements: "Announcements",
  calendar: "Calendar",
  timetable: "Timetable",
  "manage-teachers": "Manage Teachers",
  "register-students": "Register Students",
  "register-teachers": "Register Teachers",
  passwords: "Passwords",
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Split pathname into segments and filter out empty strings
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb items (skip the dashboard segment as we show Home separately)
  const filteredSegments = pathSegments.filter((segment) => segment !== "dashboard");
  const breadcrumbItems = filteredSegments.map((segment, index) => {
    const segmentIndex = pathSegments.indexOf(segment);
    const href = "/" + pathSegments.slice(0, segmentIndex + 1).join("/");
    const label = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isLast = index === filteredSegments.length - 1;
    
    return {
      href,
      label,
      isLast,
    };
  });

  // Don't show breadcrumb if we're on the home page
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 sm:mb-6 animate-fade-in-up opacity-0"
      style={{ animationDelay: "100ms" }}
    >
      <ol className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium flex-wrap">
        {/* Home icon */}
        <li>
          <Link
            href="/dashboard"
            className="group flex items-center gap-1 sm:gap-1.5 transition-all duration-300 hover:scale-105"
          >
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 group-hover:from-blue-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 border border-blue-500/20 dark:border-blue-400/20 group-hover:border-blue-500/40 dark:group-hover:border-blue-400/40 transition-all duration-300">
              <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
            </div>
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1 sm:gap-1.5">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/40 dark:text-muted-foreground/50 flex-shrink-0" />
            {item.isLast ? (
              <span
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg font-semibold text-foreground",
                  "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10",
                  "border border-blue-500/30 dark:border-blue-400/30",
                  "shadow-sm shadow-blue-500/5 dark:shadow-blue-400/5",
                  "animate-fade-in-up opacity-0",
                  "text-xs sm:text-sm"
                )}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all duration-300",
                  "text-muted-foreground hover:text-foreground",
                  "hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30",
                  "hover:border hover:border-border",
                  "animate-fade-in-up opacity-0",
                  "text-xs sm:text-sm"
                )}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

