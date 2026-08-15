-- Removes the "3 free creations at signup" promotion (15/08/2026).
-- Découverte plan no longer grants any credits on signup; the column
-- default reverts to 0 to match. Existing balances are NOT touched.

ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 0;

-- FREE_SIGNUP_CREDITS is now 0 in lib/signup-security.ts (both repos).
-- grantSignupCreditsOnce() still runs (anti-abuse review logic stays
-- intact) but grants 0 credits and logs a 0-amount signup_bonus row.
