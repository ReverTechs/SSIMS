-- ============================================================================
-- Migration: Financial Aid & Sponsorship Management System
-- Purpose: Enable tracking of bursaries, scholarships, and third-party sponsorships
-- Date: 2025-12-05
-- ============================================================================
-- 
-- FEATURES:
-- - Sponsor/organization registry (government, NGOs, companies, foundations)
-- - Flexible aid types (full coverage, percentage, fixed amount)
-- - Student aid awards with approval workflow
-- - Sponsor payment tracking and allocation
-- - Automatic aid application to invoices
-- - Integration with existing fee management system
--
-- ============================================================================

-- ============================================================================
-- 1. SPONSORS TABLE
-- Tracks organizations providing financial aid
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('government', 'ngo', 'corporate', 'foundation', 'individual')),
    
    -- Contact information
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    
    -- Payment details
    payment_terms TEXT, -- e.g., "Quarterly payment in arrears"
    billing_email TEXT, -- Where to send invoices
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique sponsor names
    CONSTRAINT unique_sponsor_name UNIQUE(name)
);

COMMENT ON TABLE public.sponsors IS 'Organizations providing financial aid to students';
COMMENT ON COLUMN public.sponsors.sponsor_type IS 'government, ngo, corporate, foundation, individual';
COMMENT ON COLUMN public.sponsors.payment_terms IS 'When and how sponsor pays (e.g., quarterly, annually)';

CREATE INDEX idx_sponsors_type ON public.sponsors(sponsor_type);
CREATE INDEX idx_sponsors_active ON public.sponsors(is_active);

-- ============================================================================
-- 2. FINANCIAL AID TYPES TABLE
-- Defines scholarship/bursary types with coverage rules
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.financial_aid_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
    
    -- Aid type details
    name TEXT NOT NULL, -- e.g., "Government Bursary", "Merit Scholarship"
    description TEXT,
    
    -- Coverage configuration
    coverage_type TEXT NOT NULL CHECK (coverage_type IN ('full', 'percentage', 'fixed_amount', 'specific_items')),
    coverage_percentage DECIMAL(5,2) CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    coverage_amount DECIMAL(10,2) CHECK (coverage_amount >= 0),
    covered_items TEXT[], -- e.g., ['tuition', 'boarding', 'books'] for specific_items type
    
    -- Eligibility
    eligibility_criteria TEXT, -- e.g., "Minimum 70% average", "Family income < MK 500,000"
    requires_application BOOLEAN NOT NULL DEFAULT false,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Audit fields
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation: Ensure coverage values are set correctly based on type
    CONSTRAINT check_coverage_values CHECK (
        (coverage_type = 'full') OR
        (coverage_type = 'percentage' AND coverage_percentage IS NOT NULL) OR
        (coverage_type = 'fixed_amount' AND coverage_amount IS NOT NULL) OR
        (coverage_type = 'specific_items' AND covered_items IS NOT NULL)
    )
);

COMMENT ON TABLE public.financial_aid_types IS 'Types of financial aid/scholarships available';
COMMENT ON COLUMN public.financial_aid_types.coverage_type IS 'full = 100%, percentage = X%, fixed_amount = MK X, specific_items = only certain fee items';
COMMENT ON COLUMN public.financial_aid_types.covered_items IS 'For specific_items type: which fee items are covered';

CREATE INDEX idx_aid_types_sponsor ON public.financial_aid_types(sponsor_id);
CREATE INDEX idx_aid_types_active ON public.financial_aid_types(is_active);

