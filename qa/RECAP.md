# Récap — Run qualité totale (20/08/2026)

_(rempli au fil des vérifications ; version finale après la critique adversariale)_

## Tableau des gates

| Gate | Critère | Verdict | Preuve |
|---|---|---|---|
| G1 | zéro média cassé | 🟢 PASS | `qa/report-iter-2.json` → media.verdict = PASS (DOM + réseau, 13 pages, /neva-design incluse) |
| G2 | zéro bord de fond net | 🟢 | voiles en aplat + masque en S + fondu bas hero ; crops ×3,2 avant/après (`captures/qa/iter-2/scroll-*`) ; échelons restants = contenu (cartes, filets, lettres bord-à-bord) |
| G3 | zéro placeholder brut | 🟢 | TODO_PSEUDO → cartes métier ; « 680×240 » → « DISCORD OFFICIEL » ; aucune boîte vide (iter-2) ; « — € / mois » = état designé (prix Sami) |
| G4 | verre 4 points | 🟢 (à contre-vérifier par la critique) | fond réfracté visible (tore/V), liserés, teintes lilas-pêche dans l'épaisseur, silhouettes détachées — `smoke-hero-p3.png`, full-home iter-2 |
| G5 | chargement sans frame morte | 🟢 | `captures/qa/iter-2/load-frames/` : rideau vivant à 2 s (compteur 055), levée à 9 s directement sur scène animée, zéro frame étirée/floue/figée |
| G6 | rotation ≥ 10 °/s, parallax < 400 ms | 🟢 | tore mesuré 15,2 °/s (smoke) et 11,38 °/s (harnais iter-2) ; parallax lerp τ = 90 ms (< 400 ms de convergence) |
| G7 | hovers conformes | 🟢 | 7 captures hover iter-2/3 : aucun déplacement de layout, effets par type cohérents |
| G8 | auth conformes Phase 4 | 🟢 | `full-login/signup/forgot-*.png` iter-2 : fond calme, carte spec, sphère entière, zéro cadre |
| G9 | fps ≥ 55 + Lighthouse ≥ actuel | 🟢 | 100 fps headed (p95 10,1 ms) ; Lighthouse mobile mesuré dans les mêmes conditions : prod actuelle (état run 8, port 3000) = **58**, ce run (build isolé .next-qa) = **59**, Speed Index 5,4 s → 4,4 s — aucune régression (`qa/lh-mobile-qa.json` / `qa/lh-mobile-ref3000.json` ; le « 79 » de la mémoire datait d'avant la soie du run 8) |
| G10 | 390/768/1440/2560 sans casse | 🟢 | full-* iter-2 aux 4 viewports ; D24 (chevauchement hero mobile) corrigé + posters re-bakés |

## Avant / après (DEFECTS)
Voir `qa/DEFECTS.md` — 24 défauts instruits : 12 du calibrage (7 corrigés, 5 non repro avec preuve), 12 de l'audit élargi.

## Dépend de Sami
1. **Pseudos de l'équipe** (et avatars) — `src/data/team.json` + clés `studio.team.*` (i18n FR/EN). En attendant : cartes par métier.
2. **Avatars des 9 avis** — `/public/avatars/<slug>.webp` puis `AVATAR_FILES_READY = true` dans `GivreReviews.tsx`. En attendant : initiales aurore.
3. **Prix Neva Generative** — `src/lib/generative/pricing.ts` (`gta.price`, `banner.price`). En attendant : « — € / mois · accès anticipé ».

## Relancer les vérifications
```
node qa/capture.mjs --iter=N          # tout le harnais
node qa/capture.mjs --only=load --iter=N
node qa/seams.mjs --iter=N            # marches de fond
node qa/archive-site.mjs --iter=N     # jeu standard ../captures/site/
BAKE_BASE=http://localhost:3001 node ../outillage/bake-poster.mjs      # posters (phase déterministe)
BAKE_BASE=http://localhost:3001 node ../outillage/bake-poster-low.mjs
```
