// -------------------------- THE PROJECT --------------------------
// Proposed by REVER B.C. on 28 Oct, 2025.
// REVER ENGINEERING Inc. (Networking and Software solutions Engineering)
// Part A, The Interface

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  Calendar,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-header transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer">
            <div className="h-10 w-10 border border-border/40 rounded-xl overflow-hidden flex items-center justify-center bg-background/50 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/images/Coat_of_arms_of_Malawi.svg.png"
                alt="Coat of Arms of Malawi"
                width={40}
                height={40}
                className="object-contain p-1"
              />
            </div>
            <Link
              href="/"
              className="text-sm sm:text-base font-semibold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors"
            >
              Malawi Secondary School IMS
            </Link>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {hasEnvVars && <AuthButton />}
            </div>
            {/*<ThemeSwitcher />*/}
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full pt-16">
        {/* Hero Section */}
        <section className="w-full py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
          <div className="max-w-5xl mx-auto text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Next Generation School Management
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-2">
              The future of <br className="hidden md:block" />
              school administration.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed text-balance">
              A powerful, intuitive platform designed to transform how secondary schools in Malawi operate.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 items-center">
              <Button asChild size="lg" className="rounded-full px-8 h-11 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                <Link href="/auth/login">Get Started</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full px-8 h-11 text-base font-medium hover:bg-secondary/80">
                <Link href="/auth/sign-up">Create Account <span className="ml-2">→</span></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section - Uniform Grid */}
        <section className="w-full py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything you need.
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Powerful features wrapped in a beautiful interface.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Student Management</CardTitle>
                  <CardDescription>
                    Comprehensive profiles, enrollment tracking, and digital records.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card 2 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-xl">Secure Access</CardTitle>
                  <CardDescription>
                    Role-based permissions for admins, teachers, and guardians.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card 3 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl">Academic Records</CardTitle>
                  <CardDescription>
                    Track grades and performance history effortlessly.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card 4 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-xl">Smart Reporting</CardTitle>
                  <CardDescription>
                    Generate detailed academic reports and analytics.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card 5 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl">Calendar</CardTitle>
                  <CardDescription>
                    Manage terms, holidays, and important events.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Card 6 */}
              <Card className="border border-border/50 bg-background shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-xl">Staff Portal</CardTitle>
                  <CardDescription>
                    Dedicated tools for teacher management.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 bg-background border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm text-foreground rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight relative z-10">
              Ready to transform your school?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto relative z-10">
              Join the growing network of modern schools in Malawi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 relative z-10">
              <Button asChild size="lg" className="rounded-full px-8 h-11 text-base font-medium shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20 transition-all">
                <Link href="/auth/login">Login Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-11 text-base font-medium bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto py-12 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Malawi Secondary School Information Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
