-- Query 2: Populate Subjects for Malawi Secondary Schools
-- Run this query in Supabase SQL Editor
-- Note: Make sure departments are populated first (run populate_departments.sql)

-- Languages Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'English', 
    'ENG',
    id,
    'English Language and Literature'
FROM public.departments WHERE code = 'LANG'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Chichewa', 
    'CHI',
    id,
    'Chichewa Language'
FROM public.departments WHERE code = 'LANG'
ON CONFLICT (code) DO NOTHING;

-- Sciences Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Biology', 
    'BIO',
    id,
    'Biology'
FROM public.departments WHERE code = 'SCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Chemistry', 
    'CHEM',
    id,
    'Chemistry'
FROM public.departments WHERE code = 'SCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Physical Science', 
    'PHY',
    id,
    'Physical Science'
FROM public.departments WHERE code = 'SCI'
ON CONFLICT (code) DO NOTHING;

-- Humanities Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'History', 
    'HIST',
    id,
    'History'
FROM public.departments WHERE code = 'HUM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Geography', 
    'GEO',
    id,
    'Geography'
FROM public.departments WHERE code = 'HUM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Social and Developmental Studies', 
    'SDS',
    id,
    'Social and Developmental Studies'
FROM public.departments WHERE code = 'HUM'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Life Skills', 
    'LS',
    id,
    'Life Skills'
FROM public.departments WHERE code = 'HUM'
ON CONFLICT (code) DO NOTHING;

-- Mathematics Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Mathematics', 
    'MATH',
    id,
    'Mathematics'
FROM public.departments WHERE code = 'MATH'
ON CONFLICT (code) DO NOTHING;

-- Vocational/Technical Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Agriculture', 
    'AGR',
    id,
    'Agriculture'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Home Economics', 
    'HE',
    id,
    'Home Economics'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Woodwork', 
    'WW',
    id,
    'Woodwork'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Metalwork', 
    'MW',
    id,
    'Metalwork'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Technical Drawing', 
    'TD',
    id,
    'Technical Drawing'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Computer Studies', 
    'CS',
    id,
    'Computer Studies'
FROM public.departments WHERE code = 'VOC'
ON CONFLICT (code) DO NOTHING;

-- Commerce/Business Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Business Studies', 
    'BS',
    id,
    'Business Studies'
FROM public.departments WHERE code = 'COM'
ON CONFLICT (code) DO NOTHING;

-- Arts Department Subjects
INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Creative Arts', 
    'CA',
    id,
    'Creative Arts'
FROM public.departments WHERE code = 'ARTS'
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.subjects (name, code, department_id, description)
SELECT 
    'Performing Arts', 
    'PA',
    id,
    'Performing Arts'
FROM public.departments WHERE code = 'ARTS'
ON CONFLICT (code) DO NOTHING;

-- Verify subjects were inserted
SELECT s.id, s.name, s.code, d.name as department_name
FROM public.subjects s
LEFT JOIN public.departments d ON s.department_id = d.id
ORDER BY d.name, s.name;

