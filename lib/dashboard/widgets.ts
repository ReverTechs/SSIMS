import { BookOpen, DollarSign, FileText, TrendingUp, Users, GraduationCap, BarChart3, AlertCircle, Shield } from "lucide-react";

type StatCard = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "neutral";
  icon: any;
  gradient: string;
  iconBg: string;
  borderGradient: string;
};

export const adminStats: StatCard[] = [
  {
    title: "System Users",
    value: "1,350",
    change: "Total registered",
    changeType: "neutral",
    icon: Users,
    gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
    borderGradient: "border-blue-500/20",
  },
  {
    title: "Active Sessions",
    value: "245",
    change: "Currently online",
    changeType: "neutral",
    icon: BarChart3,
    gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderGradient: "border-emerald-500/20",
  },
  {
    title: "System Alerts",
    value: "3",
    change: "Require attention",
    changeType: "neutral",
    icon: AlertCircle,
    gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    borderGradient: "border-amber-500/20",
  },
  {
    title: "System Health",
    value: "98%",
    change: "All systems operational",
    changeType: "positive",
    icon: Shield,
    gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    borderGradient: "border-pink-500/20",
  },
];

export const headteacherStats: StatCard[] = [
  {
    title: "Total Students",
    value: "1,245",
    change: "Enrolled this year",
    changeType: "neutral",
    icon: Users,
    gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
    borderGradient: "border-blue-500/20",
  },
  {
    title: "Total Teachers",
    value: "48",
    change: "Active staff members",
    changeType: "neutral",
    icon: GraduationCap,
    gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderGradient: "border-emerald-500/20",
  },
  {
    title: "Pending Reports",
    value: "12",
    change: "Require review",
    changeType: "neutral",
    icon: FileText,
    gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    borderGradient: "border-amber-500/20",
  },
  {
    title: "School Performance",
    value: "87%",
    change: "Overall pass rate",
    changeType: "positive",
    icon: TrendingUp,
    gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    borderGradient: "border-pink-500/20",
  },
];

export const deputyHeadteacherStats: StatCard[] = [
  {
    title: "Student Enrollment",
    value: "1,245",
    change: "Current academic year",
    changeType: "neutral",
    icon: Users,
    gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
    borderGradient: "border-blue-500/20",
  },
  {
    title: "Teaching Staff",
    value: "48",
    change: "Active teachers",
    changeType: "neutral",
    icon: GraduationCap,
    gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderGradient: "border-emerald-500/20",
  },
  {
    title: "Reports to Review",
    value: "8",
    change: "Awaiting approval",
    changeType: "neutral",
    icon: FileText,
    gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    borderGradient: "border-amber-500/20",
  },
  {
    title: "Academic Progress",
    value: "85%",
    change: "Average performance",
    changeType: "positive",
    icon: BarChart3,
    gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    borderGradient: "border-pink-500/20",
  },
];

export const teacherStats: StatCard[] = [
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

export const studentStats: StatCard[] = [
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

export const guardianStats: StatCard[] = [
  {
    title: "Children Enrolled",
    value: "2",
    change: "Active students",
    changeType: "neutral",
    icon: Users,
    gradient: "from-blue-500/20 via-blue-600/20 to-purple-600/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-purple-600",
    borderGradient: "border-blue-500/20",
  },
  {
    title: "Total Fees Due",
    value: "MK 30,000",
    change: "Outstanding balance",
    changeType: "neutral",
    icon: DollarSign,
    gradient: "from-emerald-500/20 via-emerald-600/20 to-teal-600/20",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    borderGradient: "border-emerald-500/20",
  },
  {
    title: "Reports Available",
    value: "6",
    change: "Ready for download",
    changeType: "neutral",
    icon: FileText,
    gradient: "from-amber-500/20 via-amber-600/20 to-orange-600/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    borderGradient: "border-amber-500/20",
  },
  {
    title: "Average Performance",
    value: "82%",
    change: "Children's grades",
    changeType: "positive",
    icon: TrendingUp,
    gradient: "from-pink-500/20 via-pink-600/20 to-rose-600/20",
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600",
    borderGradient: "border-pink-500/20",
  },
];

export type StatRegistryKey =
  | "stats:admin:view"
  | "stats:head:view"
  | "stats:deputy:view"
  | "stats:teacher:view"
  | "stats:student:view"
  | "stats:guardian:view";

export const statsRegistry: Record<StatRegistryKey, StatCard[]> = {
  "stats:admin:view": adminStats,
  "stats:head:view": headteacherStats,
  "stats:deputy:view": deputyHeadteacherStats,
  "stats:teacher:view": teacherStats,
  "stats:student:view": studentStats,
  "stats:guardian:view": guardianStats,
};


