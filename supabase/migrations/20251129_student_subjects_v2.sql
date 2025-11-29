-- ============================================================================
-- Migration: Enhanced Student Subject Enrollment System
-- Purpose: Add term tracking, audit trails, and performance optimizations
-- Version: 2.0
-- ============================================================================

-- 1. Add new columns to student_subjects table
-- ============================================================================

-- Add term_id (optional - allows year-wide or term-specific enrollments)
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add audit column to track who enrolled the student
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN enrolled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Ensure all timestamp columns exist
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add is_optional flag
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN is_optional BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add academic_year_id if missing
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add id column if missing (for easier management)
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN id UUID DEFAULT uuid_generate_v4();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 2. Backfill existing data
-- ============================================================================

-- Assign academic year to existing records
DO $$ 
DECLARE
    v_year_id UUID;
BEGIN
    -- Try to find active academic year first
    SELECT id INTO v_year_id FROM public.academic_years WHERE is_active = true LIMIT 1;
    
    -- If no active year, use most recent
    IF v_year_id IS NULL THEN
        SELECT id INTO v_year_id FROM public.academic_years ORDER BY start_date DESC LIMIT 1;
    END IF;

    -- Update records missing academic_year_id
    IF v_year_id IS NOT NULL THEN
        UPDATE public.student_subjects 
        SET academic_year_id = v_year_id 
        WHERE academic_year_id IS NULL;
    END IF;
END $$;

-- Backfill term_id for existing records (assign to first term of their year)
DO $$ 
BEGIN
    UPDATE public.student_subjects ss
    SET term_id = (
        SELECT t.id 
        FROM public.terms t 
        WHERE t.academic_year_id = ss.academic_year_id 
        ORDER BY t.start_date ASC 
        LIMIT 1
    )
    WHERE ss.term_id IS NULL 
    AND ss.academic_year_id IS NOT NULL;
END $$;

-- 3. Update Primary Key and Constraints
-- ============================================================================

-- Drop old primary key if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_subjects_pkey') THEN
        ALTER TABLE public.student_subjects DROP CONSTRAINT student_subjects_pkey;
    END IF;
END $$;

-- Make id the primary key
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_subjects_pkey') THEN
        ALTER TABLE public.student_subjects ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Drop old unique constraint if exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_subjects_unique_enrollment') THEN
        ALTER TABLE public.student_subjects DROP CONSTRAINT student_subjects_unique_enrollment;
    END IF;
END $$;

-- Add new unique constraint: student can only enroll in a subject once per year-term combination
-- If term_id is NULL, it's a year-wide enrollment
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD CONSTRAINT student_subjects_unique_enrollment 
    UNIQUE (student_id, subject_id, academic_year_id, term_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Add Data Integrity Constraints
-- ============================================================================

-- Ensure academic_year_id is always set
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ALTER COLUMN academic_year_id SET NOT NULL;
EXCEPTION
    WHEN others THEN 
        RAISE NOTICE 'Could not make academic_year_id NOT NULL - some records may be missing this value';
END $$;

-- Add check constraint: if term_id is set, it must belong to the academic_year_id
-- Note: PostgreSQL doesn't support subqueries in CHECK constraints
-- We'll use a trigger instead for this validation
CREATE OR REPLACE FUNCTION validate_term_belongs_to_year()
RETURNS TRIGGER AS $$
BEGIN
    -- If term_id is set, verify it belongs to the academic_year_id
    IF NEW.term_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.terms 
            WHERE id = NEW.term_id 
            AND academic_year_id = NEW.academic_year_id
        ) THEN
            RAISE EXCEPTION 'Term % does not belong to academic year %', 
                NEW.term_id, NEW.academic_year_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_student_subject_term ON public.student_subjects;
CREATE TRIGGER validate_student_subject_term
    BEFORE INSERT OR UPDATE ON public.student_subjects
    FOR EACH ROW
    EXECUTE FUNCTION validate_term_belongs_to_year();

-- 5. Performance Indexes
-- ============================================================================

-- Fast lookup by student + year
CREATE INDEX IF NOT EXISTS idx_student_subjects_student_year 
ON public.student_subjects(student_id, academic_year_id);

