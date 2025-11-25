"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, Bell, Search, Menu } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserRole } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./breadcrumb";

interface HeaderProps {
  user: {
    fullName: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();

  const getRoleDisplayName = (role: UserRole): string => {
    const roleMap: Record<UserRole, string> = {
      student: "Student",
      teacher: "Teacher",
      headteacher: "Headteacher",
      deputy_headteacher: "Deputy Headteacher",
      guardian: "Guardian",
      admin: "School Admin",
    };
    return roleMap[role];
  };

  const getRoleColor = (role: UserRole): string => {
    const colorMap: Record<UserRole, string> = {
      student: "from-blue-500 to-cyan-500",
      teacher: "from-purple-500 to-pink-500",
      headteacher: "from-amber-500 to-orange-500",
      deputy_headteacher: "from-emerald-500 to-teal-500",
      guardian: "from-indigo-500 to-purple-500",
      admin: "from-red-500 to-rose-500",
    };
    return colorMap[role];
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="relative w-full rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-sm overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="relative flex h-16 items-center px-4 sm:px-6 justify-between gap-4">
        {/* Left side - Menu button (mobile) + Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-xl hover:bg-accent text-foreground"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs - Integrated into header */}
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <Breadcrumb />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search button (optional) 
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex h-9 w-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <Search className="h-4 w-4" />
          </Button>*/}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-card" />
          </Button>

          {/* Theme switcher */}
          <div className="px-1">
            <ThemeSwitcher />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 pl-2 pr-1 rounded-xl hover:bg-accent transition-all border border-transparent hover:border-border group gap-3"
              >
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-sm font-medium text-foreground leading-none">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-1">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <Avatar className="h-8 w-8 border border-border group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback
                    className={cn(
                      "bg-gradient-to-br text-white font-semibold text-xs",
                      getRoleColor(user.role)
                    )}
                  >
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 border border-border bg-card text-foreground p-2 shadow-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback
                      className={cn(
                        "bg-gradient-to-br text-white font-semibold",
                        getRoleColor(user.role)
                      )}
                    >
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-none truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-border" />
              <DropdownMenuItem
                asChild
                className="rounded-lg hover:bg-accent focus:bg-accent focus:text-accent-foreground cursor-pointer"
              >
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 p-2"
                >
                  <User className="h-4 w-4 text-blue-500" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg hover:bg-accent focus:bg-accent focus:text-accent-foreground cursor-pointer gap-3 p-2">
                <Settings className="h-4 w-4 text-purple-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border" />
              <DropdownMenuItem
                className="text-destructive rounded-lg hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-3 p-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
