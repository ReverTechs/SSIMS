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
  School,
  Users,
  CheckCircle2,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  class?: string;
  subjects?: string[];
  gender?: "male" | "female";
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: string;
  studentType?: "internal" | "external";
}

interface StudentProfileViewProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileView({ student, open, onOpenChange }: StudentProfileViewProps) {
  if (!student) return null;

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
      <DialogContent className="max-w-[95vw] lg:max-w-7xl xl:max-w-[90vw] 2xl:max-w-[85vw] w-full h-[95vh] max-h-[95vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Cover Banner - Facebook Style */}
        <div className="relative w-full h-48 lg:h-56 flex-shrink-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 via-teal-600/80 to-cyan-600/80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 bg-gradient-to-t from-background to-transparent"></div>

          {/* Profile Picture - Suspended halfway down the background */}
          <div className="absolute left-4 sm:left-6 lg:left-8 bottom-0 translate-y-1/2 z-10">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 border-4 border-background shadow-xl ring-4 ring-emerald-500/10">
              <AvatarImage src={undefined} alt={student.name} />
              <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                {getInitials(student.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Picture and Header Info */}
        <div className="relative px-4 sm:px-6 lg:px-8 pb-4 pt-16 sm:pt-20 lg:pt-24 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
            {/* Spacer for avatar on mobile */}
            <div className="flex-shrink-0 sm:hidden">
              <div className="h-16 w-16"></div>
            </div>

            {/* Name and Basic Info */}
            <div className="flex-1 space-y-3 lg:space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{student.name}</h2>
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 capitalize">
                    {student.studentType || "Student"}
                  </Badge>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">Verified Student</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap pt-2">
                  {student.class && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <School className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-medium">{student.class}</span>
                    </div>
                  )}
                  {student.subjects && student.subjects.length > 0 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="p-1.5 rounded-md bg-teal-500/10">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <span className="font-medium">
                        {student.subjects.length} {student.subjects.length === 1 ? "Subject" : "Subjects"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <Tabs defaultValue="personal" className="w-full h-full flex flex-col">
            {/* Tabs Navigation */}
            <div className="w-full mb-6 flex-shrink-0">
              <TabsList className="w-full h-auto p-1 bg-muted/50 rounded-lg">
                <TabsTrigger
                  value="personal"
                  className="flex-1 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-medium"
                >
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="flex-1 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-medium"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="flex-1 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all font-medium"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Content Area - Full Width */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 lg:space-y-6">
                {/* Personal Information Tab */}
                <TabsContent value="personal" className="mt-0 space-y-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        Personal Information
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Basic profile details and personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            Full Name
                          </Label>
                          <p className="text-sm sm:text-base font-medium">{student.name}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email Address
                          </Label>
                          <p className="text-sm sm:text-base font-medium break-all">{student.email}</p>
                        </div>
                        {student.gender && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              Gender
                            </Label>
                            <p className="text-sm sm:text-base font-medium capitalize">{student.gender}</p>
                          </div>
                        )}
                        {student.dateOfBirth && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              Date of Birth
                            </Label>
                            <p className="text-sm sm:text-base font-medium">
                              {new Date(student.dateOfBirth).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                        {student.address && (
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              Address
                            </Label>
                            <p className="text-sm sm:text-base font-medium">{student.address}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Academic Information Tab */}
                <TabsContent value="academic" className="mt-0 space-y-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-teal-500/10">
                          <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        Academic Information
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Class, subjects, and academic details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      {student.class && (
                        <div className="space-y-3">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <School className="h-3.5 w-3.5" />
                            Class
                          </Label>
                          <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                            {student.class}
                          </Badge>
                          <Separator />
                        </div>
                      )}

                      {student.subjects && student.subjects.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                            <BookOpen className="h-3.5 w-3.5" />
                            Subjects ({student.subjects.length})
                          </Label>
                          <div className="flex flex-wrap gap-2">
                            {student.subjects.map((subject, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border-emerald-500/30 hover:border-emerald-500/50 transition-colors"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                          <Separator />
                        </div>
                      )}

                      {/* Insight Cards - Responsive Grid */}
                      {student.subjects && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 pt-2">
                          <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 flex-shrink-0">
                                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Subjects</p>
                                <p className="text-xl sm:text-2xl font-bold">{student.subjects.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Contact Information Tab */}
                <TabsContent value="contact" className="mt-0 space-y-4">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        Contact Information
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Contact details and guardian information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Student Contact Section */}
                        <div className="space-y-4">
                          <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Student Contact
                          </h3>
                          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" />
                                Email Address
                              </Label>
                              <p className="text-sm sm:text-base font-medium break-all">{student.email}</p>
                            </div>
                            {student.phone && (
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5" />
                                  Phone Number
                                </Label>
                                <p className="text-sm sm:text-base font-medium">{student.phone}</p>
                              </div>
                            )}
                            {student.address && (
                              <div className="space-y-2 sm:col-span-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                  <MapPin className="h-3.5 w-3.5" />
                                  Address
                                </Label>
                                <p className="text-sm sm:text-base font-medium">{student.address}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Guardian Information Section */}
                        {(student.guardianName || student.guardianPhone) && (
                          <>
                            <Separator />
                            <div className="space-y-4">
                              <h3 className="text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Guardian Information
                              </h3>
                              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                                {student.guardianName && (
                                  <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                      <User className="h-3.5 w-3.5" />
                                      Guardian Name
                                    </Label>
                                    <p className="text-sm sm:text-base font-medium">{student.guardianName}</p>
                                  </div>
                                )}
                                {student.guardianRelationship && (
                                  <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                      <Users className="h-3.5 w-3.5" />
                                      Relationship
                                    </Label>
                                    <p className="text-sm sm:text-base font-medium">{student.guardianRelationship}</p>
                                  </div>
                                )}
                                {student.guardianPhone && (
                                  <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                      <Phone className="h-3.5 w-3.5" />
                                      Guardian Phone
                                    </Label>
                                    <p className="text-sm sm:text-base font-medium">{student.guardianPhone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
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
