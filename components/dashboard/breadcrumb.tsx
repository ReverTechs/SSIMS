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
      className="mb-3 animate-fade-in-up opacity-0"
      style={{ animationDelay: "100ms" }}
    >
      <ol className="flex items-center gap-1.5 text-sm font-normal flex-wrap">
        {/* Home icon */}
        <li>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            {item.isLast ? (
              <span
                className="text-foreground font-medium animate-fade-in-up opacity-0"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors animate-fade-in-up opacity-0"
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

