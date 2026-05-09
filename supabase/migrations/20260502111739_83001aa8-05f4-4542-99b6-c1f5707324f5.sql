-- Achievement catalog
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  tier text NOT NULL DEFAULT 'bronze',
  xp_reward integer NOT NULL DEFAULT 0,
  criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements readable by all"
  ON public.achievements FOR SELECT USING (true);

-- User-unlocked achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User achievements viewable by everyone"
  ON public.user_achievements FOR SELECT USING (true);

CREATE POLICY "Users insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);

-- Seed achievement catalog
INSERT INTO public.achievements (key, name, description, icon, tier, xp_reward, criteria) VALUES
  ('first_blood',       'First Blood',        'Solve your very first problem',           'zap',      'bronze', 25,  '{"type":"solve_count","count":1}'),
  ('problem_solver_10', 'Problem Solver',     'Solve 10 problems',                        'trophy',   'bronze', 50,  '{"type":"solve_count","count":10}'),
  ('grinder_50',        'The Grinder',        'Solve 50 problems',                        'trophy',   'silver', 150, '{"type":"solve_count","count":50}'),
  ('centurion_100',     'Centurion',          'Solve 100 problems',                       'crown',    'gold',   400, '{"type":"solve_count","count":100}'),
  ('easy_25',           'Warm Up',            'Solve 25 Easy problems',                   'flame',    'bronze', 75,  '{"type":"difficulty","difficulty":"Easy","count":25}'),
  ('medium_25',         'Steady Climber',     'Solve 25 Medium problems',                 'flame',    'silver', 150, '{"type":"difficulty","difficulty":"Medium","count":25}'),
  ('hard_10',           'Hard Mode',          'Solve 10 Hard problems',                   'flame',    'gold',   300, '{"type":"difficulty","difficulty":"Hard","count":10}'),
  ('streak_3',          'On Fire',            'Maintain a 3-day solving streak',          'flame',    'bronze', 50,  '{"type":"streak","days":3}'),
  ('streak_7',          'Week Warrior',       'Maintain a 7-day solving streak',          'flame',    'silver', 150, '{"type":"streak","days":7}'),
  ('streak_30',         'Unstoppable',        'Maintain a 30-day solving streak',         'flame',    'gold',   500, '{"type":"streak","days":30}'),
  ('daily_5',           'Daily Devotee',      'Complete 5 daily challenges',              'calendar', 'silver', 100, '{"type":"daily_count","count":5}'),
  ('daily_30',          'Daily Legend',       'Complete 30 daily challenges',             'calendar', 'gold',   400, '{"type":"daily_count","count":30}'),
  ('polyglot',          'Polyglot',           'Submit accepted solutions in 3 languages', 'code',     'silver', 100, '{"type":"languages","count":3}'),
  ('xp_1000',           'Rising Star',        'Earn 1,000 total XP',                      'sparkles', 'silver', 0,   '{"type":"xp","amount":1000}'),
  ('xp_5000',           'Code Champion',      'Earn 5,000 total XP',                      'sparkles', 'gold',   0,   '{"type":"xp","amount":5000}');