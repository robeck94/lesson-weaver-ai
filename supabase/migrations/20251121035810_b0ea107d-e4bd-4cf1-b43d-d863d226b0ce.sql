-- Create storage bucket for custom slide images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slide-images',
  'slide-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Create RLS policies for slide images bucket
CREATE POLICY "Anyone can view slide images"
ON storage.objects FOR SELECT
USING (bucket_id = 'slide-images');

CREATE POLICY "Anyone can upload slide images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'slide-images');

CREATE POLICY "Anyone can update their slide images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'slide-images');

CREATE POLICY "Anyone can delete slide images"
ON storage.objects FOR DELETE
USING (bucket_id = 'slide-images');