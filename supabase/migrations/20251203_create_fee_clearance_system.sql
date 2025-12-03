-- ============================================================================
-- Migration: Fee Clearance System
-- Purpose: Implement comprehensive fee clearance with multiple types and workflows
-- Date: 2024-12-03
-- ============================================================================

-- ============================================================================
-- 1. CLEARANCE TYPES TABLE
-- ============================================================================
-- Defines different types of clearances (exam, report card, graduation, transfer)

CREATE TABLE IF NOT EXISTS public.clearance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Type identification
    name TEXT NOT NULL UNIQUE, -- 'exam', 'report_card', 'graduation', 'transfer'
    display_name TEXT NOT NULL, -- 'Exam Clearance', 'Report Card Clearance'
    description TEXT,
    
    -- Clearance requirements
    minimum_payment_percentage DECIMAL(5,2) NOT NULL DEFAULT 100.00 
        CHECK (minimum_payment_percentage >= 0 AND minimum_payment_percentage <= 100),
    requires_full_payment BOOLEAN NOT NULL DEFAULT false,
    allows_override BOOLEAN NOT NULL DEFAULT true,
    
    -- Validity
    validity_period_days INTEGER, -- NULL = no expiry
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Display
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.clearance_types IS 
    'Defines clearance types with their requirements and rules';

-- ============================================================================
-- 2. CLEARANCE REQUESTS TABLE
-- ============================================================================
-- Tracks all clearance requests and their status

CREATE TABLE IF NOT EXISTS public.clearance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Student & Academic Info
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID REFERENCES public.terms(id) ON DELETE CASCADE, -- NULL for year-long clearances
    
    -- Clearance Details
    clearance_type_id UUID NOT NULL REFERENCES public.clearance_types(id) ON DELETE RESTRICT,
    
    -- Financial Status at Request Time (snapshot)
    total_fees_amount DECIMAL(10,2) NOT NULL CHECK (total_fees_amount >= 0),
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
    outstanding_balance DECIMAL(10,2) NOT NULL CHECK (outstanding_balance >= 0),
    payment_percentage DECIMAL(5,2) NOT NULL CHECK (payment_percentage >= 0 AND payment_percentage <= 100),
    
    -- Status & Approval
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'auto_approved', 'manually_approved', 'rejected', 'expired', 'revoked')),
    
    -- Approval Details
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    override_reason TEXT, -- If approved despite not meeting criteria
    
    -- Validity
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE, -- NULL = no expiry
    
    -- Certificate
    certificate_number TEXT UNIQUE, -- Auto-generated: CLR-2024-T1-000001
    certificate_generated_at TIMESTAMPTZ,
    
    -- Audit
    requested_by UUID REFERENCES public.profiles(id), -- Who requested (student/guardian/admin)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one active clearance per student per type per term
    CONSTRAINT unique_active_clearance_per_student_type_term 
        UNIQUE(student_id, clearance_type_id, academic_year_id, term_id)
);

COMMENT ON TABLE public.clearance_requests IS 
    'Tracks all fee clearance requests with approval workflow';

CREATE INDEX idx_clearance_requests_student ON public.clearance_requests(student_id);
CREATE INDEX idx_clearance_requests_status ON public.clearance_requests(status);
CREATE INDEX idx_clearance_requests_type ON public.clearance_requests(clearance_type_id);
CREATE INDEX idx_clearance_requests_term ON public.clearance_requests(term_id);
CREATE INDEX idx_clearance_requests_academic_year ON public.clearance_requests(academic_year_id);
CREATE INDEX idx_clearance_requests_certificate ON public.clearance_requests(certificate_number);

-- ============================================================================
-- 3. CLEARANCE HISTORY TABLE
-- ============================================================================
-- Audit trail for all clearance actions

CREATE TABLE IF NOT EXISTS public.clearance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clearance_request_id UUID NOT NULL REFERENCES public.clearance_requests(id) ON DELETE CASCADE,
    
    -- Action details
    action TEXT NOT NULL CHECK (action IN ('requested', 'approved', 'rejected', 'revoked', 'expired', 'auto_approved')),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    
    -- Actor
    performed_by UUID REFERENCES public.profiles(id),
    reason TEXT,
    notes TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.clearance_history IS 
    'Complete audit trail of all clearance actions';

