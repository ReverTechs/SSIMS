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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      {/* Gradient overlay - subtle solid color */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/15 to-pink-50/20 dark:from-blue-950/15 dark:via-purple-950/10 dark:to-pink-950/15 pointer-events-none" />
      
      <div className="relative container flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6">
        {/* Left side - Menu button (mobile) + Title with Image */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 rounded-xl hover:bg-muted transition-all duration-300"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 border-2 border-border/50 rounded-full overflow-hidden items-center justify-center bg-background flex-shrink-0">
              <Image
                src="/images/Coat_of_arms_of_Malawi.svg.png"
                alt="Coat of Arms of Malawi"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Mitundu Secondaly School
              </h1>
              <p className="text-xs text-muted-foreground/70 font-light">
                {getRoleDisplayName(user.role)}
              </p>
            </div>
          </Link>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search button (optional) - hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex relative h-10 w-10 rounded-xl hover:bg-muted transition-all duration-300 hover:scale-105"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted transition-all duration-300 hover:scale-105"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-card" />
          </Button>

          {/* Theme switcher */}
          <div className="px-1 sm:px-2">
            <ThemeSwitcher />
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 sm:h-12 sm:w-12 rounded-xl hover:bg-muted transition-all duration-300 hover:scale-105 p-0 group"
              >
                <Avatar className="relative h-9 w-9 sm:h-12 sm:w-12 border-2 border-border group-hover:border-blue-500 transition-colors duration-300">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className={cn(
                    "bg-gradient-to-br text-white font-semibold text-xs sm:text-sm",
                    getRoleColor(user.role)
                  )}>
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 border-2 border-border bg-card p-2"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-border/50">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br text-white font-semibold",
                      getRoleColor(user.role)
                    )}>
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className="text-sm font-semibold leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white font-medium",
                        getRoleColor(user.role)
                      )}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem
                asChild
                className="rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <Link href="/dashboard/profile" className="flex items-center gap-3 p-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg hover:bg-muted transition-colors cursor-pointer gap-3 p-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem
                className="text-destructive rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer gap-3 p-2"
                onClick={handleLogout}
              >
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}


