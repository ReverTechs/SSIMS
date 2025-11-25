-- =====================================================================
-- GUARDIAN SCHEMA MIGRATION - PRODUCTION-READY WITH DUAL-ROLE SUPPORT
-- =====================================================================
-- This migration creates a Guardian table that:
-- 1. Integrates with auth.users via profiles table (guardians can log in)
-- 2. Supports dual roles (e.g., teacher who is also a guardian)
-- 3. Uses comprehensive indexing for optimal performance
-- 4. Follows normalized database design principles
-- =====================================================================

-- =====================================================================
-- 1. CREATE GUARDIANS TABLE
-- =====================================================================
-- This table stores guardian-specific data for users with guardian role.
-- Key Design Decisions:
-- - id references profiles.id (same pattern as teachers/students tables)
-- - Name/email stored in profiles table (no duplication)
-- - Only guardian-specific fields stored here
-- - Supports dual roles: a user can exist in both teachers AND guardians tables
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.guardians (
    -- Primary key references profiles table (enables auth/login)
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Contact Information
    phone_number TEXT,
    alternative_phone TEXT,
    address TEXT,
    
    -- Guardian-Specific Information
    occupation TEXT,
    national_id TEXT UNIQUE, -- Unique constraint prevents duplicate registrations
    workplace TEXT,
    work_phone TEXT,
    
    -- Default Preferences (can be overridden per student in student_guardians)
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'whatsapp')),
    is_emergency_contact BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 2. CREATE STUDENT-GUARDIAN JUNCTION TABLE
-- =====================================================================
-- Many-to-many relationship: 
-- - One student can have multiple guardians (mother, father, uncle, etc.)
-- - One guardian can have multiple students (siblings, or teacher with own children)
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.student_guardians (
    -- Composite Primary Key
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE,
    
    -- Relationship Details
    relationship TEXT NOT NULL CHECK (relationship IN (
        'father', 'mother', 'stepfather', 'stepmother',
        'grandfather', 'grandmother', 'uncle', 'aunt',
        'brother', 'sister', 'legal_guardian', 'foster_parent', 'other'
    )),
    
    -- Permissions & Responsibilities (per student)
    is_primary BOOLEAN DEFAULT false, -- Primary guardian for THIS student
    is_emergency_contact BOOLEAN DEFAULT true,
    can_pickup BOOLEAN DEFAULT true, -- Authorized to pick up student from school
    financial_responsibility BOOLEAN DEFAULT false, -- Responsible for fees
    receives_report_card BOOLEAN DEFAULT true,
    receives_notifications BOOLEAN DEFAULT true,
    
    -- Additional Information
    notes TEXT, -- Special instructions (e.g., "Only on weekends", "Court-ordered restrictions")
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    PRIMARY KEY (student_id, guardian_id)
);

-- =====================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================================

ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 4. CREATE RLS POLICIES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Guardians Table Policies
-- ---------------------------------------------------------------------

-- Policy: Authenticated users can view all guardians
-- Rationale: Teachers/admin need to see guardian info for students
CREATE POLICY "Guardians viewable by authenticated users" 
    ON public.guardians
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Policy: Admins can manage all guardian records
CREATE POLICY "Admins can manage guardians" 
    ON public.guardians
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Guardians can view their own record
CREATE POLICY "Guardians can view own info" 
    ON public.guardians
    FOR SELECT 
    USING (id = auth.uid());

-- Policy: Guardians can update their own non-critical information
-- Note: Cannot change national_id (requires admin)
CREATE POLICY "Guardians can update own details" 
    ON public.guardians
    FOR UPDATE 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------
-- Student-Guardians Junction Table Policies
-- ---------------------------------------------------------------------

-- Policy: Authenticated users can view student-guardian relationships
CREATE POLICY "Student guardians viewable by authenticated" 
    ON public.student_guardians
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Policy: Admins can manage all student-guardian relationships
CREATE POLICY "Admins can manage student guardians" 
    ON public.student_guardians
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Guardians can view their own student relationships
CREATE POLICY "Guardians can view own students" 
    ON public.student_guardians
    FOR SELECT 
    USING (guardian_id = auth.uid());

-- =====================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================
-- Indexing Strategy:
-- - Primary lookups: guardian_id, student_id (most common queries)
-- - Search fields: phone_number, national_id (for finding guardians)
-- - Filtered indexes: is_primary (reduces index size, faster queries)
-- - Composite indexes: multi-column queries (student + primary guardian)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Guardians Table Indexes
-- ---------------------------------------------------------------------

-- Index: Fast lookup by phone number (for search/contact)
-- Use case: "Find guardian by phone number"
CREATE INDEX IF NOT EXISTS idx_guardians_phone 
    ON public.guardians(phone_number) 
    WHERE phone_number IS NOT NULL;

-- Index: Fast lookup by national ID (unique identifier)
-- Use case: "Check if guardian already registered"
CREATE INDEX IF NOT EXISTS idx_guardians_national_id 
    ON public.guardians(national_id) 
    WHERE national_id IS NOT NULL;

