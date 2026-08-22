# RAPPORT — Refonte frontend « niveau 50k »

Session unique du 22/08/2026 · branche `refonte-50k` · 9 commits · baseline → final : `refonte/baseline/` vs `../captures/qa/iter-final/` (52 captures, 13 écrans × 4 viewports).

## Ce qui a changé (avant → après, par section)

**Fondations (phase 1)**
- Avant : Outfit light arrondie (« typo sans tension »), Geist en body, accents en dégradé aurore sur le texte, focus/liserés/jauges lilas, radius 10-22, body 15 px.
- Après : **Archivo variable** (une seule famille texte, axe wdth 62-125) — condensé light gris contre **expanded 640 ivoire** : l'accent est dimensionnel, jamais coloré. Échelle verrouillée §4.2 (hero 64→148 px lh 0,95, H2 40→76, H3 24→34, body 16). L'aurore chassée de TOUT l'UI (focus, sélection, jauges, liserés, ticks → **argent #C8CBD0**) : elle ne vit plus qu'en lumière. Radius resserrés 6/10/14/18 (boutons 14 conservés). Primitives : input LIGNE BASSE focus argent + label mono + erreur en ligne, ghost à FOND GLISSANT, lien 0.3 s, `.pv-tag-row`, `.pv-soon-badge` (LE badge unique du site).

**01 Hero + 3D (phase 2)**
- Avant : monogramme ΛV en TISSU ivoire monochrome (zéro couleur dans la page), titre 3 lignes ~84 px, pill « 5/5 », liste Terrains en simple texte.
- Après : **le VERRE revient** — recette joaillerie limpide (transmission 1, roughness .08, dispersion .32, clearcoat, attenuation lilas pâle) ; le **plan lumineux aurore** monte derrière la pièce (lobe central élargi + nappe CSS renforcée B9A7DA/E9C6A2) : la seule couleur de la page vit dans le verre. Titre monumental 148 px en 2 lignes (mesure 760 px), caméra décalée (la sculpture au tiers droit), preuve 5/5 en ligne mono, Terrains en index à filets + filet argent actif. 12 posters WebP + AVIF re-bakés (pose déterministe).

**02 Studio (phase 3)** — le cœur du template, tué
- Avant : 7 pills bordurées, 4 cartes identiques à PASTILLES D'INITIALES, process en 4 boîtes grises, vide 350 px.
- Après : tags mono séparés « · » ; **registre équipe pleine largeur** (index mono ( 01—04 ), métier en display, filet inférieur, hover : rangée illuminée + filet argent + **visuel du métier révélé qui suit le curseur**) ; **ligne temporelle** unique (rail rempli au scroll, 4 étapes, éveil par étape) ; rythme recalé (jonctions ≤ 214 px).

**03 Avis** — Avant : registre statique, avatars-initiales, étoiles pêche. Après : **défilement vertical lent** (46 s) sous masque de fondu haut/bas, pause au survol, clic = citation ; pastilles mortes (pseudo mono + filet) ; étoiles au trait ARGENT ; citation en display. Robustesse D02 : l'état de repos de la citation est PLEIN (fill retiré).

**04 Portfolio** — gap 16 px constant, radius 6 uniforme, **légende mono (client · type)** qui monte au survol, trou noir comblé (folio resserré). 2 rangées opposées conservées.

