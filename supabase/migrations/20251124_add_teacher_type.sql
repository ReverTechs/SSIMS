-- Create teacher_type enum
CREATE TYPE teacher_type AS ENUM ('permanent', 'temporary', 'tp');

-- Add teacher_type column to teachers table
ALTER TABLE public.teachers 
ADD COLUMN teacher_type teacher_type NOT NULL DEFAULT 'permanent';

-- Create index for performance
CREATE INDEX idx_teachers_teacher_type ON public.teachers(teacher_type);
