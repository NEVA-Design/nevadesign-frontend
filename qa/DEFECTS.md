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
| D23 | harnais | 4 cibles hover introuvables | `data-qa` posés (cta ×2, marquee-tuile, avis-ligne, modele-carte) ; 6/7 capturés iter-2, tuile-marquee = scroll à la section (l'animation empêchait scrollIntoView) | CORRIGÉ |
| D24 | home 390 (audit iter-2) | sphère + bille en lévitation ET sommet du monogramme mordaient le paragraphe du hero mobile | mobile < 600 px : sphère POSÉE au sol derrière l'épaule (figure du CTA final), bille redescendue, pose caméra 390 reculée/relevée (z 13,2→14,6, look.y 0,45→0,95) ; posters re-bakés (le tore recentré l'exigeait aussi en desktop) | CORRIGÉ (preuve mobile-hero-d24-v3) |

## Critique design adversariale (subagent, instructions fraîches — sur captures iter-2/3)

Verdict initial : G2, G5, G10 tombaient, G1 sur un point. 11 réfutations (1 bloquant, 5 majeurs, 5 mineurs) — traitement :

| Réf | Gate | Constat du critique | Correctif | Statut |
|---|---|---|---|---|
| R1 | G2 | marche de MATIÈRE au filet bas du marquee (drapé lavé dans le bandeau, nu en dessous) | rampe du masque commun 420 px/32 % → 560 px/40 % + rais de GivreCreations éteints sur la moitié basse | CORRIGÉ (crop ×4 : le pli traverse le filet en continu) |
| R2 | G2 | même marche à l'entrée/sortie du bandeau RECRUTEZ | même correctif (rampe longue) | CORRIGÉ (crop ×4) |
| R3 | G5 | compteur du rideau quasi gelé en Fast 3G (055→058 sur 6 s) | plancher asymptotique temporel 60×(1−e^(−t/5,2 s)) sous le plafond « part réseau » 60 — monte en continu | CORRIGÉ |
| R4 | G10 **BLOQUANT** | avis 390 : citation coupée en plein mot, 5ᵉ étoile tronquée (débordement 64 px) | grid blowout : `grid-cols-[minmax(0,1fr)]` en base (la colonne refusait de descendre sous le min-content des lignes truncate) ; même garde posée sur la FAQ | CORRIGÉ (mesuré : grille 310 px, zéro débordement) |
| R5 | G10 | 768 : pastille + CTA posés SUR le monogramme | pose 600-1023 reculée/relevée (z 12,6→14,2, look.y 0,52→1,0), satellites traités < 1024, palier POSTER 768/1536 dédié (le poster 390 servi aux tablettes recadrait ×1,9 en cover) | CORRIGÉ (capture 768 : sculpture dans sa fenêtre) |
| R6 | G1 | logos 390 : un « bloc blanc » + fantômes | gtavice retiré (pavé 82 % opaque, indétourable — rejoint astologo/Dlogo) ; gaps mobiles resserrés | CORRIGÉ |
| R7 | G6 | rapport iter-3 sans mesures, rotation 11,38 °/s « sous 11,4 » | itération 4 re-mesure tout (spec = ≥ 10 °/s : 11,38 passe) | CORRIGÉ (iter-4) |
| R8 | G4 | bas de la jambe gauche du Λ quasi noir, liseré local éteint | réserve ASSUMÉE (le critique valide les 4 points G4 par ailleurs) | ASSUMÉ |
| R9 | G3 | « — » orphelin dans la barre de l'éditeur | état initial de l'indicateur de sauvegarde → « Enregistrement auto » | CORRIGÉ |
| R10 | DA | RECRUTEZ centré avec ±670 px de marges à 2560 | plafond de fonte 260 → 340 px (bord-à-bord restauré aux grands viewports) | CORRIGÉ |
| R11 | DA | Formules 01/02 de structure identique | sous-blocs d'une MÊME section (pattern pricing), variation par le contenu — choix assumé | ASSUMÉ |
| — | DA | étoiles dans la section avis vs interdit historique « étoiles bannies » | l'interdit visait l'ornement décoratif pré-pivot ; les étoiles de NOTATION du run 8 sont des données d'avis — choix assumé run 8 | ASSUMÉ |
| — | contenu | « SANS CARTE BANCAIRE » sur /signup (le run 4 l'avait éradiqué) | régression de CONTENU du pivot run 7-8 → arbitrage produit | DÉPEND DE SAMI |

Note méthodo du critique (confirmée) : les captures **pleine page** montrent une couture au 1ᵉʳ viewport — c'est le canvas satin FIXE non repeint par le stitching de Playwright, un artefact de capture absent des frames scroll (viewport réel).

## Transverse
- Palette verrouillée : 239 occurrences des vieilles teintes aurore (#A48BE8/#EFB894 et rgba 164,139,232 / 239,184,148) migrées vers #B8A1E8/#F0C5A8 dans 46 fichiers.
- `.pv-field` unifiée : le même champ partout (auth comprise, où `nv-field` était inerte).

## Dépend de Sami
1. Pseudos (et avatars éventuels) des 4 graphistes — `src/data/team.json` (+ `studio.team.*` i18n).
2. Avatars des 9 avis — `/public/avatars/<slug>.webp` puis `AVATAR_FILES_READY=true` (GivreReviews.tsx).
3. Prix des 2 formules Neva Generative — `src/lib/generative/pricing.ts` (les cartes affichent « — € / mois · accès anticipé » en attendant).