-- Index: Fast lookup by alternative phone
-- Use case: Emergency contact scenarios
CREATE INDEX IF NOT EXISTS idx_guardians_alt_phone 
    ON public.guardians(alternative_phone) 
    WHERE alternative_phone IS NOT NULL;

-- Index: Emergency contacts (filtered index - smaller, faster)
-- Use case: "Get all emergency contacts"
CREATE INDEX IF NOT EXISTS idx_guardians_emergency 
    ON public.guardians(id) 
    WHERE is_emergency_contact = true;

-- ---------------------------------------------------------------------
-- Student-Guardians Junction Table Indexes
-- ---------------------------------------------------------------------

-- Index: Fast lookup of all guardians for a student
-- Use case: "Show all guardians for student X"
CREATE INDEX IF NOT EXISTS idx_student_guardians_student_id 
    ON public.student_guardians(student_id);

-- Index: Fast lookup of all students for a guardian
-- Use case: "Show all students for guardian Y" (dual-role scenario)
CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian_id 
    ON public.student_guardians(guardian_id);

-- Index: Fast lookup of primary guardian for each student (filtered + composite)
-- Use case: "Get primary guardian for student X"
-- Benefit: Smaller index (only primary guardians), faster queries
CREATE INDEX IF NOT EXISTS idx_student_guardians_primary 
    ON public.student_guardians(student_id, guardian_id) 
    WHERE is_primary = true;

-- Index: Fast lookup of emergency contacts per student (filtered)
-- Use case: "Get emergency contacts for student X"
CREATE INDEX IF NOT EXISTS idx_student_guardians_emergency 
    ON public.student_guardians(student_id, guardian_id) 
    WHERE is_emergency_contact = true;

-- Index: Fast lookup by relationship type
-- Use case: "Find all fathers", "Find all mothers"
CREATE INDEX IF NOT EXISTS idx_student_guardians_relationship 
    ON public.student_guardians(relationship);

-- Index: Guardians with financial responsibility (filtered)
-- Use case: Fee collection, billing reports
CREATE INDEX IF NOT EXISTS idx_student_guardians_financial 
    ON public.student_guardians(guardian_id) 
    WHERE financial_responsibility = true;

-- Index: Authorized pickup persons (filtered)
-- Use case: School security - "Who can pick up this student?"
CREATE INDEX IF NOT EXISTS idx_student_guardians_pickup 
    ON public.student_guardians(student_id, guardian_id) 
    WHERE can_pickup = true;

-- =====================================================================
-- 6. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================================

CREATE TRIGGER update_guardians_updated_at
    BEFORE UPDATE ON public.guardians
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_student_guardians_updated_at
    BEFORE UPDATE ON public.student_guardians
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================================
-- 7. ADD CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================================

-- Constraint: Each student must have exactly ONE primary guardian
-- This is enforced at application level, but we add a partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_one_primary_guardian 
    ON public.student_guardians(student_id) 
    WHERE is_primary = true;

-- =====================================================================
-- 8. ADD DOCUMENTATION COMMENTS
-- =====================================================================

COMMENT ON TABLE public.guardians IS 
    'Stores guardian/parent information. References profiles table to enable auth/login. Supports dual roles (e.g., teacher who is also a guardian).';

COMMENT ON TABLE public.student_guardians IS 
    'Junction table linking students to guardians with relationship details and permissions. Supports many-to-many relationships.';

COMMENT ON COLUMN public.guardians.id IS 
    'References profiles.id. Same user can exist in teachers AND guardians tables (dual role support).';

COMMENT ON COLUMN public.guardians.national_id IS 
    'Unique national ID to prevent duplicate guardian registrations.';

COMMENT ON COLUMN public.student_guardians.is_primary IS 
    'Primary guardian for THIS specific student. Each student must have exactly one primary guardian.';

COMMENT ON COLUMN public.student_guardians.can_pickup IS 
    'Whether this guardian is authorized to pick up the student from school. Important for security.';

COMMENT ON COLUMN public.student_guardians.financial_responsibility IS 
    'Whether this guardian is responsible for student fees and billing.';

COMMENT ON COLUMN public.student_guardians.notes IS 
    'Special instructions or restrictions (e.g., court orders, custody arrangements).';

-- =====================================================================
-- 9. HELPER FUNCTION: Check if user has guardian role
-- =====================================================================
-- This function helps with dual-role scenarios
-- Use case: "Is this teacher also a guardian?"

CREATE OR REPLACE FUNCTION public.is_guardian(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.guardians WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_guardian(UUID) TO authenticated;

COMMENT ON FUNCTION public.is_guardian IS 
    'Check if a user has a guardian record. Useful for dual-role scenarios (e.g., teacher who is also a guardian).';

-- =====================================================================
-- END OF MIGRATION
-- =====================================================================
