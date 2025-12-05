'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2, Mail, Phone, Edit, Power } from 'lucide-react';
import { getSponsors } from '@/actions/fees-management/sponsors';
import { SponsorFormDialog } from '@/components/financial-aid/sponsor-form-dialog';
import type { Sponsor, SponsorType } from '@/types/fees';
import { toast } from 'sonner';

export default function SponsorsPage() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<SponsorType | 'all'>('all');
    const [showInactive, setShowInactive] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

    // Load sponsors
    const loadSponsors = async () => {
        setLoading(true);
        const result = await getSponsors({
            sponsor_type: filterType === 'all' ? undefined : filterType,
            is_active: showInactive ? undefined : true,
            search: searchQuery || undefined,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            setSponsors(result.sponsors || []);
        }
        setLoading(false);
    };

    // Initial load
    useEffect(() => {
        loadSponsors();
    }, []);

    // Reload when filters change
    const handleFilterChange = () => {
        loadSponsors();
    };

    const handleCreateSuccess = () => {
        setDialogOpen(false);
        setSelectedSponsor(null);
        loadSponsors();
    };

    const handleEdit = (sponsor: Sponsor) => {
        setSelectedSponsor(sponsor);
        setDialogOpen(true);
    };

    const getSponsorTypeColor = (type: SponsorType) => {
        const colors = {
            government: 'bg-blue-600',
            ngo: 'bg-green-600',
            corporate: 'bg-purple-600',
            foundation: 'bg-orange-600',
            individual: 'bg-gray-600',
        };
        return colors[type] || 'bg-gray-600';
    };

    const getSponsorTypeLabel = (type: SponsorType) => {
        const labels = {
            government: 'Government',
            ngo: 'NGO',
            corporate: 'Corporate',
            foundation: 'Foundation',
            individual: 'Individual',
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Sponsors</h1>
                    <p className="text-muted-foreground">
                        Manage organizations providing financial aid to students
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sponsor
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search sponsors..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as SponsorType | 'all')}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="all">All Types</option>
                            <option value="government">Government</option>
                            <option value="ngo">NGO</option>
                            <option value="corporate">Corporate</option>
                            <option value="foundation">Foundation</option>
                            <option value="individual">Individual</option>
                        </select>

                        {/* Show Inactive */}
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Show inactive</span>
                        </label>

                        <Button onClick={handleFilterChange}>Apply Filters</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sponsors List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading sponsors...
                    </div>
                ) : sponsors.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No sponsors found. Click "Add Sponsor" to create one.
                    </div>
                ) : (
                    sponsors.map((sponsor) => (
                        <Card key={sponsor.id} className={!sponsor.is_active ? 'opacity-60' : ''}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            {sponsor.name}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            <Badge className={getSponsorTypeColor(sponsor.sponsor_type)}>
                                                {getSponsorTypeLabel(sponsor.sponsor_type)}
                                            </Badge>
                                            {!sponsor.is_active && (
                                                <Badge variant="outline" className="ml-2">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleEdit(sponsor)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {sponsor.contact_person && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Contact:</span>
                                        <span className="text-muted-foreground">
                                            {sponsor.contact_person}
                                        </span>
                                    </div>
                                )}
                                {sponsor.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">{sponsor.email}</span>
                                    </div>
                                )}
                                {sponsor.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground">{sponsor.phone}</span>
                                    </div>
                                )}
                                {sponsor.payment_terms && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            <strong>Payment Terms:</strong> {sponsor.payment_terms}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Sponsor Form Dialog */}
            <SponsorFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                sponsor={selectedSponsor}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
