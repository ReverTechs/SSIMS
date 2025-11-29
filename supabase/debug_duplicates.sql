-- Diagnostic queries to find duplicate subjects

-- 1. Check for duplicate subject enrollments for a specific student
-- COMMENTED OUT: Replace 'STUDENT_UUID' with actual student ID before running
/*
SELECT 
    ss.id,
    ss.student_id,
    ss.academic_year_id,
    ss.term_id,
    s.name as subject_name,
    s.code as subject_code,
    ay.name as academic_year,
    t.name as term_name,
    ss.enrolled_at
FROM student_subjects ss
JOIN subjects s ON ss.subject_id = s.id
LEFT JOIN academic_years ay ON ss.academic_year_id = ay.id
LEFT JOIN terms t ON ss.term_id = t.id
WHERE ss.student_id = 'STUDENT_UUID'
ORDER BY s.name, ss.enrolled_at;
*/

-- 2. Find subjects enrolled multiple times in the same academic year
SELECT 
    student_id,
    subject_id,
    academic_year_id,
    COUNT(*) as enrollment_count,
    STRING_AGG(DISTINCT term_id::text, ', ') as terms
FROM student_subjects
GROUP BY student_id, subject_id, academic_year_id
HAVING COUNT(*) > 1;

-- 3. Check curriculum_subjects for duplicate rules
SELECT 
    subject_id,
    s.name,
    s.code,
    level,
    stream,
    is_compulsory,
    COUNT(*) as rule_count
FROM curriculum_subjects cs
JOIN subjects s ON cs.subject_id = s.id
GROUP BY subject_id, s.name, s.code, level, stream, is_compulsory
HAVING COUNT(*) > 1;

-- 4. List all subjects in curriculum
SELECT 
    s.name,
    s.code,
    cs.level,
    cs.stream,
    cs.is_compulsory,
    cs.category
FROM curriculum_subjects cs
JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.level, cs.stream, s.name;

-- 5. Find Physical Science subject
SELECT * FROM subjects WHERE name ILIKE '%physical%';

-- 6. Check for both Physics and Chemistry
SELECT * FROM subjects WHERE name IN ('Physics', 'Chemistry', 'Physical Science');
