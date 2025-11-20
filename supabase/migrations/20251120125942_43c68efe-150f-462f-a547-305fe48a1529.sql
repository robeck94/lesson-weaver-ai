-- Create image cache table to store and reuse generated images
CREATE TABLE public.image_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  visual_description TEXT NOT NULL,
  slide_title TEXT,
  content_keywords TEXT,
  usage_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read cached images
CREATE POLICY "Image cache is viewable by everyone"
  ON public.image_cache
  FOR SELECT
  USING (true);

-- Allow anyone to insert new cached images
CREATE POLICY "Anyone can insert cached images"
  ON public.image_cache
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update usage stats
CREATE POLICY "Anyone can update cached images"
  ON public.image_cache
  FOR UPDATE
  USING (true);

-- Create index for faster lookups by visual description
CREATE INDEX idx_image_cache_visual_description ON public.image_cache(visual_description);

-- Create index for faster lookups by keywords
CREATE INDEX idx_image_cache_keywords ON public.image_cache(content_keywords);