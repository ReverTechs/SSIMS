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
  CheckCircle2,
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
      <DialogContent className="max-w-[95vw] lg:max-w-7xl xl:max-w-[90vw] 2xl:max-w-[85vw] w-full h-[95vh] max-h-[95vh] overflow-hidden p-0 gap-0 flex flex-col">
        {/* Cover Banner - Facebook Style */}
        <div className="relative w-full h-48 lg:h-56 flex-shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-visible">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 bg-gradient-to-t from-background to-transparent"></div>
          
          {/* Profile Picture - Suspended halfway down the background */}
          <div className="absolute left-4 sm:left-6 lg:left-8 bottom-0 translate-y-1/2 z-10">
            <Avatar className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 border-4 border-background shadow-xl ring-4 ring-blue-500/10">
              <AvatarImage src={undefined} alt={teacher.name} />
              <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {getInitials(teacher.name)}
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
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{teacher.name}</h2>
                  <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                    {teacher.id}
                  </Badge>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs sm:text-sm font-medium">Verified Teacher</span>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap pt-2">
                  {teacher.department && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="p-1.5 rounded-md bg-blue-500/10">
                        <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium">{teacher.department}</span>
                    </div>
                  )}
                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="p-1.5 rounded-md bg-purple-500/10">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="font-medium">
                        {teacher.subjects.length} {teacher.subjects.length === 1 ? "Subject" : "Subjects"}
                      </span>
                    </div>
                  )}
                  {teacher.totalStudents !== undefined && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-medium">{teacher.totalStudents} Students</span>
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
            {/* Stunning Horizontal Tabs Navigation */}
            <div className="w-full mb-6 flex-shrink-0">
              <div className="relative">
                {/* Background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl"></div>
                <TabsList className="relative flex flex-row h-auto w-full bg-gradient-to-r from-muted/50 via-muted/40 to-muted/50 backdrop-blur-sm p-1.5 gap-2 rounded-xl border border-border/50 shadow-lg">
                  <TabsTrigger
                    value="personal"
                    className="group relative flex-1 justify-center gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/50 data-[state=active]:scale-[1.02] transition-all duration-300 text-sm sm:text-base font-semibold hover:bg-accent/50"
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative z-10">Personal</span>
                    <div className="absolute inset-0 rounded-lg ring-2 ring-blue-500/0 group-hover:ring-blue-500/30 transition-all duration-300"></div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="teaching"
                    className="group relative flex-1 justify-center gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:via-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50 data-[state=active]:scale-[1.02] transition-all duration-300 text-sm sm:text-base font-semibold hover:bg-accent/50"
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative z-10">Teaching</span>
                    <div className="absolute inset-0 rounded-lg ring-2 ring-purple-500/0 group-hover:ring-purple-500/30 transition-all duration-300"></div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="group relative flex-1 justify-center gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-6 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:via-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 data-[state=active]:scale-[1.02] transition-all duration-300 text-sm sm:text-base font-semibold hover:bg-accent/50"
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative z-10">Contact</span>
                    <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-500/0 group-hover:ring-emerald-500/30 transition-all duration-300"></div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Content Area - Full Width */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 lg:space-y-6">
                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="mt-0 space-y-4">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
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
                            <p className="text-sm sm:text-base font-medium">{teacher.name}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              Email Address
                            </Label>
                            <p className="text-sm sm:text-base font-medium break-all">{teacher.email}</p>
                          </div>
                          {teacher.gender && (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                Gender
                              </Label>
                              <p className="text-sm sm:text-base font-medium capitalize">{teacher.gender}</p>
                            </div>
                          )}
                          {teacher.dateOfBirth && (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5" />
                                Date of Birth
                              </Label>
                              <p className="text-sm sm:text-base font-medium">
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
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5" />
                                Years of Experience
                              </Label>
                              <p className="text-sm sm:text-base font-medium">{teacher.yearsOfExperience} years</p>
                            </div>
                          )}
                          {teacher.qualification && (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Award className="h-3.5 w-3.5" />
                                Qualification
                              </Label>
                              <p className="text-sm sm:text-base font-medium">{teacher.qualification}</p>
                            </div>
                          )}
                          {teacher.specialization && (
                            <div className="space-y-2 sm:col-span-2">
                              {/* <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap className="h-3.5 w-3.5" />
                                Specialization/Major
                              </Label> */}
                               <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap className="h-3.5 w-3.5" />
                                MAJOR
                              </Label>
                              <p className="text-sm sm:text-base font-medium">{teacher.specialization}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Teaching Information Tab */}
                  <TabsContent value="teaching" className="mt-0 space-y-4">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          Teaching Information
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Teaching assignments, subjects, and classes
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        {teacher.department && (
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5" />
                              Department
                            </Label>
                            <Badge variant="secondary" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                              {teacher.department}
                            </Badge>
                            <Separator />
                          </div>
                        )}

                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                              <BookOpen className="h-3.5 w-3.5" />
                              Subjects Teaching ({teacher.subjects.length})
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {teacher.subjects.map((subject, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-blue-500/30 hover:border-blue-500/50 transition-colors"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                            <Separator />
                          </div>
                        )}

                        {teacher.classes && teacher.classes.length > 0 && (
                          <div className="space-y-3">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                              <Users className="h-3.5 w-3.5" />
                              Classes Assigned ({teacher.classes.length})
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {teacher.classes.map((className, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                                >
                                  {className}
                                </Badge>
                              ))}
                            </div>
                            <Separator />
                          </div>
                        )}

                        {/* Insight Cards - Responsive Grid */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 pt-2">
                          {teacher.subjects && (
                            <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 hover:border-blue-500/30 transition-colors">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-blue-500/10 flex-shrink-0">
                                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Subjects</p>
                                  <p className="text-xl sm:text-2xl font-bold">{teacher.subjects.length}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {teacher.totalStudents !== undefined && (
                            <div className="p-4 sm:p-5 rounded-lg bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20 hover:border-emerald-500/30 transition-colors">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-500/10 flex-shrink-0">
                                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Students</p>
                                  <p className="text-xl sm:text-2xl font-bold">{teacher.totalStudents}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Contact Information Tab */}
                  <TabsContent value="contact" className="mt-0 space-y-4">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10">
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          Contact Information
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Contact details and communication information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              Email Address
                            </Label>
                            <p className="text-sm sm:text-base font-medium break-all">{teacher.email}</p>
                          </div>
                          {teacher.phone && (
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5" />
                                Phone Number
                              </Label>
                              <p className="text-sm sm:text-base font-medium">{teacher.phone}</p>
                            </div>
                          )}
                          {teacher.address && (
                            <div className="space-y-2 sm:col-span-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                Address
                              </Label>
                              <p className="text-sm sm:text-base font-medium">{teacher.address}</p>
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
