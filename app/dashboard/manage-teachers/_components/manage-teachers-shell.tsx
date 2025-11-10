"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { GraduationCap, LayoutGrid, Users } from "lucide-react";
import { PropsWithChildren } from "react";

const subNavItems = [
  {
    label: "Overview",
    href: "/dashboard/manage-teachers",
    icon: LayoutGrid,
  },
  {
    label: "Assign Subjects",
    href: "/dashboard/manage-teachers/assign-subjects",
    icon: GraduationCap,
  },
  {
    label: "Assign Classes",
    href: "/dashboard/manage-teachers/assign-classes",
    icon: Users,
  },
];

export function ManageTeachersShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {/* <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-background via-card to-muted/40 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/80">
                Teacher Management
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Manage Teachers</h1>
              <p className="text-muted-foreground">
                Oversee teacher profiles, assign subjects, and align classes in one streamlined workspace.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 backdrop-blur-sm">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Active Teachers</p>
                <p className="text-sm text-muted-foreground">Monitor assignments in real time</p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="rounded-3xl border border-border/60 bg-card/70 p-2 shadow-sm backdrop-blur">
          <nav className="flex flex-wrap gap-2">
            {subNavItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-out",
                    "hover:bg-muted/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  <span
                    className={cn(
                      "absolute inset-0 -z-10 rounded-2xl bg-transparent transition-all duration-200 ease-out",
                      isActive ? "bg-primary/10 shadow-inner" : "bg-transparent"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
