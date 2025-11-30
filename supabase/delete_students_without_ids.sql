-- ============================================================================
-- Delete Students Without Student IDs
-- ============================================================================
-- This script safely deletes students who don't have a student_id assigned.
-- It includes safety checks and provides a preview before deletion.
-- ============================================================================

-- STEP 1: Preview students that will be deleted (RUN THIS FIRST!)
-- ============================================================================
SELECT 
    s.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.email,
    s.student_id,
    c.name as class_name,
    s.created_at
FROM public.students s
JOIN public.profiles p ON s.id = p.id
LEFT JOIN public.classes c ON s.class_id = c.id
WHERE s.student_id IS NULL
ORDER BY s.created_at DESC;

-- STEP 2: Count how many students will be deleted
-- ============================================================================
SELECT COUNT(*) as students_to_delete
FROM public.students
WHERE student_id IS NULL;

-- STEP 3: Delete students without student_id (CAREFUL - THIS IS PERMANENT!)
-- ============================================================================
-- This will also cascade delete related records in:
-- - student_subjects (due to ON DELETE CASCADE)
-- - enrollments (due to ON DELETE CASCADE)
-- - student_guardians (due to ON DELETE CASCADE)
-- 
-- However, it will NOT delete the auth user or profile.
-- If you want to delete those too, see STEP 4.

BEGIN;

-- Store the IDs for reference
CREATE TEMP TABLE students_to_delete AS
SELECT id, created_at
FROM public.students
WHERE student_id IS NULL;

-- Show what will be deleted
SELECT 
    COUNT(*) as total_students,
    COUNT(DISTINCT id) as unique_student_ids
FROM students_to_delete;

-- Delete from students table (cascades to related tables)
DELETE FROM public.students
WHERE id IN (SELECT id FROM students_to_delete);

-- Verify deletion
SELECT 
    (SELECT COUNT(*) FROM students_to_delete) as attempted_deletions,
    (SELECT COUNT(*) FROM public.students WHERE student_id IS NULL) as remaining_null_ids;

-- If everything looks good, COMMIT the transaction
-- Otherwise, ROLLBACK to undo changes
COMMIT;
-- ROLLBACK;  -- Uncomment this instead of COMMIT if you want to undo

-- STEP 4 (OPTIONAL): Also delete auth users and profiles
-- ============================================================================
-- Only run this if you want to completely remove these users from the system
-- This requires service role access

-- WARNING: This is more destructive and will remove the user's ability to login

-- BEGIN;

-- -- Delete auth users (this will cascade to profiles due to FK constraints)
-- DELETE FROM auth.users
-- WHERE id IN (
--     SELECT id FROM public.students WHERE student_id IS NULL
-- );

-- COMMIT;
-- -- ROLLBACK;  -- Uncomment to undo

-- ============================================================================
-- CLEANUP
-- ============================================================================
DROP TABLE IF EXISTS students_to_delete;

-- ============================================================================
-- VERIFICATION QUERIES (Run after deletion)
-- ============================================================================

-- Check if any students still have NULL student_id
SELECT COUNT(*) as remaining_students_without_id
FROM public.students
WHERE student_id IS NULL;

-- Verify total student count
SELECT COUNT(*) as total_students
FROM public.students;
