-- =====================================================================
-- ADMIN SCHEMA MIGRATION
-- =====================================================================
-- This migration creates an Admins table that:
-- 1. Integrates with auth.users via profiles table
-- 2. Supports dual roles (e.g., Admin who is also a Guardian/Teacher)
-- 3. Includes necessary security policies and indexes
-- =====================================================================

-- =====================================================================
-- 1. CREATE ADMINS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.admins (
    -- Primary key references profiles table (enables auth/login)
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Admin-Specific Information
    phone_number TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 3. CREATE RLS POLICIES
-- =====================================================================

-- Policy: Authenticated users can view admins (e.g., for contact info)
CREATE POLICY "Admins viewable by authenticated users" 
    ON public.admins
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Policy: Admins can manage all admin records
-- Note: We check the profiles table for the 'admin' role
CREATE POLICY "Admins can manage admins" 
    ON public.admins
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update their own details (redundant if covered by above, but good for specificity)
CREATE POLICY "Admins can update own details" 
    ON public.admins
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- =====================================================================
-- 4. CREATE INDEXES
-- =====================================================================

-- Index: Fast lookup by phone number
CREATE INDEX IF NOT EXISTS idx_admins_phone 
    ON public.admins(phone_number) 
    WHERE phone_number IS NOT NULL;

-- =====================================================================
-- 5. CREATE TRIGGERS
-- =====================================================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================================
-- 6. HELPER FUNCTION
-- =====================================================================

-- Function to check if a user is an admin (based on admins table existence)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

COMMENT ON TABLE public.admins IS 
    'Stores administrator information. References profiles table. Supports dual roles.';
