-- ============================================================================
-- Migration: Fee Management System
-- Purpose: Complete fee management for Malawian school system
-- Date: 2024-12-02
-- ============================================================================
-- 
-- MALAWIAN SCHOOL FEE STRUCTURE:
-- - Fees are UNIFORM across all classes (Form 1-4 pay the same)
-- - Only student TYPE matters: Internal (boarder) vs External (day scholar)
-- - Example: Internal students pay MK 188,000/term, External pay MK 80,000/term
--
-- ============================================================================

-- ============================================================================
-- 1. FEE STRUCTURES TABLE
-- Stores fee templates (only 2 per term: internal & external)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "Internal Students - Term 1 2024"
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    student_type TEXT NOT NULL CHECK (student_type IN ('internal', 'external')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    due_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure only one fee structure per term per student type
    CONSTRAINT unique_fee_structure_per_term_type 
        UNIQUE(academic_year_id, term_id, student_type)
);

COMMENT ON TABLE public.fee_structures IS 'Fee structure templates - only 2 per term (internal/external)';
COMMENT ON COLUMN public.fee_structures.student_type IS 'internal = boarder, external = day scholar';

-- ============================================================================
-- 2. FEE STRUCTURE ITEMS TABLE
-- Breakdown of fees (Tuition, Boarding, Library, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.fee_structure_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL, -- e.g., "Tuition", "Boarding", "Library"
    description TEXT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.fee_structure_items IS 'Individual fee items that make up a fee structure';

CREATE INDEX idx_fee_structure_items_structure ON public.fee_structure_items(fee_structure_id);

-- ============================================================================
-- 3. STUDENT FEES TABLE
-- Links students to fee structures (fee assignment/clearance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    
    -- Financial tracking
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0),
    
    -- Discounts/Scholarships
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    discount_reason TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'unpaid' 
        CHECK (status IN ('unpaid', 'partial', 'paid', 'waived', 'overdue')),
    due_date DATE NOT NULL,
    
    -- Audit fields
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One fee assignment per student per term
    CONSTRAINT unique_student_fee_per_term 
        UNIQUE(student_id, academic_year_id, term_id)
);

COMMENT ON TABLE public.student_fees IS 'Fee assignments to students - tracks balances per term';
COMMENT ON COLUMN public.student_fees.balance IS 'Calculated as: total_amount - discount_amount - amount_paid';

CREATE INDEX idx_student_fees_student ON public.student_fees(student_id);
CREATE INDEX idx_student_fees_term ON public.student_fees(term_id);
CREATE INDEX idx_student_fees_status ON public.student_fees(status);
CREATE INDEX idx_student_fees_academic_year ON public.student_fees(academic_year_id);

-- ============================================================================
-- 4. INVOICES TABLE
-- Billing documents generated from student fees
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL, -- Auto-generated: INV-2024-T1-000001
    student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    
    -- Invoice details
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    
    -- Financial tracking
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'unpaid' 
        CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled', 'overdue')),
    
    notes TEXT,
    
    -- Audit fields
    generated_by UUID REFERENCES public.profiles(id),
    sent_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.invoices IS 'Billing documents - one per student per term';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Auto-generated format: INV-YYYY-TX-NNNNNN';

CREATE INDEX idx_invoices_student ON public.invoices(student_id);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_term ON public.invoices(term_id);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

-- ============================================================================
-- 5. INVOICE ITEMS TABLE
-- Breakdown of invoice (mirrors fee structure items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.invoice_items IS 'Line items on invoices';

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ============================================================================
-- 6. PAYMENTS TABLE
-- Payment transactions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number TEXT UNIQUE NOT NULL, -- Auto-generated: PAY-2024-000001
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
    student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL 
        CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'cheque', 'card')),
    reference_number TEXT, -- Bank/Mobile money transaction reference
    
    notes TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'verified' 
        CHECK (status IN ('pending', 'verified', 'failed', 'reversed')),
    
    -- Audit fields
    recorded_by UUID REFERENCES public.profiles(id),
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Payment transactions - multiple payments can be made per invoice';
COMMENT ON COLUMN public.payments.payment_method IS 'cash, bank_transfer, mobile_money (Airtel/TNM), cheque, card';

