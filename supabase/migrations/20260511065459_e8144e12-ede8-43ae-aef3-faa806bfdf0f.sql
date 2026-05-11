
-- Live tests table
CREATE TABLE public.live_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_slug text NOT NULL,
  exam_name text NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live tests publicly readable when published"
  ON public.live_tests FOR SELECT
  USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage live tests"
  ON public.live_tests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_live_tests_updated_at
  BEFORE UPDATE ON public.live_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_live_tests_exam_slug ON public.live_tests(exam_slug);
CREATE INDEX idx_live_tests_start_at ON public.live_tests(start_at);

-- Live test attempts table
CREATE TABLE public.live_test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_test_id uuid NOT NULL REFERENCES public.live_tests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  incorrect_count integer NOT NULL DEFAULT 0,
  unanswered_count integer NOT NULL DEFAULT 0,
  time_taken_seconds integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (live_test_id, user_id)
);

ALTER TABLE public.live_test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attempts are publicly readable for leaderboard"
  ON public.live_test_attempts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own attempt"
  ON public.live_test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage attempts"
  ON public.live_test_attempts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_attempts_live_test ON public.live_test_attempts(live_test_id);
CREATE INDEX idx_attempts_user ON public.live_test_attempts(user_id);
