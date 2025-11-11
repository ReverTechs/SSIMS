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
    <main className="min-h-screen flex flex-col">
      {/* <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"} className="text-xl font-bold">
              Malawi Secondary School IMS
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {hasEnvVars && <AuthButton />}
            <ThemeSwitcher />
          </div>
        </div>
      </nav> */}
      <nav className="w-full flex justify-center h-16 border-b border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
        <div className="w-full max-w-7xl flex justify-between items-center px-4 sm:px-6 text-sm">
          {/* Logo + Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-10 sm:w-10 border border-border/50 rounded-full overflow-hidden flex items-center justify-center bg-background">
              <Image
                src="/images/Coat_of_arms_of_Malawi.svg.png"
                alt="Coat of Arms of Malawi"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <Link
              href="/"
              className="text-base sm:text-lg font-bold leading-tight"
            >
              Malawi Secondary School IMS
            </Link>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-4">
            {hasEnvVars && <AuthButton />}
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="max-w-7xl mx-auto text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              School Information
              <br />
              Management System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A modern, comprehensive platform for managing all aspects of
              secondary school operations in Malawi
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg">
                <Link href="/auth/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Comprehensive School Management
              </h2>
              <p className="text-muted-foreground text-lg">
                Everything you need to manage your school efficiently
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>
                    Complete student profiles, grades, fees, and academic
                    progress tracking
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Academic Records</CardTitle>
                  <CardDescription>
                    Manage grades, reports, subjects, and academic performance
                    across all terms
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Role-Based Access</CardTitle>
                  <CardDescription>
                    Secure access for students, teachers, administrators, and
                    guardians
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>School Calendar</CardTitle>
                  <CardDescription>
                    Manage events, holidays, exams, and important school dates
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Reports & Analytics</CardTitle>
                  <CardDescription>
                    Generate comprehensive reports and track academic
                    performance
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Teacher Management</CardTitle>
                  <CardDescription>
                    Manage teacher assignments, subjects, and class schedules
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 px-4 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to Transform Your School Management?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join schools across Malawi using our modern information management
              system
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p className="text-muted-foreground">
          © 2025 Malawi Secondary School Information Management System. All
          rights reserved.
        </p>
      </footer>
    </main>
  );
}
