"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Building2,
  Users,
  Award,
  Briefcase,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  yearsOfExperience?: number;
  qualification?: string;
  specialization?: string;
  classes?: string[];
  totalStudents?: number;
  address?: string;
}

interface TeacherProfileViewProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeacherProfileView({ teacher, open, onOpenChange }: TeacherProfileViewProps) {
  if (!teacher) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Teacher Profile</DialogTitle>
          <DialogDescription>
            View complete profile details for {teacher.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={undefined} alt={teacher.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(teacher.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold tracking-tight">{teacher.name}</h2>
                    <Badge variant="secondary" className="text-xs">
                      {teacher.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{teacher.email}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {teacher.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{teacher.department}</span>
                      </div>
                    )}
                    {teacher.subjects && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.subjects.length} {teacher.subjects.length === 1 ? "Subject" : "Subjects"}
                        </span>
                      </div>
                    )}
                    {teacher.totalStudents !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {teacher.totalStudents} Students
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Windows 11 Settings Style Tabs */}
          <Tabs defaultValue="personal" className="w-full">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Sidebar Navigation */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <TabsList className="flex flex-row lg:flex-col h-auto w-full bg-transparent p-0 gap-0.5 overflow-x-auto">
                  <TabsTrigger
                    value="personal"
                    className="flex-shrink-0 lg:w-full justify-start gap-2 lg:gap-3 h-10 px-3 rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="teaching"
                    className="flex-shrink-0 lg:w-full justify-start gap-2 lg:gap-3 h-10 px-3 rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">Teaching</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="flex-shrink-0 lg:w-full justify-start gap-2 lg:gap-3 h-10 px-3 rounded-md data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-sm transition-all"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm whitespace-nowrap">Contact</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 min-w-0">
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="mt-0 space-y-6">
                  <Card className="border bg-card">
                    <CardHeader>
                      <CardTitle className="text-xl">Personal Information</CardTitle>
                      <CardDescription>
                        Basic profile details and personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            Full Name
                          </Label>
                          <p className="text-sm font-medium">{teacher.name}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email Address
                          </Label>
                          <p className="text-sm font-medium">{teacher.email}</p>
                        </div>
                        {teacher.gender && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              Gender
                            </Label>
                            <p className="text-sm font-medium capitalize">{teacher.gender}</p>
                          </div>
                        )}
                        {teacher.dateOfBirth && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              Date of Birth
                            </Label>
                            <p className="text-sm font-medium">
                              {new Date(teacher.dateOfBirth).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                        {teacher.yearsOfExperience !== undefined && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5" />
                              Years of Experience
                            </Label>
                            <p className="text-sm font-medium">{teacher.yearsOfExperience} years</p>
                          </div>
                        )}
                        {teacher.qualification && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <Award className="h-3.5 w-3.5" />
                              Qualification
                            </Label>
                            <p className="text-sm font-medium">{teacher.qualification}</p>
                          </div>
                        )}
                        {teacher.specialization && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <GraduationCap className="h-3.5 w-3.5" />
                              Specialization
                            </Label>
                            <p className="text-sm font-medium">{teacher.specialization}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Teaching Information Tab */}
                <TabsContent value="teaching" className="mt-0 space-y-6">
                  <Card className="border bg-card">
                    <CardHeader>
                      <CardTitle className="text-xl">Teaching Information</CardTitle>
                      <CardDescription>
                        Teaching assignments, subjects, and classes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {teacher.department && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5" />
                                Department
                              </Label>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm px-3 py-1">
                                  {teacher.department}
                                </Badge>
                              </div>
                            </div>
                            <Separator />
                          </>
                        )}

                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                                <BookOpen className="h-3.5 w-3.5" />
                                Subjects Teaching ({teacher.subjects.length})
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map((subject, index) => (
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
                          </>
                        )}

                        {teacher.classes && teacher.classes.length > 0 && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground flex items-center gap-2 mb-3">
                                <Users className="h-3.5 w-3.5" />
                                Classes Assigned ({teacher.classes.length})
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {teacher.classes.map((className, index) => (
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
                          </>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                          {teacher.subjects && (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-md bg-blue-500/10">
                                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Total Subjects</p>
                                  <p className="text-lg font-semibold">{teacher.subjects.length}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {teacher.totalStudents !== undefined && (
                            <div className="p-4 rounded-lg bg-muted/50 border">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-md bg-emerald-500/10">
                                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Total Students</p>
                                  <p className="text-lg font-semibold">{teacher.totalStudents}</p>
                                </div>
                              </div>
                            </div>
                          )}
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
                        Contact details and communication information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email Address
                          </Label>
                          <p className="text-sm font-medium">{teacher.email}</p>
                        </div>
                        {teacher.phone && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              Phone Number
                            </Label>
                            <p className="text-sm font-medium">{teacher.phone}</p>
                          </div>
                        )}
                        {teacher.address && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              Address
                            </Label>
                            <p className="text-sm font-medium">{teacher.address}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

