-- Add is_visible flag: controls whether a product shows up on public pages.
-- Separate from is_available, which now only means "còn hàng" (stock badge).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Existing rows default to visible (feature default = hiện).
UPDATE products SET is_visible = true WHERE is_visible IS NULL;

-- Optional: if is_available was previously used to hide products,
-- run this instead to keep the old public listing unchanged:
-- UPDATE products SET is_visible = is_available;

CREATE INDEX IF NOT EXISTS idx_products_is_visible ON products (is_visible);
