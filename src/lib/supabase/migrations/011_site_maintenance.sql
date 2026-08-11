CREATE TABLE IF NOT EXISTS site_maintenance (
  id TEXT PRIMARY KEY DEFAULT 'global' CHECK (id = 'global'),
  enabled BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL DEFAULT 'Maintenance en cours',
  message TEXT NOT NULL DEFAULT 'Neva AI revient dans quelques minutes. Merci pour ta patience.',
  allow_admin_access BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_maintenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read site maintenance" ON site_maintenance;
DROP POLICY IF EXISTS "Service role full access site maintenance" ON site_maintenance;
CREATE POLICY "Public read site maintenance" ON site_maintenance FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role full access site maintenance" ON site_maintenance FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO site_maintenance (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;
