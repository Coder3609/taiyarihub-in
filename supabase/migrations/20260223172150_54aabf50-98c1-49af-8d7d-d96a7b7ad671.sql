
-- Table to store custom display names for exam sets
CREATE TABLE public.exam_set_names (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL DEFAULT 'pyqs',
  set_number INTEGER NOT NULL DEFAULT 1,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(exam_id, section_type, set_number)
);

-- Enable RLS
ALTER TABLE public.exam_set_names ENABLE ROW LEVEL SECURITY;

-- Publicly readable (same as exams)
CREATE POLICY "Set names are publicly readable"
  ON public.exam_set_names
  FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage set names"
  ON public.exam_set_names
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
