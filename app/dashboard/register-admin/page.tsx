import { RegisterAdminForm } from "./register-admin-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterAdminPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Register Admin</h2>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Admin Details</CardTitle>
                        <CardDescription>
                            Enter the details of the new administrator.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RegisterAdminForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
