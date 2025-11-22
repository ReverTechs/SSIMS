-- Query 5: Direct query to get teacher profile data
-- Use this query as a template or run it directly with a teacher ID
-- Replace 'teacher-uuid-here' with the actual teacher UUID

SELECT 
    t.id,
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
    p.email,
    t.phone_number AS phone,
    d.name AS department,
    t.gender,
    t.date_of_birth AS "dateOfBirth",
    t.years_of_experience AS "yearsOfExperience",
    t.qualification,
    t.specialization,
    t.address,
    -- Aggregate subjects as array
    COALESCE(
        ARRAY_AGG(DISTINCT s.name) 
        FILTER (WHERE s.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) AS subjects,
    -- Aggregate class names as array
    COALESCE(
        ARRAY_AGG(DISTINCT c.name) 
        FILTER (WHERE c.name IS NOT NULL),
        ARRAY[]::TEXT[]
    ) AS classes,
    -- Count total students (set to 0 for now - update when students table exists)
    -- To enable student counting, replace 0 with:
    -- (SELECT COUNT(*) 
    --  FROM public.students st 
    --  WHERE st.class_id IN (
    --      SELECT class_id 
    --      FROM public.teacher_classes tc 
    --      WHERE tc.teacher_id = t.id
    --  ))
    0 AS "totalStudents"
FROM public.teachers t
INNER JOIN public.profiles p ON t.id = p.id
LEFT JOIN public.departments d ON t.department_id = d.id
LEFT JOIN public.teacher_subjects ts ON t.id = ts.teacher_id
LEFT JOIN public.subjects s ON ts.subject_id = s.id
LEFT JOIN public.teacher_classes tc ON t.id = tc.teacher_id
LEFT JOIN public.classes c ON tc.class_id = c.id
WHERE t.id = 'teacher-uuid-here'  -- Replace with actual teacher UUID
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

