-- Query 1: Populate Departments for Malawi Secondary Schools
-- Run this query in Supabase SQL Editor

INSERT INTO public.departments (name, code) VALUES
('Languages', 'LANG'),
('Sciences', 'SCI'),
('Humanities', 'HUM'),
('Mathematics', 'MATH'),
('Vocational/Technical', 'VOC'),
('Commerce/Business', 'COM'),
('Arts', 'ARTS')
ON CONFLICT (name) DO NOTHING;

-- Verify departments were inserted
SELECT id, name, code FROM public.departments ORDER BY name;

