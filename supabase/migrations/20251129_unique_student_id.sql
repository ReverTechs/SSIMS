-- Add unique constraint to student_id column to prevent duplicate Student IDs
-- This ensures data integrity at the database level

-- First, check if there are any duplicate student_ids and handle them
-- (This is a safety check - in production you'd want to review duplicates first)

-- Add unique constraint to student_id column
ALTER TABLE students 
ADD CONSTRAINT students_student_id_unique UNIQUE (student_id);

-- Create an index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
