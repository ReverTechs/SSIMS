-- Add RLS policies for receipts table to allow admin/staff to create receipts

-- Enable RLS on receipts table (if not already enabled)
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin and staff can insert receipts" ON receipts;
DROP POLICY IF EXISTS "Admin and staff can view all receipts" ON receipts;
DROP POLICY IF EXISTS "Students can view their own receipts" ON receipts;
DROP POLICY IF EXISTS "Guardians can view their children's receipts" ON receipts;

-- Policy: Admin and staff can insert receipts
CREATE POLICY "Admin and staff can insert receipts"
ON receipts
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'teacher')
    )
);

-- Policy: Admin and staff can view all receipts
CREATE POLICY "Admin and staff can view all receipts"
ON receipts
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'teacher')
    )
);

-- Policy: Students can view their own receipts
CREATE POLICY "Students can view their own receipts"
ON receipts
FOR SELECT
TO authenticated
USING (
    receipts.student_id = auth.uid()
);

-- Policy: Guardians can view their children's receipts
CREATE POLICY "Guardians can view their children's receipts"
ON receipts
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM student_guardians gs
        WHERE gs.student_id = receipts.student_id
        AND gs.guardian_id = auth.uid()
    )
);
