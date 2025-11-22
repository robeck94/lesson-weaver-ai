-- Create saved_lessons table for storing generated lessons
CREATE TABLE IF NOT EXISTS public.saved_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  age_group TEXT,
  context TEXT,
  lesson_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Anyone can view saved lessons"
  ON public.saved_lessons
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert saved lessons"
  ON public.saved_lessons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update saved lessons"
  ON public.saved_lessons
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete saved lessons"
  ON public.saved_lessons
  FOR DELETE
  USING (true);

-- Create index for faster queries by session_id
CREATE INDEX idx_saved_lessons_session_id ON public.saved_lessons(session_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_lessons_updated_at
  BEFORE UPDATE ON public.saved_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_updated_at();