
-- Add profile completion fields
ALTER TABLE public.profiles
ADD COLUMN full_name text,
ADD COLUMN gender text,
ADD COLUMN preparing_for text[] DEFAULT '{}',
ADD COLUMN profile_completed boolean NOT NULL DEFAULT false;
