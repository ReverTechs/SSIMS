import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Shield, UserPlus } from "lucide-react";

export default function RegisterStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Register Students
        </h1>
        <p className="text-muted-foreground">
          Register and verify new students in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              {/* <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label> */}
              <Label htmlFor="gender">Gender</Label>
              <Select required>
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@school.mw" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input id="studentId" placeholder="STU2024001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentType">Student Type</Label>
              <Select>
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
              <Label htmlFor="class">Class</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form1a">Form 1A</SelectItem>
                  <SelectItem value="form1b">Form 1B</SelectItem>
                  <SelectItem value="form2a">Form 2A</SelectItem>
                  <SelectItem value="form2b">Form 2B</SelectItem>
                  <SelectItem value="form3a">Form 3A</SelectItem>
                  <SelectItem value="form3b">Form 3B</SelectItem>
                  <SelectItem value="form4a">Form 4A</SelectItem>
                  <SelectItem value="form4b">Form 4B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian">Guardian/Parent</Label>
              <Input id="guardian" placeholder="Guardian name or ID" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="verify" />
              <Label htmlFor="verify" className="text-sm">
                Verify student information
              </Label>
            </div>
            <Button className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Register Student
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Registration</CardTitle>
            <CardDescription>
              Upload a CSV file to register multiple students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload CSV file with student information
              </p>
              <Button variant="outline">Choose File</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>CSV format should include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Full Name</li>
                <li>Email</li>
                <li>Student ID</li>
                <li>Student Type (Internal/External)</li>
                <li>Class</li>
                <li>Date of Birth</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





