CREATE TABLE IF NOT EXISTS neva_design_portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Logos', 'Packs', 'Branding', 'Affiches', 'FiveM')),
  tag TEXT NOT NULL DEFAULT 'FiveM',
  image_path TEXT,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  layout TEXT NOT NULL DEFAULT 'normal' CHECK (layout IN ('normal', 'tall', 'wide')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE neva_design_portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active Neva Design portfolio" ON neva_design_portfolio;
DROP POLICY IF EXISTS "Service role full access Neva Design portfolio" ON neva_design_portfolio;

CREATE POLICY "Public read active Neva Design portfolio" ON neva_design_portfolio
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Service role full access Neva Design portfolio" ON neva_design_portfolio
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
