'use client';

import { useState, useTransition } from 'react';
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
import { Shield, UserPlus, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { registerStudent } from '@/actions/students';

interface ClassOption {
    id: string;
    name: string;
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
    });

    const [isVerified, setIsVerified] = useState(false);

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
                            // required
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
                            <Input
                                id="studentId"
                                placeholder="STU2024001"
                                value={formData.studentId}
                                onChange={(e) => handleChange('studentId', e.target.value)}
                                required
                            />
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
                        <div className={`p-3 rounded-md text-sm ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {status.message}
                        </div>
                    )}

                    <Button className="w-full" disabled={isPending || !isVerified}>
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
