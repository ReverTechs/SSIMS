"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Users,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Baby,
  Heart,
  Home,
} from "lucide-react";
import { User as UserType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateGuardianProfile } from "@/app/actions/update-guardian-profile";
import { Briefcase, Building2, PhoneCall } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { GuardianProfile } from "@/lib/data/guardians";

interface GuardianProfileContentProps {
  user: UserType;
  guardianData: GuardianProfile;
}

export function GuardianProfileContent({
  user,
  guardianData,
}: GuardianProfileContentProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [hasVerifiedCredentials, setHasVerifiedCredentials] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [email, setEmail] = useState(user.email);

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: user.fullName.split(" ")[0] || "",
    lastName: user.fullName.split(" ").slice(1).join(" ") || "",
    phoneNumber: guardianData.phoneNumber || "",
    address: guardianData.address || "",
    occupation: guardianData.occupation || "",
    workplace: guardianData.workplace || "",
    workPhone: guardianData.workPhone || "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateGuardianProfile(formData);
      if (result.error) {
        throw new Error(result.error);
      }
      setSuccess("Profile updated successfully!");
      setEditDialogOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
          <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4 pt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{user.fullName}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm md:text-base">@{user.email.split('@')[0]}</span>
              <span className="text-xs">•</span>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Verified Guardian</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-6"
              onClick={() => setEditDialogOpen(true)}
            >
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
              <Baby className="h-5 w-5 text-blue-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{guardianData.dependents.length} Dependents</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Wards</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Heart className="h-5 w-5 text-rose-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm capitalize">{guardianData.relationship}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Relationship</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Home className="h-5 w-5 text-emerald-500" />
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
              {["Personal", "Dependents", "Contact", "Security"].map((tab) => (
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
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-6">
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
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        Relationship
                      </Label>
                      <p className="text-sm font-medium capitalize">
                        {guardianData.relationship || "Guardian"}
                      </p>
                    </div>
                    {guardianData.occupation && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5" />
                          Occupation
                        </Label>
                        <p className="text-sm font-medium">{guardianData.occupation}</p>
                      </div>
                    )}
                    {guardianData.workplace && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5" />
                          Workplace
                        </Label>
                        <p className="text-sm font-medium">{guardianData.workplace}</p>
                      </div>
                    )}
                    {guardianData.nationalId && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5" />
                          National ID
                        </Label>
                        <p className="text-sm font-medium">{guardianData.nationalId}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dependents" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-4">
                  {guardianData.dependents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No dependents linked.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {guardianData.dependents.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-md border p-3 bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {s.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{s.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {s.id}
                                {s.className ? ` • ${s.className}` : ""}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-2xs">
                            Student
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email Address
                      </Label>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    {guardianData.phoneNumber && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5" />
                          Phone Number
                        </Label>
                        <p className="text-sm font-medium">
                          {guardianData.phoneNumber}
                        </p>
                      </div>
                    )}
                    {guardianData.address && (
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          Address
                        </Label>
                        <p className="text-sm font-medium">
                          {guardianData.address}
                        </p>
                      </div>
                    )}
                    {guardianData.workPhone && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground flex items-center gap-2">
                          <PhoneCall className="h-3.5 w-3.5" />
                          Work Phone
                        </Label>
                        <p className="text-sm font-medium">
                          {guardianData.workPhone}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-full mt-4"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    Update Contact Information
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-500/10">
                      <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Security & Password
                      </CardTitle>
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
                    <p className="text-sm text-muted-foreground">
                      Please verify your credentials to update your password.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification dialog */}
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

            {/* Edit Profile Dialog */}
            <Dialog
              open={editDialogOpen}
              onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (open) {
                  setFormData({
                    firstName: user.fullName.split(" ")[0] || "",
                    lastName: user.fullName.split(" ").slice(1).join(" ") || "",
                    phoneNumber: guardianData.phoneNumber || "",
                    address: guardianData.address || "",
                    occupation: guardianData.occupation || "",
                    workplace: guardianData.workplace || "",
                    workPhone: guardianData.workPhone || "",
                  });
                }
              }}
            >
              <DialogContent className="rounded-2xl sm:rounded-2xl md:rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Update your personal and contact information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workPhone">Work Phone</Label>
                      <Input
                        id="workPhone"
                        value={formData.workPhone}
                        onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workplace">Workplace</Label>
                      <Input
                        id="workplace"
                        value={formData.workplace}
                        onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
