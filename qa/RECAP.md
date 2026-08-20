# Récap — Run qualité totale (20-21/08/2026)

4 itérations de capture (`../captures/qa/iter-1..5/`) + critique design adversariale (subagent indépendant, sur captures uniquement). 24 défauts instruits (`qa/DEFECTS.md`) + 11 réfutations du critique, toutes traitées ou explicitement assumées.

## Tableau des gates (verdicts finaux, preuves à l'appui)

| Gate | Critère | Verdict | Preuve |
|---|---|---|---|
| G1 | zéro média cassé | 🟢 | `report-iter-4.json` → media PASS (DOM + réseau, 13 pages dont /neva-design) ; critique R6 (logo-pavé gtavice à 390) corrigé — le pavé 82 % opaque est écarté de la rangée |
| G2 | zéro bord de fond net | 🟢 | voiles en aplat + masque commun en S (rampe 560 px/40 %) + fondu bas du hero 220 px + rais éteints près des bandeaux full-bleed ; `seams.mjs` iter-4 : seuls des échelons de CONTENU (tuiles, lettres bord-à-bord) subsistent ; crops ×4 : le drapé traverse les filets en continu (R1/R2 clos) |
| G3 | zéro placeholder brut | 🟢 | TODO_PSEUDO → cartes métier ; « 680×240 » → « DISCORD OFFICIEL » ; « — » orphelin de l'éditeur → « Enregistrement auto » (R9) ; « — € / mois + badge » = état designé (prix : Sami) |
| G4 | verre 4 points | 🟢 (réserve R8 assumée) | le critique confirme : réfraction du fond dans le tore et le V, liseré, teintes lilas-pêche dans l'épaisseur, silhouettes détachées ; réserve : bas de la jambe gauche du Λ sombre sous l'horizon |
| G5 | chargement sans frame morte | 🟢 | iter-4/5 load-frames : rideau vivant dès 2 s, compteur en progression CONTINUE (047→051→054→levée, mix ressources/asymptote — R3 clos), levée directement sur scène animée ~9 s, zéro frame étirée/floue/figée |
| G6 | rotation ≥ 10 °/s, parallax < 400 ms | 🟢 | tore : 11,32 °/s (iter-4), 11,38 (iter-2), 15,2 (smoke) ; parallax pointer lerp τ = 90 ms |
| G7 | hovers conformes | 🟢 | 7/7 captures iter-3 ; diffs pixel du critique : zéro déplacement de layout, scale ≤ ~1,02, effets cohérents par type |
| G8 | auth conformes Phase 4 | 🟢 | critique : « TIENT — rien trouvé » (bords sans cadre mesurés, zones chaudes ≤ 13 % de saturation, grain sans banding au boost ×5, sphère entière) |
| G9 | fps ≥ 55 + Lighthouse ≥ actuel | 🟢 | 100 fps headed (p95 10,1 ms — headless 4 fps = SwiftShader, non représentatif) ; Lighthouse mobile mêmes conditions : prod run 8 = 58 → ce run = 59, Speed Index 5,4→4,4 s (`qa/lh-mobile-*.json`) |
| G10 | 390/768/1440/2560 sans casse | 🟢 | R4 BLOQUANT (avis 390 débordant de 64 px — grid blowout) corrigé et re-mesuré (grille 310 px, étoiles entières, citation intacte) ; R5 (768 : sculpture sous les CTA) corrigé (pose + satellites < 1024 + palier poster 768/1536 créé) ; R10 (RECRUTEZ centré à 2560) corrigé (plafond 340 px) |

## Choix assumés (documentés, non comptés comme défauts)
- Étoiles de NOTATION dans la section avis : données d'avis (l'interdit « étoiles bannies » visait l'ornement décoratif pré-pivot) — choix run 8.
- Formules 01/02 de structure jumelle : sous-blocs d'une même section (pattern pricing), variation par le contenu.
- Réserve R8 : bas de jambe du Λ sombre sous l'horizon — matière du verre fumé, silhouette tenue par le liseré.
- Artefact de capture : les full-page montrent une couture au 1ᵉʳ viewport = canvas satin FIXE + stitching Playwright ; absent des frames scroll (viewport réel) — voir note du critique.

## Dépend de Sami
1. **Pseudos (± avatars) des 4 graphistes** — `src/data/team.json` + clés `studio.team.*` (i18n FR/EN). En attendant : cartes par métier.
2. **Avatars des 9 avis** — `/public/avatars/<slug>.webp` puis `AVATAR_FILES_READY = true` (GivreReviews.tsx). En attendant : initiales aurore.
3. **Prix Neva Generative** — `src/lib/generative/pricing.ts`. En attendant : « — € / mois · accès anticipé ».
4. **Arbitrage contenu** : « SANS CARTE BANCAIRE » sur /signup (le run 4 avait purgé cette promesse ; le pivot run 7-8 l'a réintroduite).

## Relancer les vérifications
```
node qa/capture.mjs --iter=N                 # tout le harnais (ou --only=..., --pages=...)
node qa/seams.mjs --iter=N                   # échelons de fond
node qa/archive-site.mjs --iter=N            # jeu standard ../captures/site/
BAKE_BASE=http://localhost:3001 node ../outillage/bake-poster.mjs [--only=768,1536]
BAKE_BASE=http://localhost:3001 node ../outillage/bake-poster-low.mjs [--only=...]
QA_DIST=1 npx next build && QA_DIST=1 npx next start -p 3010   # build isolé (Lighthouse) sans toucher la prod
```
⚠ Les posters doivent être re-bakés après TOUT changement de scène/pose ; le bake attend la phase de pose de référence via `window.__nevaQA` et bake les paliers < 1024 à la hauteur RÉELLE de la section. Baker deux fois si les fichiers d'un NOUVEAU palier n'existaient pas encore (les 404 du picture figent le micro-rideau dans la capture).