CREATE INDEX idx_clearance_history_request ON public.clearance_history(clearance_request_id);
CREATE INDEX idx_clearance_history_action ON public.clearance_history(action);

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE TRIGGER update_clearance_types_updated_at
    BEFORE UPDATE ON public.clearance_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearance_requests_updated_at
    BEFORE UPDATE ON public.clearance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-generate certificate number (CLR-2024-T1-000001)
CREATE OR REPLACE FUNCTION generate_clearance_certificate_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    term_code TEXT;
    sequence_num TEXT;
    next_num INTEGER;
BEGIN
    -- Only generate if status is approved and certificate_number is null
    IF (NEW.status IN ('auto_approved', 'manually_approved') AND NEW.certificate_number IS NULL) THEN
        -- Get year from academic year
        SELECT EXTRACT(YEAR FROM start_date)::TEXT INTO year_code
        FROM public.academic_years WHERE id = NEW.academic_year_id;
        
        -- Get term code (T1, T2, T3) or 'YEAR' if no term
        IF NEW.term_id IS NOT NULL THEN
            SELECT REPLACE(name, 'Term ', 'T') INTO term_code
            FROM public.terms WHERE id = NEW.term_id;
        ELSE
            term_code := 'YEAR';
        END IF;
        
        -- Get next sequence number for this academic year and term
        SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 'CLR-\\d{4}-[A-Z0-9]+-(\d{6})') AS INTEGER)), 0) + 1
        INTO next_num
        FROM public.clearance_requests
        WHERE academic_year_id = NEW.academic_year_id
        AND (term_id = NEW.term_id OR (term_id IS NULL AND NEW.term_id IS NULL));
        
        -- Format sequence number with leading zeros
        sequence_num := LPAD(next_num::TEXT, 6, '0');
        
        -- Generate certificate number
        NEW.certificate_number := 'CLR-' || year_code || '-' || term_code || '-' || sequence_num;
        NEW.certificate_generated_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_clearance_certificate
    BEFORE INSERT OR UPDATE ON public.clearance_requests
    FOR EACH ROW
    EXECUTE FUNCTION generate_clearance_certificate_number();

-- Trigger: Log clearance actions to history
CREATE OR REPLACE FUNCTION log_clearance_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log on INSERT (new request)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.clearance_history (
            clearance_request_id,
            action,
            previous_status,
            new_status,
            performed_by,
            notes
        ) VALUES (
            NEW.id,
            'requested',
            NULL,
            NEW.status,
            NEW.requested_by,
            'Clearance request created'
        );
    END IF;
    
    -- Log on UPDATE (status change)
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO public.clearance_history (
            clearance_request_id,
            action,
            previous_status,
            new_status,
            performed_by,
            reason,
            notes
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.status = 'auto_approved' THEN 'auto_approved'
                WHEN NEW.status = 'manually_approved' THEN 'approved'
                WHEN NEW.status = 'rejected' THEN 'rejected'
                WHEN NEW.status = 'revoked' THEN 'revoked'
                WHEN NEW.status = 'expired' THEN 'expired'
                ELSE 'updated'
            END,
            OLD.status,
            NEW.status,
            NEW.approved_by,
            COALESCE(NEW.rejection_reason, NEW.override_reason),
            'Status changed from ' || OLD.status || ' to ' || NEW.status
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_clearance_action
    AFTER INSERT OR UPDATE ON public.clearance_requests
    FOR EACH ROW
    EXECUTE FUNCTION log_clearance_action();

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if student is eligible for clearance type
CREATE OR REPLACE FUNCTION check_clearance_eligibility(
    p_student_id UUID,
    p_clearance_type_id UUID,
    p_academic_year_id UUID,
    p_term_id UUID DEFAULT NULL
)
RETURNS TABLE (
    eligible BOOLEAN,
    payment_percentage DECIMAL(5,2),
    required_percentage DECIMAL(5,2),
    total_fees DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    outstanding_balance DECIMAL(10,2),
    reason TEXT
) AS $$
DECLARE
    v_clearance_type RECORD;
    v_fee_summary RECORD;
BEGIN
    -- Get clearance type requirements
    SELECT * INTO v_clearance_type
    FROM public.clearance_types
    WHERE id = p_clearance_type_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false, 
            0::DECIMAL(5,2), 
            0::DECIMAL(5,2), 
            0::DECIMAL(10,2), 
            0::DECIMAL(10,2), 
            0::DECIMAL(10,2), 
            'Clearance type not found or inactive';
        RETURN;
    END IF;
    
    -- Get student fee summary for the academic year/term
    SELECT 
        COALESCE(SUM(sf.total_amount), 0) as total,
        COALESCE(SUM(sf.amount_paid), 0) as paid,
        COALESCE(SUM(sf.balance), 0) as balance
    INTO v_fee_summary
    FROM public.student_fees sf
    WHERE sf.student_id = p_student_id
    AND sf.academic_year_id = p_academic_year_id
    AND (p_term_id IS NULL OR sf.term_id = p_term_id);
    
    -- Calculate payment percentage
    DECLARE
        v_payment_pct DECIMAL(5,2);
        v_eligible BOOLEAN;
        v_reason TEXT;
    BEGIN
        IF v_fee_summary.total = 0 THEN
            v_payment_pct := 100.00;
            v_eligible := true;
            v_reason := 'No fees assigned';
        ELSE
            v_payment_pct := (v_fee_summary.paid / v_fee_summary.total) * 100;
            v_eligible := v_payment_pct >= v_clearance_type.minimum_payment_percentage;
            
            IF v_eligible THEN
                v_reason := 'Meets payment requirement';
            ELSE
                v_reason := 'Payment percentage (' || ROUND(v_payment_pct, 2) || '%) below required ' || v_clearance_type.minimum_payment_percentage || '%';
            END IF;
        END IF;
        
        RETURN QUERY SELECT 
            v_eligible,
            v_payment_pct,
            v_clearance_type.minimum_payment_percentage,
            v_fee_summary.total,
            v_fee_summary.paid,
            v_fee_summary.balance,
            v_reason;
    END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_clearance_eligibility IS 
    'Check if a student is eligible for a specific clearance type';

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.clearance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clearance_history ENABLE ROW LEVEL SECURITY;

-- Clearance Types: All authenticated users can view
CREATE POLICY "Authenticated users can view clearance types"
    ON public.clearance_types FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage clearance types"
    ON public.clearance_types FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clearance Requests: Students/Guardians see own, Staff see all
CREATE POLICY "Students view own clearance requests"
    ON public.clearance_requests FOR SELECT
    USING (student_id = auth.uid());

CREATE POLICY "Guardians view children clearance requests"
    ON public.clearance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = clearance_requests.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

CREATE POLICY "Staff view all clearance requests"
    ON public.clearance_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'teacher', 'headteacher', 'deputy_headteacher')
        )
    );