**05 Enhance** — cadre AFFINÉ (hairline, radius 6-8 ; l'arête chrome et le panneau verre sont morts), **poignée ligne + pastille argent**, cartels aux coins, **auto-balayage** sinus 9 s tant que non-saisi, badge unifié.

**06 Terrains** — ( 0n ) affirmés en display 28-40 px, **filet vertical** texte/média, légendes mono SOUS les visuels, titres au système.

**07 Modules** — bento discipliné **2 tailles (8/4)**, badge « À venir » unique (mono + point argent, coin haut droit), radius 10, opacité 70, titre au système.

**08 Stats** — chiffres en **display expanded massif** (44→76 px, tabular), suffixes légers, marquee logos réparé (3 copies — la boucle sautait), logos 50→100 % au survol.

**09 Offres** — **colonne tarifaire éditoriale** : filet haut fort, « Prix à l'ouverture » en mono + UN badge accès anticipé, features en lignes à filets (les puces sont mortes), CTA pleine largeur. Les cartes de verre sont mortes.

**10 FAQ** — croix fine qui tourne à 45°, réponses ≤ 65ch, filets/numéros conservés.

**CTA final + Footer** — la sphère décorative est MORTE → **apothéose aurore** en respiration lente (le moment de lumière le plus intense) ; watermark ΛV passé AU TRAIT ; titre colophon 48→104 px.

**Motion (phase 4)** — tokens verrouillés (--dur-1/2/3, --ease-out/inout) ; titres par lignes masquées (RevealMask) partout ; images 1.06→1 ; **transitions de pages** (balayage noir + monogramme 0,6 s, chorégraphie par timers — jamais dépendante d'animationend) ; **nav avec état actif** (IntersectionObserver, filet argent) ; Lenis lerp 0.1.

**Loader (phase 5)** — l'existant satisfait le protocole : progression RÉELLE multi-phases (DOM 20 / fontes 25 / poster 25 / scène 30) avec compteur pré-hydratation (resource timings), monogramme trait→verre en f(t) absolu, reveal ≤ 1,8 s à cache chaud, micro-rideau 320 ms dès la 2e vue. Vérifié en session vierge.

**Pages secondaires (phase 6)** — auth en **split 50/50** (formulaire éditorial / panneau-œuvre verre + nappe aurore), fix autofill Chrome ; **UN style d'input partout** (la surcharge dashboard retirée) ; covers projets = **motif de palette** ou monogramme filaire (plus d'initiales, profil compris) ; tick sidebar argent ; anneau de crédits fin 2 px argent ; damier éditeur 8 px/2 % + repères de coins ; empty states filaires ; éditorial des landings au système (tokens globaux).

**Corrections produit obligatoires** — « SANS CARTE BANCAIRE » : déjà à zéro (vérifié par grep). « Créer mes 3 visuels offerts » (landings) → « Découvrir Neva Generative » ; messages « créations offertes » du shell reformulés en factuel.

**Cohérence typographique** — 76 chaînes affichées passées aux apostrophes typographiques (i18n FR + EN + fallbacks des sections).

## Budgets performance (mesurés)

- **JS initial : ~281 KB gz** (545 KB au total dont le chunk three 264 KB parti à t≈1,3 s, APRÈS le first paint — lazy conforme). Budget < 300 KB ✓
- **Fontes : 2 préchargées** (Archivo variable ; Geist Mono en swap non préchargée). ✓
- **Poids 3D : 0 GLB / 0 HDRI fichier** — géométrie extrudée + environnement PMREM généré + textures peintes en code ; posters 30-160 Ko. Budget ≤ 3,5 Mo ✓
- **Tier petits PC PROUVÉ** : `?scene-tier=low` → zéro canvas monté, poster AVIF verre opacité 1, micro-parallaxe CSS. Descente automatique sous 30 fps (2 fenêtres) inchangée. DPR plafonné 1,5 (plus strict que le ≤ 2 demandé).
- **Build de production : exit 0** (`next build`, QA_DIST).
- Animations : transform/opacity uniquement (contrôlé sur les nouvelles — rail scaleX, voile scaleY, marquee translate3d, révélations clip-path/scale).
- LCP/CLS/TBT : la structure LCP (poster hero fetchPriority=high + sous-titre SSR) et l'hydratation sélective par Suspense sont inchangées du run 3 (Lighthouse 58-59 mobile mesuré alors) ; non re-mesurés au Lighthouse dans cette session — à re-passer en staging (noté ci-dessous).

## Notes finales par page (5 axes /10 : harmonie · typographie · composants · motion · matière-lumière)

Chaque écran inspecté sur capture réelle (52 fichiers `refonte/final/`, crops zoomés pour hero/02/03/06/08/09, plus passes MCP viewport pour hovers, tier low et maintenance). Corrections faites EN COURS de QA : citation avis invisible (fill D02), « · » mobiles, doublon index Terrains, pastilles admin/settings, barres du graphe admin, nav active au hero, sphères maintenance/404, split 50/50 auth, autofill, poster 768 AVIF tissu résiduel.

| Écran | Harmonie | Typo | Composants | Motion | Matière-lumière |
|---|---|---|---|---|---|
| home FR (4 vp) | 9,5 | 9,5 | 9 | 9,5 | 9,5 |
| home EN | 9,5 | 9,5 | 9 | 9,5 | 9,5 |
| vitrine /neva-design | 9 | 9,5 | 9 | 9 | 9 |
| login | 9,5 | 9 | 9,5 | 9 | 9 |
| signup | 9,5 | 9 | 9,5 | 9 | 9 |
| forgot-password | 9 | 9 | 9,5 | 9 | 9 |
| dashboard projets | 9,5 | 9,5 | 9,5 | 9 | 9 |
| page projet | 9 | 9 | 9 | 9 | 9 |
| éditeur | 9 | 9 | 9,5 | 9 | 9 |
| paramètres | 9 | 9 | 9,5 | 9 | 9 |
| abonnement | 9 | 9 | 9 | 9 | 9 |
| ressources | 9 | 9 | 9 | 9 | 9 |
| admin | 9 | 9,5 | 9 | 9 | 9 |
| landings ×6 | 9 | 9 | 9 | 9 | 9 |
| maintenance | 9 | 9,5 | 9 | 9 | 9 |

Vérifications pixel de la passe : zéro couture de sections (masques satin communs conservés + jonctions ≤ 214 px), zéro débordement horizontal (390 vérifié : scrollWidth = innerWidth), zéro texte < 11 px dans les nouveaux composants (plancher mono 9,5 px UNIQUEMENT sur micro-cartels d'images, héritage documenté — corps de texte ≥ 13,5 px AA), alignements sur la grille du cadre éditorial (--frame-inset partagé).

## Backend — intact

Aucun fichier de `nevadesign-backend/` modifié par cette session (aucune commande d'écriture n'y a été exécutée). Le `git status` du backend montre des modifications PRÉ-EXISTANTES du run 12 (BACK-006, non commitées avant cette session) : `.env.example`, `src/config/env.ts`, `src/db/schema.sql`, `src/index.ts`, `src/lib/credits.ts` — laissées strictement en l'état.

Contrainte découverte : `CORS_ORIGIN=http://localhost:3000` (cookies HttpOnly run 12) — le front dev DOIT tourner sur **:3000** pour que l'auth locale fonctionne. Le serveur de cette session y tourne.

## Reste à faire / hors périmètre

1. **FAQ q2 & q4** : les réponses décrivent l'offre d'AVANT le pivot studio (« plan Découverte », « Creative Director » actif). Contenu métier — à réécrire par Sami (le protocole conserve le sens des textes).
2. **Lighthouse complet** (mobile 4G) à re-passer en staging — la session a mesuré les poids réseau et prouvé le lazy 3D, pas re-simulé le LCP Lantern.
3. **Avatars réels de l'équipe** (team.json pseudo/avatar null) : les rangées 02 les recevront sans changement de code.
4. **Prix Neva Generative** (GENERATIVE_PRICING null) : « Prix à l'ouverture » designé en attendant.
5. Le fond satin (SoieNoire) et la charte docs/GIVRE.md décrivent encore l'ancien vocabulaire par endroits — docs à rafraîchir (aucun impact rendu).
