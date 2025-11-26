-- =====================================================================
-- ADD GUARDIAN EMAIL REFERENCE TO STUDENTS TABLE
-- =====================================================================
-- This migration adds a guardian_email column to the students table
-- to store email references to guardians. This allows looking up
-- guardian details from the guardians table when displaying student profiles.
-- =====================================================================

-- Add guardian_email column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS guardian_email TEXT;

-- Create index for faster guardian lookups by email
CREATE INDEX IF NOT EXISTS idx_students_guardian_email 
    ON public.students(guardian_email) 
    WHERE guardian_email IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.students.guardian_email IS 
    'Email reference to guardian. Used to look up guardian details from guardians table via profiles.email.';
