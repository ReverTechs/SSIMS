"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Map route segments to display names
const routeNameMap: Record<string, string> = {
  dashboard: "Home",
  students: "Students",
  teachers: "Teachers",
  subjects: "Subjects",
  grades: "Grades",
  "enter-grades": "Enter Grades",
  "upload-grades": "Upload Grades",
  "class-grades": "Class Grades",
  "academic-settings": "Academic Settings",
  "view-class-grades": "View Class Grades",
  "grade-trends": "Grade Trends",
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

// Mock data for student/teacher names - in production, this would come from an API
const studentNames: Record<string, string> = {
  "STU2024001": "John Doe",
  "STU2024002": "Jane Smith",
  "STU2024003": "Peter Banda",
  "STU2024004": "Mary Mwale",
  "STU2024005": "David Phiri",
  "STU2024006": "Grace Jere",
};

const teacherNames: Record<string, string> = {
  "T001": "Mr. Banda",
  "T002": "Mrs. Mwale",
  "T003": "Mr. Phiri",
  "T004": "Mrs. Kachale",
  "T005": "Mr. Mbewe",
  "T006": "Mr. Jere",
  "T007": "Mrs. Tembo",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const [dynamicName, setDynamicName] = useState<string | null>(null);
  
  // Split pathname into segments and filter out empty strings
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Check if we're on a dynamic route (students/[id] or teachers/[id])
  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);
    const isStudentRoute = segments[0] === "dashboard" && segments[1] === "students" && segments[2];
    const isTeacherRoute = segments[0] === "dashboard" && segments[1] === "teachers" && segments[2];
    
    if (isStudentRoute && segments[2]) {
      const studentId = segments[2];
      setDynamicName(studentNames[studentId] || studentId);
    } else if (isTeacherRoute && segments[2]) {
      const teacherId = segments[2];
      setDynamicName(teacherNames[teacherId] || teacherId);
    } else {
      setDynamicName(null);
    }
  }, [pathname]);
  
  // Build breadcrumb items (skip the dashboard segment as we show Home separately)
  const filteredSegments = pathSegments.filter((segment) => segment !== "dashboard");
  const breadcrumbItems = filteredSegments.map((segment, index) => {
    const segmentIndex = pathSegments.indexOf(segment);
    const href = "/" + pathSegments.slice(0, segmentIndex + 1).join("/");
    
    // Check if this is a dynamic segment (ID) and we have a name for it
    let label = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    
    // If this is the last segment and we have a dynamic name, use it
    if (index === filteredSegments.length - 1 && dynamicName) {
      // Check if the previous segment is "students" or "teachers"
      const prevSegment = filteredSegments[index - 1];
      if (prevSegment === "students" || prevSegment === "teachers") {
        label = dynamicName;
      }
    }
    
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

