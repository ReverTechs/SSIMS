-- ============================================================================
-- Feature: Apply Aid to Existing Invoices
-- Purpose: Automatically update invoices when aid is assigned to students
-- ============================================================================

-- Function: Apply financial aid to existing student invoices
CREATE OR REPLACE FUNCTION apply_aid_to_existing_invoices()
RETURNS TRIGGER AS $$
DECLARE
    v_student_fee RECORD;
    v_invoice RECORD;
    v_aid_amount DECIMAL(10,2);
    v_new_balance DECIMAL(10,2);
BEGIN
    -- Only process when aid becomes active or approved
    IF NEW.status NOT IN ('active', 'approved') THEN
        RETURN NEW;
    END IF;
    
    -- Get student's fee record for this academic year/term
    SELECT * INTO v_student_fee
    FROM student_fees
    WHERE student_id = NEW.student_id
    AND academic_year_id = NEW.academic_year_id
    AND (term_id = NEW.term_id OR (term_id IS NULL AND NEW.term_id IS NULL))
    LIMIT 1;
    
    -- If no fee record exists, nothing to update
    IF NOT FOUND THEN
        RETURN NEW;
    END IF;
    
    -- Calculate total aid for this student
    SELECT calculate_student_aid_amount(
        NEW.student_id,
        NEW.academic_year_id,
        NEW.term_id,
        v_student_fee.total_amount
    ) INTO v_aid_amount;
    
    -- Update student_fees with aid discount
    UPDATE student_fees
    SET 
        discount_amount = v_aid_amount,
        discount_reason = 'Financial Aid Applied',
        balance = total_amount - amount_paid - v_aid_amount,
        updated_at = NOW()
    WHERE id = v_student_fee.id;
    
    -- Update existing invoice if it exists
    SELECT * INTO v_invoice
    FROM invoices
    WHERE student_fee_id = v_student_fee.id
    AND academic_year_id = NEW.academic_year_id
    AND (term_id = NEW.term_id OR (term_id IS NULL AND NEW.term_id IS NULL))
    LIMIT 1;
    
    IF FOUND THEN
        -- Calculate new balance
        v_new_balance := v_invoice.total_amount - v_invoice.amount_paid - v_aid_amount;
        
        -- Update invoice
        UPDATE invoices
        SET 
            balance = v_new_balance,
            status = CASE 
                WHEN v_new_balance <= 0 THEN 'paid'
                WHEN v_new_balance < v_invoice.total_amount THEN 'partially_paid'
                ELSE 'unpaid'
            END,
            notes = COALESCE(notes || E'\n', '') || 
                    'Financial aid applied: MK ' || v_aid_amount::TEXT || 
                    ' (' || TO_CHAR(NOW(), 'YYYY-MM-DD') || ')',
            updated_at = NOW()
        WHERE id = v_invoice.id;
        
        -- Update calculated_aid_amount in the aid record
        NEW.calculated_aid_amount := v_aid_amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to apply aid when assigned
DROP TRIGGER IF EXISTS trigger_apply_aid_to_invoices ON student_financial_aid;

CREATE TRIGGER trigger_apply_aid_to_invoices
    AFTER INSERT OR UPDATE ON student_financial_aid
    FOR EACH ROW
    WHEN (NEW.status IN ('active', 'approved'))
    EXECUTE FUNCTION apply_aid_to_existing_invoices();

-- ============================================================================
-- Function: Recalculate aid for all students (manual trigger)
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_all_student_aid(
    p_academic_year_id UUID DEFAULT NULL,
    p_term_id UUID DEFAULT NULL
)
RETURNS TABLE (
    students_updated INTEGER,
    total_aid_applied DECIMAL(10,2)
) AS $$
DECLARE
    v_students_updated INTEGER := 0;
    v_total_aid DECIMAL(10,2) := 0;
    v_aid RECORD;
    v_aid_amount DECIMAL(10,2);
BEGIN
    -- Loop through all active aid
    FOR v_aid IN 
        SELECT sfa.*, sf.id as fee_id, sf.total_amount
        FROM student_financial_aid sfa
        JOIN student_fees sf ON sf.student_id = sfa.student_id 
            AND sf.academic_year_id = sfa.academic_year_id
            AND (sf.term_id = sfa.term_id OR (sf.term_id IS NULL AND sfa.term_id IS NULL))
        WHERE sfa.status IN ('active', 'approved')
        AND (p_academic_year_id IS NULL OR sfa.academic_year_id = p_academic_year_id)
        AND (p_term_id IS NULL OR sfa.term_id = p_term_id OR sfa.term_id IS NULL)
    LOOP
        -- Calculate aid amount
        SELECT calculate_student_aid_amount(
            v_aid.student_id,
            v_aid.academic_year_id,
            v_aid.term_id,
            v_aid.total_amount
        ) INTO v_aid_amount;
        
        -- Update student_fees
        UPDATE student_fees
        SET 
            discount_amount = v_aid_amount,
            discount_reason = 'Financial Aid Applied',
            balance = total_amount - amount_paid - v_aid_amount,
            updated_at = NOW()
        WHERE id = v_aid.fee_id;
        
        -- Update invoices
        UPDATE invoices
        SET 
            balance = total_amount - amount_paid - v_aid_amount,
            status = CASE 
                WHEN (total_amount - amount_paid - v_aid_amount) <= 0 THEN 'paid'
                WHEN (total_amount - amount_paid - v_aid_amount) < total_amount THEN 'partially_paid'
                ELSE 'unpaid'
            END,
            updated_at = NOW()
        WHERE student_fee_id = v_aid.fee_id;
        
        -- Update aid record
        UPDATE student_financial_aid
        SET calculated_aid_amount = v_aid_amount
        WHERE id = v_aid.id;
        
        v_students_updated := v_students_updated + 1;
        v_total_aid := v_total_aid + v_aid_amount;
    END LOOP;
    
    RETURN QUERY SELECT v_students_updated, v_total_aid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_all_student_aid IS 'Recalculate and apply aid to all existing invoices. Use after bulk aid assignment.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

RAISE NOTICE 'Apply Aid to Existing Invoices feature installed!';
RAISE NOTICE 'Trigger: Automatically applies aid when assigned';
RAISE NOTICE 'Function: recalculate_all_student_aid() for bulk updates';
