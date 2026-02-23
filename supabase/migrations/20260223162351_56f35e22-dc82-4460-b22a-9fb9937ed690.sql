
-- Add question_type column to questions table (mcq, msq, integer)
ALTER TABLE public.questions ADD COLUMN question_type text NOT NULL DEFAULT 'mcq';

-- For MSQ: correct_answer will store comma-separated values like 'A,B,D'
-- For Integer: correct_answer will store the numerical answer as text like '42'
-- For MCQ: correct_answer stays as single letter like 'B'
