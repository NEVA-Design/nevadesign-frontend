-- Global anonymized character style pool
-- Feeds the composition engine with accumulated archetype knowledge
CREATE TABLE IF NOT EXISTS public.character_style_pool (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype    TEXT NOT NULL,           -- e.g. 'luxury_male_suit', 'lspd_officer', 'street_female'
  style_tags   TEXT[] NOT NULL DEFAULT '{}',
  description  TEXT NOT NULL,           -- anonymized style fragment (no user PII)
  times_used   INT NOT NULL DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Only service role can write to this table — no direct user access
ALTER TABLE public.character_style_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on style pool"
  ON public.character_style_pool FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for fast archetype lookups
CREATE INDEX IF NOT EXISTS idx_style_pool_archetype ON public.character_style_pool (archetype);
CREATE INDEX IF NOT EXISTS idx_style_pool_tags ON public.character_style_pool USING GIN (style_tags);
