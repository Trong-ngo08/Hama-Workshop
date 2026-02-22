-- 017_add_product_categories.sql
-- Many-to-many relationship between products and categories

-- Create junction table
CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can read product_categories" ON product_categories
  FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated can manage product_categories" ON product_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Migrate existing category text data into the junction table
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON lower(c.name) = lower(p.category)
WHERE p.category IS NOT NULL AND p.category != ''
ON CONFLICT (product_id, category_id) DO NOTHING;
