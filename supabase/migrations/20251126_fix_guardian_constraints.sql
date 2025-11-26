-- =====================================================================
-- FIX GUARDIAN-STUDENT RELATIONSHIP CONSTRAINTS
-- =====================================================================
-- This migration improves the guardian-student relationship handling:
-- 1. Adds a composite unique constraint to prevent duplicate relationships
-- 2. Adds helpful comments for better error messages
-- 3. Keeps the primary guardian constraint (it's correct and necessary)
-- =====================================================================

-- =====================================================================
-- 1. ADD COMPOSITE UNIQUE CONSTRAINT
-- =====================================================================
-- Prevent the same guardian-student pair from being inserted twice
-- This is the actual issue causing the duplicate key error when users
-- try to register the same relationship multiple times

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_guardian_unique_pair 
    ON public.student_guardians(student_id, guardian_id);

COMMENT ON INDEX idx_student_guardian_unique_pair IS 
    'Ensures a guardian-student relationship is only created once. Prevents duplicate entries.';

-- =====================================================================
-- 2. UPDATE COMMENTS FOR BETTER CLARITY
-- =====================================================================

COMMENT ON INDEX idx_student_one_primary_guardian IS 
    'Ensures each student has exactly ONE primary guardian. This is a business rule constraint. If you get an error on this index, it means the student already has a primary guardian - set is_primary=false for additional guardians.';

-- =====================================================================
-- 3. CREATE HELPER FUNCTION TO CHECK PRIMARY GUARDIAN
-- =====================================================================
-- This function helps validate before insertion to provide better error messages

CREATE OR REPLACE FUNCTION public.check_student_primary_guardian(
    p_student_id UUID,
    p_is_primary BOOLEAN
)
RETURNS TABLE(
    has_primary BOOLEAN,
    primary_guardian_id UUID,
    primary_guardian_name TEXT
) AS $$
BEGIN
    IF p_is_primary = false THEN
        -- Not trying to set as primary, no need to check
        RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        true as has_primary,
        sg.guardian_id,
        CONCAT(p.first_name, ' ', p.last_name) as guardian_name
    FROM public.student_guardians sg
    INNER JOIN public.profiles p ON p.id = sg.guardian_id
    WHERE sg.student_id = p_student_id 
        AND sg.is_primary = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_student_primary_guardian(UUID, BOOLEAN) TO authenticated;

COMMENT ON FUNCTION public.check_student_primary_guardian IS 
    'Check if a student already has a primary guardian. Returns the guardian details if one exists. Use this before inserting to provide better error messages.';

-- =====================================================================
-- 4. CREATE HELPER FUNCTION TO GET STUDENT GUARDIANS COUNT
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_student_guardians_count(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
    guardian_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO guardian_count
    FROM public.student_guardians
    WHERE student_id = p_student_id;
    
    RETURN guardian_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_student_guardians_count(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_student_guardians_count IS 
    'Get the total number of guardians for a student. Useful for validation and display.';

-- =====================================================================
-- 5. CREATE HELPER FUNCTION TO GET GUARDIAN STUDENTS COUNT
-- =====================================================================

CREATE OR REPLACE FUNCTION public.get_guardian_students_count(p_guardian_id UUID)
RETURNS INTEGER AS $$
DECLARE
    student_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO student_count
    FROM public.student_guardians
    WHERE guardian_id = p_guardian_id;
    
    RETURN student_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_guardian_students_count(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_guardian_students_count IS 
    'Get the total number of students for a guardian. Useful for dual-role scenarios and display.';

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
