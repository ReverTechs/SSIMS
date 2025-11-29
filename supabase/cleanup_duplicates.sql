-- ============================================================================
-- Cleanup: Remove Duplicate Subjects and Fix Curriculum
-- Purpose: Fix duplicate enrollments and update curriculum structure
-- ============================================================================

BEGIN;

-- 1. BACKUP: Create temporary table with current state (for safety)
-- ============================================================================
CREATE TEMP TABLE backup_student_subjects AS 
SELECT * FROM student_subjects;

CREATE TEMP TABLE backup_curriculum_subjects AS 
SELECT * FROM curriculum_subjects;

-- 2. REMOVE DUPLICATE ENROLLMENTS
-- ============================================================================
-- Keep only the earliest enrollment for each student-subject-year-term combination
DELETE FROM student_subjects ss1
WHERE EXISTS (
    SELECT 1 FROM student_subjects ss2
    WHERE ss2.student_id = ss1.student_id
    AND ss2.subject_id = ss1.subject_id
    AND ss2.academic_year_id = ss1.academic_year_id
    AND COALESCE(ss2.term_id::text, 'NULL') = COALESCE(ss1.term_id::text, 'NULL')
    AND ss2.enrolled_at < ss1.enrolled_at
    AND ss2.id != ss1.id
);

-- 3. UPDATE SUBJECTS: Replace Physical Science with Physics and Chemistry
-- ============================================================================

DO $$
DECLARE
    v_dept_sciences UUID;
    v_physical_science_id UUID;
    v_physics_id UUID;
    v_chemistry_id UUID;
