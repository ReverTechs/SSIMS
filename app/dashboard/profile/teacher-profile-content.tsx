"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Shield,
  Building2,
  Users,
  Award,
  Briefcase,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { User as UserType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeacherData {
  teacherId: string;
  department: string;
  subjects: string[];
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  yearsOfExperience: number;
  qualification: string;
  specialization: string;
  classes: string[];
  totalStudents: number;
}

interface TeacherProfileContentProps {
  user: UserType;
  teacherData: TeacherData;
}

export function TeacherProfileContent({ user, teacherData }: TeacherProfileContentProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [hasVerifiedCredentials, setHasVerifiedCredentials] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState(user.email);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error("Current credentials are incorrect");
      }
      setHasVerifiedCredentials(true);
      setSecurityDialogOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <Card className="border bg-card">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold tracking-tight">{user.fullName}</h2>
                <Badge variant="secondary" className="text-xs">
                  {teacherData.teacherId}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{teacherData.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {teacherData.subjects.length} {teacherData.subjects.length === 1 ? "Subject" : "Subjects"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {teacherData.totalStudents} Students
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Windows 11 Settings Style Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val);
          if (val === "security" && !hasVerifiedCredentials) {
            setSecurityDialogOpen(true);
          }
        }}
        className="w-full"
      >
        {/* Tabs Navigation - Horizontal Row on All Screen Sizes */}
        <div className="w-full mb-6">
          <TabsList className="flex flex-row h-auto w-full bg-muted/30 p-1.5 gap-1.5 rounded-lg border overflow-x-auto">
            <TabsTrigger
              value="personal"
              className="flex-1 justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all text-xs sm:text-sm"
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="teaching"
              className="flex-1 justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all text-xs sm:text-sm"
            >
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium">Teaching</span>
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex-1 justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all text-xs sm:text-sm"
            >
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium">Contact</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex-1 justify-start gap-2 sm:gap-3 h-10 sm:h-12 px-3 sm:px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border transition-all text-xs sm:text-sm"
            >
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="font-medium">Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="w-full">
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-0 space-y-6">
              <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>
                    Your basic profile details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        Full Name
                      </Label>
                      <p className="text-sm font-medium">{user.fullName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        Date of Birth
                      </Label>
                      <p className="text-sm font-medium">
                        {new Date(teacherData.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        Years of Experience
                      </Label>
                      <p className="text-sm font-medium">{teacherData.yearsOfExperience} years</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Award className="h-3.5 w-3.5" />
                        Qualification
                      </Label>
                      <p className="text-sm font-medium">{teacherData.qualification}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Specialization
                      </Label>
                      <p className="text-sm font-medium">{teacherData.specialization}</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full sm:w-auto">
                    Edit Personal Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teaching Information Tab */}
            <TabsContent value="teaching" className="mt-0 space-y-6">
              <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Teaching Information</CardTitle>
                  <CardDescription>
                    Your teaching assignments, subjects, and classes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Department
                      </Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {teacherData.department}
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                        <BookOpen className="h-3.5 w-3.5" />
                        Subjects Teaching ({teacherData.subjects.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.subjects.map((subject, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm px-3 py-1.5 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/20"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                        <Users className="h-3.5 w-3.5" />
                        Classes Assigned ({teacherData.classes.length})
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.classes.map((className, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm px-3 py-1.5"
                          >
                            {className}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-blue-500/10">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Subjects</p>
                            <p className="text-lg font-semibold">{teacherData.subjects.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-md bg-emerald-500/10">
                            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Students</p>
                            <p className="text-lg font-semibold">{teacherData.totalStudents}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="mt-0 space-y-6">
              <Card className="border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Information</CardTitle>
                  <CardDescription>
                    Your contact details and communication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        Phone Number
                      </Label>
                      <p className="text-sm font-medium">{teacherData.phoneNumber}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </Label>
                      <p className="text-sm font-medium">{teacherData.address}</p>
                    </div>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full sm:w-auto">
                    Update Contact Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab - gated by credentials dialog */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-500/10">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Security & Password</CardTitle>
                      <CardDescription>Update your password to keep your account secure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-emerald-500/50 bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                  {hasVerifiedCredentials ? (
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          New Password
                        </Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="max-w-md"
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 6 characters long
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="flex items-center gap-2">
                          <Lock className="h-3.5 w-3.5" />
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="max-w-md"
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setNewPassword("");
                            setConfirmPassword("");
                            setError(null);
                            setSuccess(null);
                            setHasVerifiedCredentials(false);
                            setSecurityDialogOpen(true);
                          }}
                        >
                          Start Over
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-sm text-muted-foreground">Please verify your credentials to update your password.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
        </div>
      </Tabs>
      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent className="rounded-2xl sm:rounded-2xl md:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Verify your credentials</DialogTitle>
            <DialogDescription>
              Enter your current credentials to access password settings.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleVerifyCredentials} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-email">Email</Label>
              <Input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verify-current-password">Current Password</Label>
              <Input
                id="verify-current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="max-w-md"
              />
            </div>
            <div className="flex items-center justify-between">
              <a href="/auth/forgot-password" className="text-sm text-primary underline underline-offset-4">
                Forgot password?
              </a>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Continue"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSecurityDialogOpen(false);
                  setCurrentPassword("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

