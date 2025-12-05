-- ============================================================================
-- Migration: Fix Sponsor Payment Allocation Trigger
-- Purpose: Update invoices and student fees when sponsor payments are allocated
-- Date: 2025-12-06
-- ============================================================================
-- 
-- PROBLEM:
-- When sponsor payments are auto-allocated, the allocations are created but
-- student invoices and fees are not updated, so balances remain unchanged.
--
-- SOLUTION:
-- Update the trigger to mirror the logic in update_balances_on_payment()
-- which properly updates invoices and student_fees when regular payments are made.
--
-- ============================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS trigger_update_allocation ON public.sponsor_payment_allocations;
DROP FUNCTION IF EXISTS update_sponsor_payment_allocation();

-- Recreate function with invoice/fee balance updates
CREATE OR REPLACE FUNCTION update_sponsor_payment_allocation()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    -- 1. Update allocated amount on sponsor payment
    UPDATE public.sponsor_payments
    SET allocated_amount = allocated_amount + NEW.allocated_amount,
        updated_at = NOW()
    WHERE id = NEW.sponsor_payment_id;
    
    -- 2. Mark student aid as payment received
    UPDATE public.student_financial_aid
    SET sponsor_payment_received = true,
        sponsor_payment_date = NEW.allocation_date,
        updated_at = NOW()
    WHERE student_id = NEW.student_id
    AND sponsor_id = (SELECT sponsor_id FROM public.sponsor_payments WHERE id = NEW.sponsor_payment_id)
    AND status = 'active';
    
    -- 3. Get invoice_id if not provided
    IF NEW.invoice_id IS NULL THEN
        -- Find invoice from student_fee_id
        SELECT id INTO v_invoice_id
        FROM public.invoices
        WHERE student_fee_id = NEW.student_fee_id
        LIMIT 1;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;
    
    -- 4. Update invoice balance (if invoice exists)
    IF v_invoice_id IS NOT NULL THEN
        UPDATE public.invoices
        SET amount_paid = amount_paid + NEW.allocated_amount,
            balance = GREATEST(balance - NEW.allocated_amount, 0),
            status = CASE
                WHEN balance - NEW.allocated_amount <= 0 THEN 'paid'
                WHEN amount_paid + NEW.allocated_amount > 0 THEN 'partial'
                ELSE 'unpaid'
            END,
            paid_at = CASE 
                WHEN balance - NEW.allocated_amount <= 0 THEN NOW() 
                ELSE paid_at 
            END,
            updated_at = NOW()
        WHERE id = v_invoice_id;
        
        -- Update NEW.invoice_id for the allocation record
        NEW.invoice_id := v_invoice_id;
    END IF;
    
    -- 5. Update student_fees balance
    UPDATE public.student_fees
    SET amount_paid = amount_paid + NEW.allocated_amount,
        balance = GREATEST(balance - NEW.allocated_amount, 0),
        status = CASE
            WHEN balance - NEW.allocated_amount <= 0 THEN 'paid'
            WHEN amount_paid + NEW.allocated_amount > 0 THEN 'partial'
            ELSE 'unpaid'
        END,
        updated_at = NOW()
    WHERE id = NEW.student_fee_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER trigger_update_allocation
    BEFORE INSERT ON public.sponsor_payment_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsor_payment_allocation();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

COMMENT ON FUNCTION update_sponsor_payment_allocation IS 'Updates sponsor payment stats, student aid status, invoice balances, and student fee balances when allocation is created';

-- Verify trigger was created
DO $$
BEGIN
    RAISE NOTICE 'Sponsor payment allocation trigger updated successfully!';
    RAISE NOTICE 'The trigger now updates:';
    RAISE NOTICE '  1. sponsor_payments.allocated_amount';
    RAISE NOTICE '  2. student_financial_aid.sponsor_payment_received';
    RAISE NOTICE '  3. invoices.amount_paid and balance';
    RAISE NOTICE '  4. student_fees.amount_paid and balance';
    RAISE NOTICE 'Test by recording a sponsor payment with auto-allocate enabled.';
END $$;
