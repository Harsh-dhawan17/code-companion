-- Extend problems table
ALTER TABLE public.problems
  ADD COLUMN IF NOT EXISTS companies text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS youtube_query text;

-- Editorials cache
CREATE TABLE IF NOT EXISTS public.editorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL UNIQUE,
  intuition text NOT NULL,
  approach text NOT NULL,
  complexity text NOT NULL,
  solutions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.editorials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Editorials readable by all" ON public.editorials FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert editorials" ON public.editorials
  FOR INSERT TO authenticated WITH CHECK (true);

-- Daily challenge
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  challenge_date date PRIMARY KEY,
  problem_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Daily challenges readable by all" ON public.daily_challenges FOR SELECT USING (true);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  problem_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, problem_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);