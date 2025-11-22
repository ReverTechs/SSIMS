-- Script to verify middle_name is set correctly in the database
-- Run this to check what values are actually stored

DO $$
DECLARE
    headteacher_id UUID;
    current_first_name TEXT;
    current_last_name TEXT;
    current_middle_name TEXT;
    current_title TEXT;
    constructed_full_name TEXT;
BEGIN
    -- Find the headteacher user
    SELECT id INTO headteacher_id
    FROM public.profiles
    WHERE role = 'headteacher'
    LIMIT 1;

    IF headteacher_id IS NULL THEN
        RAISE NOTICE 'No headteacher found in profiles table';
        RETURN;
    END IF;

    -- Get current profile data
    SELECT first_name, last_name, middle_name INTO current_first_name, current_last_name, current_middle_name
    FROM public.profiles
    WHERE id = headteacher_id;

    -- Get current title from teachers table
    SELECT title INTO current_title
    FROM public.teachers
    WHERE id = headteacher_id;

    RAISE NOTICE '=== HEADTEACHER PROFILE DATA ===';
    RAISE NOTICE 'User ID: %', headteacher_id;
    RAISE NOTICE '';
    RAISE NOTICE 'From profiles table:';
    RAISE NOTICE '  first_name: %', COALESCE(current_first_name, 'NULL');
    RAISE NOTICE '  middle_name: %', COALESCE(current_middle_name, 'NULL');
    RAISE NOTICE '  last_name: %', COALESCE(current_last_name, 'NULL');
    RAISE NOTICE '';
    RAISE NOTICE 'From teachers table:';
    RAISE NOTICE '  title: %', COALESCE(current_title, 'NULL');
    RAISE NOTICE '';
    
    -- Check if middle_name is actually set
    IF current_middle_name IS NULL THEN
        RAISE NOTICE '⚠️  WARNING: middle_name is NULL in the database!';
        RAISE NOTICE '   Run the UPDATE command to set it.';
    ELSIF current_middle_name = '' THEN
        RAISE NOTICE '⚠️  WARNING: middle_name is an empty string in the database!';
    ELSIF TRIM(current_middle_name) = '' THEN
        RAISE NOTICE '⚠️  WARNING: middle_name contains only whitespace!';
    ELSE
        RAISE NOTICE '✓  middle_name is set to: "%"', current_middle_name;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== EXPECTED FULL NAME CONSTRUCTION ===';
    
    -- Construct the expected full name
    DECLARE
        name_parts TEXT[] := ARRAY[]::TEXT[];
    BEGIN
        IF current_title IS NOT NULL AND TRIM(current_title) != '' THEN
            name_parts := name_parts || current_title;
            RAISE NOTICE '  Adding title: %', current_title;
        END IF;
        
        IF current_first_name IS NOT NULL AND TRIM(current_first_name) != '' THEN
            name_parts := name_parts || current_first_name;
            RAISE NOTICE '  Adding first_name: %', current_first_name;
        END IF;
        
        IF current_middle_name IS NOT NULL AND TRIM(current_middle_name) != '' THEN
            name_parts := name_parts || current_middle_name;
            RAISE NOTICE '  Adding middle_name: %', current_middle_name;
        ELSE
            RAISE NOTICE '  Skipping middle_name (NULL or empty)';
        END IF;
        
        IF current_last_name IS NOT NULL AND TRIM(current_last_name) != '' THEN
            name_parts := name_parts || current_last_name;
            RAISE NOTICE '  Adding last_name: %', current_last_name;
        END IF;
        
        constructed_full_name := array_to_string(name_parts, ' ');
        RAISE NOTICE '';
        RAISE NOTICE 'Expected Full Name: %', constructed_full_name;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== TO UPDATE MIDDLE NAME ===';
    RAISE NOTICE 'Run this command (replace "YourMiddleName" with the actual middle name):';
    RAISE NOTICE 'UPDATE public.profiles SET middle_name = ''YourMiddleName'', updated_at = NOW() WHERE id = ''%'';', headteacher_id;
END $$;

