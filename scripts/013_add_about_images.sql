-- Create table for About Us page images
CREATE TABLE IF NOT EXISTS about_images (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample data
INSERT INTO about_images (title, description, image_url, display_order) VALUES
('Không gian làm việc', 'Góc làm việc ấm cúng của Hama Workshop', '/placeholder.svg?height=400&width=600&text=Workspace', 1),
('Quy trình móc len', 'Những bước tỉ mỉ trong quy trình tạo sản phẩm', '/placeholder.svg?height=400&width=600&text=Process', 2),
('Sản phẩm hoàn thiện', 'Những tác phẩm đáng yêu đã hoàn thành', '/placeholder.svg?height=400&width=600&text=Products', 3);
