-- ============================================================================
-- Migration: Create teacher_departments junction table
-- Purpose: Enable many-to-many relationship between teachers and departments
-- Normalization: Proper junction table for normalized many-to-many relationship
-- ============================================================================

-- Create teacher_departments junction table
-- This table allows a teacher to belong to multiple departments (many-to-many)
CREATE TABLE IF NOT EXISTS public.teacher_departments (
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (teacher_id, department_id),
    CONSTRAINT teacher_departments_teacher_id_fkey FOREIGN KEY (teacher_id) 
        REFERENCES public.teachers(id) ON DELETE CASCADE,
    CONSTRAINT teacher_departments_department_id_fkey FOREIGN KEY (department_id) 
        REFERENCES public.departments(id) ON DELETE CASCADE
);

-- Add table comment for documentation
COMMENT ON TABLE public.teacher_departments IS 
    'Junction table for many-to-many relationship between teachers and departments. Allows teachers to belong to multiple departments.';

COMMENT ON COLUMN public.teacher_departments.teacher_id IS 
    'Foreign key to teachers table. Part of composite primary key.';

COMMENT ON COLUMN public.teacher_departments.department_id IS 
    'Foreign key to departments table. Part of composite primary key.';

COMMENT ON COLUMN public.teacher_departments.created_at IS 
    'Timestamp when the teacher-department association was created.';

-- Enable RLS
ALTER TABLE public.teacher_departments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Readable by all authenticated users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teacher_departments' 
        AND policyname = 'Teacher departments viewable by authenticated'
    ) THEN
        CREATE POLICY "Teacher departments viewable by authenticated" ON public.teacher_departments
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Admins can manage (insert, update, delete) teacher departments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teacher_departments' 
        AND policyname = 'Admins can manage teacher departments'
    ) THEN
        CREATE POLICY "Admins can manage teacher departments" ON public.teacher_departments
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role = 'admin'
                )
            );
    END IF;
END $$;

-- Teachers can insert their own department associations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teacher_departments' 
        AND policyname = 'Teachers can insert own departments'
    ) THEN
        CREATE POLICY "Teachers can insert own departments" ON public.teacher_departments
            FOR INSERT TO authenticated
            WITH CHECK (auth.uid() = teacher_id);
    END IF;
END $$;

-- Teachers can delete their own department associations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'teacher_departments' 
        AND policyname = 'Teachers can delete own departments'
    ) THEN
        CREATE POLICY "Teachers can delete own departments" ON public.teacher_departments
            FOR DELETE TO authenticated
            USING (auth.uid() = teacher_id);
    END IF;
END $$;

-- Migrate existing data from teachers table to teacher_departments
-- Only insert if the combination doesn't already exist (idempotent migration)
INSERT INTO public.teacher_departments (teacher_id, department_id)
SELECT t.id, t.department_id
FROM public.teachers t
WHERE t.department_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.teacher_departments td
      WHERE td.teacher_id = t.id AND td.department_id = t.department_id
  )
ON CONFLICT (teacher_id, department_id) DO NOTHING;

-- Create indexes for performance optimization
-- Index on teacher_id for fast lookups of all departments for a teacher
CREATE INDEX IF NOT EXISTS idx_teacher_departments_teacher_id 
    ON public.teacher_departments(teacher_id);

-- Index on department_id for fast lookups of all teachers in a department
CREATE INDEX IF NOT EXISTS idx_teacher_departments_department_id 
    ON public.teacher_departments(department_id);

-- Composite index for queries filtering by both (though PK already covers this)
-- This is optional but can help with certain query patterns
CREATE INDEX IF NOT EXISTS idx_teacher_departments_composite 
    ON public.teacher_departments(teacher_id, department_id);
