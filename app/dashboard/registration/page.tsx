import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, UserCheck, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegistrationPage() {
  const registrationOptions = [
    {
      title: "Register Students",
      description: "Add new students to the system. Include internal and external student types.",
      href: "/dashboard/register-students",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Register Teachers",
      description: "Add new teachers to the system. Assign departments, subjects, and roles.",
      href: "/dashboard/register-teachers",
      icon: GraduationCap,
      gradient: "from-purple-500 to-pink-600",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Register Guardians",
      description: "Add new guardians/parents to the system. Link them to their students.",
      href: "/dashboard/register-guardians",
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Register Admins",
      description: "Add new administrators to the system. Manage system access and roles.",
      href: "/dashboard/register-admin",
      icon: Shield,
      gradient: "from-orange-500 to-red-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registration</h1>
        <p className="text-muted-foreground">
          Choose whether to register a new student or teacher
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {registrationOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Link key={option.href} href={option.href}>
              <Card
                className={cn(
                  "group relative border bg-card hover:bg-accent/50 transition-all duration-200 overflow-hidden cursor-pointer",
                  "hover:shadow-lg hover:scale-[1.02]"
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-200",
                    option.gradient
                  )}
                />
                <CardHeader className="relative">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200",
                        option.iconBg,
                        "group-hover:scale-110"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", option.iconColor)} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {option.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}










