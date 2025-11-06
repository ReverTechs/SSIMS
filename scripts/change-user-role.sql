-- Quick SQL Scripts for Changing User Roles
-- Copy and paste these into Supabase SQL Editor

-- ============================================
-- VIEW ALL USERS AND THEIR ROLES
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- ============================================
-- CHANGE ROLE BY EMAIL
-- ============================================
-- Replace 'user@example.com' with the actual email
-- Replace 'admin' with desired role: student, teacher, headteacher, deputy_headteacher, guardian, admin

UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email = 'user@example.com';

-- ============================================
-- CHANGE ROLE BY USER ID
-- ============================================
-- Replace 'user-id-here' with the actual user ID from auth.users

UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE id = 'user-id-here';

-- ============================================
-- CHANGE MULTIPLE USERS AT ONCE
-- ============================================
UPDATE user_profiles
SET role = 'admin', updated_at = NOW()
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);

-- ============================================
-- SET DEFAULT ROLE FOR USERS WITHOUT ROLE
-- ============================================
UPDATE user_profiles
SET role = 'student', updated_at = NOW()
WHERE role IS NULL OR role = '';

-- ============================================
-- CREATE PROFILE FOR EXISTING AUTH USER
-- ============================================
-- If a user exists in auth.users but not in user_profiles
-- Replace 'user-id-here' with actual user ID

INSERT INTO user_profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'student')
FROM auth.users
WHERE id = 'user-id-here'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FIND USERS BY ROLE
-- ============================================
-- Find all admins
SELECT * FROM user_profiles WHERE role = 'admin';

-- Find all teachers (including headteachers)
SELECT * FROM user_profiles 
WHERE role IN ('teacher', 'headteacher', 'deputy_headteacher');

-- Find all students
SELECT * FROM user_profiles WHERE role = 'student';



