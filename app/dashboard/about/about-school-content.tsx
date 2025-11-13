"use client";

import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { UserRole } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Building2,
  Calendar,
  Calculator,
  Layers,
  Library,
  PenSquare,
  Plus,
  Quote,
  Save,
  School,
  Settings,
  Tags,
  Trash2,
  Upload,
  Wallet,
  X,
} from "lucide-react";

interface AboutSchoolContentProps {
  userRole: UserRole;
}

interface SchoolData {
  fullName: string;
  centerName: string;
  backgroundInfo: string;
  logo: string;
  schoolType: "government" | "private";
  governmentCategory?:
    | "national"
    | "district"
    | "conventional"
    | "CDSS"
    | "mission";
  motto: string;
  yearEstablished: string;
}

interface Subject {
  id: string;
  name: string;
  level: string;
  department: string;
}

interface FeeItem {
  id: string;
  title: string;
  amount: string;
  description: string;
}

const initialSchoolData: SchoolData = {
  fullName: "Wynberg Boys' High School",
  centerName: "MTSS005",
  backgroundInfo:
    "Wynberg Boys' High School is a prestigious educational institution committed to academic excellence, character development, and holistic education. Established with a vision to nurture future leaders, the school provides a comprehensive curriculum that balances academic rigor with extracurricular activities. Our dedicated faculty and modern facilities create an environment where students can thrive academically, socially, and personally.",
  logo: "/images/Coat_of_arms_of_Malawi.svg.png",
  schoolType: "government",
  governmentCategory: "national",
  motto: "Excellence Through Dedication",
  yearEstablished: "1950",
};

const initialSubjects: Subject[] = [
  {
    id: "english-language",
    name: "English Language",
    level: "Forms 1 - 4",
    department: "Languages",
  },
  {
    id: "chichewa",
    name: "Chichewa",
    level: "Forms 1 - 4",
    department: "Languages",
  },
  {
    id: "mathematics",
    name: "Mathematics",
    level: "Forms 1 - 4",
    department: "Sciences",
  },
  {
    id: "biology",
    name: "Biology",
    level: "Forms 3 - 4",
    department: "Sciences",
  },
  {
    id: "geography",
    name: "Geography",
    level: "Forms 2 - 4",
    department: "Humanities",
  },
  {
    id: "business-studies",
    name: "Business Studies",
    level: "Forms 3 - 4",
    department: "Commercial",
  },
];

const initialFees: FeeItem[] = [
  {
    id: "tuition",
    title: "Tuition Fees",
    amount: "MWK 350,000",
    description: "Core instructional costs per academic term.",
  },
  {
    id: "library",
    title: "Library Fees",
    amount: "MWK 25,000",
    description:
      "Access, maintenance, and new collections for the resource centre.",
  },
  {
    id: "accommodation",
    title: "Accommodation Fees",
    amount: "MWK 180,000",
    description: "Boarding facilities including utilities and maintenance.",
  },
  {
    id: "pta",
    title: "PTA Contributions",
    amount: "MWK 15,000",
    description: "Parent-Teacher Association development projects.",
  },
];

