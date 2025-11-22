-- Script to set/update middle_name for headteacher
-- Replace 'YourMiddleName' with the actual middle name you want to set

DO $$
DECLARE
    headteacher_id UUID;
    new_middle_name TEXT := 'YourMiddleName'; -- ⚠️ CHANGE THIS to your desired middle name
    current_middle_name TEXT;
BEGIN
    -- Find the headteacher
    SELECT id INTO headteacher_id
    FROM public.profiles
    WHERE role = 'headteacher'
    LIMIT 1;

    IF headteacher_id IS NULL THEN
        RAISE NOTICE '❌ No headteacher found in profiles table';
        RETURN;
    END IF;

    -- Get current middle name
    SELECT middle_name INTO current_middle_name
    FROM public.profiles
    WHERE id = headteacher_id;

    RAISE NOTICE '=== UPDATING MIDDLE NAME ===';
    RAISE NOTICE 'Headteacher ID: %', headteacher_id;
    RAISE NOTICE 'Current middle_name: %', COALESCE(current_middle_name, 'NULL');
    RAISE NOTICE 'New middle_name: %', new_middle_name;
    RAISE NOTICE '';

    -- Update the middle name
    UPDATE public.profiles
    SET middle_name = TRIM(new_middle_name),
        updated_at = NOW()
    WHERE id = headteacher_id;

    -- Verify the update
    SELECT middle_name INTO current_middle_name
    FROM public.profiles
    WHERE id = headteacher_id;

    IF current_middle_name = TRIM(new_middle_name) THEN
        RAISE NOTICE '✅ SUCCESS: middle_name updated successfully!';
        RAISE NOTICE 'Verified value: %', current_middle_name;
    ELSE
        RAISE NOTICE '❌ ERROR: Update may have failed. Current value: %', COALESCE(current_middle_name, 'NULL');
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. Refresh your browser/clear cache';
    RAISE NOTICE '2. Log out and log back in if the name still doesn''t appear';
    RAISE NOTICE '3. Run verify_middle_name.sql to check the database values';
END $$;

