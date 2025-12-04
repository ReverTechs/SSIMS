-- Fix payment_methods table to ensure method_type values match the payments table constraint
-- The payments table CHECK constraint allows: 'cash', 'bank_transfer', 'mobile_money', 'cheque', 'card'

-- First, delete any existing payment methods to start fresh
DELETE FROM payment_methods;

-- Insert correct payment methods with matching method_type values
INSERT INTO payment_methods (method_name, method_type, is_active, display_order) VALUES
('Cash', 'cash', true, 1),
('Bank Transfer', 'bank_transfer', true, 2),
('Mobile Money', 'mobile_money', true, 3),
('Cheque', 'cheque', true, 4),
('Card Payment', 'card', true, 5);

-- Verify the data
SELECT * FROM payment_methods ORDER BY display_order;