-- Fast lookup by student + term
CREATE INDEX IF NOT EXISTS idx_student_subjects_student_term 
ON public.student_subjects(student_id, term_id) 
WHERE term_id IS NOT NULL;

-- Fast lookup by subject (for enrollment statistics)
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject_year 
ON public.student_subjects(subject_id, academic_year_id);

-- Composite index for common query pattern (student's subjects in a specific term)
CREATE INDEX IF NOT EXISTS idx_student_subjects_full 
ON public.student_subjects(student_id, academic_year_id, term_id, subject_id);

-- Index for audit queries (who enrolled when)
CREATE INDEX IF NOT EXISTS idx_student_subjects_enrolled_by 
ON public.student_subjects(enrolled_by, enrolled_at);

-- 6. Enable RLS
-- ============================================================================

ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- 7. Update RLS Policies
-- ============================================================================

-- Drop existing policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Student subjects viewable by authenticated" ON public.student_subjects;
    DROP POLICY IF EXISTS "Admins can manage student subjects" ON public.student_subjects;
    DROP POLICY IF EXISTS "Admins and teachers can manage student subjects" ON public.student_subjects;
END $$;

-- All authenticated users can view student subjects
CREATE POLICY "Student subjects viewable by authenticated" 
ON public.student_subjects
FOR SELECT 
TO authenticated 
USING (true);

-- Admins and teachers can manage student subjects
CREATE POLICY "Admins and teachers can manage student subjects" 
ON public.student_subjects
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('admin', 'teacher', 'headteacher', 'deputy_headteacher')
    )
);

-- Students can view their own subjects
CREATE POLICY "Students can view own subjects" 
ON public.student_subjects
FOR SELECT 
USING (
    student_id = auth.uid()
);

-- 8. Triggers
-- ============================================================================

-- Update updated_at timestamp on changes
DROP TRIGGER IF EXISTS update_student_subjects_updated_at ON public.student_subjects;
CREATE TRIGGER update_student_subjects_updated_at
    BEFORE UPDATE ON public.student_subjects
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- 9. Add helpful comments
-- ============================================================================

COMMENT ON TABLE public.student_subjects IS 'Tracks student enrollment in subjects per academic year and optionally per term';
COMMENT ON COLUMN public.student_subjects.term_id IS 'Optional: If set, this enrollment is specific to a term. If NULL, enrollment is for the entire academic year';
COMMENT ON COLUMN public.student_subjects.enrolled_by IS 'User who enrolled the student (for audit trail)';
COMMENT ON COLUMN public.student_subjects.is_optional IS 'True if this is an elective/optional subject, false if compulsory';
COMMENT ON COLUMN public.student_subjects.academic_year_id IS 'Required: The academic year for this enrollment';

-- 10. Create helper view for easy querying
-- ============================================================================

CREATE OR REPLACE VIEW student_subjects_detailed AS
SELECT 
    ss.id,
    ss.student_id,
    ss.subject_id,
    ss.academic_year_id,
    ss.term_id,
    ss.is_optional,
    ss.enrolled_at,
    ss.enrolled_by,
    -- Student details
    p.first_name || ' ' || p.last_name AS student_name,
    p.email AS student_email,
    -- Subject details
    subj.name AS subject_name,
    subj.code AS subject_code,
    -- Academic year details
    ay.name AS academic_year_name,
    ay.is_active AS is_current_year,
    -- Term details (if applicable)
    t.name AS term_name,
    t.is_active AS is_current_term,
    -- Enrolled by details
    ep.first_name || ' ' || ep.last_name AS enrolled_by_name
FROM public.student_subjects ss
JOIN public.profiles p ON ss.student_id = p.id
JOIN public.subjects subj ON ss.subject_id = subj.id
JOIN public.academic_years ay ON ss.academic_year_id = ay.id
LEFT JOIN public.terms t ON ss.term_id = t.id
LEFT JOIN public.profiles ep ON ss.enrolled_by = ep.id;

COMMENT ON VIEW student_subjects_detailed IS 'Convenient view with all enrollment details joined for easy querying and reporting';
