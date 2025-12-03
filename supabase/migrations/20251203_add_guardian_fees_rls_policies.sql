-- ============================================================================
-- Migration: Add Guardian RLS Policies for Fee Management
-- Purpose: Allow guardians to view their children's fees, invoices, and payments
-- Date: 2024-12-03
-- ============================================================================

-- ============================================================================
-- STUDENT_FEES TABLE - Add Guardian Policy
-- ============================================================================

CREATE POLICY "Guardians view children fees"
    ON public.student_fees FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = student_fees.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

COMMENT ON POLICY "Guardians view children fees" ON public.student_fees IS 
    'Allows guardians to view fees for students they are linked to via student_guardians table';

-- ============================================================================
-- INVOICES TABLE - Add Guardian Policy
-- ============================================================================

CREATE POLICY "Guardians view children invoices"
    ON public.invoices FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = invoices.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

COMMENT ON POLICY "Guardians view children invoices" ON public.invoices IS 
    'Allows guardians to view invoices for students they are linked to via student_guardians table';

-- ============================================================================
-- PAYMENTS TABLE - Add Guardian Policy
-- ============================================================================

CREATE POLICY "Guardians view children payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = payments.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

COMMENT ON POLICY "Guardians view children payments" ON public.payments IS 
    'Allows guardians to view payments for students they are linked to via student_guardians table';

-- ============================================================================
-- RECEIPTS TABLE - Add Guardian Policy
-- ============================================================================

CREATE POLICY "Guardians view children receipts"
    ON public.receipts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = receipts.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

COMMENT ON POLICY "Guardians view children receipts" ON public.receipts IS 
    'Allows guardians to view receipts for students they are linked to via student_guardians table';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Guardian RLS Policies Migration Complete!';
    RAISE NOTICE 'Policies added to: student_fees, invoices, payments, receipts';
    RAISE NOTICE 'Guardians can now view their children''s fee data';
END $$;