export function AboutSchoolContent({ userRole }: AboutSchoolContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [schoolData, setSchoolData] = useState<SchoolData>(initialSchoolData);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(() => [
    ...initialSubjects,
  ]);
  const [fees, setFees] = useState<FeeItem[]>(() => [...initialFees]);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<Omit<Subject, "id">>({
    name: "",
    level: "",
    department: "",
  });
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [feeForm, setFeeForm] = useState<Omit<FeeItem, "id">>({
    title: "",
    amount: "",
    description: "",
  });

  const canEdit = useMemo(
    () => ["admin", "headteacher", "deputy_headteacher"].includes(userRole),
    [userRole]
  );

  const handleInputChange = (field: keyof SchoolData, value: string) => {
    setSchoolData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setSchoolData((prev) => ({
        ...prev,
        logo: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditMode(false);
    setLogoPreview(null);
  };

  const handleCancel = () => {
    setSchoolData(initialSchoolData);
    setSubjects([...initialSubjects]);
    setFees([...initialFees]);
    setIsEditMode(false);
    setLogoPreview(null);
  };

  const openSubjectDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubjectId(subject.id);
      setSubjectForm({
        name: subject.name,
        level: subject.level,
        department: subject.department,
      });
    } else {
      setEditingSubjectId(null);
      setSubjectForm({
        name: "",
        level: "",
        department: "",
      });
    }
    setIsSubjectDialogOpen(true);
  };

  const handleSubjectSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subjectForm.name.trim() || !subjectForm.level.trim()) {
      return;
    }

    if (editingSubjectId) {
      setSubjects((prev) =>
        prev.map((subject) =>
          subject.id === editingSubjectId
            ? { ...subject, ...subjectForm }
            : subject
        )
      );
    } else {
      setSubjects((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...subjectForm,
        },
      ]);
    }

    setIsSubjectDialogOpen(false);
  };

  const handleSubjectDelete = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
  };

  const openFeeDialog = (fee?: FeeItem) => {
    if (fee) {
      setEditingFeeId(fee.id);
      setFeeForm({
        title: fee.title,
        amount: fee.amount,
        description: fee.description,
      });
    } else {
      setEditingFeeId(null);
      setFeeForm({
        title: "",
        amount: "",
        description: "",
      });
    }
    setIsFeeDialogOpen(true);
  };

  const handleFeeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!feeForm.title.trim() || !feeForm.amount.trim()) {
      return;
    }

    if (editingFeeId) {
      setFees((prev) =>
        prev.map((fee) =>
          fee.id === editingFeeId ? { ...fee, ...feeForm } : fee
        )
      );
    } else {
      setFees((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ...feeForm,
        },
      ]);
    }

    setIsFeeDialogOpen(false);
  };

  const handleFeeDelete = (id: string) => {
    setFees((prev) => prev.filter((fee) => fee.id !== id));
  };

  // Calculate total fees automatically
  const totalFees = useMemo(() => {
    return fees.reduce((total, fee) => {
      // Parse amount string (e.g., "MWK 350,000" -> 350000)
      const amountStr = fee.amount
        .replace(/MWK/gi, "")
        .replace(/,/g, "")
        .trim();
      const amount = parseFloat(amountStr) || 0;
      return total + amount;
    }, 0);
  }, [fees]);

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `MWK ${amount.toLocaleString("en-US")}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            School Overview
          </h1>
          <p className="text-muted-foreground">
            A modern snapshot of the school&apos;s identity, culture, and
            academics.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 rounded-full border bg-muted/50 px-4 py-2 shadow-sm">
            <Label htmlFor="edit-mode" className="text-sm font-medium">
              Edit mode
            </Label>
            <Switch
              id="edit-mode"
              checked={isEditMode}
              onCheckedChange={setIsEditMode}
            />
          </div>
        )}
      </div>

      {isEditMode && (
        <Alert className="border-yellow-500/40 bg-yellow-500/10 backdrop-blur">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-200">
            You&apos;re editing live school information. Review all changes
            carefully before saving.
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-6">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-100 via-white to-slate-200 p-8 shadow-sm dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="absolute inset-y-0 right-0 hidden w-1/3 translate-x-1/3 blur-3xl lg:block">
            <div className="h-full w-full bg-gradient-to-br from-blue-400/40 via-purple-500/40 to-sky-400/30" />
          </div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-lg ring-4 ring-white/60 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 dark:ring-slate-800/80">
                    {(logoPreview || schoolData.logo) && (
                      <Image
                        src={logoPreview || schoolData.logo}
                        alt="School logo"
                        fill
                        className="object-contain p-4"
                        unoptimized={Boolean(logoPreview)}
                      />
                    )}
                  </div>
                  {canEdit && isEditMode && (
                    <>
                      <Label
                        htmlFor="logo-upload"
                        className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-md ring-1 ring-primary/40 hover:bg-primary/90"
                      >
                        Change logo
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    {schoolData.centerName}
                  </p>
                  <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                    {schoolData.fullName}
                  </h2>
                </div>
                <p className="max-w-xl text-base italic text-muted-foreground">
                  &ldquo;{schoolData.motto}&rdquo;
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Established
                    </p>
                    <p className="text-sm font-semibold">
                      {schoolData.yearEstablished}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                    <School className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      School type
                    </p>
                    <p className="text-sm font-semibold capitalize">
                      {schoolData.schoolType}
                    </p>
                    {schoolData.schoolType === "government" &&
                      schoolData.governmentCategory && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {schoolData.governmentCategory}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                    <Layers className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">
                      Streams
                    </p>
                    <p className="text-sm font-semibold">Junior & Senior</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card className="rounded-3xl border border-border/60 bg-muted/30 shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Identity & Governance
                </CardTitle>
                <CardDescription>
                  Registration details and school classification.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="school-full-name">School full name</Label>
                {isEditMode ? (
                  <Input
                    id="school-full-name"
                    value={schoolData.fullName}
                    onChange={(event) =>
                      handleInputChange("fullName", event.target.value)
                    }
                    placeholder="Enter official school name"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground">
                    {schoolData.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="center-name">Center name</Label>
                {isEditMode ? (
                  <Input
                    id="center-name"
                    value={schoolData.centerName}
                    onChange={(event) =>
                      handleInputChange("centerName", event.target.value)
                    }
                    placeholder="e.g. MTSS005"
                  />
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    {schoolData.centerName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-type">School type</Label>
                {isEditMode ? (
                  <Select
                    value={schoolData.schoolType}
                    onValueChange={(value: "government" | "private") =>
                      handleInputChange("schoolType", value)
                    }
                  >
                    <SelectTrigger id="school-type">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium capitalize text-foreground">
                    {schoolData.schoolType}
                  </p>
                )}
              </div>

              {schoolData.schoolType === "government" && (
                <div className="space-y-2">
                  <Label htmlFor="government-category">
                    Government category
                  </Label>
                  {isEditMode ? (
                    <Select
                      value={schoolData.governmentCategory ?? "national"}
                      onValueChange={(
                        value:
                          | "national"
                          | "district"
                          | "conventional"
                          | "CDSS"
                          | "mission"
                      ) => handleInputChange("governmentCategory", value)}
                    >
                      <SelectTrigger id="government-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national">National</SelectItem>
                        <SelectItem value="district">District</SelectItem>
                        <SelectItem value="conventional">
                          Conventional
                        </SelectItem>
                        <SelectItem value="CDSS">CDSS</SelectItem>
                        <SelectItem value="mission">Mission</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-medium capitalize text-muted-foreground">
                      {schoolData.governmentCategory}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-muted/30 shadow-lg shadow-slate-900/5 transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/5 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Campus Snapshot
                </CardTitle>
                <CardDescription>
                  Quick facts shared with families and partners.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="year-established">Year established</Label>
              {isEditMode ? (
                <Input
                  id="year-established"
                  value={schoolData.yearEstablished}
                  onChange={(event) =>
                    handleInputChange("yearEstablished", event.target.value)
                  }
                  placeholder="Enter year"
                />
              ) : (
                <p className="text-sm font-medium text-foreground">
                  {schoolData.yearEstablished}
                </p>
              )}
            </div>

            <Separator className="bg-border/70" />

            <div className="space-y-2">
              <Label htmlFor="school-motto">School motto</Label>
              {isEditMode ? (
                <Textarea
                  id="school-motto"
                  value={schoolData.motto}
                  onChange={(event) =>
                    handleInputChange("motto", event.target.value)
                  }
                  rows={3}
                  placeholder="Enter school motto"
                />
              ) : (
                <p className="rounded-2xl bg-muted/60 px-4 py-3 text-sm italic text-muted-foreground">
                  &ldquo;{schoolData.motto}&rdquo;
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-3xl border-0 bg-card shadow-lg shadow-slate-900/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-200">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Background & Story
              </CardTitle>
              <CardDescription>
                A condensed narrative of the school&apos;s history and
                aspirations.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <Textarea
              value={schoolData.backgroundInfo}
              onChange={(event) =>
                handleInputChange("backgroundInfo", event.target.value)
              }
              rows={6}
              placeholder="Capture the school history, milestones, and guiding philosophy."
            />
          ) : (
            <div className="space-y-4 rounded-3xl bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
              <p className="whitespace-pre-line">{schoolData.backgroundInfo}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-card shadow-lg shadow-slate-900/5">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Subjects Offered
                </CardTitle>
                <CardDescription>
                  Core and elective subjects available across the whole school.
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <Badge
                role="button"
                onClick={() => openSubjectDialog()}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border-primary/50 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                <PenSquare className="h-3.5 w-3.5" />
                Manage
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group rounded-2xl border border-border/60 bg-muted/30 p-4 transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{subject.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {subject.level}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-secondary/40 bg-secondary/10 text-xs"
                  >
                    {subject.department}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          {subjects.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No subjects have been added yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-card shadow-lg shadow-slate-900/5">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Fees Structure
                </CardTitle>
                <CardDescription>
                  Up-to-date overview of payable items for Malawi secondary
                  school learners.
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <Badge
                role="button"
                onClick={() => openFeeDialog()}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border-primary/50 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                <PenSquare className="h-3.5 w-3.5" />
                Manage
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {fees.map((fee) => (
              <div
                key={fee.id}
                className="rounded-2xl border border-border/60 bg-muted/30 p-5 shadow-sm transition hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-semibold">{fee.title}</h3>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {fee.amount}
                    </p>
                  </div>
                  <Library className="h-4 w-4 text-muted-foreground/70" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {fee.description}
                </p>
              </div>
            ))}
          </div>
          {fees.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              No fees have been configured yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-lg shadow-emerald-900/10 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                Total Fees Summary
              </CardTitle>
              <CardDescription>
                Automatically calculated from the fees structure above
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-200/60 bg-gradient-to-br from-white/80 to-emerald-50/50 p-8 shadow-inner dark:border-emerald-800/40 dark:from-slate-900/80 dark:to-emerald-950/30">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Total Amount
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
              {formatCurrency(totalFees)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Based on {fees.length} {fees.length === 1 ? "fee item" : "fee items"}
            </p>
          </div>
        </CardContent>
      </Card>

      {isEditMode && (
        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      )}

      {canEdit && (
        <>
          <Dialog
            open={isSubjectDialogOpen}
            onOpenChange={(open) => {
              setIsSubjectDialogOpen(open);
              if (!open) {
                setEditingSubjectId(null);
                setSubjectForm({ name: "", level: "", department: "" });
              }
            }}
          >
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSubjectId ? "Edit subject" : "Manage subjects"}
                </DialogTitle>
                <DialogDescription>
                  Add new subjects or refine existing offerings. These changes
                  update the live list instantly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No subjects yet. Use the form below to add one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-border"
                        >
                          <div>
                            <p className="text-sm font-semibold">
                              {subject.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subject.level} &middot; {subject.department}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openSubjectDialog(subject)}
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleSubjectDelete(subject.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubjectSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="subject-name">Subject name</Label>
                      <Input
                        id="subject-name"
                        required
                        value={subjectForm.name}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        placeholder="e.g. Physics"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-level">Level / forms</Label>
                      <Input
                        id="subject-level"
                        required
                        value={subjectForm.level}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({
                            ...prev,
                            level: event.target.value,
                          }))
                        }
                        placeholder="Forms 1 - 4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject-department">Department</Label>
                      <Input
                        id="subject-department"
                        value={subjectForm.department}
                        onChange={(event) =>
                          setSubjectForm((prev) => ({
                            ...prev,
                            department: event.target.value,
                          }))
                        }
                        placeholder="Sciences, Languages..."
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsSubjectDialogOpen(false);
                        setEditingSubjectId(null);
                        setSubjectForm({ name: "", level: "", department: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {editingSubjectId ? "Save subject" : "Add subject"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isFeeDialogOpen}
            onOpenChange={(open) => {
              setIsFeeDialogOpen(open);
              if (!open) {
                setEditingFeeId(null);
                setFeeForm({ title: "", amount: "", description: "" });
              }
            }}
          >
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFeeId ? "Edit fees item" : "Manage fees structure"}
                </DialogTitle>
                <DialogDescription>
                  Capture the latest charges for students. Ensure currency and
                  rounding follow school policy.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  {fees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No fee items yet. Use the form below to add one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div
                          key={fee.id}
                          className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-border"
                        >
                          <div>
                            <p className="text-sm font-semibold">{fee.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {fee.amount} &middot; {fee.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openFeeDialog(fee)}
                            >
                              <PenSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleFeeDelete(fee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleFeeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee-title">Fee title</Label>
                    <Input
                      id="fee-title"
                      required
                      value={feeForm.title}
                      onChange={(event) =>
                        setFeeForm((prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder="e.g. Library Fees"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-amount">Amount</Label>
                    <Input
                      id="fee-amount"
                      required
                      value={feeForm.amount}
                      onChange={(event) =>
                        setFeeForm((prev) => ({
                          ...prev,
                          amount: event.target.value,
                        }))
                      }
                      placeholder="MWK 25,000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee-description">Description</Label>
                    <Textarea
                      id="fee-description"
                      value={feeForm.description}
                      onChange={(event) =>
                        setFeeForm((prev) => ({
                          ...prev,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Explain what this fee covers."
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsFeeDialogOpen(false);
                        setEditingFeeId(null);
                        setFeeForm({ title: "", amount: "", description: "" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Plus className="h-4 w-4" />
                      {editingFeeId ? "Save fee" : "Add fee"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