-- ============================================================================
-- 3. STUDENT FINANCIAL AID TABLE
-- Awards financial aid to specific students
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_financial_aid (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    financial_aid_type_id UUID NOT NULL REFERENCES public.financial_aid_types(id) ON DELETE RESTRICT,
    sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE, -- NULL if year-long
    
    -- Coverage details (copied from aid type, can be customized per student)
    coverage_type TEXT NOT NULL CHECK (coverage_type IN ('full', 'percentage', 'fixed_amount', 'specific_items')),
    coverage_percentage DECIMAL(5,2) CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    coverage_amount DECIMAL(10,2) CHECK (coverage_amount >= 0),
    covered_items TEXT[],
    
    -- Calculated aid amount (set when invoice is generated)
    calculated_aid_amount DECIMAL(10,2) DEFAULT 0 CHECK (calculated_aid_amount >= 0),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'active', 'suspended', 'completed', 'rejected')),
    
    -- Approval workflow
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Validity period
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    -- Conditions and notes
    conditions TEXT, -- e.g., "Maintain 70% average or aid will be revoked"
    notes TEXT,
    
    -- Sponsor payment tracking
    sponsor_pays_directly BOOLEAN NOT NULL DEFAULT true, -- If false, it's a discount/waiver
    sponsor_payment_received BOOLEAN NOT NULL DEFAULT false,
    sponsor_payment_date DATE,
    
    -- Audit fields
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT check_valid_dates CHECK (valid_from <= valid_until),
    CONSTRAINT check_coverage_values_student CHECK (
        (coverage_type = 'full') OR
        (coverage_type = 'percentage' AND coverage_percentage IS NOT NULL) OR
        (coverage_type = 'fixed_amount' AND coverage_amount IS NOT NULL) OR
        (coverage_type = 'specific_items' AND covered_items IS NOT NULL)
    )
);

COMMENT ON TABLE public.student_financial_aid IS 'Financial aid awards assigned to students';
COMMENT ON COLUMN public.student_financial_aid.term_id IS 'NULL means aid is valid for entire academic year';
COMMENT ON COLUMN public.student_financial_aid.calculated_aid_amount IS 'Actual aid amount calculated when invoice is generated';
COMMENT ON COLUMN public.student_financial_aid.sponsor_pays_directly IS 'true = sponsor pays school, false = internal discount/waiver';

CREATE INDEX idx_student_aid_student ON public.student_financial_aid(student_id);
CREATE INDEX idx_student_aid_sponsor ON public.student_financial_aid(sponsor_id);
CREATE INDEX idx_student_aid_status ON public.student_financial_aid(status);
CREATE INDEX idx_student_aid_academic_year ON public.student_financial_aid(academic_year_id);
CREATE INDEX idx_student_aid_term ON public.student_financial_aid(term_id);
CREATE INDEX idx_student_aid_validity ON public.student_financial_aid(valid_from, valid_until);

-- ============================================================================
-- 4. SPONSOR PAYMENTS TABLE
-- Records bulk payments from sponsors
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sponsor_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE NOT NULL, -- Auto-generated: SP-2024-000001
    sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE RESTRICT,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL 
        CHECK (payment_method IN ('bank_transfer', 'cheque', 'cash', 'wire_transfer')),
    reference_number TEXT, -- Bank reference, cheque number, etc.
    
    -- Allocation tracking
    allocated_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0),
    unallocated_amount DECIMAL(10,2) GENERATED ALWAYS AS (amount - allocated_amount) STORED,
    
    notes TEXT,
    
    -- Audit fields
    recorded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT check_allocation CHECK (allocated_amount <= amount)
);

COMMENT ON TABLE public.sponsor_payments IS 'Bulk payments received from sponsors';
COMMENT ON COLUMN public.sponsor_payments.allocated_amount IS 'Total amount allocated to students';
COMMENT ON COLUMN public.sponsor_payments.unallocated_amount IS 'Remaining amount not yet allocated';

CREATE INDEX idx_sponsor_payments_sponsor ON public.sponsor_payments(sponsor_id);
CREATE INDEX idx_sponsor_payments_date ON public.sponsor_payments(payment_date);
CREATE INDEX idx_sponsor_payments_number ON public.sponsor_payments(payment_number);

-- ============================================================================
-- 5. SPONSOR PAYMENT ALLOCATIONS TABLE
-- Links sponsor payments to specific student invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sponsor_payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_payment_id UUID NOT NULL REFERENCES public.sponsor_payments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    
    -- Allocation details
    allocated_amount DECIMAL(10,2) NOT NULL CHECK (allocated_amount > 0),
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    notes TEXT,
    
    -- Audit fields
    allocated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.sponsor_payment_allocations IS 'Tracks how sponsor payments are allocated to students';

