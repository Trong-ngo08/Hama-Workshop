-- Simplify sale fields to just basic discount percentage
ALTER TABLE products 
DROP COLUMN IF EXISTS sale_start_date,
DROP COLUMN IF EXISTS sale_end_date,
DROP COLUMN IF EXISTS is_on_sale;

-- Keep only sale_price and discount_percentage for simple sale management
