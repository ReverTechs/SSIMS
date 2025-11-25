-- ============================================================================
-- Migration: Curriculum Schema Support
-- Purpose: Implement Malawi secondary curriculum structure (Junior/Senior, Streams)
-- ============================================================================

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE curriculum_level AS ENUM ('junior', 'senior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stream_type AS ENUM ('sciences', 'humanities', 'commercial', 'general');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subject_category AS ENUM ('core', 'sciences', 'humanities', 'commercial', 'languages', 'technical', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Curriculum Subjects Configuration Table
-- This table defines the rules for subjects (e.g., Math is compulsory for Junior)
CREATE TABLE IF NOT EXISTS public.curriculum_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    level curriculum_level NOT NULL,
    stream stream_type, -- If NULL, applies to all streams (or is for Junior)
    is_compulsory BOOLEAN NOT NULL DEFAULT false,
    category subject_category NOT NULL DEFAULT 'other',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(subject_id, level, stream) -- Prevent duplicate rules
);

-- 3. Update Students Table
-- Add stream column for Senior students
DO $$ BEGIN
    ALTER TABLE public.students 
    ADD COLUMN stream stream_type;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 4. Enable RLS on new table
ALTER TABLE public.curriculum_subjects ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Curriculum Subjects
-- Readable by all authenticated users
DO $$ BEGIN
    CREATE POLICY "Curriculum subjects viewable by authenticated" ON public.curriculum_subjects
        FOR SELECT TO authenticated USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Manageable by admins
DO $$ BEGIN
    CREATE POLICY "Admins can manage curriculum subjects" ON public.curriculum_subjects
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Triggers
CREATE TRIGGER update_curriculum_subjects_updated_at
    BEFORE UPDATE ON public.curriculum_subjects
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_subject_id ON public.curriculum_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_level ON public.curriculum_subjects(level);
CREATE INDEX IF NOT EXISTS idx_students_stream ON public.students(stream);
