import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/user";
import { PieCharts } from "@/components/dashboard/pie-charts";
import { AttendanceBarChart } from "@/components/dashboard/attendance-bar-chart";
import { getGreeting } from "@/utils/getGreeting";
import { getPermissionsForRole } from "@/lib/auth/permissions";
import { statsRegistry } from "@/lib/dashboard/widgets";
import FinanceChartClient from "@/components/dashboard/finance-chart-client";

const greeting = getGreeting();

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const permissions = user ? Array.from(getPermissionsForRole(user.role)) : [];
  const stats = permissions
    .filter((p) => p.startsWith("stats:"))
    .flatMap((p) => statsRegistry[p as keyof typeof statsRegistry] ?? []);
  const effectiveStats =
    stats.length > 0 ? stats : statsRegistry["stats:student:view"] ?? [];

  const events = [
    {
      title: "End of Term Exams",
      date: "March 15, 2024",
      time: "08:00 AM",
      type: "exam",
    },
    {
      title: "Parent-Teacher Meeting",
      date: "March 20, 2024",
      time: "02:00 PM",
      type: "meeting",
    },
  ];

  const schedule = [
    {
      subject: "Mathematics",
      period: "Period 1",
      time: "08:00 - 09:00",
      room: "Room 101",
    },
    {
      subject: "English",
      period: "Period 2",
      time: "09:00 - 10:00",
      room: "Room 205",
    },
    {
      subject: "Science",
      period: "Period 3",
      time: "10:30 - 11:30",
      room: "Lab 1",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-purple-600/3 to-pink-600/3 rounded-lg" />
        <div className="relative space-y-2 sm:space-y-3">
          {/* Profile Header Card */}
          <Card className="border bg-card">
            <CardContent className="pt-6">
              {/* Mobile View - Column Layout */}
              <div className="flex flex-col items-center gap-4 sm:hidden">
                <div className="relative">
                  <Avatar className="h-28 w-28 border-4 border-primary/30 shadow-lg">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.fullName ?? "User"}
                    />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
                      {user?.fullName ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 border-2 border-card shadow-sm"></div>
                </div>
                <div className="flex flex-col items-center gap-2 text-center w-full">
                  <p className="text-sm font-semibold text-muted-foreground tracking-wide">
                    {greeting}
                  </p>
                  <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                    {user?.fullName ?? "Guest"}
                  </h2>
                  {(user?.role === "teacher" ||
                    user?.role === "headteacher" ||
                    user?.role === "deputy_headteacher") && (
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {user?.role === "headteacher"
                            ? "Administration"
                            : user?.role === "deputy_headteacher"
                              ? "Administration"
                              : "Sciences"}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Desktop View - Row Layout */}
              <div className="hidden sm:flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.fullName ?? "User"}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user?.fullName ? getInitials(user.fullName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-base font-bold mb-2 text-muted-foreground">
                    {greeting}
                  </p>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {user?.fullName ?? "Guest"}
                    </h2>
                  </div>
                  {(user?.role === "teacher" ||
                    user?.role === "headteacher" ||
                    user?.role === "deputy_headteacher") && (
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-muted-foreground">
                            {user?.role === "headteacher"
                              ? "Administration"
                              : user?.role === "deputy_headteacher"
                                ? "Administration"
                                : "Sciences"}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {effectiveStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="group relative animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card
                    className={cn(
                      "relative border bg-card hover:bg-accent/50 transition-all duration-200",
                      stat.borderGradient
                    )}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={cn("p-1.5 rounded-md", stat.iconBg)}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="text-xl font-semibold tracking-tight">
                        {stat.value}
                      </div>
                      <p
                        className={cn(
                          "text-xs",
                          stat.changeType === "positive"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        )}
                      >
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-2.5 sm:gap-3 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Events */}
            <Card
              className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden animate-fade-in-up opacity-0"
              style={{ animationDelay: "400ms" }}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-0.5">
                      Upcoming Events
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Your calendar for this week
                    </CardDescription>
                  </div>
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="group/item flex items-start gap-3 p-2.5 rounded-md bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200 cursor-pointer"
                  >
                    <div className="mt-0.5 p-1 rounded-md bg-blue-500/10 group-hover/item:bg-blue-500/20 transition-colors flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors opacity-0 group-hover/item:opacity-100 transform translate-x-[-8px] group-hover/item:translate-x-0 flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card
              className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden animate-fade-in-up opacity-0"
              style={{ animationDelay: "500ms" }}
            >
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-0.5">
                      Today's Schedule
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Your timetable for today
                    </CardDescription>
                  </div>
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-2">
                {schedule.map((item, index) => (
                  <div
                    key={index}
                    className="group/item flex items-start gap-3 p-2.5 rounded-md bg-muted/50 hover:bg-muted border border-transparent hover:border-border transition-all duration-200 cursor-pointer"
                  >
                    <div className="mt-0.5 p-1 rounded-md bg-emerald-500/10 group-hover/item:bg-emerald-500/20 transition-colors flex-shrink-0">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">
                          {item.subject}
                        </p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium whitespace-nowrap">
                          {item.period}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.room}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors opacity-0 group-hover/item:opacity-100 transform translate-x-[-8px] group-hover/item:translate-x-0 flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="space-y-2.5 sm:space-y-3">
            {/* Students and Teachers Pie Charts - Row Layout */}
            <div className="w-full">
              <PieCharts />
            </div>
            {/* Attendance Bar Chart - Full Width Below */}
            <div className="w-full">
              <AttendanceBarChart />
            </div>
            <div className="w-full">
              <FinanceChartClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
