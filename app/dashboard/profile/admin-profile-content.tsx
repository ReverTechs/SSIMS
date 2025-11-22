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
  Shield,
  Lock,
  Settings,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Activity,
} from "lucide-react";
import { User as UserType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminData {
  adminId: string;
  phoneNumber?: string;
  address?: string;
  permissions: string[];
}

interface AdminProfileContentProps {
  user: UserType;
  adminData: AdminData;
}

export function AdminProfileContent({ user, adminData }: AdminProfileContentProps) {
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* YouTube Style Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
          <AvatarImage src={user.avatar} alt={user.fullName} className="object-cover" />
          <AvatarFallback className="text-4xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4 pt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.fullName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm md:text-base">@{user.email.split('@')[0]}</span>
              <span className="text-xs">•</span>
              <div className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Verified Admin</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-6">
              Edit profile
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar - 3/4 Width */}
      <div className="w-full md:w-3/4 space-y-8">
        <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{user.fullName}</span>
            <Badge variant="secondary" className="ml-auto text-xs font-normal">Public</Badge>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Shield className="h-5 w-5 text-blue-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{adminData.permissions.length} Permissions</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Access Level</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Briefcase className="h-5 w-5 text-indigo-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Administrator</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Role</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Activity className="h-5 w-5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Active</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Style Tabs - 3/4 Width */}
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
          <div className="border-b mb-6">
            <TabsList className="flex h-auto w-full justify-start gap-8 bg-transparent p-0 rounded-none">
              {["Personal", "Access", "Contact", "Security"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.toLowerCase()}
                  className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground"
                >
                  {tab.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="w-full">
            <TabsContent value="personal" className="mt-0 space-y-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
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
                        Email
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="access" className="mt-0 space-y-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      System Permissions
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {adminData.permissions.map((perm, i) => (
                        <Badge key={i} variant="outline" className="text-sm px-4 py-1.5 rounded-full bg-background">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 space-y-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    {adminData.phoneNumber && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Number
                        </Label>
                        <p className="text-sm font-medium">{adminData.phoneNumber}</p>
                      </div>
                    )}
                    {adminData.address && (
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          Address
                        </Label>
                        <p className="text-sm font-medium">{adminData.address}</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="rounded-full mt-4">
                    Update Contact Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-500/10">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Security & Password</CardTitle>
                      <CardDescription>Update your password</CardDescription>
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
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="max-w-md"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
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
      </div>

      <Dialog open={securityDialogOpen} onOpenChange={setSecurityDialogOpen}>
        <DialogContent className="rounded-2xl sm:rounded-2xl md:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Verify your credentials</DialogTitle>
            <DialogDescription>Enter your current credentials to proceed.</DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form
            onSubmit={async (e) => {
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
            }}
            className="space-y-4"
          >
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


