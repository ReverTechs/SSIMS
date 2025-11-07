import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, DollarSign, FileText, TrendingUp, Calendar, Clock, ArrowRight, Sparkles, Users, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/user";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const defaultStats = [
    {
      title: "Average Grade",
      value: "85%",
      change: "+2.5%",
      changeType: "positive",
      icon: BookOpen,
      gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
      borderGradient: "border-blue-500/20",
    },
    {
      title: "Fees Balance",
      value: "MK 15,000",
      change: "Due by end of month",
      changeType: "neutral",
      icon: DollarSign,
      gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      borderGradient: "border-emerald-500/20",
    },
    {
      title: "Reports",
      value: "3",
      change: "Available for download",
      changeType: "neutral",
      icon: FileText,
      gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      borderGradient: "border-amber-500/20",
    },
    {
      title: "Progress",
      value: "Improving",
      change: "Across all subjects",
      changeType: "positive",
      icon: TrendingUp,
      gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
      iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
      borderGradient: "border-pink-500/20",
    },
  ];

  const teacherStats = [
    {
      title: "Subjects Teaching",
      value: "4",
      change: "Across all classes",
      changeType: "neutral",
      icon: GraduationCap,
      gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
      borderGradient: "border-blue-500/20",
    },
    {
      title: "Registered Students",
      value: "120",
      change: "Current academic year",
      changeType: "neutral",
      icon: Users,
      gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      borderGradient: "border-emerald-500/20",
    },
    {
      title: "Reports",
      value: "8",
      change: "Ready for submission",
      changeType: "neutral",
      icon: FileText,
      gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      borderGradient: "border-amber-500/20",
    },
    {
      title: "Teaching Progress",
      value: "On Track",
      change: "85% syllabus coverage",
      changeType: "positive",
      icon: TrendingUp,
      gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
      iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
      borderGradient: "border-pink-500/20",
    },
  ];

  const stats = user?.role === "teacher" ? teacherStats : defaultStats;

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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-purple-600/3 to-pink-600/3 rounded-lg" />
        <div className="relative space-y-4 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">
              Welcome to your school information management system
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="group relative animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className={cn(
                    "relative border bg-card hover:bg-accent/50 transition-all duration-200",
                    stat.borderGradient
                  )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={cn(
                        "p-1.5 rounded-md",
                        stat.iconBg
                      )}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <div className="text-xl font-semibold tracking-tight">
                        {stat.value}
                      </div>
                      <p className={cn(
                        "text-xs",
                        stat.changeType === "positive" 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-muted-foreground"
                      )}>
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Events */}
            <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden animate-fade-in-up opacity-0"
                  style={{ animationDelay: '400ms' }}>
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-0.5">Upcoming Events</CardTitle>
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
                      <p className="font-medium text-sm truncate">{event.title}</p>
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
            <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden animate-fade-in-up opacity-0"
                  style={{ animationDelay: '500ms' }}>
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-semibold mb-0.5">Today's Schedule</CardTitle>
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
                        <p className="font-medium text-sm truncate">{item.subject}</p>
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
        </div>
      </div>
    </div>
  );
}



