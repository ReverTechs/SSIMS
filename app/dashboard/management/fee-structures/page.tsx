import { createClient } from '@/lib/supabase/server';
import { CreateFeeStructureForm } from './create-fee-structure-form';
import { BulkAssignFeesForm } from './bulk-assign-fees-form';
import { GenerateInvoicesForm } from './generate-invoices-form';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function FeeStructuresPage() {
    const supabase = await createClient();

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Fetch academic years
    const { data: academicYears } = await supabase
        .from('academic_years')
        .select('id, name, start_date')
        .order('start_date', { ascending: false });

    // Fetch terms
    const { data: terms } = await supabase
        .from('terms')
        .select('id, name, academic_year_id, start_date')
        .order('start_date', { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fee Structure Management</h1>
                <p className="text-muted-foreground">
                    Create fee structures, assign to students, and generate invoices
                </p>
            </div>

            <Tabs defaultValue="create" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">Create Fee Structure</TabsTrigger>
                    <TabsTrigger value="assign">Bulk Assign Fees</TabsTrigger>
                    <TabsTrigger value="invoices">Generate Invoices</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="mt-6">
                    <CreateFeeStructureForm
                        academicYears={academicYears || []}
                        terms={terms || []}
                    />
                </TabsContent>
                <TabsContent value="assign" className="mt-6">
                    <BulkAssignFeesForm
                        academicYears={academicYears || []}
                        terms={terms || []}
                    />
                </TabsContent>
                <TabsContent value="invoices" className="mt-6">
                    <GenerateInvoicesForm
                        academicYears={academicYears || []}
                        terms={terms || []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
