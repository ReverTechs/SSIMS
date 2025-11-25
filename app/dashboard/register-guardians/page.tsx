import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { getStudents } from "@/app/actions/get-students";
import { RegisterGuardianForm } from "./register-guardian-form";

export default async function RegisterGuardiansPage() {
    const students = await getStudents();

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            <CardTitle>New Guardian Registration</CardTitle>
                        </div>
                        <CardDescription>
                            Add a new guardian/parent to the system
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RegisterGuardianForm students={students} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bulk Registration</CardTitle>
                        <CardDescription>
                            Upload a CSV file to register multiple guardians
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload CSV file with guardian information
                            </p>
                            <Button variant="outline">Choose File</Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <p>CSV format should include:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Title, First Name, Last Name</li>
                                <li>Email, Phone Number</li>
                                <li>National ID</li>
                                <li>Student ID(s)</li>
                                <li>Relationship</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
