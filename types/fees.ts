// ============================================================================
// Fee Management System Types
// Generated from database schema
// ============================================================================

export type StudentType = 'internal' | 'external';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque' | 'card';
export type PaymentMethodType = 'mobile_money' | 'bank' | 'cash' | 'card';

export type FeeStatus = 'unpaid' | 'partial' | 'paid' | 'waived' | 'overdue';
export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'cancelled' | 'overdue';
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'reversed';

// ============================================================================
// Database Tables
// ============================================================================

export interface FeeStructure {
    id: string;
    name: string;
    academic_year_id: string;
    term_id: string;
    student_type: StudentType;
    total_amount: number;
    due_date: string;
    is_active: boolean;
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface FeeStructureItem {
    id: string;
    fee_structure_id: string;
    item_name: string;
    description?: string;
    amount: number;
    is_mandatory: boolean;
    display_order: number;
    created_at: string;
}

export interface StudentFee {
    id: string;
    student_id: string;
    fee_structure_id: string;
    academic_year_id: string;
    term_id: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    discount_amount: number;
    discount_reason?: string;
    status: FeeStatus;
    due_date: string;
    assigned_by?: string;
    assigned_at: string;
    created_at: string;
    updated_at: string;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    student_fee_id: string;
    student_id: string;
    academic_year_id: string;
    term_id: string;
    invoice_date: string;
    due_date: string;
    total_amount: number;
    amount_paid: number;
    balance: number;
    status: InvoiceStatus;
    notes?: string;
    generated_by?: string;
    sent_at?: string;
    paid_at?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    item_name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    created_at: string;
}

export interface Payment {
    id: string;
    payment_number: string;
    invoice_id: string;
    student_fee_id: string;
    student_id: string;
    academic_year_id: string;
    term_id: string;
    amount: number;
    payment_date: string;
    payment_method: PaymentMethod;
    reference_number?: string;
    notes?: string;
    status: PaymentStatus;
    recorded_by?: string;
    verified_by?: string;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Receipt {
    id: string;
    receipt_number: string;
    payment_id: string;
    invoice_id: string;
    student_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    pdf_url?: string;
    generated_at: string;
    generated_by?: string;
    created_at: string;
}

export interface PaymentMethodConfig {
    id: string;
    method_name: string;
    method_type: PaymentMethodType;
    account_number?: string;
    account_name?: string;
    instructions?: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// Extended Types (with relations)
// ============================================================================

export interface FeeStructureWithItems extends FeeStructure {
    items: FeeStructureItem[];
}

export interface StudentFeeWithDetails extends StudentFee {
    student: {
        id: string;
        student_id: string;
        full_name: string;
        student_type: StudentType;
    };
    fee_structure: FeeStructure;
    academic_year: {
        id: string;
        name: string;
    };
    term: {
        id: string;
        name: string;
    };
}

export interface InvoiceWithDetails extends Invoice {
    student: {
        id: string;
        student_id: string;
        full_name: string;
        class_name: string;
    };
    items: InvoiceItem[];
    payments: Payment[];
}

export interface PaymentWithDetails extends Payment {
    student: {
        id: string;
        student_id: string;
        full_name: string;
    };
    invoice: {
        invoice_number: string;
    };
    receipt?: Receipt;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateFeeStructureInput {
    name?: string; // Optional - auto-generated if not provided
    academic_year_id: string;
    term_id: string;
    student_type: StudentType;
    due_date: string;
    notes?: string;
    items: {
        item_name: string;
        description?: string;
        amount: number;
        is_mandatory: boolean;
        display_order: number;
    }[];
}

export interface BulkAssignFeesInput {
    academic_year_id: string;
    term_id: string;
}

export interface GenerateInvoicesInput {
    academic_year_id: string;
    term_id: string;
    class_ids?: string[]; // Optional: specific classes
    due_date?: string; // Optional: override default due date
}

export interface RecordPaymentInput {
    invoice_id: string;
    amount: number;
    payment_date: string;
    payment_method: PaymentMethod;
    reference_number?: string;
    notes?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface BulkAssignFeesResponse {
    success: boolean;
    internal_count: number;
    external_count: number;
    total_count: number;
    total_amount: number;
    message: string;
}

export interface GenerateInvoicesResponse {
    success: boolean;
    invoice_count: number;
    total_amount: number;
    invoices: {
        invoice_number: string;
        student_name: string;
        amount: number;
    }[];
    message: string;
}

export interface RecordPaymentResponse {
    success: boolean;
    payment: Payment;
    receipt: Receipt;
    updated_balance: number;
    message: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface FeeCollectionSummary {
    term_id: string;
    term_name: string;
    total_expected: number;
    total_collected: number;
    total_outstanding: number;
    collection_rate: number; // Percentage
    internal_students: {
        count: number;
        expected: number;
        collected: number;
        outstanding: number;
    };
    external_students: {
        count: number;
        expected: number;
        collected: number;
        outstanding: number;
    };
}

export interface OutstandingFeesReport {
    student_id: string;
    student_number: string;
    student_name: string;
    class_name: string;
    student_type: StudentType;
    total_fees: number;
    amount_paid: number;
    balance: number;
    status: FeeStatus;
    due_date: string;
    days_overdue: number;
}

export interface PaymentMethodBreakdown {
    payment_method: PaymentMethod;
    transaction_count: number;
    total_amount: number;
    percentage: number;
}

// ============================================================================
// Financial Aid & Sponsorship Types
// ============================================================================

export type SponsorType = 'government' | 'ngo' | 'corporate' | 'foundation' | 'individual';
export type AidCoverageType = 'full' | 'percentage' | 'fixed_amount' | 'specific_items';
export type AidStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'completed' | 'rejected';

// ============================================================================
// Database Tables
// ============================================================================

export interface Sponsor {
    id: string;
    name: string;
    sponsor_type: SponsorType;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    payment_terms?: string;
    billing_email?: string;
    is_active: boolean;
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface FinancialAidType {
    id: string;
    sponsor_id: string;
    name: string;
    description?: string;
    coverage_type: AidCoverageType;
    coverage_percentage?: number;
    coverage_amount?: number;
    covered_items?: string[];
    eligibility_criteria?: string;
    requires_application: boolean;
    is_active: boolean;
    display_order: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface StudentFinancialAid {
    id: string;
    student_id: string;
    financial_aid_type_id: string;
    sponsor_id: string;
    academic_year_id: string;
    term_id?: string;
    coverage_type: AidCoverageType;
    coverage_percentage?: number;
    coverage_amount?: number;
    covered_items?: string[];
    calculated_aid_amount: number;
    status: AidStatus;
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
    valid_from: string;
    valid_until: string;
    conditions?: string;
    notes?: string;
    sponsor_pays_directly: boolean;
    sponsor_payment_received: boolean;
    sponsor_payment_date?: string;
    assigned_by?: string;
    created_at: string;
    updated_at: string;
}

export interface SponsorPayment {
    id: string;
    payment_number: string;
    sponsor_id: string;
    amount: number;
    payment_date: string;
    payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'wire_transfer';
    reference_number?: string;
    allocated_amount: number;
    unallocated_amount: number;
    notes?: string;
    recorded_by?: string;
    created_at: string;
    updated_at: string;
}

export interface SponsorPaymentAllocation {
    id: string;
    sponsor_payment_id: string;
    student_id: string;
    student_fee_id: string;
    invoice_id?: string;
    allocated_amount: number;
    allocation_date: string;
    notes?: string;
    allocated_by?: string;
    created_at: string;
}

// ============================================================================
// Extended Types (with relations)
// ============================================================================

export interface SponsorWithStats extends Sponsor {
    total_paid: number;
    total_allocated: number;
    total_unallocated: number;
    payment_count: number;
    students_helped: number;
}

export interface FinancialAidTypeWithSponsor extends FinancialAidType {
    sponsor: {
        id: string;
        name: string;
        sponsor_type: SponsorType;
    };
}

export interface StudentFinancialAidWithDetails extends StudentFinancialAid {
    student: {
        id: string;
        student_id: string;
        full_name: string;
    };
    sponsor: {
        id: string;
        name: string;
        sponsor_type: SponsorType;
    };
    financial_aid_type: {
        id: string;
        name: string;
    };
    academic_year: {
        id: string;
        name: string;
    };
    term?: {
        id: string;
        name: string;
    };
}

export interface SponsorPaymentWithDetails extends SponsorPayment {
    sponsor: {
        id: string;
        name: string;
    };
    allocations: SponsorPaymentAllocation[];
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface CreateSponsorInput {
    name: string;
    sponsor_type: SponsorType;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    payment_terms?: string;
    billing_email?: string;
    notes?: string;
}

export interface UpdateSponsorInput extends Partial<CreateSponsorInput> {
    is_active?: boolean;
}

export interface CreateFinancialAidTypeInput {
    sponsor_id: string;
    name: string;
    description?: string;
    coverage_type: AidCoverageType;
    coverage_percentage?: number;
    coverage_amount?: number;
    covered_items?: string[];
    eligibility_criteria?: string;
    requires_application?: boolean;
}

export interface AssignAidToStudentInput {
    student_id: string;
    financial_aid_type_id: string;
    academic_year_id: string;
    term_id?: string;
    valid_from: string;
    valid_until: string;
    conditions?: string;
    notes?: string;
    // Override aid type defaults if needed
    coverage_type?: AidCoverageType;
    coverage_percentage?: number;
    coverage_amount?: number;
    covered_items?: string[];
}

export interface BulkAssignAidInput {
    financial_aid_type_id: string;
    academic_year_id: string;
    term_id?: string;
    student_ids: string[];
    valid_from: string;
    valid_until: string;
    conditions?: string;
    notes?: string;
}

export interface RecordSponsorPaymentInput {
    sponsor_id: string;
    amount: number;
    payment_date: string;
    payment_method: 'bank_transfer' | 'cheque' | 'cash' | 'wire_transfer';
    reference_number?: string;
    notes?: string;
    // Auto-allocate to students?
    auto_allocate?: boolean;
}

export interface AllocateSponsorPaymentInput {
    sponsor_payment_id: string;
    allocations: {
        student_id: string;
        student_fee_id: string;
        invoice_id?: string;
        allocated_amount: number;
    }[];
}

// ============================================================================
// Response Types
// ============================================================================

export interface AssignAidResponse {
    success: boolean;
    aid_award: StudentFinancialAid;
    message: string;
}

export interface BulkAssignAidResponse {
    success: boolean;
    assigned_count: number;
    failed_count: number;
    total_aid_amount: number;
    message: string;
}

export interface RecordSponsorPaymentResponse {
    success: boolean;
    payment: SponsorPayment;
    allocations?: SponsorPaymentAllocation[];
    message: string;
}

// ============================================================================
// Report Types
// ============================================================================

export interface FinancialAidSummary {
    academic_year_id: string;
    academic_year_name: string;
    total_students_with_aid: number;
    total_aid_amount: number;
    by_sponsor: {
        sponsor_id: string;
        sponsor_name: string;
        student_count: number;
        total_aid_amount: number;
    }[];
    by_coverage_type: {
        coverage_type: AidCoverageType;
        student_count: number;
        total_aid_amount: number;
    }[];
}

export interface SponsorReport {
    sponsor_id: string;
    sponsor_name: string;
    sponsor_type: SponsorType;
    total_committed: number;
    total_paid: number;
    total_allocated: number;
    outstanding_balance: number;
    students_sponsored: number;
    payment_history: SponsorPayment[];
}

