'use client';

import { useState, useTransition, useEffect } from 'react';
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
import { Shield, UserPlus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerStudent } from '@/actions/students';
import { checkStudentIdAvailability } from '@/actions/check-student-id';

interface ClassOption {
    id: string;
    name: string;
    grade_level: number;
}

interface RegisterStudentFormProps {
    classes: ClassOption[];
}

export function RegisterStudentForm({ classes }: RegisterStudentFormProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: '',
        email: '',
        studentId: '',
        studentType: '',
        classId: '',
        dateOfBirth: '',
        guardianEmail: '',
        stream: '',
    });

    const [isVerified, setIsVerified] = useState(false);
    const [studentIdValidation, setStudentIdValidation] = useState<{
        checking: boolean;
        available: boolean | null;
        message: string;
    }>({ checking: false, available: null, message: '' });

    // Debounced Student ID validation
    useEffect(() => {
        if (!formData.studentId || formData.studentId.trim() === '') {
            setStudentIdValidation({ checking: false, available: null, message: '' });
            return;
        }

        setStudentIdValidation({ checking: true, available: null, message: 'Checking...' });

        const timeoutId = setTimeout(async () => {
            const result = await checkStudentIdAvailability(formData.studentId);
            if (result.available) {
                setStudentIdValidation({
                    checking: false,
                    available: true,
                    message: 'Student ID is available'
                });
            } else {
                setStudentIdValidation({
                    checking: false,
                    available: false,
                    message: result.error || 'Student ID is already in use'
                });
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.studentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        const submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            submitData.append(key, value);
        });

        startTransition(async () => {
            const result = await registerStudent({}, submitData);
            if (result.error) {
                setStatus({ type: 'error', message: result.error });
            } else {
                setStatus({ type: 'success', message: result.message || 'Student registered successfully!' });
                // Reset form
                setFormData({
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    gender: '',
                    email: '',
                    studentId: '',
                    studentType: '',
                    classId: '',
                    dateOfBirth: '',
                    guardianEmail: '',
                    stream: '',
                });
                setIsVerified(false);
            }
        });
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <CardTitle>New Student Registration</CardTitle>
                </div>
                <CardDescription>
                    Add a new student to the system
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="middleName">Middle Name</Label>
                            <Input
                                id="middleName"
                                placeholder="(optional)"
                                value={formData.middleName}
                                onChange={(e) => handleChange('middleName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(val) => handleChange('gender', val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="classId">Class</Label>
                            <Select
                                value={formData.classId}
                                onValueChange={(val) => handleChange('classId', val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
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
                    </div>

                    {/* Stream Selection for Senior Classes */}
                    {formData.classId && classes.find(c => c.id === formData.classId)?.grade_level! > 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="stream">Stream (Required for Senior Classes)</Label>
                            <Select
                                value={formData.stream}
                                onValueChange={(val) => handleChange('stream', val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stream" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sciences">Sciences</SelectItem>
                                    <SelectItem value="humanities">Humanities</SelectItem>
                                    <SelectItem value="commercial">Commercial</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@school.mw"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <div className="relative">
                                <Input
                                    id="studentId"
                                    placeholder="STU2024001"
                                    value={formData.studentId}
                                    onChange={(e) => handleChange('studentId', e.target.value)}
                                    required
                                    className={
                                        studentIdValidation.available === false
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : studentIdValidation.available === true
                                                ? 'border-green-500 focus-visible:ring-green-500'
                                                : ''
                                    }
                                />
                                {studentIdValidation.checking && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                                {!studentIdValidation.checking && studentIdValidation.available === true && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </div>
                                )}
                                {!studentIdValidation.checking && studentIdValidation.available === false && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {studentIdValidation.message && (
                                <p className={`text-xs ${studentIdValidation.available === false
                                    ? 'text-red-500'
                                    : studentIdValidation.available === true
                                        ? 'text-green-500'
                                        : 'text-muted-foreground'
                                    }`}>
                                    {studentIdValidation.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentType">Student Type</Label>
                            <Select
                                value={formData.studentType}
                                onValueChange={(val) => handleChange('studentType', val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="external">External</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="guardianEmail">Guardian/Parent Email</Label>
                        <Input
                            id="guardianEmail"
                            type="email"
                            placeholder="guardian@example.com"
                            value={formData.guardianEmail}
                            onChange={(e) => handleChange('guardianEmail', e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="verify"
                            checked={isVerified}
                            onCheckedChange={(checked) => setIsVerified(checked as boolean)}
                        />
                        <Label htmlFor="verify" className="text-sm">
                            Verify student information
                        </Label>
                    </div>

                    {status.message && (
                        <div className={`p-3 rounded-md text-sm ${status.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'}`}>
                            {status.message}
                        </div>
                    )}

                    <Button
                        className="w-full"
                        disabled={
                            isPending ||
                            !isVerified ||
                            studentIdValidation.checking ||
                            studentIdValidation.available === false
                        }
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4 mr-2" />
                                Register Student
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
