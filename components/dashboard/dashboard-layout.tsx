"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumb } from "./breadcrumb";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar userRole={userRole} />
        
        {/* Mobile Sidebar */}
        <Sidebar 
          userRole={userRole} 
          mobile 
          open={sidebarOpen} 
          onOpenChange={setSidebarOpen} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container max-w-7xl mx-auto px-6 py-4">
            <Breadcrumb />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}



