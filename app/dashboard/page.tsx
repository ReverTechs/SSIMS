import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, DollarSign, FileText, TrendingUp, Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const stats = [
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
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl sm:rounded-3xl" />
        <div className="relative space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 animate-pulse flex-shrink-0" />
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 font-light">
              Welcome to your school information management system
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="group relative animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className={cn(
                    "relative border-2 bg-card hover:bg-card transition-all duration-500 hover:scale-[1.02] hover:shadow-xl",
                    stat.borderGradient
                  )}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                      <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground/80">
                        {stat.title}
                      </CardTitle>
                      <div className={cn(
                        "p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg",
                        stat.iconBg
                      )}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 sm:space-y-2">
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {stat.value}
                      </div>
                      <p className={cn(
                        "text-xs font-medium",
                        stat.changeType === "positive" 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-muted-foreground/70"
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Events */}
            <Card className="group relative border-2 border-blue-500/30 bg-card hover:bg-card transition-all duration-500 hover:scale-[1.01] hover:shadow-xl overflow-hidden animate-fade-in-up opacity-0"
                  style={{ animationDelay: '400ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/15 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold mb-1">Upcoming Events</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Your calendar for this week
                    </CardDescription>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 sm:space-y-4">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted hover:bg-muted/90 border border-border hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="mt-0.5 sm:mt-1 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover/item:from-blue-500/30 group-hover/item:to-purple-600/30 transition-colors flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{event.title}</p>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors opacity-0 group-hover/item:opacity-100 transform translate-x-[-10px] group-hover/item:translate-x-0 flex-shrink-0" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="group relative border-2 border-emerald-500/30 bg-card hover:bg-card transition-all duration-500 hover:scale-[1.01] hover:shadow-xl overflow-hidden animate-fade-in-up opacity-0"
                  style={{ animationDelay: '500ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-cyan-50/30 dark:from-emerald-950/20 dark:via-teal-950/15 dark:to-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl sm:text-2xl font-bold mb-1">Today's Schedule</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Your timetable for today
                    </CardDescription>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg flex-shrink-0">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-3 sm:space-y-4">
                {schedule.map((item, index) => (
                  <div
                    key={index}
                    className="group/item flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted hover:bg-muted/90 border border-border hover:border-emerald-500/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="mt-0.5 sm:mt-1 p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 group-hover/item:from-emerald-500/30 group-hover/item:to-teal-600/30 transition-colors flex-shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-sm sm:text-base truncate">{item.subject}</p>
                        <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium whitespace-nowrap">
                          {item.period}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <span>{item.time}</span>
                        <span>•</span>
                        <span>{item.room}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover/item:text-emerald-600 dark:group-hover/item:text-emerald-400 transition-colors opacity-0 group-hover/item:opacity-100 transform translate-x-[-10px] group-hover/item:translate-x-0 flex-shrink-0" />
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



