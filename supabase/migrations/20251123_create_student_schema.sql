-- 0. Create Enums
-- gender_type is assumed to exist from teacher schema (male, female)
-- If not, uncomment: CREATE TYPE gender_type AS ENUM ('male', 'female');

DO $$ BEGIN
    CREATE TYPE student_type AS ENUM ('internal', 'external');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender gender_type,
    student_type student_type DEFAULT 'internal',
    address TEXT,
    phone_number TEXT,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_relationship TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Student Subjects Junction Table
CREATE TABLE IF NOT EXISTS public.student_subjects (
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (student_id, subject_id)
);

-- 3. Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_subjects ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Students:
-- Public read access (authenticated) - e.g. for teachers to see students
CREATE POLICY "Students are viewable by authenticated users" ON public.students
    FOR SELECT TO authenticated USING (true);

-- Only Admins can insert/delete students
CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Students can update their own non-critical info (phone, address)
CREATE POLICY "Students can update own details" ON public.students
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Student Subjects:
-- Readable by all authenticated users
CREATE POLICY "Student subjects viewable by authenticated" ON public.student_subjects
    FOR SELECT TO authenticated USING (true);

-- Manageable by admins
CREATE POLICY "Admins can manage student subjects" ON public.student_subjects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_student_id ON public.student_subjects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subjects_subject_id ON public.student_subjects(subject_id);

-- 6. Triggers for Updated At
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