CREATE INDEX idx_payments_student ON public.payments(student_id);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_payments_method ON public.payments(payment_method);
CREATE INDEX idx_payments_number ON public.payments(payment_number);

-- ============================================================================
-- 7. RECEIPTS TABLE
-- Payment confirmations (auto-generated from payments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number TEXT UNIQUE NOT NULL, -- Auto-generated: RCT-2024-000001
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    
    -- Receipt details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    
    -- PDF storage
    pdf_url TEXT, -- Path to generated PDF in Supabase Storage
    
    -- Audit fields
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.receipts IS 'Payment receipts - auto-generated when payment is verified';

CREATE INDEX idx_receipts_payment ON public.receipts(payment_id);
CREATE INDEX idx_receipts_student ON public.receipts(student_id);
CREATE INDEX idx_receipts_number ON public.receipts(receipt_number);

-- ============================================================================
-- 8. PAYMENT METHODS TABLE (Optional - for school configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    method_name TEXT NOT NULL, -- e.g., "Airtel Money", "NBS Bank"
    method_type TEXT NOT NULL 
        CHECK (method_type IN ('mobile_money', 'bank', 'cash', 'card')),
    account_number TEXT,
    account_name TEXT,
    instructions TEXT, -- Payment instructions for parents
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payment_methods IS 'Configured payment methods for the school';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fee_structures_updated_at 
    BEFORE UPDATE ON public.fee_structures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at 
    BEFORE UPDATE ON public.student_fees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON public.invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON public.payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON public.payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-GENERATION TRIGGERS
-- ============================================================================

-- Trigger: Auto-generate invoice number (INV-2024-T1-000001)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    term_code TEXT;
    sequence_num TEXT;
    next_num INTEGER;
BEGIN
    -- Get year from academic year
    SELECT EXTRACT(YEAR FROM start_date)::TEXT INTO year_code
    FROM public.academic_years WHERE id = NEW.academic_year_id;
    
    -- Get term code (T1, T2, T3)
    SELECT REPLACE(name, 'Term ', 'T') INTO term_code
    FROM public.terms WHERE id = NEW.term_id;
    
    -- Get next sequence number for this term
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-\d{4}-T\d-(\d{6})') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.invoices 
    WHERE academic_year_id = NEW.academic_year_id 
    AND term_id = NEW.term_id;
    
    -- Format sequence number with leading zeros
    sequence_num := LPAD(next_num::TEXT, 6, '0');
    
    -- Generate invoice number
    NEW.invoice_number := 'INV-' || year_code || '-' || term_code || '-' || sequence_num;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();

-- Trigger: Auto-generate payment number (PAY-2024-000001)
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    year_code TEXT;
    sequence_num TEXT;
    next_num INTEGER;
BEGIN
    -- Get current year
    year_code := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 'PAY-\d{4}-(\d{6})') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.payments 
    WHERE EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Format sequence number with leading zeros
    sequence_num := LPAD(next_num::TEXT, 6, '0');
    
    -- Generate payment number
    NEW.payment_number := 'PAY-' || year_code || '-' || sequence_num;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_payment_number
    BEFORE INSERT ON public.payments
    FOR EACH ROW
    WHEN (NEW.payment_number IS NULL OR NEW.payment_number = '')
    EXECUTE FUNCTION generate_payment_number();

-- Trigger: Auto-generate receipt number (RCT-2024-000001)
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    payment_num TEXT;
BEGIN
    -- Get payment number
    SELECT payment_number INTO payment_num
    FROM public.payments WHERE id = NEW.payment_id;
    
    -- Generate receipt number from payment number
    NEW.receipt_number := REPLACE(payment_num, 'PAY-', 'RCT-');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_receipt_number
    BEFORE INSERT ON public.receipts
    FOR EACH ROW
    WHEN (NEW.receipt_number IS NULL OR NEW.receipt_number = '')
    EXECUTE FUNCTION generate_receipt_number();

-- ============================================================================
-- BALANCE UPDATE TRIGGERS (Critical for data consistency)
-- ============================================================================

-- Trigger: Update balances when payment is made
CREATE OR REPLACE FUNCTION update_balances_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process verified payments
    IF NEW.status = 'verified' THEN
        -- Update invoice balance
        UPDATE public.invoices
        SET amount_paid = amount_paid + NEW.amount,
            balance = GREATEST(balance - NEW.amount, 0),
            status = CASE
                WHEN balance - NEW.amount <= 0 THEN 'paid'
                WHEN amount_paid + NEW.amount > 0 THEN 'partial'
                ELSE 'unpaid'
            END,
            paid_at = CASE 
                WHEN balance - NEW.amount <= 0 THEN NOW() 
                ELSE paid_at 
            END,
            updated_at = NOW()
        WHERE id = NEW.invoice_id;
        
        -- Update student_fees balance
        UPDATE public.student_fees
        SET amount_paid = amount_paid + NEW.amount,
            balance = GREATEST(balance - NEW.amount, 0),
            status = CASE
                WHEN balance - NEW.amount <= 0 THEN 'paid'
                WHEN amount_paid + NEW.amount > 0 THEN 'partial'
                ELSE 'unpaid'
            END,
            updated_at = NOW()
        WHERE id = NEW.student_fee_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_balances
    AFTER INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_balances_on_payment();

-- Trigger: Auto-generate receipt when payment is verified
CREATE OR REPLACE FUNCTION auto_generate_receipt()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate receipt for verified payments
    IF NEW.status = 'verified' THEN
        INSERT INTO public.receipts (
            payment_id,
            invoice_id,
            student_id,
            amount,
            payment_date,
            payment_method,
            generated_by
        ) VALUES (
            NEW.id,
            NEW.invoice_id,
            NEW.student_id,
            NEW.amount,
            NEW.payment_date,
            NEW.payment_method,
            NEW.recorded_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_receipt
    AFTER INSERT ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_receipt();

-- ============================================================================
-- SCHEDULED FUNCTIONS (Run daily via cron or application)
-- ============================================================================

-- Function: Mark overdue invoices and fees
CREATE OR REPLACE FUNCTION mark_overdue_fees()
RETURNS void AS $$
BEGIN
    -- Mark overdue invoices
    UPDATE public.invoices
    SET status = 'overdue'
    WHERE status IN ('unpaid', 'partial')
    AND due_date < CURRENT_DATE
    AND balance > 0;
    
    -- Mark overdue student fees
    UPDATE public.student_fees
    SET status = 'overdue'
    WHERE status IN ('unpaid', 'partial')
    AND due_date < CURRENT_DATE
    AND balance > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_overdue_fees IS 'Run daily to mark overdue invoices and fees';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structure_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Fee Structures: All can view, admins can manage
CREATE POLICY "Anyone can view fee structures" 
    ON public.fee_structures FOR SELECT 
    USING (true);

CREATE POLICY "Admins can manage fee structures" 
    ON public.fee_structures FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher')
        )
    );