CREATE INDEX idx_allocations_payment ON public.sponsor_payment_allocations(sponsor_payment_id);
CREATE INDEX idx_allocations_student ON public.sponsor_payment_allocations(student_id);
CREATE INDEX idx_allocations_invoice ON public.sponsor_payment_allocations(invoice_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_sponsors_updated_at 
    BEFORE UPDATE ON public.sponsors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aid_types_updated_at 
    BEFORE UPDATE ON public.financial_aid_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_aid_updated_at 
    BEFORE UPDATE ON public.student_financial_aid 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_payments_updated_at 
    BEFORE UPDATE ON public.sponsor_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-GENERATION TRIGGERS
-- ============================================================================

-- Trigger: Auto-generate sponsor payment number (SP-2024-000001)
CREATE OR REPLACE FUNCTION generate_sponsor_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num TEXT;
    next_num INTEGER;
BEGIN
    -- Get current year
    year_code := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 'SP-\\d{4}-(\\d{6})') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.sponsor_payments 
    WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Format sequence number with leading zeros
    sequence_num := LPAD(next_num::TEXT, 6, '0');
    
    -- Generate payment number
    NEW.payment_number := 'SP-' || year_code || '-' || sequence_num;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_sponsor_payment_number
    BEFORE INSERT ON public.sponsor_payments
    FOR EACH ROW
    WHEN (NEW.payment_number IS NULL OR NEW.payment_number = '')
    EXECUTE FUNCTION generate_sponsor_payment_number();

-- ============================================================================
-- BUSINESS LOGIC TRIGGERS
-- ============================================================================

-- Trigger: Update sponsor payment allocated amount when allocation is created
CREATE OR REPLACE FUNCTION update_sponsor_payment_allocation()
RETURNS TRIGGER AS $$
BEGIN
    -- Update allocated amount on sponsor payment
    UPDATE public.sponsor_payments
    SET allocated_amount = allocated_amount + NEW.allocated_amount,
        updated_at = NOW()
    WHERE id = NEW.sponsor_payment_id;
    
    -- Mark student aid as payment received
    UPDATE public.student_financial_aid
    SET sponsor_payment_received = true,
        sponsor_payment_date = NEW.allocation_date,
        updated_at = NOW()
    WHERE student_id = NEW.student_id
    AND sponsor_id = (SELECT sponsor_id FROM public.sponsor_payments WHERE id = NEW.sponsor_payment_id)
    AND status = 'active';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_allocation
    AFTER INSERT ON public.sponsor_payment_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_sponsor_payment_allocation();

-- Trigger: Auto-activate approved aid when valid_from date is reached
CREATE OR REPLACE FUNCTION auto_activate_aid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND NEW.valid_from <= CURRENT_DATE THEN
        NEW.status := 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_activate_aid
    BEFORE INSERT OR UPDATE ON public.student_financial_aid
    FOR EACH ROW
    EXECUTE FUNCTION auto_activate_aid();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Get active financial aid for a student in a specific term
