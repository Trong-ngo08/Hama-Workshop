-- Lock site_settings down: anyone may read (the storefront needs it), but
-- writes go only through /api/settings, which uses the service-role key and
-- bypasses RLS. Run this AFTER deploying the code that uses /api/settings.
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings public read" ON site_settings;
CREATE POLICY "site_settings public read"
  ON site_settings FOR SELECT
  USING (true);
