-- Populate classes table with initial data
-- Forms 1-4, Streams A-C
-- Defaulting academic_year to '2025'

DO $$
DECLARE
    v_year TEXT := '2025';
BEGIN
    -- Form 1
    INSERT INTO public.classes (name, grade_level, academic_year) VALUES
    ('Form 1A', 1, v_year),
    ('Form 1B', 1, v_year),
    ('Form 1C', 1, v_year)
    ON CONFLICT (name, academic_year) DO NOTHING;

    -- Form 2
    INSERT INTO public.classes (name, grade_level, academic_year) VALUES
    ('Form 2A', 2, v_year),
    ('Form 2B', 2, v_year),
    ('Form 2C', 2, v_year)
    ON CONFLICT (name, academic_year) DO NOTHING;

    -- Form 3
    INSERT INTO public.classes (name, grade_level, academic_year) VALUES
    ('Form 3A', 3, v_year),
    ('Form 3B', 3, v_year),
    ('Form 3C', 3, v_year)
    ON CONFLICT (name, academic_year) DO NOTHING;

    -- Form 4
    INSERT INTO public.classes (name, grade_level, academic_year) VALUES
    ('Form 4A', 4, v_year),
    ('Form 4B', 4, v_year),
    ('Form 4C', 4, v_year)
    ON CONFLICT (name, academic_year) DO NOTHING;

END $$;
