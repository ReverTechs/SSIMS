# Fee Management Database Schema - Quick Reference

## Tables Overview

### 1. `fee_structures` (2 per term)
- Stores fee templates for internal/external students
- **Key**: `(academic_year_id, term_id, student_type)` UNIQUE
- Example: "Internal Students - Term 1 2024" = MK 188,000

### 2. `fee_structure_items`
- Breakdown of fees (Tuition, Boarding, Library, etc.)
- Links to `fee_structures`

### 3. `student_fees` (Fee Assignment)
- Links students to fee structures
- Tracks: `total_amount`, `amount_paid`, `balance`, `status`
- **Key**: `(student_id, academic_year_id, term_id)` UNIQUE

### 4. `invoices`
- Billing documents
- Auto-generated number: `INV-2024-T1-000001`
- Tracks: `total_amount`, `amount_paid`, `balance`, `status`

### 5. `invoice_items`
- Line items on invoices
- Mirrors `fee_structure_items`

### 6. `payments`
- Payment transactions
- Auto-generated number: `PAY-2024-000001`
- Methods: cash, bank_transfer, mobile_money, cheque, card

### 7. `receipts`
- Payment confirmations
- Auto-generated number: `RCT-2024-000001`
- Auto-created when payment is verified

### 8. `payment_methods`
- School's configured payment methods
- Seeded with: Cash, Airtel Money, TNM Mpamba, NBS Bank, Standard Bank

---

## Auto-Triggers

### Invoice Number Generation
- Format: `INV-YYYY-TX-NNNNNN`
- Example: `INV-2024-T1-000001`

### Payment Number Generation
- Format: `PAY-YYYY-NNNNNN`
- Example: `PAY-2024-000001`

### Receipt Number Generation
- Format: `RCT-YYYY-NNNNNN`
- Derived from payment number

### Balance Updates (Critical!)
When payment is inserted:
1. Updates `invoices.amount_paid` and `invoices.balance`
2. Updates `student_fees.amount_paid` and `student_fees.balance`
3. Updates status (unpaid → partial → paid)
4. Auto-generates receipt

---

## Data Flow

```
1. Create Fee Structure
   ↓
2. Assign Fees to Students (student_fees)
   ↓
3. Generate Invoices
   ↓
4. Record Payment
   ↓ (triggers)
5. Update Balances + Generate Receipt
```

---

## Key Constraints

- Only 2 fee structures per term (internal/external)
- One student_fee per student per term
- One invoice per student per term
- Multiple payments per invoice allowed
- One receipt per payment

---

## RLS Policies

- **Students**: See only their own data
- **Teachers/Staff**: See all data (read-only)
- **Admins**: Full access (CRUD)

---

## Next Steps

Run migration:
```sql
-- In Supabase Dashboard → SQL Editor
-- Copy and paste: supabase/migrations/20251202_create_fee_management_schema.sql
```

Verify:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%fee%';
```
