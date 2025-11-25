-- ============================================================================
-- Migration: Seed Curriculum Data
-- Purpose: Populate subjects and curriculum configuration
-- ============================================================================

DO $$
DECLARE
    -- Subject IDs
    v_math_id UUID;
    v_english_id UUID;
    v_chichewa_id UUID;
    v_biology_id UUID;
    v_chemistry_id UUID;
    v_physics_id UUID;
    v_geography_id UUID;
    v_history_id UUID;
    v_social_studies_id UUID;
    v_life_skills_id UUID;
    v_add_math_id UUID;
    v_computer_studies_id UUID;
    v_bible_knowledge_id UUID;
    v_literature_id UUID;
    v_business_studies_id UUID;
    v_accounting_id UUID;
    v_commerce_id UUID;
    v_agri_id UUID;
BEGIN
    -- 1. Insert Subjects (Idempotent)
    
    -- Core / Common
    INSERT INTO public.subjects (name, code) VALUES ('Mathematics', 'MAT') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_math_id;
    INSERT INTO public.subjects (name, code) VALUES ('English', 'ENG') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_english_id;
    INSERT INTO public.subjects (name, code) VALUES ('Chichewa', 'CHI') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_chichewa_id;
    INSERT INTO public.subjects (name, code) VALUES ('Biology', 'BIO') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_biology_id;
    INSERT INTO public.subjects (name, code) VALUES ('Life Skills', 'LIF') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_life_skills_id;
    
    -- Sciences
    INSERT INTO public.subjects (name, code) VALUES ('Chemistry', 'CHE') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_chemistry_id;
    INSERT INTO public.subjects (name, code) VALUES ('Physics', 'PHY') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_physics_id;
    INSERT INTO public.subjects (name, code) VALUES ('Additional Mathematics', 'AMT') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_add_math_id;
    INSERT INTO public.subjects (name, code) VALUES ('Computer Studies', 'COM') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_computer_studies_id;
    INSERT INTO public.subjects (name, code) VALUES ('Agriculture', 'AGR') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_agri_id;

    -- Humanities
    INSERT INTO public.subjects (name, code) VALUES ('Geography', 'GEO') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_geography_id;
    INSERT INTO public.subjects (name, code) VALUES ('History', 'HIS') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_history_id;
    INSERT INTO public.subjects (name, code) VALUES ('Social Studies', 'SOS') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_social_studies_id;
    INSERT INTO public.subjects (name, code) VALUES ('Bible Knowledge', 'BK') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_bible_knowledge_id;
    INSERT INTO public.subjects (name, code) VALUES ('Literature', 'LIT') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_literature_id;

    -- Commercial
    INSERT INTO public.subjects (name, code) VALUES ('Business Studies', 'BUS') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_business_studies_id;
    INSERT INTO public.subjects (name, code) VALUES ('Accounting', 'ACC') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_accounting_id;
    INSERT INTO public.subjects (name, code) VALUES ('Commerce', 'CMM') ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_commerce_id;


    -- 2. Configure Curriculum (Junior - Forms 1-2)
    -- Compulsory: Math, English, Chichewa, Bio, Chem, Phy, Geo, History
    
    INSERT INTO public.curriculum_subjects (subject_id, level, is_compulsory, category) VALUES
    (v_math_id, 'junior', true, 'core'),
    (v_english_id, 'junior', true, 'core'),
    (v_chichewa_id, 'junior', true, 'core'),
    (v_biology_id, 'junior', true, 'sciences'),
    (v_chemistry_id, 'junior', true, 'sciences'),
    (v_physics_id, 'junior', true, 'sciences'),
    (v_geography_id, 'junior', true, 'humanities'),
    (v_history_id, 'junior', true, 'humanities'),
    (v_agri_id, 'junior', true, 'technical'),
    (v_life_skills_id, 'junior', true, 'core')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;


    -- 3. Configure Curriculum (Senior - Forms 3-4)
    
    -- Core / Compulsory for ALL Senior
    INSERT INTO public.curriculum_subjects (subject_id, level, is_compulsory, category) VALUES
    (v_english_id, 'senior', true, 'core'),
    (v_math_id, 'senior', true, 'core'),
    (v_chichewa_id, 'senior', true, 'core'),
    (v_biology_id, 'senior', true, 'sciences'),
    (v_life_skills_id, 'senior', true, 'core')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- Stream Specific (Optional/Elective but typical for stream)
    
    -- Sciences Stream
    INSERT INTO public.curriculum_subjects (subject_id, level, stream, is_compulsory, category) VALUES
    (v_physics_id, 'senior', 'sciences', false, 'sciences'),
    (v_chemistry_id, 'senior', 'sciences', false, 'sciences'),
    (v_add_math_id, 'senior', 'sciences', false, 'sciences'),
    (v_computer_studies_id, 'senior', 'sciences', false, 'technical')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- Humanities Stream
    INSERT INTO public.curriculum_subjects (subject_id, level, stream, is_compulsory, category) VALUES
    (v_history_id, 'senior', 'humanities', false, 'humanities'),
    (v_geography_id, 'senior', 'humanities', false, 'humanities'),
    (v_bible_knowledge_id, 'senior', 'humanities', false, 'humanities'),
    (v_literature_id, 'senior', 'humanities', false, 'humanities')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

    -- Commercial Stream
    INSERT INTO public.curriculum_subjects (subject_id, level, stream, is_compulsory, category) VALUES
    (v_business_studies_id, 'senior', 'commercial', false, 'commercial'),
    (v_accounting_id, 'senior', 'commercial', false, 'commercial'),
    (v_commerce_id, 'senior', 'commercial', false, 'commercial')
    ON CONFLICT (subject_id, level, stream) DO NOTHING;

END $$;
