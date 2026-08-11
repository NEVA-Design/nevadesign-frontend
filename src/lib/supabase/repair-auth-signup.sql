-- Run this in the Supabase SQL editor for the production project.
-- It repairs the signup tables, RLS policies, and auth trigger used by Neva AI.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  credits INTEGER NOT NULL DEFAULT 5,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_histories (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  messages JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  email TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read signup attempts" ON public.signup_attempts;
DROP POLICY IF EXISTS "Allow public insert signup attempts" ON public.signup_attempts;
DROP POLICY IF EXISTS "Service role full access signup attempts" ON public.signup_attempts;
CREATE POLICY "Allow public read signup attempts"
  ON public.signup_attempts FOR SELECT
  TO anon, authenticated
  USING (true);
CREATE POLICY "Allow public insert signup attempts"
  ON public.signup_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Service role full access signup attempts"
  ON public.signup_attempts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role full access transactions" ON public.credit_transactions;
CREATE POLICY "Users read own transactions"
  ON public.credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access transactions"
  ON public.credit_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users read own chat history" ON public.chat_histories;
DROP POLICY IF EXISTS "Users update own chat history" ON public.chat_histories;
DROP POLICY IF EXISTS "Users insert own chat history" ON public.chat_histories;
DROP POLICY IF EXISTS "Service role full access chat histories" ON public.chat_histories;
CREATE POLICY "Users read own chat history"
  ON public.chat_histories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users update own chat history"
  ON public.chat_histories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own chat history"
  ON public.chat_histories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access chat histories"
  ON public.chat_histories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, credits, plan)
  VALUES (NEW.id, 0, 'free')
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.increment_credits(user_id UUID, amount INTEGER)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
  SET credits = credits + amount, updated_at = NOW()
  WHERE id = user_id;
$$;

INSERT INTO public.profiles (id, credits, plan)
SELECT id, 5, 'free' FROM auth.users
ON CONFLICT (id) DO NOTHING;
