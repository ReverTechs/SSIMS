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
  CalendarCheck,
  Clock9,
  PiggyBank,
  School,
  Users,
} from "lucide-react";

const managementAreas = [
  {
    title: "Manage Teachers",
    description: "Assign classes, review loads, and keep profiles updated.",
    href: "/dashboard/manage-teachers",
    icon: School,
    statLabel: "Active Profiles",
    statValue: "56",
  },
  {
    title: "Manage Students",
    description: "Update enrollments, guardians, and academic standing.",
    href: "/dashboard/management/students",
    icon: Users,
    statLabel: "Enrolled Learners",
    statValue: "824",
  },
  {
    title: "Manage Calendar",
    description: "Create reminders, term dates, and event notifications.",
    href: "/dashboard/management/calendar",
    icon: CalendarCheck,
    statLabel: "Live Events",
    statValue: "12",
  },
  {
    title: "Manage Timetable",
    description: "Balance class slots, rooms, and teacher allocations.",
    href: "/dashboard/management/timetable",
    icon: Clock9,
    statLabel: "Weekly Blocks",
    statValue: "48",
  },
  {
    title: "Manage Finances",
    description: "Track budgets, approvals, and collection progress.",
    href: "/dashboard/management/finances",
    icon: PiggyBank,
    statLabel: "Budget Coverage",
    statValue: "86%",
  },
  {
    title: "School Departments",
    description: "Add, modify, and manage.",
    href: "/dashboard/management/departments",
    icon: PiggyBank,
    statLabel: "Active Units",
    statValue: "10",
  },
];

const highlightMetrics = [
  {
    label: "Pending approvals",
    value: "7",
    description: "Items awaiting leadership action",
  },
  {
    label: "Data freshness",
    value: "94%",
    description: "Records updated in the last 48h",
  },
  {
    label: "Alerts resolved",
    value: "18",
    description: "Issues cleared this week",
  },
  {
    label: "Automation coverage",
    value: "64%",
    description: "Management tasks using workflows",
  },
];

export default function ManagementHubPage() {
  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="space-y-2">
        {/* <Badge variant="secondary" className="w-fit bg-amber-50 text-amber-800">
          Management Suite
        </Badge> */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Unified management control
          </h1>
          <p className="text-muted-foreground">
            Navigate every operational area from one modern, visual hub. Choose
            a card to drill into fine-grained actions.
          </p>
        </div>
      </div>

      <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {highlightMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="border border-border/70 bg-card/80"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-[0.7rem] uppercase tracking-wide">
                {metric.label}
              </CardDescription>
              <CardTitle className="text-xl font-semibold">
                {metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {metric.description}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
        {managementAreas.map((area) => {
          const Icon = area.icon;
          return (
            <Link
              key={area.title}
              href={area.href}
              className="group block h-full"
            >
              <Card className="relative h-full border border-border/70 bg-card/90 transition-colors duration-150 hover:border-primary">
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-border/70 bg-background p-2 text-amber-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{area.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {area.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-3">
                  <div className="flex items-baseline gap-2 text-sm">
                    <p className="text-2xl font-semibold">{area.statValue}</p>
                    <span className="text-xs text-muted-foreground">
                      {area.statLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-primary">
                    <span>Open workspace</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
