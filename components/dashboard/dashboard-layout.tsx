"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumb } from "./breadcrumb";
import { BreadcrumbProvider } from "./breadcrumb-context";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
  DashboardOverviewSkeleton,
  DashboardShellSkeleton,
} from "../skeletons/dashboard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  user: {
    fullName: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
}

export function DashboardLayout({
  children,
  userRole,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showBootScreen, setShowBootScreen] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShowBootScreen(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (showBootScreen) {
    return (
      <DashboardShellSkeleton>
        <DashboardOverviewSkeleton />
      </DashboardShellSkeleton>
    );
  }

  return (
    <BreadcrumbProvider>
      <div className="flex h-screen w-full overflow-hidden bg-muted/20">
        {/* Desktop Sidebar - Floating */}
        <div className={cn(
          "hidden lg:flex flex-col py-3 pl-3 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[80px]" : "w-72"
        )}>
          <Sidebar
            userRole={userRole}
            collapsed={isCollapsed}
            onCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sidebar
          userRole={userRole}
          mobile
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Header - Floating */}
          <div className="p-3 pb-0">
            <Header
              user={user}
              onMenuClick={() => setSidebarOpen(true)}
            />
          </div>

          <main className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="w-full p-3 pt-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}