CREATE OR REPLACE FUNCTION get_active_student_aid(
    p_student_id UUID,
    p_academic_year_id UUID,
    p_term_id UUID
)
RETURNS TABLE (
    aid_id UUID,
    sponsor_name TEXT,
    aid_type_name TEXT,
    coverage_type TEXT,
    coverage_percentage DECIMAL(5,2),
    coverage_amount DECIMAL(10,2),
    covered_items TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sfa.id,
        s.name,
        fat.name,
        sfa.coverage_type,
        sfa.coverage_percentage,
        sfa.coverage_amount,
        sfa.covered_items
    FROM public.student_financial_aid sfa
    JOIN public.sponsors s ON sfa.sponsor_id = s.id
    JOIN public.financial_aid_types fat ON sfa.financial_aid_type_id = fat.id
    WHERE sfa.student_id = p_student_id
    AND sfa.academic_year_id = p_academic_year_id
    AND (sfa.term_id = p_term_id OR sfa.term_id IS NULL) -- Year-long aid applies to all terms
    AND sfa.status = 'active'
    AND CURRENT_DATE BETWEEN sfa.valid_from AND sfa.valid_until
    AND s.is_active = true
    AND fat.is_active = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_student_aid IS 'Returns all active financial aid for a student in a given term';

-- Function: Calculate total aid amount for a student
CREATE OR REPLACE FUNCTION calculate_student_aid_amount(
    p_student_id UUID,
    p_academic_year_id UUID,
    p_term_id UUID,
    p_total_fees DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_total_aid DECIMAL(10,2) := 0;
    v_aid RECORD;
BEGIN
    -- Get all active aid for this student
    FOR v_aid IN 
        SELECT * FROM get_active_student_aid(p_student_id, p_academic_year_id, p_term_id)
    LOOP
        -- Calculate aid amount based on coverage type
        IF v_aid.coverage_type = 'full' THEN
            v_total_aid := p_total_fees; -- Full coverage, no need to check other aids
            EXIT; -- Exit loop early
        ELSIF v_aid.coverage_type = 'percentage' THEN
            v_total_aid := v_total_aid + (p_total_fees * v_aid.coverage_percentage / 100);
        ELSIF v_aid.coverage_type = 'fixed_amount' THEN
            v_total_aid := v_total_aid + v_aid.coverage_amount;
        END IF;
    END LOOP;
    
    -- Ensure aid doesn't exceed total fees
    IF v_total_aid > p_total_fees THEN
        v_total_aid := p_total_fees;
    END IF;
    
    RETURN v_total_aid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_student_aid_amount IS 'Calculates total financial aid amount for a student, capped at total fees';

-- Function: Get sponsor payment summary
CREATE OR REPLACE FUNCTION get_sponsor_payment_summary(p_sponsor_id UUID)
RETURNS TABLE (
    total_paid DECIMAL(10,2),
    total_allocated DECIMAL(10,2),
    total_unallocated DECIMAL(10,2),
    payment_count INTEGER,
    students_helped INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(sp.amount), 0) as total_paid,
        COALESCE(SUM(sp.allocated_amount), 0) as total_allocated,
        COALESCE(SUM(sp.unallocated_amount), 0) as total_unallocated,
        COUNT(sp.id)::INTEGER as payment_count,
        COUNT(DISTINCT spa.student_id)::INTEGER as students_helped
    FROM public.sponsor_payments sp
    LEFT JOIN public.sponsor_payment_allocations spa ON sp.id = spa.sponsor_payment_id
    WHERE sp.sponsor_id = p_sponsor_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sponsor_payment_summary IS 'Returns payment summary for a sponsor';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_aid_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_financial_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsor_payment_allocations ENABLE ROW LEVEL SECURITY;

-- Sponsors: All can view active sponsors, admins can manage
CREATE POLICY "Anyone can view active sponsors" 
    ON public.sponsors FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins can manage sponsors" 
    ON public.sponsors FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher')
        )
    );

-- Financial Aid Types: All can view active types, admins can manage
CREATE POLICY "Anyone can view active aid types" 
    ON public.financial_aid_types FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins can manage aid types" 
    ON public.financial_aid_types FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher')
        )
    );

-- Student Financial Aid: Students see own, guardians see children's, staff see all
CREATE POLICY "Students view own aid" 
    ON public.student_financial_aid FOR SELECT 
    USING (
        student_id = auth.uid()
    );

CREATE POLICY "Guardians view children aid" 
    ON public.student_financial_aid FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians sg
            WHERE sg.student_id = student_financial_aid.student_id
            AND sg.guardian_id = auth.uid()
        )
    );

CREATE POLICY "Staff view all aid" 
    ON public.student_financial_aid FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage aid" 
    ON public.student_financial_aid FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sponsor Payments: Only staff can view and manage
CREATE POLICY "Staff view sponsor payments" 
    ON public.sponsor_payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage sponsor payments" 
    ON public.sponsor_payments FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Sponsor Payment Allocations: Follow sponsor payments policy
CREATE POLICY "Staff view allocations" 
    ON public.sponsor_payment_allocations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage allocations" 
    ON public.sponsor_payment_allocations FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Financial Aid & Sponsorship Schema Migration Complete!';
    RAISE NOTICE 'Tables created: sponsors, financial_aid_types, student_financial_aid, sponsor_payments, sponsor_payment_allocations';
    RAISE NOTICE 'Functions created: get_active_student_aid, calculate_student_aid_amount, get_sponsor_payment_summary';
    RAISE NOTICE 'Triggers created: Auto-numbering, allocation tracking, auto-activation';
    RAISE NOTICE 'RLS policies: Enabled for all tables with proper access control';
    RAISE NOTICE 'Next steps: Add TypeScript types and create server actions';
END $$;
