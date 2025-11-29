-- Add student_id field to students table for school identification
-- This field will be similar to employee_id for teachers

ALTER TABLE public.students
ADD COLUMN student_id TEXT UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON public.students(student_id);

-- Optional: Generate student IDs for existing students
-- Format: STU-YYYY-NNNN (e.g., STU-2024-0001)
-- This can be customized based on school's ID format preference

DO $$
DECLARE
    student_record RECORD;
    counter INTEGER := 1;
    current_year TEXT := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
BEGIN
    FOR student_record IN 
        SELECT id FROM public.students WHERE student_id IS NULL ORDER BY created_at
    LOOP
        UPDATE public.students
        SET student_id = 'STU-' || current_year || '-' || LPAD(counter::TEXT, 4, '0')
        WHERE id = student_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;
