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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Calculator,
  Pencil,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { User as UserType } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateTeacherProfile } from "@/lib/actions/teacher-profile";
import { useRouter } from "next/navigation";

interface TeacherData {
  teacherId: string;
  title?: string;
  department: string;

  departmentId?: string; // Kept for backward compatibility
  departments?: { id: string; name: string }[];
  subjects: string[];
  subjectIds?: string[];
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  yearsOfExperience: number;
  qualification: string;
  specialization: string;
  classes: string[];
  classIds?: string[];
  totalStudents: number;
  gender?: "male" | "female";
  teacherType?: "permanent" | "temporary" | "tp";
}

interface TeacherProfileContentProps {
  user: UserType;
  teacherData: TeacherData;
}

export function TeacherProfileContent({
  user,
  teacherData,
}: TeacherProfileContentProps) {
  const router = useRouter();
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

  // Edit dialog states
  const [personalDialogOpen, setPersonalDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [teachingDialogOpen, setTeachingDialogOpen] = useState(false);
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);
  const [tempSelectedDeptIds, setTempSelectedDeptIds] = useState<string[]>([]);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [personalSuccess, setPersonalSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [teachingError, setTeachingError] = useState<string | null>(null);
  const [teachingSuccess, setTeachingSuccess] = useState<string | null>(null);

  // Teaching form data
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [subjects, setSubjects] = useState<
    Array<{
      id: string;
      name: string;
      code: string;
      departmentId: string | null;
    }>
  >([]);
  const [classes, setClasses] = useState<
    Array<{
      id: string;
      name: string;
      gradeLevel: number;
      academicYear: string;
    }>
  >([]);
  const [teachingForm, setTeachingForm] = useState({
    departmentIds:
      teacherData.departments?.map((d) => d.id) ||
      (teacherData.departmentId ? [teacherData.departmentId] : []),
    subjectIds: teacherData.subjectIds || [],
    classIds: teacherData.classIds || [],
  });

  // Parse name to extract first, middle, and last name
  const parseName = (fullName: string) => {
    const nameWithoutTitle = fullName
      .replace(/^(Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Prof\.?|Rev\.?)\s+/i, "")
      .trim();
    const parts = nameWithoutTitle.split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], middleName: "", lastName: "" };
    } else if (parts.length === 2) {
      return { firstName: parts[0], middleName: "", lastName: parts[1] };
    } else {
      return {
        firstName: parts[0],
        middleName: parts.slice(1, -1).join(" "),
        lastName: parts[parts.length - 1],
      };
    }
  };

  const initialName = parseName(user.fullName);

  // Personal Information Form State
  const [personalForm, setPersonalForm] = useState({
    title: teacherData.title || "",
    firstName: initialName.firstName,
    middleName: initialName.middleName,
    lastName: initialName.lastName,
    email: user.email,
    gender: teacherData.gender || "",
    dateOfBirth: teacherData.dateOfBirth
      ? new Date(teacherData.dateOfBirth).toISOString().split("T")[0]
      : "",
    yearsOfExperience: teacherData.yearsOfExperience?.toString() || "",
    qualification: teacherData.qualification || "",
    specialization: teacherData.specialization || "",
  });

  // Contact Information Form State
  const [contactForm, setContactForm] = useState({
    phone: teacherData.phoneNumber || "",
    address: teacherData.address || "",
  });

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

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

  // Handle opening personal dialog
  const handleOpenPersonalDialog = () => {
    const parsed = parseName(user.fullName);
    setPersonalForm({
      title: teacherData.title || "",
      firstName: parsed.firstName,
      middleName: parsed.middleName,
      lastName: parsed.lastName,
      email: user.email,
      gender: teacherData.gender || "",
      dateOfBirth: teacherData.dateOfBirth
        ? new Date(teacherData.dateOfBirth).toISOString().split("T")[0]
        : "",
      yearsOfExperience: teacherData.yearsOfExperience?.toString() || "",
      qualification: teacherData.qualification || "",
      specialization: teacherData.specialization || "",
    });
    setPersonalError(null);
    setPersonalSuccess(null);
    setPersonalDialogOpen(true);
  };

  // Handle opening contact dialog
  const handleOpenContactDialog = () => {
    setContactForm({
      phone: teacherData.phoneNumber || "",
      address: teacherData.address || "",
    });
    setContactError(null);
    setContactSuccess(null);
    setContactDialogOpen(true);
  };

  // Handle opening teaching dialog
  const handleOpenTeachingDialog = async () => {
    setTeachingForm({
      departmentIds:
        teacherData.departments?.map((d) => d.id) ||
        (teacherData.departmentId ? [teacherData.departmentId] : []),
      subjectIds: teacherData.subjectIds || [],
      classIds: teacherData.classIds || [],
    });
    setTeachingError(null);
    setTeachingSuccess(null);
    setTeachingDialogOpen(true);

    // Only fetch if we haven't already
    if (departments.length === 0 || subjects.length === 0 || classes.length === 0) {
      try {
        const supabase = createClient();

        const [deptsResult, subsResult, clsResult] = await Promise.all([
          // Fetch departments
          supabase
            .from("departments")
            .select("id, name, code")
            .order("name", { ascending: true }),
          // Fetch subjects
          supabase
            .from("subjects")
            .select("id, name, code, department_id")
            .order("name", { ascending: true }),
          // Fetch classes
          supabase
            .from("classes")
            .select("id, name, grade_level, academic_year")
            .order("grade_level", { ascending: true })
            .order("name", { ascending: true }),
        ]);

        if (deptsResult.data) setDepartments(deptsResult.data);

        if (subsResult.data) {
          setSubjects(
            subsResult.data.map((s) => ({
              id: s.id,
              name: s.name,
              code: s.code,
              departmentId: s.department_id,
            }))
          );
        }

        if (clsResult.data) {
          setClasses(
            clsResult.data.map((c) => ({
              id: c.id,
              name: c.name,
              gradeLevel: c.grade_level,
              academicYear: c.academic_year,
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching teaching data:", err);
      }
    }
  };

  // Handle teaching form submission
  const handleTeachingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTeachingError(null);
    setTeachingSuccess(null);

    // Validation: If departments are selected, at least one subject must be selected
    if (
      teachingForm.departmentIds.length > 0 &&
      teachingForm.subjectIds.length === 0
    ) {
      setTeachingError("Select at least one subject!");
      setIsLoading(false);
      return;
    }

    // Additional validation: Ensure selected subjects belong to selected departments
    if (
      teachingForm.departmentIds.length > 0 &&
      teachingForm.subjectIds.length > 0
    ) {
      const validSubjects = teachingForm.subjectIds.filter((subjectId) => {
        const subject = subjects.find((s) => s.id === subjectId);
        return (
          subject &&
          subject.departmentId &&
          teachingForm.departmentIds.includes(subject.departmentId)
        );
      });

      if (validSubjects.length === 0) {
        setTeachingError(
          "Selected subjects must belong to the selected departments!"
        );
        setIsLoading(false);
        return;
      }

      // Update subjectIds to only include valid subjects
      if (validSubjects.length !== teachingForm.subjectIds.length) {
        setTeachingForm({
          ...teachingForm,
          subjectIds: validSubjects,
        });
      }
    }

    try {
      const result = await updateTeacherProfile(teacherData.teacherId, {
        departmentIds: teachingForm.departmentIds,
        subjectIds: teachingForm.subjectIds,
        classIds: teachingForm.classIds,
      });

      if (result.success) {
        setTeachingSuccess("Teaching information updated successfully!");
        setTimeout(() => {
          setTeachingDialogOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setTeachingError(
          result.error || "Failed to update teaching information"
        );
      }
    } catch (err) {
      setTeachingError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle personal form submission
  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPersonalError(null);
    setPersonalSuccess(null);

    try {
      const result = await updateTeacherProfile(teacherData.teacherId, {
        title: personalForm.title.trim(),
        firstName: personalForm.firstName.trim(),
        middleName: personalForm.middleName.trim(),
        lastName: personalForm.lastName.trim(),
        email: personalForm.email.trim(),
        gender: personalForm.gender
          ? (personalForm.gender as "male" | "female")
          : undefined,
        dateOfBirth: personalForm.dateOfBirth || undefined,
        yearsOfExperience: personalForm.yearsOfExperience
          ? parseInt(personalForm.yearsOfExperience, 10)
          : undefined,
        qualification: personalForm.qualification.trim(),
        specialization: personalForm.specialization.trim(),
      });

      if (result.success) {
        setPersonalSuccess("Profile updated successfully!");
        setTimeout(() => {
          setPersonalDialogOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setPersonalError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setPersonalError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setContactError(null);
    setContactSuccess(null);

    try {
      const result = await updateTeacherProfile(teacherData.teacherId, {
        phoneNumber: contactForm.phone.trim(),
        address: contactForm.address.trim(),
      });

      if (result.success) {
        setContactSuccess("Contact information updated successfully!");
        setTimeout(() => {
          setContactDialogOpen(false);
          router.refresh();
        }, 1500);
      } else {
        setContactError(result.error || "Failed to update contact information");
      }
    } catch (err) {
      setContactError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* YouTube Style Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
          <AvatarImage
            src={user.avatar}
            alt={user.fullName}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4 pt-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {user.fullName}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <span className="text-sm md:text-base">
                @{user.email.split("@")[0]}
              </span>
              <span className="text-xs">•</span>
              <span className="text-sm md:text-base">
                {teacherData.department} Department
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge
              className={`rounded-full bg-foreground text-background hover:bg-foreground/90 font-medium px-6 py-2 ${teacherData.teacherType !== "tp" ? "capitalize" : ""
                }`}
            >
              {teacherData.teacherType === "tp"
                ? "TP (Teaching Practice)"
                : teacherData.teacherType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Bar (Replacing "Create Post" area) - 3/4 Width */}
      <div className="w-full md:w-3/4 space-y-8">
        <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{user.fullName}</span>
            <Badge variant="secondary" className="ml-auto text-xs font-normal">
              Public
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {teacherData.specialization || "N/A"}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Specialization
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {teacherData.subjects.length} Subjects
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Teaching
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default">
              <Users className="h-5 w-5 text-purple-500" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {teacherData.totalStudents} Students
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Enrolled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Style Tabs - 3/4 Width (inherited from parent div) */}
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
              {["Personal", "Teaching", "Contact", "Security"].map((tab) => (
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

          {/* Content Area */}
          <div className="w-full">
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Basic profile details and personal information
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenPersonalDialog}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
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
                        {new Date(teacherData.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" />
                        Years of Experience
                      </Label>
                      <p className="text-sm font-medium">
                        {teacherData.yearsOfExperience} years
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <Award className="h-3.5 w-3.5" />
                        Qualification
                      </Label>
                      <p className="text-sm font-medium">
                        {teacherData.qualification}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Specialization
                      </Label>
                      <p className="text-sm font-medium">
                        {teacherData.specialization}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teaching Information Tab */}
            <TabsContent value="teaching" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Teaching Information
                      </CardTitle>
                      <CardDescription>
                        Teaching assignments, subjects, and classes
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenTeachingDialog}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department
                      </Label>
                      <Badge
                        variant="secondary"
                        className="text-sm px-4 py-1.5 rounded-full"
                      >
                        {teacherData.departments &&
                          teacherData.departments.length > 0
                          ? teacherData.departments
                            .map((d) => d.name)
                            .join(", ")
                          : teacherData.department || "Unassigned"}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Subjects Teaching
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.subjects.map((subject, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm px-4 py-1.5 rounded-full bg-background"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Classes Assigned
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {teacherData.classes.map((className, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm px-4 py-1.5 rounded-full bg-background"
                          >
                            {className}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="mt-0 space-y-6">
              <Card className="bg-card border rounded-xl shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Contact Information
                      </CardTitle>
                      <CardDescription>
                        Contact details and communication information
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenContactDialog}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
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
                      <p className="text-sm font-medium">
                        {teacherData.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </Label>
                      <p className="text-sm font-medium">
                        {teacherData.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
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
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
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
                        <Label
                          htmlFor="new-password"
                          className="flex items-center gap-2"
                        >
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
                        <Label
                          htmlFor="confirm-password"
                          className="flex items-center gap-2"
                        >
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
                    <p className="text-sm text-muted-foreground">
                      Please verify your credentials to update your password.
                    </p>
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
              <a
                href="/auth/forgot-password"
                className="text-sm text-primary underline underline-offset-4"
              >
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

      {/* Edit Personal Information Dialog */}
      <Dialog open={personalDialogOpen} onOpenChange={setPersonalDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your personal details and information.
            </DialogDescription>
          </DialogHeader>
          {personalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{personalError}</AlertDescription>
            </Alert>
          )}
          {personalSuccess && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                {personalSuccess}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handlePersonalSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Row 1: Name Details */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 sm:col-span-2 space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Select
                    value={personalForm.title}
                    onValueChange={(value) =>
                      setPersonalForm({ ...personalForm, title: value })
                    }
                  >
                    <SelectTrigger id="title">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr.</SelectItem>
                      <SelectItem value="Mrs">Mrs.</SelectItem>
                      <SelectItem value="Ms">Ms.</SelectItem>
                      <SelectItem value="Dr">Dr.</SelectItem>
                      <SelectItem value="Prof">Prof.</SelectItem>
                      <SelectItem value="Rev">Rev.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 sm:col-span-4 space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={personalForm.firstName}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="col-span-12 sm:col-span-3 space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={personalForm.middleName}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        middleName: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="col-span-12 sm:col-span-3 space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={personalForm.lastName}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        lastName: e.target.value,
                      })
                    }
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Row 2: Contact & Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalForm.email}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, email: e.target.value })
                    }
                    required
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={personalForm.gender}
                    onValueChange={(value) =>
                      setPersonalForm({ ...personalForm, gender: value })
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalForm.dateOfBirth}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Row 3: Professional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={personalForm.yearsOfExperience}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        yearsOfExperience: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={personalForm.qualification}
                    onChange={(e) =>
                      setPersonalForm({
                        ...personalForm,
                        qualification: e.target.value,
                      })
                    }
                    placeholder="e.g., B.Ed, M.Sc"
                  />
                </div>
              </div>

              {/* Row 4: Specialization */}
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={personalForm.specialization}
                  onChange={(e) =>
                    setPersonalForm({
                      ...personalForm,
                      specialization: e.target.value,
                    })
                  }
                  placeholder="e.g., Mathematics, Science"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPersonalDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog >

      {/* Edit Contact Information Dialog */}
      < Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>
              Update your contact details and address.
            </DialogDescription>
          </DialogHeader>
          {contactError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{contactError}</AlertDescription>
            </Alert>
          )}
          {contactSuccess && (
            <Alert className="border-emerald-500/50 bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                {contactSuccess}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: e.target.value })
                }
                placeholder="+1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={contactForm.address}
                onChange={(e) =>
                  setContactForm({ ...contactForm, address: e.target.value })
                }
                placeholder="Enter your full address"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setContactDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog >

      {/* Edit Teaching Information Dialog */}
      < Dialog open={teachingDialogOpen} onOpenChange={setTeachingDialogOpen} >
        <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl w-full max-h-[95vh] overflow-hidden p-0 gap-0 flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Teaching Information
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Update your department, subjects, and class assignments.
              </DialogDescription>
            </DialogHeader>
            {(teachingError || teachingSuccess) && (
              <div className="mt-4">
                {teachingError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{teachingError}</AlertDescription>
                  </Alert>
                )}
                {teachingSuccess && (
                  <Alert className="border-emerald-500/50 bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                      {teachingSuccess}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            <form
              onSubmit={handleTeachingSubmit}
              id="teaching-form"
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label
                  htmlFor="departmentIds"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Departments
                </Label>
                {teachingForm.departmentIds.length === 0 ? (
                  <div className="border rounded-lg p-6 text-center bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-4">
                      No departments selected
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAddDepartmentDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-card">
                    <div className="flex flex-wrap gap-2 items-center">
                      {teachingForm.departmentIds.map((deptId) => {
                        const dept = departments.find((d) => d.id === deptId);
                        if (!dept) return null;
                        return (
                          <div
                            key={deptId}
                            className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-md border"
                          >
                            <span className="text-sm font-medium">
                              {dept.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setTeachingForm({
                                  ...teachingForm,
                                  departmentIds:
                                    teachingForm.departmentIds.filter(
                                      (id) => id !== deptId
                                    ),
                                  // Also remove subjects from this department
                                  subjectIds: teachingForm.subjectIds.filter(
                                    (subjectId) => {
                                      const subject = subjects.find(
                                        (s) => s.id === subjectId
                                      );
                                      return subject?.departmentId !== deptId;
                                    }
                                  ),
                                });
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              aria-label={`Remove ${dept.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAddDepartmentDialogOpen(true)}
                        className="h-8 w-8 p-0"
                        aria-label="Add department"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subjects Taught
                  </Label>
                  {teachingForm.departmentIds.length > 0 &&
                    teachingForm.subjectIds.length === 0 && (
                      <span className="text-xs text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Select at least one subject
                      </span>
                    )}
                </div>
                {/* {teachingForm.departmentIds.length > 0 && teachingForm.subjectIds.length === 0 && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      You must select at least one subject for the selected departments.
                    </AlertDescription>
                  </Alert>
                )} */}
                <div className="border rounded-lg p-4 bg-card max-h-[280px] overflow-y-auto space-y-2 scrollbar-thin">
                  {subjects
                    .filter((subject) => {
                      // If no departments selected, show no subjects
                      if (teachingForm.departmentIds.length === 0) {
                        return false;
                      }
                      // Show subjects belonging to ANY of the selected departments
                      return (
                        subject.departmentId &&
                        teachingForm.departmentIds.includes(
                          subject.departmentId
                        )
                      );
                    })
                    .map((subject) => (
                      <div
                        key={subject.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={`subject-${subject.id}`}
                          checked={teachingForm.subjectIds.includes(subject.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeachingForm({
                                ...teachingForm,
                                subjectIds: [
                                  ...teachingForm.subjectIds,
                                  subject.id,
                                ],
                              });
                            } else {
                              setTeachingForm({
                                ...teachingForm,
                                subjectIds: teachingForm.subjectIds.filter(
                                  (id) => id !== subject.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                        <Label
                          htmlFor={`subject-${subject.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {subject.name}{" "}
                          <span className="text-muted-foreground">
                            ({subject.code})
                          </span>
                        </Label>
                      </div>
                    ))}
                  {teachingForm.departmentIds.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Please select a department to view available subjects.
                    </p>
                  )}
                  {teachingForm.departmentIds.length > 0 &&
                    subjects.filter(
                      (subject) =>
                        subject.departmentId &&
                        teachingForm.departmentIds.includes(
                          subject.departmentId
                        )
                    ).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No subjects available for the selected departments.
                      </p>
                    )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Classes Assigned
                </Label>
                <div className="border rounded-lg p-4 bg-card max-h-[280px] overflow-y-auto space-y-2 scrollbar-thin">
                  {classes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Loading classes...
                    </p>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={`class-${cls.id}`}
                          checked={teachingForm.classIds.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeachingForm({
                                ...teachingForm,
                                classIds: [...teachingForm.classIds, cls.id],
                              });
                            } else {
                              setTeachingForm({
                                ...teachingForm,
                                classIds: teachingForm.classIds.filter(
                                  (id) => id !== cls.id
                                ),
                              });
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                        />
                        <Label
                          htmlFor={`class-${cls.id}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          {cls.name}{" "}
                          <span className="text-muted-foreground">
                            (Grade {cls.gradeLevel}, {cls.academicYear})
                          </span>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t bg-muted/30">
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTeachingDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" form="teaching-form" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog >

      {/* Add Department Dialog - Nested */}
      < Dialog
        open={addDepartmentDialogOpen}
        onOpenChange={(open) => {
          setAddDepartmentDialogOpen(open);
          if (open) {
            // Initialize temp selection when opening
            setTempSelectedDeptIds([]);
          } else {
            // Reset temp selection when closing without saving
            setTempSelectedDeptIds([]);
          }
        }
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>
              Select one or more departments to add to your teaching
              assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
              {departments
                .filter((dept) => !teachingForm.departmentIds.includes(dept.id))
                .map((dept) => (
                  <div key={dept.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`add-dept-${dept.id}`}
                      checked={tempSelectedDeptIds.includes(dept.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempSelectedDeptIds([
                            ...tempSelectedDeptIds,
                            dept.id,
                          ]);
                        } else {
                          setTempSelectedDeptIds(
                            tempSelectedDeptIds.filter((id) => id !== dept.id)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label
                      htmlFor={`add-dept-${dept.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {dept.name} ({dept.code})
                    </Label>
                  </div>
                ))}
              {departments.filter(
                (dept) => !teachingForm.departmentIds.includes(dept.id)
              ).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All available departments have been added.
                  </p>
                )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddDepartmentDialogOpen(false);
                setTempSelectedDeptIds([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                // Apply selections before closing
                if (tempSelectedDeptIds.length > 0) {
                  // Filter out any duplicates (shouldn't happen, but safety check)
                  const newDeptIds = tempSelectedDeptIds.filter(
                    (id) => !teachingForm.departmentIds.includes(id)
                  );
                  if (newDeptIds.length > 0) {
                    setTeachingForm({
                      ...teachingForm,
                      departmentIds: [
                        ...teachingForm.departmentIds,
                        ...newDeptIds,
                      ],
                    });
                  }
                }
                setAddDepartmentDialogOpen(false);
                setTempSelectedDeptIds([]);
              }}
              disabled={tempSelectedDeptIds.length === 0}
            >
              Add Selected{" "}
              {tempSelectedDeptIds.length > 0 &&
                `(${tempSelectedDeptIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
}
