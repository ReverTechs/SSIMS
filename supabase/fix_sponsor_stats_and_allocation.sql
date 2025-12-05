-- ============================================================================
-- FIX: Sponsor Statistics and Payment Allocation
-- Purpose: 
-- 1. Fix incorrect calculation of sponsor statistics (Total Paid/Allocated) caused by join multiplication
-- 2. Ensure invoices and student fee balances are automatically updated when allocations occur
-- ============================================================================

-- 1. FIX SPONSOR STATISTICS FUNCTION
CREATE OR REPLACE FUNCTION get_sponsor_payment_summary(p_sponsor_id UUID)
RETURNS TABLE (
    total_paid DECIMAL(10,2),
    total_allocated DECIMAL(10,2),
    total_unallocated DECIMAL(10,2),
    payment_count INTEGER,
    students_helped INTEGER
) AS $$
DECLARE
    v_total_paid DECIMAL(10,2);
    v_total_allocated DECIMAL(10,2);
    v_total_unallocated DECIMAL(10,2);
    v_payment_count INTEGER;
    v_students_helped INTEGER;
BEGIN
    -- Calculate payment totals directly from sponsor_payments to avoid join multiplication
    -- This ensures that if a payment has multiple allocations, we don't count the payment amount multiple times
    SELECT 
        COALESCE(SUM(amount), 0),
        COALESCE(SUM(allocated_amount), 0),
        COALESCE(SUM(unallocated_amount), 0),
        COUNT(id)
    INTO 
        v_total_paid,
        v_total_allocated,
        v_total_unallocated,
        v_payment_count
    FROM public.sponsor_payments
    WHERE sponsor_id = p_sponsor_id;

    -- Calculate unique students helped separately
    -- We join to allocations just to find distinct students associated with this sponsor's payments
    SELECT COUNT(DISTINCT spa.student_id)
    INTO v_students_helped
    FROM public.sponsor_payment_allocations spa
    JOIN public.sponsor_payments sp ON spa.sponsor_payment_id = sp.id
    WHERE sp.sponsor_id = p_sponsor_id;

    RETURN QUERY SELECT 
        v_total_paid, 
        v_total_allocated, 
        v_total_unallocated, 
        v_payment_count, 
        v_students_helped;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sponsor_payment_summary IS 'Returns payment summary for a sponsor with corrected aggregation logic';


-- 2. FIX ALLOCATION TRIGGER AND FUNCTION
-- First drop existing to ensure clean slate
DROP TRIGGER IF EXISTS trigger_update_allocation ON public.sponsor_payment_allocations;
DROP FUNCTION IF EXISTS update_sponsor_payment_allocation();

-- Recreate the function to handle updates across all related tables
CREATE OR REPLACE FUNCTION update_sponsor_payment_allocation()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    -- A. Update allocated amount on sponsor payment
    -- This ensures the "Allocated" card on the dashboard updates correctly
    UPDATE public.sponsor_payments
    SET allocated_amount = allocated_amount + NEW.allocated_amount,
        updated_at = NOW()
    WHERE id = NEW.sponsor_payment_id;
    
    -- B. Mark student aid as payment received
    UPDATE public.student_financial_aid
    SET sponsor_payment_received = true,
        sponsor_payment_date = NEW.allocation_date,
        updated_at = NOW()
    WHERE student_id = NEW.student_id
    AND sponsor_id = (SELECT sponsor_id FROM public.sponsor_payments WHERE id = NEW.sponsor_payment_id)
    AND status = 'active';
    
    -- C. Get invoice_id if not provided in the allocation
    IF NEW.invoice_id IS NULL THEN
        -- Find invoice associated with the student fee
        SELECT id INTO v_invoice_id
        FROM public.invoices
        WHERE student_fee_id = NEW.student_fee_id
        LIMIT 1;
    ELSE
        v_invoice_id := NEW.invoice_id;
    END IF;
    
    -- D. Update invoice balance (if invoice exists)
    -- This ensures the student's invoice status changes to "Paid" or "Partial"
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
        
        -- Link the invoice to the allocation record
        NEW.invoice_id := v_invoice_id;
    END IF;
    
    -- E. Update student_fees balance
    -- This ensures the underlying fee record is also updated
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

-- Recreate trigger as BEFORE INSERT to allow setting NEW.invoice_id
CREATE TRIGGER trigger_update_allocation
    BEFORE INSERT ON public.sponsor_payment_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsor_payment_allocation();

COMMENT ON FUNCTION update_sponsor_payment_allocation IS 'Updates billing records when a sponsor allocation is created';

-- Success confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Sponsor Allocation Fix Applied Successfully';
    RAISE NOTICE '   - Fixed statistics calculation in get_sponsor_payment_summary';
    RAISE NOTICE '   - Replaced trigger_update_allocation to ensure invoices update automatically';
END $$;
