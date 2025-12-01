-- ============================================================================
-- Migration: Add Audit Trail to Departments and Subjects
-- Purpose: Track who created, modified, and deleted records with timestamps
-- Date: 2025-12-01
-- ============================================================================

-- 1. Add audit columns to departments table
-- ============================================================================

DO $$ BEGIN
    ALTER TABLE public.departments 
    ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.departments 
    ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.departments 
    ADD COLUMN deleted_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.departments 
    ADD COLUMN deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 2. Add audit columns to subjects table
-- ============================================================================

DO $$ BEGIN
    ALTER TABLE public.subjects 
    ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.subjects 
    ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.subjects 
    ADD COLUMN deleted_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.subjects 
    ADD COLUMN deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 3. Create trigger function to auto-populate audit fields
-- ============================================================================

CREATE OR REPLACE FUNCTION set_audit_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- On INSERT: Set both created_by and updated_by to current user
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    -- On UPDATE: Only update updated_by
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by = auth.uid();
        
        -- If this is a soft delete (deleted_at is being set), also set deleted_by
        IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
            NEW.deleted_by = auth.uid();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply triggers to departments table
-- ============================================================================

DROP TRIGGER IF EXISTS audit_departments ON public.departments;
CREATE TRIGGER audit_departments
    BEFORE INSERT OR UPDATE ON public.departments
    FOR EACH ROW 
    EXECUTE FUNCTION set_audit_fields();

-- 5. Apply triggers to subjects table
-- ============================================================================

DROP TRIGGER IF EXISTS audit_subjects ON public.subjects;
CREATE TRIGGER audit_subjects
    BEFORE INSERT OR UPDATE ON public.subjects
    FOR EACH ROW 
    EXECUTE FUNCTION set_audit_fields();

-- 6. Add performance indexes
-- ============================================================================

-- Indexes for departments
CREATE INDEX IF NOT EXISTS idx_departments_created_by 
ON public.departments(created_by) 
WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_departments_updated_by 
ON public.departments(updated_by) 
WHERE updated_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_departments_deleted_at 
ON public.departments(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_departments_active 
ON public.departments(id) 
WHERE deleted_at IS NULL;

-- Indexes for subjects
CREATE INDEX IF NOT EXISTS idx_subjects_created_by 
ON public.subjects(created_by) 
WHERE created_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_updated_by 
ON public.subjects(updated_by) 
WHERE updated_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_deleted_at 
ON public.subjects(deleted_at) 
WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subjects_active 
ON public.subjects(id) 
WHERE deleted_at IS NULL;

-- 7. Update RLS Policies to handle soft deletes
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Reference tables viewable by authenticated" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;

-- Departments: Regular users see only active (non-deleted) records
CREATE POLICY "Active departments viewable by authenticated" 
ON public.departments
FOR SELECT 
TO authenticated 
USING (deleted_at IS NULL);

-- Departments: Admins can view all records (including deleted)
CREATE POLICY "Admins can view all departments" 
ON public.departments
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('admin', 'headteacher', 'deputy_headteacher')
    )
);

-- Departments: Admins can insert, update, and soft delete
CREATE POLICY "Admins can manage departments" 
ON public.departments
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('admin', 'headteacher', 'deputy_headteacher')
    )
);

-- Drop existing policies for subjects
DROP POLICY IF EXISTS "Reference tables viewable by authenticated" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;

-- Subjects: Regular users see only active (non-deleted) records
CREATE POLICY "Active subjects viewable by authenticated" 
ON public.subjects
FOR SELECT 
TO authenticated 
USING (deleted_at IS NULL);

-- Subjects: Admins can view all records (including deleted)
CREATE POLICY "Admins can view all subjects" 
ON public.subjects
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('admin', 'headteacher', 'deputy_headteacher')
    )
);

-- Subjects: Admins can insert, update, and soft delete
CREATE POLICY "Admins can manage subjects" 
ON public.subjects
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('admin', 'headteacher', 'deputy_headteacher')
    )
);

-- 8. Add helpful comments
-- ============================================================================

COMMENT ON COLUMN public.departments.created_by IS 'User who created this department (for audit trail)';
COMMENT ON COLUMN public.departments.updated_by IS 'User who last modified this department (for audit trail)';
COMMENT ON COLUMN public.departments.deleted_at IS 'Timestamp when department was soft-deleted (NULL if active)';
COMMENT ON COLUMN public.departments.deleted_by IS 'User who deleted this department (for audit trail)';

COMMENT ON COLUMN public.subjects.created_by IS 'User who created this subject (for audit trail)';
COMMENT ON COLUMN public.subjects.updated_by IS 'User who last modified this subject (for audit trail)';
COMMENT ON COLUMN public.subjects.deleted_at IS 'Timestamp when subject was soft-deleted (NULL if active)';
COMMENT ON COLUMN public.subjects.deleted_by IS 'User who deleted this subject (for audit trail)';

-- 9. Create helper views for easy querying
-- ============================================================================

CREATE OR REPLACE VIEW departments_with_audit
WITH (security_invoker = true) AS
SELECT 
    d.id,
    d.name,
    d.code,
    d.head_of_department_id,
    d.created_at,
    d.updated_at,
    d.deleted_at,
    -- Created by details
    cp.first_name || ' ' || cp.last_name AS created_by_name,
    cp.email AS created_by_email,
    -- Updated by details
    up.first_name || ' ' || up.last_name AS updated_by_name,
    up.email AS updated_by_email,
    -- Deleted by details
    dp.first_name || ' ' || dp.last_name AS deleted_by_name,
    dp.email AS deleted_by_email,
    -- Status
    CASE 
        WHEN d.deleted_at IS NULL THEN 'active'
        ELSE 'deleted'
    END AS status
FROM public.departments d
LEFT JOIN public.profiles cp ON d.created_by = cp.id
LEFT JOIN public.profiles up ON d.updated_by = up.id
LEFT JOIN public.profiles dp ON d.deleted_by = dp.id;

CREATE OR REPLACE VIEW subjects_with_audit
WITH (security_invoker = true) AS
SELECT 
    s.id,
    s.name,
    s.code,
    s.department_id,
    s.description,
    s.created_at,
    s.updated_at,
    s.deleted_at,
    -- Department details
    dept.name AS department_name,
    -- Created by details
    cp.first_name || ' ' || cp.last_name AS created_by_name,
    cp.email AS created_by_email,
    -- Updated by details
    up.first_name || ' ' || up.last_name AS updated_by_name,
    up.email AS updated_by_email,
    -- Deleted by details
    dp.first_name || ' ' || dp.last_name AS deleted_by_name,
    dp.email AS deleted_by_email,
    -- Status
    CASE 
        WHEN s.deleted_at IS NULL THEN 'active'
        ELSE 'deleted'
    END AS status
FROM public.subjects s
LEFT JOIN public.departments dept ON s.department_id = dept.id
LEFT JOIN public.profiles cp ON s.created_by = cp.id
LEFT JOIN public.profiles up ON s.updated_by = up.id
LEFT JOIN public.profiles dp ON s.deleted_by = dp.id;

COMMENT ON VIEW departments_with_audit IS 'Departments with full audit trail information including user names';
COMMENT ON VIEW subjects_with_audit IS 'Subjects with full audit trail information including user names';

-- 10. Grant appropriate permissions on views
-- ============================================================================

-- Allow authenticated users to view the audit views
GRANT SELECT ON departments_with_audit TO authenticated;
GRANT SELECT ON subjects_with_audit TO authenticated;
