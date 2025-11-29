-- SAFE: Create or upgrade an admin user for SSIMS
-- Email: ***************
-- Password: *********
-- BACK UP your DB before running this.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  wanted_email TEXT := '****************';
  wanted_password TEXT := '********';
  password_hash TEXT := crypt(wanted_password, gen_salt('bf'));
  existing_id UUID;
  new_user_id UUID;
  raw_app jsonb := '{"provider":"email","providers":["email"]}'::jsonb;
  raw_user jsonb := jsonb_build_object('first_name','Admin','last_name','SSIMS','role','admin');
  conflict_profile_id UUID;
  user_id UUID;
BEGIN
  -- Find existing auth.user by email (if any)
  SELECT id INTO existing_id FROM auth.users WHERE email = wanted_email LIMIT 1;

  IF existing_id IS NOT NULL THEN
    user_id := existing_id;

    -- Update existing auth.user: set password and meta data
    UPDATE auth.users
    SET
      encrypted_password = password_hash,
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      updated_at = NOW(),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || raw_app,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || raw_user
    WHERE id = user_id;

    -- Ensure an identity exists for email provider
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
      user_id,
      user_id::text,
      user_id,
      format('{"sub": "%s", "email": "%s"}', user_id, wanted_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;

  ELSE
    -- Create a new auth.user
    new_user_id := uuid_generate_v4();
    user_id := new_user_id;

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
      wanted_email,
      password_hash,
      NOW(),
      NOW(),
      NOW(),
      raw_app,
      raw_user,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );

    -- Create identity for new user
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
      new_user_id::text,
      new_user_id,
      format('{"sub": "%s", "email": "%s"}', new_user_id, wanted_email)::jsonb,
      'email',
      NOW(),
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END IF;

  -- At this point we have a user_id (existing or new).
  -- Ensure there is NOT a conflicting profile for the same email with a different id.
  SELECT id INTO conflict_profile_id FROM public.profiles WHERE email = wanted_email LIMIT 1;
  IF conflict_profile_id IS NOT NULL AND conflict_profile_id <> user_id THEN
    RAISE EXCEPTION 'Profile email % already exists with different id (%). Resolve before running this script.', wanted_email, conflict_profile_id;
  END IF;

  -- Ensure a profile exists for the user_id; create or update safely
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (user_id, wanted_email, 'Admin', 'SSIMS', 'admin', NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        role = 'admin',
        first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
        last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
        updated_at = NOW();

  -- Now it is safe to insert into public.admins (FK to profiles.id will succeed)
  INSERT INTO public.admins (id, phone_number, is_super_admin, created_at, updated_at)
  VALUES (user_id, NULL, true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE
    SET is_super_admin = true, updated_at = NOW();

  RAISE NOTICE 'Admin ensured for user id=%', user_id;
  RAISE NOTICE 'Email: %', wanted_email;
  RAISE NOTICE 'Password (plain): % -- change after first login', wanted_password;
END $$;