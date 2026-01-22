-- Add sale-related fields to products table
ALTER TABLE products 
ADD COLUMN sale_price NUMERIC,
ADD COLUMN discount_percentage INTEGER,
ADD COLUMN is_on_sale BOOLEAN DEFAULT FALSE,
ADD COLUMN sale_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN sale_end_date TIMESTAMP WITH TIME ZONE;

-- Add index for sale queries
CREATE INDEX idx_products_on_sale ON products(is_on_sale) WHERE is_on_sale = TRUE;

-- Add check constraint for discount percentage
ALTER TABLE products 
ADD CONSTRAINT check_discount_percentage 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- Add check constraint for sale price
ALTER TABLE products 
ADD CONSTRAINT check_sale_price 
CHECK (sale_price IS NULL OR sale_price >= 0);
