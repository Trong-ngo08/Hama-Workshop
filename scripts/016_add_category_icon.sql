-- Add custom icon field to categories table
-- Stores a Lucide icon name string (e.g. 'Trees', 'Printer', 'Gift')
-- Used by the admin icon picker and rendered in product-filters & home page category grid

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon TEXT;

-- No index needed: categories is a small table, queried in full every time