CREATE POLICY "Students can request own clearances"
    ON public.clearance_requests FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Guardians can request children clearances"
    ON public.clearance_requests FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.student_guardians
            WHERE student_guardians.student_id = clearance_requests.student_id
            AND student_guardians.guardian_id = auth.uid()
        )
    );

CREATE POLICY "Admins and teachers can manage clearances"
    ON public.clearance_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'teacher')
        )
    );

-- Clearance History: Follow parent clearance request
CREATE POLICY "Users view history for accessible clearances"
    ON public.clearance_history FOR SELECT
    USING (
        clearance_request_id IN (
            SELECT id FROM public.clearance_requests
        )
    );

-- ============================================================================
-- 7. SEED DATA: Default Clearance Types
-- ============================================================================

INSERT INTO public.clearance_types (
    name,
    display_name,
    description,
    minimum_payment_percentage,
    requires_full_payment,
    allows_override,
    validity_period_days,
    display_order
) VALUES
(
    'exam',
    'Exam Clearance',
    'Required to sit for end-of-term examinations',
    75.00,
    false,
    true,
    120, -- Valid for ~1 term
    1
),
(
    'report_card',
    'Report Card Clearance',
    'Required to collect term report cards',
    80.00,
    false,
    true,
    90,
    2
),
(
    'graduation',
    'Graduation Clearance',
    'Required for final year students to graduate',
    100.00,
    true,
    false, -- No override for graduation
    NULL, -- Permanent
    3
),
(
    'transfer',
    'Transfer Clearance',
    'Required for students transferring to another school',
    100.00,
    true,
    true,
    30, -- Valid for 30 days
    4
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION check_clearance_eligibility(UUID, UUID, UUID, UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Fee Clearance System Migration Complete!';
    RAISE NOTICE 'Tables created: clearance_types, clearance_requests, clearance_history';
    RAISE NOTICE 'Default clearance types: exam (75%%), report_card (80%%), graduation (100%%), transfer (100%%)';
    RAISE NOTICE 'RLS policies: Enabled for all tables';
    RAISE NOTICE 'Helper function: check_clearance_eligibility()';
END $$;