BEGIN
    -- Get Sciences department
    SELECT id INTO v_dept_sciences FROM departments WHERE name = 'Sciences' LIMIT 1;
    
    -- Get Physical Science ID
    SELECT id INTO v_physical_science_id FROM subjects WHERE code = 'PSC' LIMIT 1;
    
    -- Create Physics if it doesn't exist
    INSERT INTO subjects (name, code, department_id)
    VALUES ('Physics', 'PHY', v_dept_sciences)
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO v_physics_id;
    
    -- If it already existed, get its ID
    IF v_physics_id IS NULL THEN
        SELECT id INTO v_physics_id FROM subjects WHERE code = 'PHY';
    END IF;
    
    -- Create Chemistry if it doesn't exist
    INSERT INTO subjects (name, code, department_id)
    VALUES ('Chemistry', 'CHE', v_dept_sciences)
    ON CONFLICT (code) DO NOTHING
    RETURNING id INTO v_chemistry_id;
    
    -- If it already existed, get its ID
    IF v_chemistry_id IS NULL THEN
        SELECT id INTO v_chemistry_id FROM subjects WHERE code = 'CHE';
    END IF;
    
    -- Update curriculum_subjects: Replace Physical Science with Physics and Chemistry
    -- For Junior level
    IF EXISTS (SELECT 1 FROM curriculum_subjects WHERE subject_id = v_physical_science_id AND level = 'junior') THEN
        -- Add Physics for junior
        INSERT INTO curriculum_subjects (subject_id, level, stream, is_compulsory, category)
        VALUES (v_physics_id, 'junior', NULL, true, 'core')
        ON CONFLICT (subject_id, level, stream) DO NOTHING;
        
        -- Add Chemistry for junior
        INSERT INTO curriculum_subjects (subject_id, level, stream, is_compulsory, category)
        VALUES (v_chemistry_id, 'junior', NULL, true, 'core')
        ON CONFLICT (subject_id, level, stream) DO NOTHING;
        
        -- Remove Physical Science from junior
        DELETE FROM curriculum_subjects 
        WHERE subject_id = v_physical_science_id AND level = 'junior';
    END IF;
    
    -- For Senior Sciences stream
    IF EXISTS (SELECT 1 FROM curriculum_subjects WHERE subject_id = v_physical_science_id AND level = 'senior' AND stream = 'sciences') THEN
        -- Add Physics for senior sciences
        INSERT INTO curriculum_subjects (subject_id, level, stream, is_compulsory, category)
        VALUES (v_physics_id, 'senior', 'sciences', true, 'sciences')
        ON CONFLICT (subject_id, level, stream) DO NOTHING;
        
        -- Add Chemistry for senior sciences
        INSERT INTO curriculum_subjects (subject_id, level, stream, is_compulsory, category)
        VALUES (v_chemistry_id, 'senior', 'sciences', true, 'sciences')
        ON CONFLICT (subject_id, level, stream) DO NOTHING;
        
        -- Remove Physical Science from senior sciences
        DELETE FROM curriculum_subjects 
        WHERE subject_id = v_physical_science_id AND level = 'senior' AND stream = 'sciences';
    END IF;
    
    -- Update student enrollments: Replace Physical Science with Physics and Chemistry
    -- This creates two enrollments for each Physical Science enrollment
    INSERT INTO student_subjects (student_id, subject_id, academic_year_id, term_id, is_optional, enrolled_by, enrolled_at)
    SELECT 
        student_id,
        v_physics_id,
        academic_year_id,
        term_id,
        is_optional,
        enrolled_by,
        enrolled_at
    FROM student_subjects
    WHERE subject_id = v_physical_science_id
    ON CONFLICT (student_id, subject_id, academic_year_id, term_id) DO NOTHING;
    
    INSERT INTO student_subjects (student_id, subject_id, academic_year_id, term_id, is_optional, enrolled_by, enrolled_at)
    SELECT 
        student_id,
        v_chemistry_id,
        academic_year_id,
        term_id,
        is_optional,
        enrolled_by,
        enrolled_at
    FROM student_subjects
    WHERE subject_id = v_physical_science_id
    ON CONFLICT (student_id, subject_id, academic_year_id, term_id) DO NOTHING;
    
    -- Delete Physical Science enrollments
    DELETE FROM student_subjects WHERE subject_id = v_physical_science_id;
    
    -- Optionally: Mark Physical Science as deprecated (don't delete in case of historical data)
    UPDATE subjects 
    SET description = 'DEPRECATED: Replaced by Physics and Chemistry'
    WHERE id = v_physical_science_id;
    
END $$;

-- 4. VERIFY: Check for remaining duplicates
-- ============================================================================
DO $$
DECLARE
    v_duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_duplicate_count
    FROM (
        SELECT student_id, subject_id, academic_year_id, term_id, COUNT(*)
        FROM student_subjects
        GROUP BY student_id, subject_id, academic_year_id, term_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF v_duplicate_count > 0 THEN
        RAISE WARNING 'Still found % duplicate enrollments after cleanup', v_duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate enrollments found - cleanup successful!';
    END IF;
END $$;

-- 5. SUMMARY: Show what was changed
-- ============================================================================
DO $$
DECLARE
    v_removed_count INTEGER;
    v_physics_count INTEGER;
    v_chemistry_count INTEGER;
BEGIN
    -- Count removed duplicates
    SELECT COUNT(*) INTO v_removed_count
    FROM backup_student_subjects bss
    WHERE NOT EXISTS (
        SELECT 1 FROM student_subjects ss
        WHERE ss.id = bss.id
    );
    
    -- Count new Physics enrollments
    SELECT COUNT(*) INTO v_physics_count
    FROM student_subjects ss
    JOIN subjects s ON ss.subject_id = s.id
    WHERE s.code = 'PHY';
    
    -- Count new Chemistry enrollments
    SELECT COUNT(*) INTO v_chemistry_count
    FROM student_subjects ss
    JOIN subjects s ON ss.subject_id = s.id
    WHERE s.code = 'CHE';
    
    RAISE NOTICE '=== CLEANUP SUMMARY ===';
    RAISE NOTICE 'Duplicate enrollments removed: %', v_removed_count;
    RAISE NOTICE 'Physics enrollments created: %', v_physics_count;
    RAISE NOTICE 'Chemistry enrollments created: %', v_chemistry_count;
    RAISE NOTICE '======================';
END $$;

-- If everything looks good, commit the transaction
-- If there are issues, you can ROLLBACK instead
COMMIT;

-- ROLLBACK; -- Uncomment this line instead of COMMIT if you want to undo changes
