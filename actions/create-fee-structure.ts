'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CreateFeeStructureInput } from '@/types/fees';

export async function createFeeStructure(data: CreateFeeStructureInput) {
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

        if (profile?.role !== 'admin') {
            return { error: 'Only admins can create fee structures' };
        }

        // Get academic year and term names for the fee structure name
        const { data: academicYear } = await supabase
            .from('academic_years')
            .select('name')
            .eq('id', data.academic_year_id)
            .single();

        const { data: term } = await supabase
            .from('terms')
            .select('name')
            .eq('id', data.term_id)
            .single();

        if (!academicYear || !term) {
            return { error: 'Invalid academic year or term' };
        }

        // Generate fee structure name
        const studentTypeLabel = data.student_type === 'internal' ? 'Internal Students' : 'External Students';
        const feeStructureName = `${studentTypeLabel} - ${term.name} ${academicYear.name}`;

        // Calculate total amount
        const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

        // Check if fee structure already exists
        const { data: existing } = await supabase
            .from('fee_structures')
            .select('id')
            .eq('academic_year_id', data.academic_year_id)
            .eq('term_id', data.term_id)
            .eq('student_type', data.student_type)
            .single();

        if (existing) {
            return { error: `Fee structure for ${studentTypeLabel} in ${term.name} ${academicYear.name} already exists` };
        }

        // Create fee structure
        const { data: feeStructure, error: structureError } = await supabase
            .from('fee_structures')
            .insert({
                name: feeStructureName,
                academic_year_id: data.academic_year_id,
                term_id: data.term_id,
                student_type: data.student_type,
                total_amount: totalAmount,
                due_date: data.due_date,
                notes: data.notes,
                created_by: user.id,
            })
            .select()
            .single();

        if (structureError) {
            console.error('Error creating fee structure:', structureError);
            return { error: 'Failed to create fee structure' };
        }

        // Create fee structure items
        const itemsToInsert = data.items.map((item, index) => ({
            fee_structure_id: feeStructure.id,
            item_name: item.item_name,
            description: item.description || null,
            amount: item.amount,
            is_mandatory: item.is_mandatory,
            display_order: item.display_order || index + 1,
        }));

        const { error: itemsError } = await supabase
            .from('fee_structure_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Error creating fee structure items:', itemsError);
            // Rollback: delete the fee structure
            await supabase
                .from('fee_structures')
                .delete()
                .eq('id', feeStructure.id);
            return { error: 'Failed to create fee structure items' };
        }

        revalidatePath('/dashboard/management/fee-structures');

        return {
            success: true,
            message: `Fee structure created successfully: ${feeStructureName} (MK ${totalAmount.toLocaleString()})`,
            data: feeStructure,
        };
    } catch (error) {
        console.error('Error in createFeeStructure:', error);
        return { error: 'An unexpected error occurred' };
    }
}
