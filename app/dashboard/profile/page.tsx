import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Calendar, GraduationCap } from "lucide-react";

export default function ProfilePage() {
  const user = {
    fullName: "John Doe",
    email: "john.doe@school.mw",
    studentId: "STU2024001",
    class: "Form 4A",
    dateOfBirth: "2008-05-15",
    phoneNumber: "+265 991 234 567",
    address: "Lilongwe, Malawi",
    avatar: undefined,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.studentId}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Class</Label>
                  <p className="text-sm font-medium">{user.class}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Date of Birth
                  </Label>
                  <p className="text-sm font-medium">
                    {new Date(user.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm font-medium">{user.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <p className="text-sm font-medium">{user.address}</p>
                </div>
              </div>
            </div>

            <Button className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Update your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button className="w-full">Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



