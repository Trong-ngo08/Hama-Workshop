-- Create feedbacks table for customer testimonials
CREATE TABLE IF NOT EXISTS feedbacks (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  quote TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table for configurable UI options
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed default layout setting
INSERT INTO site_settings (key, value)
VALUES ('feedbacks_layout', 'grid')
ON CONFLICT (key) DO NOTHING;
