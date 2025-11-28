-- ============================================================================
-- Migration: Academic Year and Enrollment System
-- Purpose: Introduce Academic Years, Terms, and Student Enrollments for history tracking
-- ============================================================================

-- 1. Create Academic Years Table
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Terms Table
CREATE TABLE IF NOT EXISTS public.terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Term 1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'transferred', 'expelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, academic_year_id) -- A student can only be enrolled in one class per academic year (simplification)
);

-- 4. Enable RLS
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Academic Years & Terms: Readable by everyone (authenticated), manageable by admins
CREATE POLICY "Academic years viewable by authenticated" ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage academic years" ON public.academic_years FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Terms viewable by authenticated" ON public.terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage terms" ON public.terms FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enrollments: Viewable by authenticated, manageable by admins
CREATE POLICY "Enrollments viewable by authenticated" ON public.enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Triggers for Updated At
CREATE TRIGGER update_academic_years_updated_at BEFORE UPDATE ON public.academic_years FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON public.terms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Ensure only one Academic Year is active
CREATE OR REPLACE FUNCTION ensure_single_active_academic_year()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.academic_years SET is_active = false WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_academic_year
    BEFORE INSERT OR UPDATE OF is_active ON public.academic_years
    FOR EACH ROW WHEN (NEW.is_active = true)
    EXECUTE PROCEDURE ensure_single_active_academic_year();

-- 8. Ensure only one Term is active (per year? or globally? Usually globally for the school)
CREATE OR REPLACE FUNCTION ensure_single_active_term()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE public.terms SET is_active = false WHERE id != NEW.id AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_term
    BEFORE INSERT OR UPDATE OF is_active ON public.terms
    FOR EACH ROW WHEN (NEW.is_active = true)
    EXECUTE PROCEDURE ensure_single_active_term();

-- 9. DATA MIGRATION: Seed Initial Academic Year and Enroll existing students
DO $$
DECLARE
    v_year_id UUID;
    v_term_id UUID;
BEGIN
    -- Create default Academic Year if none exists
    IF NOT EXISTS (SELECT 1 FROM public.academic_years) THEN
        INSERT INTO public.academic_years (name, start_date, end_date, is_active)
        VALUES ('2025', '2025-01-01', '2025-12-31', true)
        RETURNING id INTO v_year_id;
        
        -- Create default Term
        INSERT INTO public.terms (academic_year_id, name, start_date, end_date, is_active)
        VALUES (v_year_id, 'Term 1', '2025-01-01', '2025-04-01', true)
        RETURNING id INTO v_term_id;

        -- Migrate existing students to this year
        INSERT INTO public.enrollments (student_id, class_id, academic_year_id, status)
        SELECT id, class_id, v_year_id, 'active'
        FROM public.students
        WHERE class_id IS NOT NULL;
    END IF;
END $$;

-- 10. Sync Trigger: Update students.class_id when Enrollment changes for the ACTIVE year
-- This keeps the 'students' table as a fast cache for the current state
CREATE OR REPLACE FUNCTION sync_student_class_from_enrollment()
RETURNS TRIGGER AS $$
DECLARE
    v_is_active_year BOOLEAN;
BEGIN
    -- Check if the enrollment belongs to the active academic year
    SELECT is_active INTO v_is_active_year
    FROM public.academic_years
    WHERE id = NEW.academic_year_id;

    IF v_is_active_year THEN
        UPDATE public.students
        SET class_id = NEW.class_id
        WHERE id = NEW.student_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_student_class
    AFTER INSERT OR UPDATE ON public.enrollments
    FOR EACH ROW
    EXECUTE PROCEDURE sync_student_class_from_enrollment();
