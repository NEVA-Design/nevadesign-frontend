ALTER TABLE signup_attempts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Allow public insert signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Service role full access signup attempts" ON signup_attempts;
CREATE POLICY "Service role full access signup attempts" ON signup_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS signup_security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  matching_user_ids UUID[] NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'allowed' CHECK (status IN (
    'allowed',
    'blocked',
    'pending_review',
    'approved_by_admin',
    'rejected_by_admin'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ
);

ALTER TABLE signup_security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access signup security events" ON signup_security_events;
CREATE POLICY "Service role full access signup security events" ON signup_security_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS signup_security_events_status_idx ON signup_security_events(status);
CREATE INDEX IF NOT EXISTS signup_security_events_user_id_idx ON signup_security_events(user_id);
CREATE INDEX IF NOT EXISTS signup_security_events_ip_address_idx ON signup_security_events(ip_address);
CREATE INDEX IF NOT EXISTS signup_attempts_ip_user_idx ON signup_attempts(ip, user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, credits, plan)
  VALUES (NEW.id, 0, 'free')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
