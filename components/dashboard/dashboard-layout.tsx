"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { UserRole } from "@/types";

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
  return (
    <div className="flex h-screen flex-col">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar userRole={userRole} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}



