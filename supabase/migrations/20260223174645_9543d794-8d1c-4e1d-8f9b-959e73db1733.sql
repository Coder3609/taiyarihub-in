-- Add source_label column to questions for metadata like "PYQ 2019 Set 1", "DC Pandey Ch.3", "FIITJEE Module 2"
ALTER TABLE public.questions
ADD COLUMN source_label TEXT DEFAULT NULL;
