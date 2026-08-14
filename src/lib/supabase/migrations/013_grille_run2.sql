-- Grille tarifaire run 2 (14/08/2026) — décision business client.
-- Découverte : 3 créations offertes à l'inscription (one-shot).
-- Le montant réel est accordé côté serveur (FREE_SIGNUP_CREDITS = 3
-- dans lib/signup-security.ts) ; le default de colonne s'aligne.
-- Les soldes existants ne sont PAS retouchés.

ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 3;

-- Aucun autre changement de données : les nouveaux prix (Creator
-- 24 € / 12, Studio 59 € / 25, Agence 129 € / 45, recharges
-- 10 → 29 €, 30 → 87 €, 100 → 290 €, packs de création 39/89/149 €)
-- vivent dans Stripe (nouveaux produits/prix à créer) et dans le
-- code (lib/plans.ts, lib/resources.ts).
