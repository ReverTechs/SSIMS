-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Cleanup / Reset (Handle "relation already exists" and replace old schema)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop tables with CASCADE to handle foreign keys
DROP TABLE IF EXISTS public.teacher_classes CASCADE;
DROP TABLE IF EXISTS public.teacher_subjects CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE; -- Drop old table from 001 migration

-- Drop Enums
DROP TYPE IF EXISTS class_teacher_role CASCADE;
DROP TYPE IF EXISTS teacher_status CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS teacher_title CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;


-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'guardian', 'headteacher', 'deputy_headteacher');
CREATE TYPE teacher_title AS ENUM ('Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Rev');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE teacher_status AS ENUM ('active', 'inactive', 'suspended', 'on_leave');
CREATE TYPE class_teacher_role AS ENUM ('form_teacher', 'subject_teacher');

-- 2. Create Tables

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments Table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    head_of_department_id UUID, -- FK added later to avoid circular dependency
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Classes Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., '5A'
    grade_level INTEGER NOT NULL,
    academic_year TEXT NOT NULL,
    capacity INTEGER DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, academic_year)
);

-- Teachers Table
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    title teacher_title NOT NULL,
    gender gender_type NOT NULL,
    date_of_birth DATE,
    phone_number TEXT,
    address TEXT,
    qualification TEXT,
    specialization TEXT,
    years_of_experience INTEGER DEFAULT 0,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    status teacher_status NOT NULL DEFAULT 'active',
    joined_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add circular FK for Department Head
ALTER TABLE public.departments
ADD CONSTRAINT fk_head_of_department
FOREIGN KEY (head_of_department_id) REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Junction Table: Teacher Subjects
CREATE TABLE public.teacher_subjects (
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (teacher_id, subject_id)
);

-- Junction Table: Teacher Classes
CREATE TABLE public.teacher_classes (
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    role class_teacher_role NOT NULL DEFAULT 'subject_teacher',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (teacher_id, class_id, role)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Profiles:
-- Everyone can read basic profile info (for directory purposes)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Teachers:
-- Public read access (authenticated)
CREATE POLICY "Teachers are viewable by authenticated users" ON public.teachers
    FOR SELECT TO authenticated USING (true);

-- Only Admins can insert/update/delete teachers
-- (Assuming we have a function or claim for is_admin, for now using a placeholder check)
-- Ideally: auth.jwt() ->> 'role' = 'admin' or check profiles table
CREATE POLICY "Admins can manage teachers" ON public.teachers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Teachers can update their own non-critical info (phone, address)
CREATE POLICY "Teachers can update own details" ON public.teachers
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Departments, Subjects, Classes:
-- Readable by all authenticated users
CREATE POLICY "Reference tables viewable by authenticated" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables viewable by authenticated" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reference tables viewable by authenticated" ON public.classes FOR SELECT TO authenticated USING (true);

-- Manageable only by admins
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage subjects" ON public.subjects FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Junction Tables:
-- Readable by all
CREATE POLICY "Junctions viewable by authenticated" ON public.teacher_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Junctions viewable by authenticated" ON public.teacher_classes FOR SELECT TO authenticated USING (true);

-- Manageable by admins
CREATE POLICY "Admins can manage teacher subjects" ON public.teacher_subjects FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage teacher classes" ON public.teacher_classes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));


-- 5. Create Indexes for Performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);

CREATE INDEX idx_teachers_department_id ON public.teachers(department_id);
CREATE INDEX idx_teachers_status ON public.teachers(status);
CREATE INDEX idx_teachers_employee_id ON public.teachers(employee_id);

CREATE INDEX idx_subjects_department_id ON public.subjects(department_id);
CREATE INDEX idx_subjects_code ON public.subjects(code);

CREATE INDEX idx_classes_grade_level ON public.classes(grade_level);
CREATE INDEX idx_classes_academic_year ON public.classes(academic_year);

CREATE INDEX idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);

CREATE INDEX idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX idx_teacher_classes_class_id ON public.teacher_classes(class_id);

-- 6. Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Trigger to automatically create profile on auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
