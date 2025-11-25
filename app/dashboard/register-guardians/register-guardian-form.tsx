"use client";

import { useActionState, useState, useEffect } from "react";
import { registerGuardian } from "@/app/actions/register-guardian";
import { StudentOption } from "@/app/actions/get-students";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RegisterGuardianFormProps {
    students: StudentOption[];
}

export function RegisterGuardianForm({ students }: RegisterGuardianFormProps) {
    const [state, action, isPending] = useActionState(registerGuardian, {
        message: "",
        errors: {},
        success: false,
    });
    const [isVerified, setIsVerified] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());

    // Reset form on success
    useEffect(() => {
        if (state.success) {
            const form = document.querySelector("form") as HTMLFormElement;
            if (form) form.reset();
            setIsVerified(false);
            setSelectedStudents(new Set());
            setExpandedStudents(new Set());
        }
    }, [state.success]);

    const handleStudentToggle = (studentId: string) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
            const newExpanded = new Set(expandedStudents);
            newExpanded.delete(studentId);
            setExpandedStudents(newExpanded);
        } else {
            newSelected.add(studentId);
            // Auto-expand when selected
            const newExpanded = new Set(expandedStudents);
            newExpanded.add(studentId);
            setExpandedStudents(newExpanded);
        }
        setSelectedStudents(newSelected);
    };

    const toggleStudentExpanded = (studentId: string) => {
        const newExpanded = new Set(expandedStudents);
        if (newExpanded.has(studentId)) {
            newExpanded.delete(studentId);
        } else {
            newExpanded.add(studentId);
        }
        setExpandedStudents(newExpanded);
    };

    return (
        <form action={action} className="space-y-4">
            {state.message && (
                <div
                    className={`p-4 rounded-md ${state.success
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                >
                    {state.message}
                </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Select name="title" defaultValue="mr">
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mr">Mr.</SelectItem>
                                <SelectItem value="mrs">Mrs.</SelectItem>
                                <SelectItem value="ms">Ms.</SelectItem>
                                <SelectItem value="dr">Dr.</SelectItem>
                                <SelectItem value="prof">Prof.</SelectItem>
                                <SelectItem value="rev">Rev.</SelectItem>
                            </SelectContent>
                        </Select>
                        {state.errors?.title && (
                            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" placeholder="John" />
                        {state.errors?.firstName && (
                            <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="middleName">
                            Middle Name <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input id="middleName" name="middleName" placeholder="D." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" placeholder="Doe" />
                        {state.errors?.lastName && (
                            <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    {state.errors?.gender && (
                        <p className="text-sm text-red-500">{state.errors.gender[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="guardian@example.com" />
                    {state.errors?.email && (
                        <p className="text-sm text-red-500">{state.errors.email[0]}</p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" name="phoneNumber" placeholder="+265991234567" />
                        {state.errors?.phoneNumber && (
                            <p className="text-sm text-red-500">{state.errors.phoneNumber[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alternativePhone">
                            Alternative Phone <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input id="alternativePhone" name="alternativePhone" placeholder="+265991234567" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="nationalId">National ID</Label>
                    <Input id="nationalId" name="nationalId" placeholder="MWI123456789" />
                    {state.errors?.nationalId && (
                        <p className="text-sm text-red-500">{state.errors.nationalId[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">
                        Address <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Textarea id="address" name="address" placeholder="Full address" rows={2} />
                </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>

                <div className="space-y-2">
                    <Label htmlFor="occupation">
                        Occupation <span className="text-muted-foreground text-xs">(Optional)</span>
                    </Label>
                    <Input id="occupation" name="occupation" placeholder="Teacher, Doctor, etc." />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="workplace">
                            Workplace <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input id="workplace" name="workplace" placeholder="Company/Organization" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="workPhone">
                            Work Phone <span className="text-muted-foreground text-xs">(Optional)</span>
                        </Label>
                        <Input id="workPhone" name="workPhone" placeholder="+265991234567" />
                    </div>
                </div>
            </div>

            {/* Guardian Preferences */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preferences</h3>

                <div className="space-y-2">
                    <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                    <Select name="preferredContactMethod" defaultValue="phone">
                        <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isEmergencyContact"
                        name="isEmergencyContact"
                        value="true"
                        defaultChecked
                    />
                    <Label htmlFor="isEmergencyContact" className="text-sm font-normal cursor-pointer">
                        Available as emergency contact
                    </Label>
                </div>
            </div>

            {/* Student Connections */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Connections <span className="text-red-500">*</span></h3>

                <div className="border rounded-md p-4 space-y-3 max-h-96 overflow-y-auto">
                    {students.length > 0 ? (
                        students.map((student) => {
                            const isSelected = selectedStudents.has(student.id);
                            const isExpanded = expandedStudents.has(student.id);

                            return (
                                <div key={student.id} className="border rounded-md p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2 flex-1">
                                            <Checkbox
                                                id={`student-${student.id}`}
                                                name="studentIds"
                                                value={student.id}
                                                checked={isSelected}
                                                onCheckedChange={() => handleStudentToggle(student.id)}
                                            />
                                            <Label htmlFor={`student-${student.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                {student.name} {student.class && `(${student.class})`}
                                            </Label>
                                        </div>
                                        {isSelected && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleStudentExpanded(student.id)}
                                            >
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        )}
                                    </div>

                                    {isSelected && isExpanded && (
                                        <div className="ml-6 space-y-3 pt-2 border-t">
                                            <div className="space-y-2">
                                                <Label htmlFor={`relationship_${student.id}`} className="text-sm">
                                                    Relationship <span className="text-red-500">*</span>
                                                </Label>
                                                <Select name={`relationship_${student.id}`} required={isSelected}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select relationship" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="father">Father</SelectItem>
                                                        <SelectItem value="mother">Mother</SelectItem>
                                                        <SelectItem value="stepfather">Stepfather</SelectItem>
                                                        <SelectItem value="stepmother">Stepmother</SelectItem>
                                                        <SelectItem value="grandfather">Grandfather</SelectItem>
                                                        <SelectItem value="grandmother">Grandmother</SelectItem>
                                                        <SelectItem value="uncle">Uncle</SelectItem>
                                                        <SelectItem value="aunt">Aunt</SelectItem>
                                                        <SelectItem value="brother">Brother</SelectItem>
                                                        <SelectItem value="sister">Sister</SelectItem>
                                                        <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                                                        <SelectItem value="foster_parent">Foster Parent</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold">Permissions & Responsibilities</Label>
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`isPrimary_${student.id}`}
                                                            name={`isPrimary_${student.id}`}
                                                            value="true"
                                                        />
                                                        <Label htmlFor={`isPrimary_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Primary Guardian
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`isEmergencyContact_${student.id}`}
                                                            name={`isEmergencyContact_${student.id}`}
                                                            value="true"
                                                            defaultChecked
                                                        />
                                                        <Label htmlFor={`isEmergencyContact_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Emergency Contact
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`canPickup_${student.id}`}
                                                            name={`canPickup_${student.id}`}
                                                            value="true"
                                                            defaultChecked
                                                        />
                                                        <Label htmlFor={`canPickup_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Can Pickup Student
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`financialResponsibility_${student.id}`}
                                                            name={`financialResponsibility_${student.id}`}
                                                            value="true"
                                                        />
                                                        <Label htmlFor={`financialResponsibility_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Financial Responsibility
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`receivesReportCard_${student.id}`}
                                                            name={`receivesReportCard_${student.id}`}
                                                            value="true"
                                                            defaultChecked
                                                        />
                                                        <Label htmlFor={`receivesReportCard_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Receives Report Card
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`receivesNotifications_${student.id}`}
                                                            name={`receivesNotifications_${student.id}`}
                                                            value="true"
                                                            defaultChecked
                                                        />
                                                        <Label htmlFor={`receivesNotifications_${student.id}`} className="text-sm font-normal cursor-pointer">
                                                            Receives Notifications
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`notes_${student.id}`} className="text-sm">
                                                    Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                                                </Label>
                                                <Textarea
                                                    id={`notes_${student.id}`}
                                                    name={`notes_${student.id}`}
                                                    placeholder="Special instructions or restrictions..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-muted-foreground">No students available</p>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Select all students this guardian is responsible for.</p>
                {state.errors?.studentIds && (
                    <p className="text-sm text-red-500">{state.errors.studentIds[0]}</p>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="verify"
                    checked={isVerified}
                    onCheckedChange={(checked) => setIsVerified(checked as boolean)}
                />
                <Label htmlFor="verify" className="text-sm">
                    Verify guardian information
                </Label>
            </div>

            <Button className="w-full" disabled={!isVerified || isPending}>
                <Shield className="h-4 w-4 mr-2" />
                {isPending ? "Registering..." : "Register Guardian"}
            </Button>
        </form>
    );
}
