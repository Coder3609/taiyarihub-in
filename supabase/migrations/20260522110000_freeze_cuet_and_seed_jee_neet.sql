-- Delete CUET exam from the exams table
DELETE FROM public.exams WHERE slug = 'CUET';

-- Ensure JEE Mains, JEE Advanced, and NEET exams are seeded
INSERT INTO public.exams (name, slug, category, duration_minutes, total_questions, description)
VALUES 
  ('JEE Mains', 'JEE-Mains', 'school', 180, 90, 'Joint Entrance Examination - Main'),
  ('JEE Advanced', 'JEE-Advanced', 'school', 180, 54, 'Joint Entrance Examination - Advanced'),
  ('JEE Advanced Paper 1', 'JEE-Advanced-Paper-1', 'school', 180, 54, 'Joint Entrance Examination - Advanced Paper 1'),
  ('JEE Advanced Paper 2', 'JEE-Advanced-Paper-2', 'school', 180, 54, 'Joint Entrance Examination - Advanced Paper 2'),
  ('NEET', 'NEET', 'school', 200, 200, 'National Eligibility cum Entrance Test')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description;
