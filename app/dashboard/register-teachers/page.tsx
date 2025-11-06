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

export default function RegisterTeachersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Register Teachers
        </h1>
        <p className="text-muted-foreground">
          Register and verify new teachers in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <CardTitle>New Teacher Registration</CardTitle>
            </div>
            <CardDescription>
              Add a new teacher to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Enter full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="teacher@school.mw" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">Teacher ID</Label>
              <Input id="teacherId" placeholder="T001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="social-studies">Social Studies</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subjects">Subjects</Label>
              <Input
                id="subjects"
                placeholder="Mathematics, Physics (comma separated)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="headteacher">Headteacher</SelectItem>
                  <SelectItem value="deputy_headteacher">
                    Deputy Headteacher
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="verify" />
              <Label htmlFor="verify" className="text-sm">
                Verify teacher information
              </Label>
            </div>
            <Button className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Register Teacher
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Registration</CardTitle>
            <CardDescription>
              Upload a CSV file to register multiple teachers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Upload CSV file with teacher information
              </p>
              <Button variant="outline">Choose File</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>CSV format should include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Full Name</li>
                <li>Email</li>
                <li>Teacher ID</li>
                <li>Department</li>
                <li>Subjects</li>
                <li>Role</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