-- Fee Structure Items: Follow parent fee structure
CREATE POLICY "Anyone can view fee structure items" 
    ON public.fee_structure_items FOR SELECT 
    USING (true);

CREATE POLICY "Admins can manage fee structure items" 
    ON public.fee_structure_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher')
        )
    );

-- Student Fees: Students see own, staff see all
CREATE POLICY "Students view own fees" 
    ON public.student_fees FOR SELECT 
    USING (
        student_id = auth.uid()
    );

CREATE POLICY "Staff view all fees" 
    ON public.student_fees FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage fees" 
    ON public.student_fees FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Invoices: Same as student_fees
CREATE POLICY "Students view own invoices" 
    ON public.invoices FOR SELECT 
    USING (
        student_id = auth.uid()
    );

CREATE POLICY "Staff view all invoices" 
    ON public.invoices FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage invoices" 
    ON public.invoices FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Invoice Items: Follow parent invoice
CREATE POLICY "Users view invoice items for accessible invoices" 
    ON public.invoice_items FOR SELECT 
    USING (
        invoice_id IN (SELECT id FROM public.invoices)
    );

CREATE POLICY "Admins manage invoice items" 
    ON public.invoice_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Payments: Same pattern
CREATE POLICY "Students view own payments" 
    ON public.payments FOR SELECT 
    USING (
        student_id = auth.uid()
    );

