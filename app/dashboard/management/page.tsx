import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarCheck,
  Clock9,
  DollarSign,
  FileCheck,
  PiggyBank,
  School,
  Users,
  Activity,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/app/actions/get-dashboard-stats";

const managementAreas = [
  {
    title: "Manage Teachers",
    description: "Assign classes, review loads, and keep profiles updated.",
    href: "/dashboard/manage-teachers",
    icon: School,
    statLabel: "Active Profiles",
    statValue: "56", // Default fallback
    borderGradient: "border-blue-500/20",
    key: "teacherCount"
  },
  {
    title: "Manage Students",
    description: "Update enrollments, guardians, and academic standing.",
    href: "/dashboard/management/students",
    icon: Users,
    statLabel: "Enrolled Learners",
    statValue: "824", // Default fallback
    borderGradient: "border-emerald-500/20",
    key: "studentCount"
  },
  {
    title: "Fee Structures",
    description: "Create and manage term-based fees for internal and external students.",
    href: "/dashboard/management/fee-structures",
    icon: DollarSign,
    statLabel: "Active Structures",
    statValue: "6",
    borderGradient: "border-green-500/20",
  },
  {
    title: "Manage Calendar",
    description: "Create reminders, term dates, and event notifications.",
    href: "/dashboard/management/calendar",
    icon: CalendarCheck,
    statLabel: "Live Events",
    statValue: "12",
    borderGradient: "border-amber-500/20",
  },
  {
    title: "Manage Timetable",
    description: "Balance class slots, rooms, and teacher allocations.",
    href: "/dashboard/management/timetable",
    icon: Clock9,
    statLabel: "Weekly Blocks",
    statValue: "48",
    borderGradient: "border-pink-500/20",
  },
  {
    title: "Manage Finances",
    description: "Track budgets, approvals, and collection progress.",
    href: "/dashboard/management/finances",
    icon: PiggyBank,
    statLabel: "Budget Coverage",
    statValue: "86%",
    borderGradient: "border-blue-500/20",
  },
  {
    title: "Fee Clearances",
    description: "Review and approve student fee clearance requests.",
    href: "/dashboard/management/clearances",
    icon: FileCheck,
    statLabel: "Pending Requests",
    statValue: "0",
    borderGradient: "border-purple-500/20",
  },
  {
    title: "Departments-subjects",
    description: "Add, modify, and manage.",
    href: "/dashboard/management/departments-subjects",
    icon: PiggyBank,
    statLabel: "Active Units",
    statValue: "10",
    borderGradient: "border-emerald-500/20",
  },
  {
    title: "Sponsors",
    description: "Manage organizations providing financial aid to students.",
    href: "/dashboard/management/sponsors",
    icon: Building2,
    statLabel: "Active Sponsors",
    statValue: "0",
    borderGradient: "border-indigo-500/20",
  },
  {
    title: "Financial Aid",
    description: "Manage scholarships, bursaries, and student aid assignments.",
    href: "/dashboard/management/financial-aid",
    icon: Award,
    statLabel: "Aid Programs",
    statValue: "0",
    borderGradient: "border-teal-500/20",
  },
];

export const dynamic = 'force-dynamic';

export default async function ManagementHubPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">

      <div className="grid gap-4 md:grid-cols-3">
        {managementAreas.map((area) => {
          const Icon = area.icon;
          // Override statValue if a matching key exists in stats
          let displayValue = area.statValue;
          if (area.key === "studentCount") {
            displayValue = stats.studentCount.toString();
          } else if (area.key === "teacherCount") {
            displayValue = stats.teacherCount.toString();
          }

          return (
            <Link
              key={area.title}
              href={area.href}
              className="group block h-full"
            >
              <Card
                className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02]"
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-200",
                    area.borderGradient.replace('border-', 'from-').replace('/20', '')
                  )}
                />
                <CardHeader className="relative">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {area.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-sm mb-3">
                    {area.description}
                  </CardDescription>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold">{displayValue}</p>
                    <span className="text-xs text-muted-foreground">
                      {area.statLabel}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
