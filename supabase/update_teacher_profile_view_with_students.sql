-- Query to update teacher_profile_view when students table is created
-- Run this AFTER you have created the students table with a class_id column
-- This will enable student counting in the view

-- First, drop the existing view
DROP VIEW IF EXISTS teacher_profile_view;

-- Recreate the view with student counting enabled
CREATE OR REPLACE VIEW teacher_profile_view AS
SELECT 
    t.id,
    t.employee_id,
    p.email,
    CONCAT(
        CASE 
            WHEN t.title = 'Mr' THEN 'Mr. '
            WHEN t.title = 'Mrs' THEN 'Mrs. '
            WHEN t.title = 'Ms' THEN 'Ms. '
            WHEN t.title = 'Dr' THEN 'Dr. '
            WHEN t.title = 'Prof' THEN 'Prof. '
            WHEN t.title = 'Rev' THEN 'Rev. '
            ELSE ''
        END,
        p.first_name,
        CASE WHEN p.middle_name IS NOT NULL AND p.middle_name != '' THEN ' ' || p.middle_name ELSE '' END,
        ' ' || p.last_name
    ) AS name,
    t.phone_number AS phone,
    d.name AS department,
    t.gender,
    t.date_of_birth AS dateOfBirth,
    t.years_of_experience AS yearsOfExperience,
    t.qualification,
    t.specialization,
    t.address,
    -- Aggregate subjects as JSON array
    COALESCE(
        json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) 
        FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) AS subjects_json,
    -- Aggregate class names as JSON array
    COALESCE(
        json_agg(DISTINCT c.name) 
        FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) AS classes_json,
    -- Count total students from students table
    COALESCE(
        (SELECT COUNT(*) 
         FROM public.students st 
         WHERE st.class_id IN (
             SELECT class_id 
             FROM public.teacher_classes tc 
             WHERE tc.teacher_id = t.id
         )),
        0
    ) AS totalStudents
FROM public.teachers t
INNER JOIN public.profiles p ON t.id = p.id
LEFT JOIN public.departments d ON t.department_id = d.id
LEFT JOIN public.teacher_subjects ts ON t.id = ts.teacher_id
LEFT JOIN public.subjects s ON ts.subject_id = s.id
LEFT JOIN public.teacher_classes tc ON t.id = tc.teacher_id
LEFT JOIN public.classes c ON tc.class_id = c.id
GROUP BY 
    t.id,
    t.employee_id,
    p.email,
    p.first_name,
    p.middle_name,
    p.last_name,
    t.title,
    t.phone_number,
    d.name,
    t.gender,
    t.date_of_birth,
    t.years_of_experience,
    t.qualification,
    t.specialization,
    t.address;

-- Grant access to authenticated users
GRANT SELECT ON teacher_profile_view TO authenticated;



