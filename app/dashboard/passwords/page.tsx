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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Download, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PasswordsPage() {
  const generatedPasswords = [
    {
      id: "1",
      userId: "STU2024001",
      userName: "John Doe",
      role: "Student",
      password: "TempPass123!",
      generatedAt: "2024-03-01",
      status: "active",
    },
    {
      id: "2",
      userId: "T001",
      userName: "Mr. Banda",
      role: "Teacher",
      password: "TempPass456!",
      generatedAt: "2024-03-01",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Generate Default Passwords
        </h1>
        <p className="text-muted-foreground">
          Generate and manage default passwords for new users
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Generate Password</CardTitle>
            </div>
            <CardDescription>
              Generate a default password for a user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">User Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" placeholder="Enter user ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordLength">Password Length</Label>
              <Input
                id="passwordLength"
                type="number"
                defaultValue="12"
                min="8"
                max="20"
              />
            </div>
            <Button className="w-full">
              <Key className="h-4 w-4 mr-2" />
              Generate Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Password Generation</CardTitle>
            <CardDescription>
              Generate passwords for multiple users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userTypeBulk">User Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="class">Class (for students)</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
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
            <Button className="w-full" variant="outline">
              Generate Passwords for Selected Group
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generated Passwords</CardTitle>
              <CardDescription>
                Recently generated default passwords
              </CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generatedPasswords.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.userId}</TableCell>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {item.password}
                    </code>
                  </TableCell>
                  <TableCell>
                    {new Date(item.generatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        item.status === "active"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}





