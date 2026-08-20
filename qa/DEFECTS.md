# DEFECTS — Run qualité totale (démarré le 20/08/2026)

Statuts : `OUVERT` → `CORRIGÉ (non vérifié)` → `VÉRIFIÉ` (preuve re-capture) / `NON REPRO` (résolu avant ce run, preuve à l'appui) / `DÉPEND DE SAMI`.

Captures : `../captures/qa/iter-<N>/`. Rapport auto : `qa/report-iter-<N>.json`. Mesure des marches : `qa/seams.mjs`.

## Défauts signalés (calibrage du 20/08 17 h)

| N° | Page | Défaut | Preuve initiale | Cause racine | Correctif appliqué | Statut |
|---|---|---|---|---|---|---|
| D01 | /login /signup /forgot | Fond boueux marron-violet + banding ; sphère recouverte ; cadre hairline viewport | `iter-1/full-login-1440.png` | empilement dawn-calm + caustiques + rais + halos inline 0.20-0.21 (vieilles teintes) sur satin sous-échantillonné ; cadre login:83-87 ; sphère derrière la carte | Phase 4 : `pv-auth-bg` (satin voilé 72 % + UN champ aurore 5-6 %), `pv-auth-card` (4 %/12 %/top-light), `.pv-field` spec (3 %/10 %/ring aurore 2 px), cadre supprimé, sphère ENTIÈRE identique ×3 pages | CORRIGÉ (vérif iter-2) |
| D02 | home §03 avis | Pull-quote vide | `iter-1/slices/home-1440-s01.jpg` : affichée | reveal `once:true` fonctionne au scroll naturel ; l'état vide du 20/08 non reproduit | rotation 6 s + clic déjà en place ; surveillé | NON REPRO (surveillé iter-2) |
| D03 | home marquee | Doublons d'artwork visibles (REWIND ×2, TICKETS ×2 inter-rangées) ; « tuile grise vide » | `iter-1/slices/home-1440-s02.jpg` + planche `marquee-tiles.png` | pack_19 = même artwork TICKETS que pack_15 (rangée A) ; pack_3 = même REWIND que pack_9 (même rangée) ; pas de tuile vide constatée | ROW_B : pack_19→pack_455 (New Paradise), pack_3→pack_4_1 (Essential V) — plus jamais deux fois le même artwork à l'écran | CORRIGÉ (vérif iter-2) |
| D04 | home §06 (01) | Image principale vide | `slices/home-1440-s03.jpg` : VIBE affichée | résolu run 8 | — | NON REPRO |
| D05 | home Scènes GTA | 3 slots vides | `slices/home-1440-s06/s07.jpg` : affichés | résolu run 8 | — | NON REPRO |
| D06 | home modèles Discord | 4 previews vides | `slices/home-1440-s07.jpg` : 6/6 affichées | SVG créés run 8 21h07 | — | NON REPRO |
| D07 | home transitions | Bords horizontaux nets | `scroll-home-03/04/06/10.png` + crops ×3,2 (`seam-*.png`) | (a) couches lumineuses (caustiques, rais, radiaux) SANS fondu vertical → valeur pleine au bord de section ; (b) voiles 420 px dégénérés sur sections < 840 px (stops croisés — la « bande RECRUTEZ ») ; (c) le cyclorama hero s'arrêtait NET en bas de section | voiles en APLAT + masque commun en S (`.pv-scene > couches`, min(420px, 32 %)) ; fondu bas du hero 220 px vers le noir de page | CORRIGÉ (seams.mjs iter-2 fera foi) |
| D08 | dashboard | Décor coupé, sidebar courte | `scroll-dash-projets-01.png`, `scroll-admin-overview-01.png` : décor continu, sidebars pleine hauteur | résolu run 8 (fixed) | — | NON REPRO |
| D09 | hero 3D | Tore mord la colonne texte ; monogramme graphite | `slices/home-1440-s00.jpg` (~40 px de chevauchement) | RING_X trop à gauche pour le frustum 1440 ; verre trop absorbant | RING_X −0,92→−0,42 (marge mesurée ~75-80 px sur smoke) ; verre ravivé : attenuation 1,6→2,4 + #d9cdf2, env 1,7→2,2, iridescence 0,16, roughness 0,08 | CORRIGÉ (vérif iter-2) |
| D10 | module Brand | Pastille vert acide + 4 hex bleutés | code + `scroll-home-10.png` | `#C7F464` etc. (vestiges site clair) | palette [#B8A1E8, #F0C5A8, #F2EFE9, #2E2E30, #0B0B0B] ; panneau brief & bulle chat en verre sombre ; pill « Composer » lisible (texte noir sur ivoire) ; séparateurs blancs | CORRIGÉ |
| D11 | §08 logos | Logos quasi invisibles, trous, logo coupé | `slices/home-1440-s06.jpg` | PNG « ink » #2B2450 (site clair d'avant le pivot) sur #060606 ; largeurs libres | `ivory/` générés (outillage/logos-ivory.mjs) ; opacité 45 %→70 % hover ; encombrement fixe h-7×w-20 centré | CORRIGÉ (vérif iter-2) |
| D12 | chargement | Rideau mort 8 s → poster figé « zoomé/flou » → départ tardif ; objets escargots | `iter-1/load-frames/` | rideau SSR statique jusqu'à l'hydratation ; l'ouverture sortait sans attendre le canvas ; rotation 4,3 °/s max ; parallax inexistante | chorégraphie CSS dès le premier paint + compteur inline sur resource timings + f(t) JS en temps ABSOLU ; l'ouverture attend `marks.canvas` (filet 4 s) ; 2 frames de chauffe canvas masqué ; tore 12 °/s, flottements 6-10 px / 4,6-5,6 s, mono ±19°/9 s, parallax τ=90 ms | VÉRIFIÉ (iter-2 load-frames : compteur 055 à 2 s, levée sur scène animée à 9 s, zéro frame figée ; tore mesuré 15,2 °/s ; 100 fps headed p95 10,1 ms) |

## Défauts additionnels (audit iter-1)

| N° | Page | Défaut | Correctif appliqué | Statut |
|---|---|---|---|---|
| D13 | home §02 | `TODO_PSEUDO_1..4` affichés (G3) | cartes par MÉTIER (rôle + mission + initiales de rôle), i18n FR/EN ; pseudos réels à fournir | CORRIGÉ — pseudos réels DÉPEND DE SAMI |
| D14 | home §03 | 9 avatars en 404 réseau | `AVATAR_FILES_READY=false` → initiales directes, zéro requête ; fichiers réels à fournir | CORRIGÉ — avatars DÉPEND DE SAMI |
| D15 | /neva-design | 9 logos portfolio `.png` inexistants | chemins en `.webp` ; `/neva-design` ajoutée au test médias du harnais | CORRIGÉ (preuve iter-2) |
| D16 | site EN | 25 clés supposées manquantes | faux positif (diff réel : 0) ; +8 clés `studio.team.*` FR/EN ajoutées pour les nouvelles cartes | NON REPRO |
| D17 | /forgot-password | pas de sphère (famille incohérente) | sphère ajoutée, position identique ×3 | CORRIGÉ |
| D18 | home rail | FAQ absente du rail | le rail actuel a déjà 10 entrées | NON REPRO |
| D19 | mesure fps | 22 fps headless (SwiftShader) | mesure headed : 100 fps avg, p95 10,1 ms ; harnais force `?scene-tier=high` en headless | VÉRIFIÉ |
| D20 | modèles Discord | « 680×240 » écrit dans minimal-ink.svg (G3) | « DISCORD OFFICIEL » | CORRIGÉ |
| D21 | home CTA final | sphère « coupée », lueurs brunes | sphère en fait ENTIÈRE (artefact de tranche compressée) ; teintes migrées | NON REPRO / CORRIGÉ |
| D22 | home §07 | panneau brief gris béton, mockups délavés | brief + bulle en verre sombre ; carte Character conservée (seul accent clair du bento) | CORRIGÉ |
| D23 | harnais | 4 cibles hover introuvables | `data-qa` posés (cta ×2, marquee-tuile, avis-ligne, modele-carte) | CORRIGÉ (re-run iter-2) |

## Transverse
- Palette verrouillée : 239 occurrences des vieilles teintes aurore (#A48BE8/#EFB894 et rgba 164,139,232 / 239,184,148) migrées vers #B8A1E8/#F0C5A8 dans 46 fichiers.
- `.pv-field` unifiée : le même champ partout (auth comprise, où `nv-field` était inerte).

## Dépend de Sami
1. Pseudos (et avatars éventuels) des 4 graphistes — `src/data/team.json` (+ `studio.team.*` i18n).
2. Avatars des 9 avis — `/public/avatars/<slug>.webp` puis `AVATAR_FILES_READY=true` (GivreReviews.tsx).
3. Prix des 2 formules Neva Generative — `src/lib/generative/pricing.ts` (les cartes affichent « — € / mois · accès anticipé » en attendant).
