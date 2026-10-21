-- Homepage hero content (image + all hero text), stored as a JSON blob.
-- '{}' means "use the built-in defaults"; the admin settings page overwrites it.
INSERT INTO site_settings (key, value)
VALUES ('hero_content', '{}')
ON CONFLICT (key) DO NOTHING;
