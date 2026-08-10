-- Site-wide discount switch. When 'false', the storefront shows only original
-- prices; per-product sale_price values stay in the database untouched.
INSERT INTO site_settings (key, value)
VALUES ('discounts_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
