"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AcademicYear } from "@/types"
import { promoteStudents } from "@/actions/enrollment/enrollments"
import { checkEnrollmentsForeignKey } from "@/actions/enrollment/debug-enrollments"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, ArrowRight, Users } from "lucide-react"
import { getEnrolledStudents } from "@/actions/enrollment/get-enrolled-students"

interface Class {
  id: string
  name: string
}

interface Student {
  id: string
  firstName: string
  lastName: string
  classId: string
}

export function PromotionManager({
  years,
  classes,
}: {
  years: AcademicYear[]
  classes: Class[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [promoting, setPromoting] = useState(false)

  // Selection State
  const [sourceYearId, setSourceYearId] = useState<string>("")
  const [sourceClassId, setSourceClassId] = useState<string>("")
  const [targetYearId, setTargetYearId] = useState<string>("")
  const [targetClassId, setTargetClassId] = useState<string>("")

  // Data State
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set())

  async function fetchStudents() {
    if (!sourceYearId || !sourceClassId) {
      toast.error("Please select source year and class")
      return
    }

    setLoading(true)

    try {
      // Use server action to get stable, normalized student payload
      const enrolled = await getEnrolledStudents({
        academicYearId: sourceYearId,
        classId: sourceClassId,
      })

      const formattedStudents = (enrolled || []).map((s: any) => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        classId: s.class_id,
      }))

      setStudents(formattedStudents)
      // Select all by default
      setSelectedStudentIds(new Set(formattedStudents.map((s) => s.id)))
      setStep(2)

      if (formattedStudents.length === 0) {
        toast.info("No students found in the selected class")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch students"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handlePromotion() {
    if (!targetYearId || !targetClassId) {
      toast.error("Please select target year and class");
      return;
    }

    if (selectedStudentIds.size === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setPromoting(true);
    try {
      await promoteStudents({
        studentIds: Array.from(selectedStudentIds),
        targetClassId,
        targetYearId,
      });
      toast.success(
        `Successfully promoted ${selectedStudentIds.size} students`
      );
      router.refresh();
      // Reset or go to success state?
      setStep(1);
      setStudents([]);
      setSelectedStudentIds(new Set());
    } catch (error) {
      toast.error("Failed to promote students");
    } finally {
      setPromoting(false);
    }
  }

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map((s) => s.id)));
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={step === 1 ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>1. Source (Current)</CardTitle>
            <CardDescription>
              Where are the students coming from?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={sourceYearId} onValueChange={setSourceYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name} {y.isActive ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={sourceClassId} onValueChange={setSourceClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className={step === 2 ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>2. Target (Destination)</CardTitle>
            <CardDescription>Where are they going?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={targetYearId} onValueChange={setTargetYearId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name} {y.isActive ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={targetClassId} onValueChange={setTargetClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Area */}
      {step === 1 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const result = await checkEnrollmentsForeignKey();
              console.log("=== DIAGNOSTIC RESULTS ===", result);
              toast.info("Check console for diagnostic results");
            }}
          >
            🔍 Test Foreign Key
          </Button>
          <Button
            onClick={fetchStudents}
            disabled={loading || !sourceYearId || !sourceClassId}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fetch Students
          </Button>
        </div>
      )}

      {/* Step 2: Student Selection */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Select Students to Promote</span>
              <span className="text-sm font-normal text-muted-foreground">
                {selectedStudentIds.size} of {students.length} selected
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={
                  selectedStudentIds.size === students.length &&
                  students.length > 0
                }
                onCheckedChange={toggleAll}
              />
              <Label htmlFor="select-all">Select All</Label>
            </div>

            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-muted/50"
                >
                  <Checkbox
                    id={student.id}
                    checked={selectedStudentIds.has(student.id)}
                    onCheckedChange={() => toggleStudent(student.id)}
                  />
                  <Label htmlFor={student.id} className="cursor-pointer flex-1">
                    {student.firstName} {student.lastName}
                  </Label>
                </div>
              ))}
            </div>

            {students.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No students found in the selected source class.
              </div>
            )}
          </CardContent>
          <div className="p-6 border-t bg-muted/20 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={handlePromotion}
              disabled={promoting || selectedStudentIds.size === 0}
            >
              {promoting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Promote {selectedStudentIds.size} Students
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
