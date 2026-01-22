-- Add SEO fields to products table
ALTER TABLE products 
ADD COLUMN seo_title TEXT,
ADD COLUMN seo_description TEXT,
ADD COLUMN seo_keywords TEXT,
ADD COLUMN slug TEXT UNIQUE;

-- Create index for slug lookups
CREATE INDEX idx_products_slug ON products(slug);

-- Update existing products with basic slugs (optional)
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '''', ''))
WHERE slug IS NULL;
