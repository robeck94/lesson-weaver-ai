-- Templates table to persist templates
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  teaching_style text NOT NULL,
  activity_preferences text[] DEFAULT '{}',
  emphasis_areas text[] DEFAULT '{}',
  custom_instructions text,
  tone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lesson analytics table to track lesson quality
CREATE TABLE IF NOT EXISTS public.lesson_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES public.templates(id) ON DELETE SET NULL,
  lesson_topic text NOT NULL,
  cefr_level text NOT NULL,
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback text,
  slides_count integer,
  image_quality_score numeric(3,2),
  generated_at timestamptz DEFAULT now()
);

-- Template statistics view
CREATE OR REPLACE VIEW public.template_analytics AS
SELECT 
  t.id,
  t.name,
  t.teaching_style,
  t.tone,
  COUNT(la.id) as total_uses,
  COUNT(la.user_rating) as total_ratings,
  ROUND(AVG(la.user_rating)::numeric, 2) as average_rating,
  ROUND(AVG(la.image_quality_score)::numeric, 2) as avg_image_quality,
  MAX(la.generated_at) as last_used_at,
  ROUND((COUNT(CASE WHEN la.user_rating >= 4 THEN 1 END)::numeric / NULLIF(COUNT(la.user_rating), 0) * 100), 1) as satisfaction_rate
FROM public.templates t
LEFT JOIN public.lesson_analytics la ON t.id = la.template_id
GROUP BY t.id, t.name, t.teaching_style, t.tone;

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for templates (no auth required for now)
CREATE POLICY "Templates are viewable by everyone"
  ON public.templates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update templates"
  ON public.templates FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete templates"
  ON public.templates FOR DELETE
  USING (true);

-- Public access for analytics
CREATE POLICY "Analytics are viewable by everyone"
  ON public.lesson_analytics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert analytics"
  ON public.lesson_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_lesson_analytics_template ON public.lesson_analytics(template_id);
CREATE INDEX idx_lesson_analytics_rating ON public.lesson_analytics(user_rating);
CREATE INDEX idx_templates_created ON public.templates(created_at DESC);

-- Function to update template updated_at
CREATE OR REPLACE FUNCTION public.update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_updated_at();