-- ============================================================================
-- Quick Fix: Remove Duplicate Enrollments in Same Academic Year
-- Purpose: Clean up duplicate subject enrollments for the same student in the same year
-- ============================================================================

BEGIN;

-- 1. Show current duplicates
SELECT 
    'BEFORE CLEANUP' as status,
    COUNT(*) as duplicate_enrollment_count
FROM (
    SELECT student_id, subject_id, academic_year_id, COUNT(*)
    FROM student_subjects
    GROUP BY student_id, subject_id, academic_year_id
    HAVING COUNT(*) > 1
) duplicates;

-- 2. Show detailed duplicate information
SELECT 
    p.first_name || ' ' || p.last_name as student_name,
    s.name as subject_name,
    ay.name as academic_year,
    COUNT(*) as enrollment_count,
    STRING_AGG(ss.id::text, ', ') as enrollment_ids
FROM student_subjects ss
JOIN profiles p ON ss.student_id = p.id
JOIN subjects s ON ss.subject_id = s.id
JOIN academic_years ay ON ss.academic_year_id = ay.id
GROUP BY p.first_name, p.last_name, s.name, ay.name, ss.student_id, ss.subject_id, ss.academic_year_id
HAVING COUNT(*) > 1
ORDER BY student_name, subject_name;

-- 3. Remove duplicates (keep the earliest enrollment)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY student_id, subject_id, academic_year_id 
            ORDER BY enrolled_at ASC, id ASC
        ) as rn
    FROM student_subjects
)
DELETE FROM student_subjects
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 4. Verify cleanup
SELECT 
    'AFTER CLEANUP' as status,
    COUNT(*) as duplicate_enrollment_count
FROM (
    SELECT student_id, subject_id, academic_year_id, COUNT(*)
    FROM student_subjects
    GROUP BY student_id, subject_id, academic_year_id
    HAVING COUNT(*) > 1
) duplicates;

-- 5. Show summary
DO $$
DECLARE
    v_total_enrollments INTEGER;
    v_unique_students INTEGER;
    v_active_year_name TEXT;
BEGIN
    -- Get active year name
    SELECT name INTO v_active_year_name 
    FROM academic_years 
    WHERE is_active = true 
    LIMIT 1;
    
    -- Count total enrollments in active year
    SELECT COUNT(*) INTO v_total_enrollments
    FROM student_subjects ss
    JOIN academic_years ay ON ss.academic_year_id = ay.id
    WHERE ay.is_active = true;
    
    -- Count unique students in active year
    SELECT COUNT(DISTINCT student_id) INTO v_unique_students
    FROM student_subjects ss
    JOIN academic_years ay ON ss.academic_year_id = ay.id
    WHERE ay.is_active = true;
    
    RAISE NOTICE '=== CLEANUP SUMMARY ===';
    RAISE NOTICE 'Active Academic Year: %', COALESCE(v_active_year_name, 'NONE');
    RAISE NOTICE 'Total Enrollments in Active Year: %', v_total_enrollments;
    RAISE NOTICE 'Unique Students Enrolled: %', v_unique_students;
    RAISE NOTICE '======================';
END $$;

COMMIT;
