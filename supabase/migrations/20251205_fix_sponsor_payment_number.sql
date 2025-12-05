-- ============================================================================
-- FIX: Sponsor Payment Number Generation
-- Issue: Duplicate key constraint violation due to race condition in trigger
-- Solution: Use PostgreSQL sequence for atomic number generation
-- ============================================================================

-- Step 1: Create a sequence for sponsor payment numbers
CREATE SEQUENCE IF NOT EXISTS sponsor_payment_number_seq START 1;

-- Step 2: Drop the old trigger
DROP TRIGGER IF EXISTS trigger_generate_sponsor_payment_number ON public.sponsor_payments;

-- Step 3: Drop the old function
DROP FUNCTION IF EXISTS generate_sponsor_payment_number();

-- Step 4: Create improved function using sequence
CREATE OR REPLACE FUNCTION generate_sponsor_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num TEXT;
    next_num INTEGER;
    new_payment_number TEXT;
    max_attempts INTEGER := 10;
    attempt INTEGER := 0;
BEGIN
    -- Only generate if payment_number is not provided
    IF NEW.payment_number IS NOT NULL AND NEW.payment_number != '' THEN
        RETURN NEW;
    END IF;
    
    -- Get current year
    year_code := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Loop to handle potential race conditions
    LOOP
        attempt := attempt + 1;
        
        -- Get next sequence number
        next_num := nextval('sponsor_payment_number_seq');
        
        -- Format sequence number with leading zeros
        sequence_num := LPAD(next_num::TEXT, 6, '0');
        
        -- Generate payment number
        new_payment_number := 'SP-' || year_code || '-' || sequence_num;
        
        -- Check if this number already exists (shouldn't happen with sequence, but safety check)
        IF NOT EXISTS (SELECT 1 FROM public.sponsor_payments WHERE payment_number = new_payment_number) THEN
            NEW.payment_number := new_payment_number;
            RETURN NEW;
        END IF;
        
        -- If we've tried too many times, raise an error
        IF attempt >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique payment number after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Recreate the trigger
CREATE TRIGGER trigger_generate_sponsor_payment_number
    BEFORE INSERT ON public.sponsor_payments
    FOR EACH ROW
    EXECUTE FUNCTION generate_sponsor_payment_number();

-- Step 6: Reset sequence to current max + 1 (to avoid conflicts with existing data)
DO $$
DECLARE
    max_num INTEGER;
BEGIN
    -- Extract the highest number from existing payment_numbers
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(payment_number FROM 'SP-\\d{4}-(\\d{6})') AS INTEGER)), 
        0
    ) INTO max_num
    FROM public.sponsor_payments;
    
    -- Reset sequence to max + 1
    PERFORM setval('sponsor_payment_number_seq', max_num + 1, false);
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the function (optional - comment out after verification)
-- INSERT INTO public.sponsor_payments (sponsor_id, amount, payment_date, payment_method, recorded_by)
-- VALUES (
--     (SELECT id FROM public.sponsors LIMIT 1),
--     1000.00,
--     CURRENT_DATE,
--     'bank_transfer',
--     (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
-- );

-- Check the result
-- SELECT payment_number, amount, payment_date FROM public.sponsor_payments ORDER BY created_at DESC LIMIT 1;

RAISE NOTICE 'Sponsor payment number generation fixed!';
RAISE NOTICE 'Sequence created and synchronized with existing data';
RAISE NOTICE 'Trigger recreated with race condition protection';
