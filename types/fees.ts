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
