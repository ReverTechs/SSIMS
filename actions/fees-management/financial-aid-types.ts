'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    CreateFinancialAidTypeInput,
    FinancialAidType,
    FinancialAidTypeWithSponsor,
} from '@/types/fees';

/**
 * Create a new financial aid type
 */
export async function createFinancialAidType(input: CreateFinancialAidTypeInput) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'headteacher'].includes(profile.role)) {
            return { error: 'Only admins and headteachers can create financial aid types' };
        }

        // Validate sponsor exists
        const { data: sponsor } = await supabase
            .from('sponsors')
            .select('id, name')
            .eq('id', input.sponsor_id)
            .single();

        if (!sponsor) {
            return { error: 'Sponsor not found' };
        }

        // Validate coverage values based on type
        if (input.coverage_type === 'percentage') {
            if (!input.coverage_percentage || input.coverage_percentage <= 0 || input.coverage_percentage > 100) {
                return { error: 'Coverage percentage must be between 0 and 100' };
            }
        } else if (input.coverage_type === 'fixed_amount') {
            if (!input.coverage_amount || input.coverage_amount <= 0) {
                return { error: 'Coverage amount must be greater than 0' };
            }
        } else if (input.coverage_type === 'specific_items') {
            if (!input.covered_items || input.covered_items.length === 0) {
                return { error: 'At least one covered item must be specified' };
            }
        }

        // Create aid type
        const { data: aidType, error: createError } = await supabase
            .from('financial_aid_types')
            .insert({
                ...input,
                requires_application: input.requires_application ?? false,
                created_by: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating financial aid type:', createError);
            return { error: 'Failed to create financial aid type' };
        }

        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            aid_type: aidType as FinancialAidType,
            message: `Financial aid type "${input.name}" created successfully`,
        };
    } catch (error) {
        console.error('Error in createFinancialAidType:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Update financial aid type
 */
export async function updateFinancialAidType(
    aidTypeId: string,
    input: Partial<CreateFinancialAidTypeInput>
) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'headteacher'].includes(profile.role)) {
            return { error: 'Only admins and headteachers can update financial aid types' };
        }

        // Check if aid type exists
        const { data: existing } = await supabase
            .from('financial_aid_types')
            .select('id, coverage_type')
            .eq('id', aidTypeId)
            .single();

        if (!existing) {
            return { error: 'Financial aid type not found' };
        }

        // Validate coverage values if being updated
        const coverageType = input.coverage_type || existing.coverage_type;
        if (coverageType === 'percentage' && input.coverage_percentage !== undefined) {
            if (input.coverage_percentage <= 0 || input.coverage_percentage > 100) {
                return { error: 'Coverage percentage must be between 0 and 100' };
            }
        } else if (coverageType === 'fixed_amount' && input.coverage_amount !== undefined) {
            if (input.coverage_amount <= 0) {
                return { error: 'Coverage amount must be greater than 0' };
            }
        }

        // Update aid type
        const { data: aidType, error: updateError } = await supabase
            .from('financial_aid_types')
            .update(input)
            .eq('id', aidTypeId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating financial aid type:', updateError);
            return { error: 'Failed to update financial aid type' };
        }

        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            aid_type: aidType as FinancialAidType,
            message: 'Financial aid type updated successfully',
        };
    } catch (error) {
        console.error('Error in updateFinancialAidType:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get all financial aid types with optional filtering
 */
export async function getFinancialAidTypes(filters?: {
    sponsor_id?: string;
    is_active?: boolean;
    coverage_type?: string;
}) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('financial_aid_types')
            .select(`
                *,
                sponsors (
                    id,
                    name,
                    sponsor_type
                )
            `)
            .order('display_order')
            .order('name');

        // Apply filters
        if (filters?.sponsor_id) {
            query = query.eq('sponsor_id', filters.sponsor_id);
        }

        if (filters?.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
        }

        if (filters?.coverage_type) {
            query = query.eq('coverage_type', filters.coverage_type);
        }

        const { data: aidTypes, error } = await query;

        if (error) {
            console.error('Error fetching financial aid types:', error);
            return { error: 'Failed to fetch financial aid types' };
        }

        // Transform to include sponsor details
        const typesWithSponsor: FinancialAidTypeWithSponsor[] = (aidTypes || []).map((type: any) => ({
            ...type,
            sponsor: Array.isArray(type.sponsors) ? type.sponsors[0] : type.sponsors,
        }));

        return {
            success: true,
            aid_types: typesWithSponsor,
        };
    } catch (error) {
        console.error('Error in getFinancialAidTypes:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get financial aid type by ID
 */
export async function getFinancialAidTypeById(aidTypeId: string) {
    try {
        const supabase = await createClient();

        const { data: aidType, error } = await supabase
            .from('financial_aid_types')
            .select(`
                *,
                sponsors (
                    id,
                    name,
                    sponsor_type
                )
            `)
            .eq('id', aidTypeId)
            .single();

        if (error || !aidType) {
            return { error: 'Financial aid type not found' };
        }

        const typeWithSponsor: FinancialAidTypeWithSponsor = {
            ...aidType,
            sponsor: Array.isArray(aidType.sponsors) ? aidType.sponsors[0] : aidType.sponsors,
        };

        return {
            success: true,
            aid_type: typeWithSponsor,
        };
    } catch (error) {
        console.error('Error in getFinancialAidTypeById:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Toggle financial aid type active status
 */
export async function toggleAidTypeStatus(aidTypeId: string, isActive: boolean) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || !['admin', 'headteacher'].includes(profile.role)) {
            return { error: 'Only admins and headteachers can modify financial aid types' };
        }

        // Update status
        const { error: updateError } = await supabase
            .from('financial_aid_types')
            .update({ is_active: isActive })
            .eq('id', aidTypeId);

        if (updateError) {
            console.error('Error updating aid type status:', updateError);
            return { error: 'Failed to update aid type status' };
        }

        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            message: `Financial aid type ${isActive ? 'activated' : 'deactivated'} successfully`,
        };
    } catch (error) {
        console.error('Error in toggleAidTypeStatus:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Delete financial aid type (soft delete by deactivating)
 */
export async function deleteFinancialAidType(aidTypeId: string) {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { error: 'Unauthorized' };
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return { error: 'Only admins can delete financial aid types' };
        }

        // Check if aid type has active awards
        const { data: activeAwards } = await supabase
            .from('student_financial_aid')
            .select('id')
            .eq('financial_aid_type_id', aidTypeId)
            .eq('status', 'active')
            .limit(1);

        if (activeAwards && activeAwards.length > 0) {
            return {
                error: 'Cannot delete aid type with active awards. Please deactivate instead.',
            };
        }

        // Soft delete by deactivating
        const { error: updateError } = await supabase
            .from('financial_aid_types')
            .update({ is_active: false })
            .eq('id', aidTypeId);

        if (updateError) {
            console.error('Error deleting aid type:', updateError);
            return { error: 'Failed to delete aid type' };
        }

        revalidatePath('/dashboard/management/financial-aid');

        return {
            success: true,
            message: 'Financial aid type deactivated successfully',
        };
    } catch (error) {
        console.error('Error in deleteFinancialAidType:', error);
        return { error: 'An unexpected error occurred' };
    }
}
