"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, GraduationCap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SchoolCouncilPage() {
  return (
    <div
      className="space-y-6 animate-fade-in-up opacity-0"
      style={{ animationDelay: "100ms" }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          The School Council
        </h1>
        <p className="text-muted-foreground mt-2">
          View the organizational structure of staff roles and student
          leadership
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Staff Roles Card */}
        <Link href="/dashboard/school-council/staff-roles">
          <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Staff Roles</CardTitle>
              </div>
              <CardDescription className="text-base">
                View all teaching staff and administrative roles in hierarchical
                order
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Headteachers, Deputy Headteachers, Senior Teachers, HoD,
                    etc.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </Card>
        </Link>

        {/* Student Council Card */}
        <Link href="/dashboard/school-council/student-council">
          <Card className="group relative border bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Student Council</CardTitle>
              </div>
              <CardDescription className="text-base">
                View all student leadership positions and their roles
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Head Boy/Girl, Deputy Head Boy/Girl, Prefects, Class
                    Monitors, and more
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </Card>
        </Link>
      </div>
    </div>
  );
}


