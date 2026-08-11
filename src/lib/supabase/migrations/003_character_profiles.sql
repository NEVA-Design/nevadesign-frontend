-- Character memory profiles — allows Neva to reproduce a FiveM character without a reference image
CREATE TABLE IF NOT EXISTS public.character_profiles (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,  -- Ultra-detailed identity card produced by GPT-4o Vision
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own character profiles
CREATE POLICY "Users manage own characters"
  ON public.character_profiles FOR ALL TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
