ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS question_text_hi text,
  ADD COLUMN IF NOT EXISTS option_a_hi text,
  ADD COLUMN IF NOT EXISTS option_b_hi text,
  ADD COLUMN IF NOT EXISTS option_c_hi text,
  ADD COLUMN IF NOT EXISTS option_d_hi text,
  ADD COLUMN IF NOT EXISTS explanation_hi text;