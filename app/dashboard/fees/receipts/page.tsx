import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/supabase/user';
import { redirect } from 'next/navigation';
import { ReceiptsHistoryClient } from '@/components/fees/receipts-history-client';

export default async function ReceiptsPage() {
    const user = await getCurrentUser();

    // Only students can access this page
    if (!user || user.role !== 'student') {
        redirect('/dashboard');
    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Receipt History</h1>
                <p className="text-muted-foreground mt-2">
                    View and download all your payment receipts
                </p>
            </div>

            <Suspense fallback={<div>Loading receipts...</div>}>
                <ReceiptsHistoryClient studentId={user.id} />
            </Suspense>
        </div>
    );
}
