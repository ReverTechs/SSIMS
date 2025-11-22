-- Script to create a Headteacher user
-- Run this in the Supabase SQL Editor

-- Enable pgcrypto to generate password hashes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id UUID := uuid_generate_v4();
    user_email TEXT := 'headteacher@school.mw';
    user_password TEXT := 'password123';
    password_hash TEXT := crypt(user_password, gen_salt('bf'));
BEGIN
    -- 1. Insert into auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        user_email,
        password_hash,
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"first_name": "Khadidya", "last_name": "Kaisi", "role": "headteacher"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    );

    -- 2. Insert into auth.identities
    -- Fixed: Removed 'email' column as it is generated. Kept 'provider_id'.
    INSERT INTO auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        new_user_id::text, -- provider_id is usually the user ID for email provider
        new_user_id,
        format('{"sub": "%s", "email": "%s"}', new_user_id, user_email)::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW()
    );

    -- 3. The trigger `on_auth_user_created` will run and create the profile.
    -- We ensure the role is 'headteacher'.
    UPDATE public.profiles
    SET role = 'headteacher'
    WHERE id = new_user_id;

    -- 4. Insert into public.teachers
    INSERT INTO public.teachers (
        id,
        employee_id,
        title,
        gender,
        date_of_birth,
        phone_number,
        address,
        qualification,
        specialization,
        years_of_experience,
        status,
        joined_at
    ) VALUES (
        new_user_id,
        'HT001',
        'Dr',
        'female',
        '1980-01-01',
        '+265999123456',
        '123 School Lane, Lilongwe',
        'PhD in Education',
        'Educational Leadership',
        15,
        'active',
        CURRENT_DATE
    );

    RAISE NOTICE 'Headteacher user created successfully.';
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Password: %', user_password;
END $$;
