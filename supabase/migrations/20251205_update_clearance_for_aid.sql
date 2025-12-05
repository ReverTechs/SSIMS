-- ============================================================================
-- Migration: Update Clearance Eligibility to Account for Financial Aid
-- Purpose: Modify clearance check to calculate payment percentage based on
--          student's responsibility (after aid) rather than total fees
-- Date: 2025-12-05
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_clearance_eligibility(UUID, UUID, UUID, UUID);

-- Recreate function with financial aid support
CREATE OR REPLACE FUNCTION check_clearance_eligibility(
    p_student_id UUID,
    p_clearance_type_id UUID,
    p_academic_year_id UUID,
    p_term_id UUID DEFAULT NULL
)
RETURNS TABLE (
    eligible BOOLEAN,
    payment_percentage DECIMAL(5,2),
    required_percentage DECIMAL(5,2),
    total_fees DECIMAL(10,2),
    financial_aid_amount DECIMAL(10,2),
    student_responsibility DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    outstanding_balance DECIMAL(10,2),
    reason TEXT
) AS $$
DECLARE
    v_clearance_type RECORD;
    v_student_fees RECORD;
    v_aid_amount DECIMAL(10,2);
    v_student_owes DECIMAL(10,2);
    v_payment_pct DECIMAL(5,2);
    v_eligible BOOLEAN;
    v_reason TEXT;
BEGIN
    -- Get clearance type requirements
    SELECT 
        minimum_payment_percentage,
        requires_full_payment
    INTO v_clearance_type
    FROM clearance_types
    WHERE id = p_clearance_type_id
    AND is_active = true;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false,
            0::DECIMAL(5,2),
            0::DECIMAL(5,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            'Clearance type not found or inactive';
        RETURN;
    END IF;

    -- Get student fees for the period
    SELECT 
        total_amount,
        amount_paid,
        balance,
        discount_amount
    INTO v_student_fees
    FROM student_fees
    WHERE student_id = p_student_id
    AND academic_year_id = p_academic_year_id
    AND (p_term_id IS NULL OR term_id = p_term_id)
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false,
            0::DECIMAL(5,2),
            v_clearance_type.minimum_payment_percentage,
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            0::DECIMAL(10,2),
            'No fees found for this student in the specified period';
        RETURN;
    END IF;

    -- Calculate financial aid amount using database function
    SELECT calculate_student_aid_amount(
        p_student_id,
        p_academic_year_id,
        p_term_id,
        v_student_fees.total_amount
    ) INTO v_aid_amount;

    v_aid_amount := COALESCE(v_aid_amount, v_student_fees.discount_amount, 0);

    -- Calculate student's actual responsibility (after aid)
    v_student_owes := v_student_fees.total_amount - v_aid_amount;

    -- Calculate payment percentage based on student's portion
    IF v_student_owes > 0 THEN
        v_payment_pct := (v_student_fees.amount_paid / v_student_owes) * 100;
    ELSE
        -- If student owes nothing (100% aid), they've paid 100% of their portion
        v_payment_pct := 100;
    END IF;

    -- Check eligibility
    IF v_clearance_type.requires_full_payment THEN
        v_eligible := v_student_fees.balance <= 0;
        v_reason := CASE 
            WHEN v_eligible THEN 'Full payment requirement met'
            ELSE 'Full payment required for this clearance type'
        END;
    ELSE
        v_eligible := v_payment_pct >= v_clearance_type.minimum_payment_percentage;
        v_reason := CASE 
            WHEN v_eligible THEN 'Payment percentage requirement met'
            ELSE FORMAT('Payment is %s%%, but %s%% is required', 
                ROUND(v_payment_pct, 2), 
                v_clearance_type.minimum_payment_percentage)
        END;
    END IF;

    -- Return results
    RETURN QUERY SELECT 
        v_eligible,
        ROUND(v_payment_pct, 2),
        v_clearance_type.minimum_payment_percentage,
        v_student_fees.total_amount,
        v_aid_amount,
        v_student_owes,
        v_student_fees.amount_paid,
        v_student_fees.balance,
        v_reason;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_clearance_eligibility IS 'Checks if student is eligible for clearance, accounting for financial aid. Payment percentage is calculated based on student responsibility (after aid) rather than total fees.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Clearance Eligibility Function Updated!';
    RAISE NOTICE 'Now accounts for financial aid when calculating payment percentages';
    RAISE NOTICE 'Students with 100%% aid will automatically be eligible for clearance';
END $$;
