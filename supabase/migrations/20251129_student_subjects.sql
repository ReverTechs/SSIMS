-- ============================================================================
-- Migration: Update Student Subject Enrollment
-- Purpose: Update existing student_subjects table to support academic years
-- ============================================================================

-- 1. Add new columns if they don't exist
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN is_optional BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

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

-- 2. Handle existing data (if any)
-- We need to assign an academic year to existing records to avoid NULLs in PK
-- We'll try to find the active academic year, or the most recent one.
DO $$ 
DECLARE
    v_year_id UUID;
BEGIN
    SELECT id INTO v_year_id FROM public.academic_years WHERE is_active = true LIMIT 1;
    
    IF v_year_id IS NULL THEN
        SELECT id INTO v_year_id FROM public.academic_years ORDER BY start_date DESC LIMIT 1;
    END IF;

    IF v_year_id IS NOT NULL THEN
        UPDATE public.student_subjects 
        SET academic_year_id = v_year_id 
        WHERE academic_year_id IS NULL;
    END IF;
END $$;

-- 3. Update Primary Key / Constraints
-- We need to allow the same subject for different years.
-- Current PK is (student_id, subject_id). We need to drop it.

DO $$ BEGIN
    -- Check if the constraint exists before dropping
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_subjects_pkey') THEN
        ALTER TABLE public.student_subjects DROP CONSTRAINT student_subjects_pkey;
    END IF;
END $$;

-- Add ID column if not exists (useful for management)
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD COLUMN id UUID DEFAULT uuid_generate_v4();
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Make ID the new Primary Key
DO $$ BEGIN
    -- Only add PK if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'student_subjects_pkey') THEN
        ALTER TABLE public.student_subjects ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Add Unique Constraint for (student_id, subject_id, academic_year_id)
DO $$ BEGIN
    ALTER TABLE public.student_subjects 
    ADD CONSTRAINT student_subjects_unique_enrollment UNIQUE (student_id, subject_id, academic_year_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Enable RLS (if not already)
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- 5. Update/Create RLS Policies
-- (Re-run policies to ensure they are correct)

DO $$ BEGIN
    DROP POLICY IF EXISTS "Student subjects viewable by authenticated" ON public.student_subjects;
    CREATE POLICY "Student subjects viewable by authenticated" ON public.student_subjects
        FOR SELECT TO authenticated USING (true);
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins can manage student subjects" ON public.student_subjects;
    CREATE POLICY "Admins and teachers can manage student subjects" ON public.student_subjects
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('admin', 'teacher', 'headteacher', 'deputy_headteacher')
            )
        );
END $$;

-- 6. Triggers
DROP TRIGGER IF EXISTS update_student_subjects_updated_at ON public.student_subjects;
CREATE TRIGGER update_student_subjects_updated_at
    BEFORE UPDATE ON public.student_subjects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_student_subjects_student_year ON public.student_subjects(student_id, academic_year_id);
