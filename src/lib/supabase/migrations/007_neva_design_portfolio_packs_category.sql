UPDATE neva_design_portfolio
SET category = 'Packs'
WHERE category = 'Landing Pages';

ALTER TABLE neva_design_portfolio
  DROP CONSTRAINT IF EXISTS neva_design_portfolio_category_check;

ALTER TABLE neva_design_portfolio
  ADD CONSTRAINT neva_design_portfolio_category_check
  CHECK (category IN ('Logos', 'Packs', 'Branding', 'Affiches', 'FiveM'));
