-- Add question_category column to differentiate Core CS vs Reasoning/Aptitude
ALTER TABLE public.questions
ADD COLUMN question_category TEXT NOT NULL DEFAULT 'core';

-- Add an index for efficient filtering
CREATE INDEX idx_questions_category ON public.questions (exam_id, set_number, question_category);