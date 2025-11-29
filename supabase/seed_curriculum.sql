-- ============================================================================
-- Seed: Malawi Secondary Curriculum (Corrected)
-- Purpose: Populate subjects and default curriculum rules
-- ============================================================================

DO $$
DECLARE
    v_dept_sciences UUID;
    v_dept_languages UUID;
    v_dept_humanities UUID;
    v_dept_technical UUID;
BEGIN
    -- 1. Ensure Departments Exist and Get IDs
    
    -- Sciences
    INSERT INTO public.departments (name, code) VALUES ('Sciences', 'SCI')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_sciences;
    
    -- If it existed and didn't return ID (because of DO NOTHING/UPDATE), fetch it
    IF v_dept_sciences IS NULL THEN
        SELECT id INTO v_dept_sciences FROM public.departments WHERE name = 'Sciences';
    END IF;

    -- Languages
    INSERT INTO public.departments (name, code) VALUES ('Languages', 'LANG')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_languages;

    IF v_dept_languages IS NULL THEN
        SELECT id INTO v_dept_languages FROM public.departments WHERE name = 'Languages';
    END IF;

    -- Humanities
    INSERT INTO public.departments (name, code) VALUES ('Humanities', 'HUM')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_dept_humanities;

    IF v_dept_humanities IS NULL THEN
        SELECT id INTO v_dept_humanities FROM public.departments WHERE name = 'Humanities';
    END IF;

    -- 2. Insert Subjects using Department IDs

    -- Mathematics (Sciences)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Mathematics', 'MAT', v_dept_sciences) ON CONFLICT (code) DO NOTHING;
    -- English (Languages)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('English', 'ENG', v_dept_languages) ON CONFLICT (code) DO NOTHING;
    -- Chichewa (Languages)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Chichewa', 'CHI', v_dept_languages) ON CONFLICT (code) DO NOTHING;
    -- Physical Science (Sciences)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Physical Science', 'PSC', v_dept_sciences) ON CONFLICT (code) DO NOTHING;
    -- Biology (Sciences)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Biology', 'BIO', v_dept_sciences) ON CONFLICT (code) DO NOTHING;
    -- Geography (Humanities)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Geography', 'GEO', v_dept_humanities) ON CONFLICT (code) DO NOTHING;
    -- History (Humanities)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('History', 'HIS', v_dept_humanities) ON CONFLICT (code) DO NOTHING;
    -- Agriculture (Sciences)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Agriculture', 'AGR', v_dept_sciences) ON CONFLICT (code) DO NOTHING;
    -- Social Studies (Humanities)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Social Studies', 'SOS', v_dept_humanities) ON CONFLICT (code) DO NOTHING;
    -- Life Skills (Humanities)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Life Skills', 'LFS', v_dept_humanities) ON CONFLICT (code) DO NOTHING;
    -- Bible Knowledge (Humanities)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Bible Knowledge', 'BK', v_dept_humanities) ON CONFLICT (code) DO NOTHING;
    -- Computer Studies (Sciences)
    INSERT INTO public.subjects (name, code, department_id) VALUES ('Computer Studies', 'COM', v_dept_sciences) ON CONFLICT (code) DO NOTHING;

    -- 3. Define Curriculum Rules (Compulsory Subjects)

    -- JUNIOR (Forms 1 & 2) - Core Subjects
    INSERT INTO public.curriculum_subjects (subject_id, level, is_compulsory, category)
    SELECT id, 'junior', true, 'core'
    FROM public.subjects
    WHERE code IN ('MAT', 'ENG', 'CHI', 'PSC', 'BIO', 'GEO', 'AGR', 'SOS', 'LFS')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- SENIOR (Forms 3 & 4) - Core Subjects (All Streams)
    INSERT INTO public.curriculum_subjects (subject_id, level, is_compulsory, category)
    SELECT id, 'senior', true, 'core'
    FROM public.subjects
    WHERE code IN ('MAT', 'ENG', 'CHI', 'BIO')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- SENIOR - Stream Specific Compulsory
    -- Sciences Stream: Physical Science
    INSERT INTO public.curriculum_subjects (subject_id, level, stream, is_compulsory, category)
    SELECT id, 'senior', 'sciences', true, 'sciences'
    FROM public.subjects
    WHERE code IN ('PSC')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- Humanities Stream: Geography, History
    INSERT INTO public.curriculum_subjects (subject_id, level, stream, is_compulsory, category)
    SELECT id, 'senior', 'humanities', true, 'humanities'
    FROM public.subjects
    WHERE code IN ('GEO', 'HIS')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

END $$;
