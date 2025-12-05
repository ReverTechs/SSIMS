'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { assignAidToStudent } from '@/actions/fees-management/student-aid';
import { getFinancialAidTypes } from '@/actions/fees-management/financial-aid-types';
import { createClient } from '@/lib/supabase/client';
import type { FinancialAidTypeWithSponsor } from '@/types/fees';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

interface AssignAidDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preselectedAidType?: FinancialAidTypeWithSponsor | null;
    onSuccess: () => void;
}

export function AssignAidDialog({ open, onOpenChange, preselectedAidType, onSuccess }: AssignAidDialogProps) {
    const [loading, setLoading] = useState(false);
    const [aidTypes, setAidTypes] = useState<FinancialAidTypeWithSponsor[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    const [formData, setFormData] = useState({
        financial_aid_type_id: preselectedAidType?.id || '',
        academic_year_id: '',
        term_id: '',
        valid_from: '',
        valid_until: '',
        conditions: '',
        notes: '',
    });

    // Load aid types and academic data
    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient();

            // Load aid types
            const typesResult = await getFinancialAidTypes({ is_active: true });
            if (!typesResult.error) {
                setAidTypes(typesResult.aid_types || []);
            }

            // Load academic years
            const { data: years } = await supabase
                .from('academic_years')
                .select('*')
                .order('start_date', { ascending: false });
            setAcademicYears(years || []);

            // Load terms
            const { data: termsData } = await supabase
                .from('terms')
                .select('*')
                .order('display_order');
            setTerms(termsData || []);
        };

        if (open) {
            loadData();
        }
    }, [open]);

    // Update form when preselected aid type changes
    useEffect(() => {
        if (preselectedAidType) {
            setFormData(prev => ({ ...prev, financial_aid_type_id: preselectedAidType.id }));
        }
    }, [preselectedAidType]);

    // Search students
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        const supabase = createClient();
        const { data, error } = await supabase
            .from('students')
            .select(`
                id,
                student_id,
                profiles (
                    first_name,
                    last_name
                ),
                classes (
                    name
                )
            `)
            .ilike('student_id', `%${searchQuery}%`)
            .limit(10);

        if (!error && data) {
            setSearchResults(data);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudent) {
            toast.error('Please select a student');
            return;
        }

        setLoading(true);

        try {
            const result = await assignAidToStudent({
                student_id: selectedStudent.id,
                ...formData,
            });

            if ('error' in result) {
                toast.error(result.error);
            } else {
                toast.success(result.message);
                onSuccess();
                // Reset form
                setSelectedStudent(null);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assign Financial Aid</DialogTitle>
                    <DialogDescription>
                        Assign financial aid to a student for a specific academic period
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Student Search */}
                    {!selectedStudent ? (
                        <div className="space-y-2">
                            <Label>Search Student</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter student ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                />
                                <Button type="button" onClick={handleSearch}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="border rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                                    {searchResults.map((student) => {
                                        const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
                                        const studentClass = Array.isArray(student.classes) ? student.classes[0] : student.classes;

                                        return (
                                            <div
                                                key={student.id}
                                                className="p-2 hover:bg-accent rounded cursor-pointer"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <p className="font-medium">
                                                    {profile?.first_name} {profile?.last_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {student.student_id} • {studentClass?.name}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="font-medium">
                                Selected: {(() => {
                                    const profile = Array.isArray(selectedStudent.profiles) ? selectedStudent.profiles[0] : selectedStudent.profiles;
                                    return `${profile?.first_name} ${profile?.last_name} (${selectedStudent.student_id})`;
                                })()}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStudent(null)}
                                className="mt-2"
                            >
                                Change Student
                            </Button>
                        </div>
                    )}

                    {/* Aid Type Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="aid_type">
                            Aid Type <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="aid_type"
                            value={formData.financial_aid_type_id}
                            onChange={(e) => handleChange('financial_aid_type_id', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            required
                            disabled={!!preselectedAidType}
                        >
                            <option value="">Select aid type...</option>
                            {aidTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} ({type.sponsor.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Academic Period */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="academic_year">
                                Academic Year <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="academic_year"
                                value={formData.academic_year_id}
                                onChange={(e) => handleChange('academic_year_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Select year...</option>
                                {academicYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="term">Term (optional for year-long aid)</Label>
                            <select
                                id="term"
                                value={formData.term_id}
                                onChange={(e) => handleChange('term_id', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="">Year-long aid</option>
                                {terms.map((term) => (
                                    <option key={term.id} value={term.id}>
                                        {term.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Validity Period */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="valid_from">
                                Valid From <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="valid_from"
                                type="date"
                                value={formData.valid_from}
                                onChange={(e) => handleChange('valid_from', e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valid_until">
                                Valid Until <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="valid_until"
                                type="date"
                                value={formData.valid_until}
                                onChange={(e) => handleChange('valid_until', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2">
                        <Label htmlFor="conditions">Conditions</Label>
                        <Input
                            id="conditions"
                            value={formData.conditions}
                            onChange={(e) => handleChange('conditions', e.target.value)}
                            placeholder="e.g., Maintain 70% average"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            rows={3}
                            placeholder="Additional notes..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !selectedStudent}>
                            {loading ? 'Assigning...' : 'Assign Aid'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
