-- Migration: Add budget to departments
-- Purpose: Add a budget column to the departments table to track financial allocation.
-- Date: 2025-12-07

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'budget') THEN
        ALTER TABLE public.departments ADD COLUMN budget DECIMAL(12, 2) DEFAULT 0.00;
    END IF;
END $$;

COMMENT ON COLUMN public.departments.budget IS 'Allocated budget for the department';