CREATE POLICY "Staff view all payments" 
    ON public.payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

CREATE POLICY "Admins manage payments" 
    ON public.payments FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Receipts: Same pattern
CREATE POLICY "Students view own receipts" 
    ON public.receipts FOR SELECT 
    USING (
        student_id = auth.uid()
    );

CREATE POLICY "Staff view all receipts" 
    ON public.receipts FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher', 'deputy_headteacher', 'teacher')
        )
    );

-- Payment Methods: All can view, admins manage
CREATE POLICY "Anyone can view payment methods" 
    ON public.payment_methods FOR SELECT 
    USING (is_active = true);

CREATE POLICY "Admins manage payment methods" 
    ON public.payment_methods FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'headteacher')
        )
    );

-- ============================================================================
-- SEED DATA: Payment Methods
-- ============================================================================
INSERT INTO public.payment_methods (method_name, method_type, account_number, instructions, display_order) VALUES
('Cash', 'cash', NULL, 'Pay at the school bursar office during office hours (8:00 AM - 4:00 PM)', 1),
('Airtel Money', 'mobile_money', '0999123456', 'Send money to 0999123456. Use student ID as reference.', 2),
('TNM Mpamba', 'mobile_money', '0888123456', 'Send money to 0888123456. Use student ID as reference.', 3),
('NBS Bank', 'bank', '1234567890', 'Account Name: [School Name]. Branch: [Branch]. Use student ID as reference.', 4),
('Standard Bank', 'bank', '0987654321', 'Account Name: [School Name]. Branch: [Branch]. Use student ID as reference.', 5)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HELPFUL VIEWS (Optional - for easier querying)
-- ============================================================================

-- View: Student fees with student details
CREATE OR REPLACE VIEW public.v_student_fees_details AS
SELECT 
    sf.id,
    sf.student_id,
    s.student_id as student_number,
    p.first_name || ' ' || p.last_name as student_name,
    c.name as class_name,
    s.student_type,
    ay.name as academic_year,
    t.name as term,
    fs.name as fee_structure_name,
    sf.total_amount,
    sf.amount_paid,
    sf.balance,
    sf.discount_amount,
    sf.status,
    sf.due_date,
    sf.assigned_at
FROM public.student_fees sf
JOIN public.students s ON sf.student_id = s.id
JOIN public.profiles p ON s.id = p.id
JOIN public.classes c ON s.class_id = c.id
JOIN public.academic_years ay ON sf.academic_year_id = ay.id
JOIN public.terms t ON sf.term_id = t.id
JOIN public.fee_structures fs ON sf.fee_structure_id = fs.id;

COMMENT ON VIEW public.v_student_fees_details IS 'Student fees with full student and term details';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE 'Fee Management Schema Migration Complete!';
    RAISE NOTICE 'Tables created: fee_structures, fee_structure_items, student_fees, invoices, invoice_items, payments, receipts, payment_methods';
    RAISE NOTICE 'Triggers created: Auto-numbering, balance updates, receipt generation';
    RAISE NOTICE 'RLS policies: Enabled for all tables';
    RAISE NOTICE 'Next steps: Create fee structures and assign fees to students';
END $$;
