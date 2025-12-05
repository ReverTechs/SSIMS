'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    CreateSponsorInput,
    UpdateSponsorInput,
    Sponsor,
    SponsorWithStats,
} from '@/types/fees';

/**
 * Create a new sponsor organization
 */
export async function createSponsor(input: CreateSponsorInput) {
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
            return { error: 'Only admins and headteachers can create sponsors' };
        }

        // Check for duplicate sponsor name
        const { data: existing } = await supabase
            .from('sponsors')
            .select('id, name')
            .eq('name', input.name)
            .single();

        if (existing) {
            return { error: `Sponsor with name "${input.name}" already exists` };
        }

        // Create sponsor
        const { data: sponsor, error: createError } = await supabase
            .from('sponsors')
            .insert({
                ...input,
                created_by: user.id,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating sponsor:', createError);
            return { error: 'Failed to create sponsor' };
        }

        revalidatePath('/dashboard/management/sponsors');

        return {
            success: true,
            sponsor: sponsor as Sponsor,
            message: `Sponsor "${input.name}" created successfully`,
        };
    } catch (error) {
        console.error('Error in createSponsor:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Update sponsor details
 */
export async function updateSponsor(sponsorId: string, input: UpdateSponsorInput) {
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
            return { error: 'Only admins and headteachers can update sponsors' };
        }

        // Check if sponsor exists
        const { data: existing } = await supabase
            .from('sponsors')
            .select('id, name')
            .eq('id', sponsorId)
            .single();

        if (!existing) {
            return { error: 'Sponsor not found' };
        }

        // If name is being changed, check for duplicates
        if (input.name && input.name !== existing.name) {
            const { data: duplicate } = await supabase
                .from('sponsors')
                .select('id')
                .eq('name', input.name)
                .neq('id', sponsorId)
                .single();

            if (duplicate) {
                return { error: `Sponsor with name "${input.name}" already exists` };
            }
        }

        // Update sponsor
        const { data: sponsor, error: updateError } = await supabase
            .from('sponsors')
            .update(input)
            .eq('id', sponsorId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating sponsor:', updateError);
            return { error: 'Failed to update sponsor' };
        }

        revalidatePath('/dashboard/management/sponsors');

        return {
            success: true,
            sponsor: sponsor as Sponsor,
            message: 'Sponsor updated successfully',
        };
    } catch (error) {
        console.error('Error in updateSponsor:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get all sponsors with optional filtering
 */
export async function getSponsors(filters?: {
    sponsor_type?: string;
    is_active?: boolean;
    search?: string;
}) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('sponsors')
            .select('*')
            .order('name');

        // Apply filters
        if (filters?.sponsor_type) {
            query = query.eq('sponsor_type', filters.sponsor_type);
        }

        if (filters?.is_active !== undefined) {
            query = query.eq('is_active', filters.is_active);
        }

        if (filters?.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        const { data: sponsors, error } = await query;

        if (error) {
            console.error('Error fetching sponsors:', error);
            return { error: 'Failed to fetch sponsors' };
        }

        return {
            success: true,
            sponsors: sponsors as Sponsor[],
        };
    } catch (error) {
        console.error('Error in getSponsors:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get sponsor by ID with statistics
 */
export async function getSponsorById(sponsorId: string) {
    try {
        const supabase = await createClient();

        // Get sponsor details
        const { data: sponsor, error: sponsorError } = await supabase
            .from('sponsors')
            .select('*')
            .eq('id', sponsorId)
            .single();

        if (sponsorError || !sponsor) {
            return { error: 'Sponsor not found' };
        }

        // Get sponsor statistics using database function
        const { data: stats, error: statsError } = await supabase
            .rpc('get_sponsor_payment_summary', { p_sponsor_id: sponsorId })
            .single();

        if (statsError) {
            console.error('Error fetching sponsor stats:', statsError);
            // Return sponsor without stats if function fails
            return {
                success: true,
                sponsor: sponsor as Sponsor,
            };
        }

        const sponsorWithStats: SponsorWithStats = {
            ...sponsor,
            total_paid: (stats as any)?.total_paid || 0,
            total_allocated: (stats as any)?.total_allocated || 0,
            total_unallocated: (stats as any)?.total_unallocated || 0,
            payment_count: (stats as any)?.payment_count || 0,
            students_helped: (stats as any)?.students_helped || 0,
        };

        return {
            success: true,
            sponsor: sponsorWithStats,
        };
    } catch (error) {
        console.error('Error in getSponsorById:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Toggle sponsor active status
 */
export async function toggleSponsorStatus(sponsorId: string, isActive: boolean) {
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
            return { error: 'Only admins and headteachers can modify sponsors' };
        }

        // Update status
        const { error: updateError } = await supabase
            .from('sponsors')
            .update({ is_active: isActive })
            .eq('id', sponsorId);

        if (updateError) {
            console.error('Error updating sponsor status:', updateError);
            return { error: 'Failed to update sponsor status' };
        }

        revalidatePath('/dashboard/management/sponsors');

        return {
            success: true,
            message: `Sponsor ${isActive ? 'activated' : 'deactivated'} successfully`,
        };
    } catch (error) {
        console.error('Error in toggleSponsorStatus:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Delete sponsor (soft delete by deactivating)
 */
export async function deleteSponsor(sponsorId: string) {
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
            return { error: 'Only admins can delete sponsors' };
        }

        // Check if sponsor has active aid awards
        const { data: activeAid } = await supabase
            .from('student_financial_aid')
            .select('id')
            .eq('sponsor_id', sponsorId)
            .eq('status', 'active')
            .limit(1);

        if (activeAid && activeAid.length > 0) {
            return {
                error: 'Cannot delete sponsor with active financial aid awards. Please deactivate instead.',
            };
        }

        // Soft delete by deactivating
        const { error: updateError } = await supabase
            .from('sponsors')
            .update({ is_active: false })
            .eq('id', sponsorId);

        if (updateError) {
            console.error('Error deleting sponsor:', updateError);
            return { error: 'Failed to delete sponsor' };
        }

        revalidatePath('/dashboard/management/sponsors');

        return {
            success: true,
            message: 'Sponsor deactivated successfully',
        };
    } catch (error) {
        console.error('Error in deleteSponsor:', error);
        return { error: 'An unexpected error occurred' };
    }
}
