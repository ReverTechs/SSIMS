"use client";

import { useMemo, useState } from "react";
import { GraduationCap, RefreshCw, Save, School } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
};

const TEACHERS: Teacher[] = [
  {
    id: "T001",
    name: "Mr. Banda",
    email: "banda@school.mw",
    department: "Mathematics",
    subjects: ["Mathematics"],
  },
  {
    id: "T002",
    name: "Mrs. Mwale",
    email: "mwale@school.mw",
    department: "Languages",
    subjects: ["English"],
  },
  {
    id: "T003",
    name: "Mr. Phiri",
    email: "phiri@school.mw",
    department: "Sciences",
    subjects: ["Physics"],
  },
];

const SUBJECTS = [
  "Mathematics",
  "English",
  "Chichewa",
  "Biology",
  "Chemistry",
  "Physics",
  "History",
  "Geography",
  "Computer Studies",
  "Agriculture",
];

export function AssignSubjectsPanel() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    TEACHERS[0]?.id ?? ""
  );
  const [subjectSearch, setSubjectSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [assignments, setAssignments] = useState<Record<string, Set<string>>>(
    () => {
      const initial: Record<string, Set<string>> = {};
      for (const teacher of TEACHERS) {
        initial[teacher.id] = new Set(teacher.subjects);
      }
      return initial;
    }
  );

  const teacher = useMemo(
    () => TEACHERS.find((t) => t.id === selectedTeacherId) ?? null,
    [selectedTeacherId]
  );

  const filteredSubjects = useMemo(() => {
    const q = subjectSearch.trim().toLowerCase();
    if (!q) return SUBJECTS;
    return SUBJECTS.filter((subject) => subject.toLowerCase().includes(q));
  }, [subjectSearch]);

  const selectedSubjects = useMemo(() => {
    if (!teacher) return new Set<string>();
    return assignments[teacher.id] ?? new Set<string>();
  }, [assignments, teacher]);

  const toggleSubject = (subject: string) => {
    if (!teacher) return;
    setAssignments((prev) => {
      const copy = { ...prev };
      const existing = new Set(copy[teacher.id] ?? []);
      if (existing.has(subject)) {
        existing.delete(subject);
      } else {
        existing.add(subject);
      }
      copy[teacher.id] = existing;
      return copy;
    });
  };

  const onSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSaving(false);
  };

  const onReset = () => {
    if (!teacher) return;
    const original = TEACHERS.find((t) => t.id === teacher.id)?.subjects ?? [];
    setAssignments((prev) => ({
      ...prev,
      [teacher.id]: new Set(original),
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Assign Subjects</CardTitle>
              <CardDescription>
                Select a teacher and curate the subjects they specialize in.
                Changes sync with class scheduling.
              </CardDescription>
            </div>
          </div>
          {teacher && (
            <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary shadow-inner">
              <p className="font-medium">{teacher.name}</p>
              <p className="text-xs text-primary/70">{teacher.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select teacher</CardTitle>
          <CardDescription>
            Choose the teacher whose subject assignments you want to adjust.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-select">Teacher</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={(value) => setSelectedTeacherId(value)}
              >
                <SelectTrigger
                  id="teacher-select"
                  className="w-full items-start text-left"
                >
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent className="min-w-[240px]">
                  {TEACHERS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{item.name}</span>
                        {/* <span className="text-xs text-muted-foreground">
                          {item.email}
                        </span> */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {teacher && (
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-primary/80">
                    Teacher ID
                  </p>
                  <p className="font-medium text-foreground">{teacher.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-primary/80">
                    Department
                  </p>
                  <p className="font-medium text-foreground">
                    {teacher.department}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle className="text-lg">Subjects library</CardTitle>
            <CardDescription>
              Activate the subjects this teacher can teach. Students will see
              updates instantly.
            </CardDescription>
          </div>
          <div className="sm:w-72">
            <Label htmlFor="subject-search" className="sr-only">
              Search subjects
            </Label>
            <Input
              id="subject-search"
              placeholder="Search subjects..."
              value={subjectSearch}
              onChange={(event) => setSubjectSearch(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects.map((subject) => {
              const isActive = selectedSubjects.has(subject);
              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleSubject(subject)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                    "hover:border-primary/40 hover:shadow-md active:scale-[0.99]",
                    isActive
                      ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                      : "border-border/70 bg-card text-foreground"
                  )}
                >
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 text-purple-600 dark:text-purple-400 transition-colors group-hover:from-purple-500/20 group-hover:to-pink-600/20 group-hover:text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{subject}</span>
                </button>
              );
            })}
            {filteredSubjects.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/30 px-6 py-10 text-center text-sm text-muted-foreground">
                No subjects found. Adjust your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-muted/60 bg-muted/30">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Assignment summary</CardTitle>
            <CardDescription>
              Review the selection before saving. You can always revisit and
              tweak later.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onReset} disabled={!teacher}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={onSave} disabled={!teacher || isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {teacher ? (
            <>
              <div className="rounded-2xl border border-border/60 bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <School className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {teacher.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.department} • {teacher.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedSubjects).length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No subjects assigned yet. Select at least one subject to
                    continue.
                  </span>
                ) : (
                  Array.from(selectedSubjects).map((subject) => (
                    <Badge
                      key={subject}
                      variant="secondary"
                      className="rounded-xl px-3 py-1 text-xs"
                    >
                      {subject}
                    </Badge>
                  ))
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a teacher to view assignment details.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
