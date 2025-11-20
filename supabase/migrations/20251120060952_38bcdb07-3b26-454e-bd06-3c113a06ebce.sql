-- Fix security issues by dropping and recreating trigger and function

-- Drop trigger first
DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;

-- Drop and recreate function with proper search_path
DROP FUNCTION IF EXISTS public.update_template_updated_at();

CREATE OR REPLACE FUNCTION public.update_template_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_template_updated_at();