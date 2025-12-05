'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSponsorById } from '@/actions/fees-management/sponsors';
import { PaymentHistory } from '@/components/financial-aid/payment-history';
import { RecordPaymentDialog } from '@/components/financial-aid/record-payment-dialog';
import type { SponsorWithStats } from '@/types/fees';
import { ArrowLeft, Building2, Mail, Phone, DollarSign, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SponsorDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function SponsorDetailsPage({ params }: SponsorDetailsPageProps) {
    const { id } = use(params); // Unwrap the Promise
    const router = useRouter();
    const [sponsor, setSponsor] = useState<SponsorWithStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

    useEffect(() => {
        loadSponsor();
    }, [id]);

    const loadSponsor = async () => {
        setLoading(true);
        const result = await getSponsorById(id);

        if (result.error) {
            toast.error(result.error);
            router.push('/dashboard/management/sponsors');
        } else if (result.sponsor) {
            setSponsor(result.sponsor as SponsorWithStats);
        }
        setLoading(false);
    };

    const handlePaymentSuccess = () => {
        setPaymentDialogOpen(false);
        loadSponsor();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <p className="text-muted-foreground">Loading sponsor details...</p>
            </div>
        );
    }

    if (!sponsor) {
        return null;
    }

    const getSponsorTypeColor = (type: string) => {
        const colors = {
            government: 'bg-blue-600',
            ngo: 'bg-green-600',
            corporate: 'bg-purple-600',
            foundation: 'bg-orange-600',
            individual: 'bg-gray-600',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/dashboard/management/sponsors')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <h1 className="text-3xl font-bold">{sponsor.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getSponsorTypeColor(sponsor.sponsor_type)}>
                                        {sponsor.sponsor_type}
                                    </Badge>
                                    {!sponsor.is_active && (
                                        <Badge variant="outline">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {sponsor.is_active && (
                    <Button onClick={() => setPaymentDialogOpen(true)}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Record Payment
                    </Button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            MK {(sponsor.total_paid || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Allocated</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            MK {(sponsor.total_allocated || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {sponsor.total_paid > 0
                                ? `${((sponsor.total_allocated / sponsor.total_paid) * 100).toFixed(0)}% of total`
                                : '0%'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unallocated</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            MK {(sponsor.total_unallocated || 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students Helped</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sponsor.students_helped || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {sponsor.payment_count || 0} payment{(sponsor.payment_count || 0) !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sponsor Details */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sponsor.contact_person && (
                            <div>
                                <p className="text-sm font-medium">Contact Person</p>
                                <p className="text-sm text-muted-foreground">{sponsor.contact_person}</p>
                            </div>
                        )}
                        {sponsor.email && (
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">{sponsor.email}</p>
                            </div>
                        )}
                        {sponsor.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">{sponsor.phone}</p>
                            </div>
                        )}
                        {sponsor.address && (
                            <div>
                                <p className="text-sm font-medium">Address</p>
                                <p className="text-sm text-muted-foreground">{sponsor.address}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sponsor.payment_terms ? (
                            <p className="text-sm text-muted-foreground">{sponsor.payment_terms}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground">No payment terms specified</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment History */}
            <PaymentHistory sponsorId={sponsor.id} />

            {/* Record Payment Dialog */}
            <RecordPaymentDialog
                open={paymentDialogOpen}
                onOpenChange={setPaymentDialogOpen}
                sponsor={sponsor}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
