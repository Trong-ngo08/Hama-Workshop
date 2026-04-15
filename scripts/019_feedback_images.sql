-- Create feedback_images table
CREATE TABLE IF NOT EXISTS feedback_images (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing image_url data into feedback_images
INSERT INTO feedback_images (feedback_id, image_url, display_order)
SELECT id, image_url, 0
FROM feedbacks
WHERE image_url IS NOT NULL AND image_url != '';

-- Make image_url nullable (no longer required, cover comes from feedback_images)
ALTER TABLE feedbacks ALTER COLUMN image_url DROP NOT NULL;

-- Remove obsolete layout setting
DELETE FROM site_settings WHERE key = 'feedbacks_layout';
