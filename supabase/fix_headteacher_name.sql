-- Script to fix the Headteacher's name
-- Run this in the Supabase SQL Editor
-- This script ensures the headteacher's name is correctly set in both auth.users and public.profiles

DO $$
DECLARE
    headteacher_id UUID;
    current_first_name TEXT;
    current_last_name TEXT;
    current_middle_name TEXT;
    current_title TEXT;
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

    RAISE NOTICE 'Current profile data for headteacher (ID: %):', headteacher_id;
    RAISE NOTICE '  First Name: %', current_first_name;
    RAISE NOTICE '  Middle Name: %', COALESCE(current_middle_name, 'NULL');
    RAISE NOTICE '  Last Name: %', current_last_name;
    RAISE NOTICE '  Title: %', COALESCE(current_title, 'NULL');

    -- 1. Update the auth metadata (for future logins/sessions)
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'first_name', 'Khadidya',
        'last_name', 'Kaisi',
        'role', 'headteacher'
    )
    WHERE id = headteacher_id;

    -- 2. Update the public profile (for current display)
    UPDATE public.profiles
    SET first_name = 'Khadidya',
        last_name = 'Kaisi',
        updated_at = NOW()
    WHERE id = headteacher_id;

    -- 3. Ensure the title is set in teachers table (if not already set)
    IF current_title IS NULL THEN
        UPDATE public.teachers
        SET title = 'Dr',
            updated_at = NOW()
        WHERE id = headteacher_id;
        RAISE NOTICE 'Title set to "Dr" in teachers table';
    ELSIF current_title != 'Dr' THEN
        UPDATE public.teachers
        SET title = 'Dr',
            updated_at = NOW()
        WHERE id = headteacher_id;
        RAISE NOTICE 'Title updated to "Dr" in teachers table';
    END IF;

    RAISE NOTICE 'Headteacher name updated successfully!';
    RAISE NOTICE 'Expected full name: Dr Khadidya Kaisi';
    RAISE NOTICE '';
    RAISE NOTICE 'Verification - Current data after update:';
    
    SELECT first_name, last_name, middle_name INTO current_first_name, current_last_name, current_middle_name
    FROM public.profiles
    WHERE id = headteacher_id;

    SELECT title INTO current_title
    FROM public.teachers
    WHERE id = headteacher_id;

    RAISE NOTICE '  Title: %', COALESCE(current_title, 'NULL');
    RAISE NOTICE '  First Name: %', current_first_name;
    RAISE NOTICE '  Middle Name: %', COALESCE(current_middle_name, 'NULL');
    RAISE NOTICE '  Last Name: %', current_last_name;
    
    -- Construct expected full name
    DECLARE
        full_name_parts TEXT[] := ARRAY[]::TEXT[];
        expected_full_name TEXT;
    BEGIN
        IF current_title IS NOT NULL AND current_title != '' THEN
            full_name_parts := full_name_parts || current_title;
        END IF;
        IF current_first_name IS NOT NULL AND current_first_name != '' THEN
            full_name_parts := full_name_parts || current_first_name;
        END IF;
        IF current_middle_name IS NOT NULL AND current_middle_name != '' THEN
            full_name_parts := full_name_parts || current_middle_name;
        END IF;
        IF current_last_name IS NOT NULL AND current_last_name != '' THEN
            full_name_parts := full_name_parts || current_last_name;
        END IF;
        
        expected_full_name := array_to_string(full_name_parts, ' ');
        RAISE NOTICE '  Expected Full Name: %', expected_full_name;
    END;
END $$;
