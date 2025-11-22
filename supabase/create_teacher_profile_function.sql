-- Query 4: Create a function to get teacher profile by ID
-- This function returns teacher data in a format compatible with the component
-- Run this query in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_teacher_profile(teacher_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    department TEXT,
    gender gender_type,
    dateOfBirth DATE,
    yearsOfExperience INTEGER,
    qualification TEXT,
    specialization TEXT,
    address TEXT,
    subjects TEXT[],
    classes TEXT[],
    totalStudents BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
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
        t.date_of_birth AS dateOfBirth,
        t.years_of_experience AS yearsOfExperience,
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
        -- Count total students (set to 0 for now)
        -- Note: This will be updated when the students table is created
        -- To enable student counting, uncomment and update the query below:
        -- COALESCE(
        --     (SELECT COUNT(*) 
        --      FROM public.students st 
        --      WHERE st.class_id IN (
        --          SELECT class_id 
        --          FROM public.teacher_classes tc 
        --          WHERE tc.teacher_id = t.id
        --      )),
        --     0
        -- )::BIGINT
        0::BIGINT AS totalStudents
    FROM public.teachers t
    INNER JOIN public.profiles p ON t.id = p.id
    LEFT JOIN public.departments d ON t.department_id = d.id
    LEFT JOIN public.teacher_subjects ts ON t.id = ts.teacher_id
    LEFT JOIN public.subjects s ON ts.subject_id = s.id
    LEFT JOIN public.teacher_classes tc ON t.id = tc.teacher_id
    LEFT JOIN public.classes c ON tc.class_id = c.id
    WHERE t.id = teacher_id
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
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_teacher_profile(UUID) TO authenticated;

-- Test the function (replace with actual teacher ID)
-- SELECT * FROM get_teacher_profile('your-teacher-uuid-here');

