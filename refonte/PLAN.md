# PLAN — Refonte frontend « niveau 50k »

Reprise après interruption : lire ce fichier + NOTES.md, vérifier la phase en cours ci-dessous, serveurs (front :3001, backend :4000 DEV_LOCAL_MODE), branche `refonte-50k`.

## Phase 0 — Recon & baseline
- [x] Digest des skills écrit dans NOTES.md (ui-ux-pro-max + frontend-design + AGENTS/CLAUDE.md repo)
- [x] Stack identifiée (NOTES.md) — aucune lib à ajouter
- [x] Branche `refonte-50k` + commit de l'état pré-refonte
- [x] Baseline : toutes pages × 390/768/1440/2560 → ../captures/qa/iter-baseline/ (copie → refonte/baseline/ à la fin de la capture)
- [x] Inventaire des patterns bannis (NOTES.md — inventaire visuel + greps)

## Phase 1 — Fondations (35 min)
- [x] Tokens verrouillés §4.1 (palette --noir-*, --ligne, --ivoire, --gris, --argent, --aurore-a/b)
- [x] Fontes : A/B/C display (Archivo / Anybody / Bricolage) sur le hero → choix justifié → Outfit supprimée du projet
- [x] Échelle typo §4.2 (H1 clamp 64→148, H2 40→76, body 16-17/1.6 65ch, mono 11-12 tracking .14em)
- [x] Grille 12 col / gouttière 24 / marges clamp(24,5vw,96) ; padding sections 140-180 ; aucun vide > 220px
- [x] Primitives : bouton (fond glissant + flèche 4px), lien (soulignement gauche→droite), input (ligne basse + label mono + erreur en ligne)
- [x] Grain film 1,2-2 % fixe ; une source de lumière par vue
- [x] Commit `feat(refonte): phase 1 — fondations`

## Phase 2 — Hero + matière 3D (65 min)
- [x] Verre : MeshPhysicalMaterial transmission 1.0 / thickness 1.2-2.5 / roughness .06-.12 / ior 1.5 / clearcoat 1 / dispersion si dispo
- [x] HDRI studio neutre PMREM + plan lumineux aurore derrière le monogramme
- [x] Vie : float 6-10px 6-8s + inertie souris lerp .06 + UNE mécanique scroll
- [x] Satellites : composition ou suppression ; sphères floues login/signup/CTA supprimées
- [x] DPR ≤ 2, pause hors viewport, budget 3D ≤ 3,5 Mo, jamais d'affichage avant 1er frame rendu
- [x] Typo hero recomposée (jeu de largeurs) + colonne Terrains en index mono
- [x] Commit phase 2

## Phase 3 — Tuer le template (80 min)
- [x] 02 Équipe : rangées éditoriales (index mono, filet, hover argent + visuel) — plus de cartes à pastilles
- [x] Process : timeline horizontale unique liée au scroll
- [x] Chips : rangée mono séparée par « · »
- [x] 03 Avis : lignes fines sans cartes, masque fondu, défilement lent pause hover, étoiles SVG dessinées
- [x] 04 Portfolio : marquee full bleed 2 rangées opposées, radius ≤ 6, hover scale 1.03 + légende mono ; trou comblé
- [x] 05 Enhance : cadre affiné, poignée ligne+pastille argent, auto-balayage
- [x] RECRUTEZ : mask scroll-driven, crop vérifié 4 viewports
- [x] 06 Terrains : filets verticaux, ( 01 ) display, légendes mono, cadres unifiés
- [x] 07 Modules : bento 2 tailles max, un seul badge « À venir » mono
- [x] 08 Stats : chiffres display massifs, filets verticaux, logos opacité .5→1
- [x] 09 Offres : colonnes éditoriales, prix display, features à filets, CTA pleine largeur ; grille bannières unifiée
- [x] 10 FAQ : filets, numéros mono, chevron 45°, réponses ≤ 65ch
- [x] CTA final : monogramme (échelle réduite) ou apothéose aurore — la sphère décorative dégage
- [x] Footer : colonnes sur grille, watermark raffiné
- [x] Commit phase 3

## Phase 4 — Motion system (50 min)
- [x] Tokens motion (--dur-1/2/3, --ease-out, --ease-inout, stagger 70ms)
- [x] Entrées : titres par lignes masquées, images scale 1.06→1 en masque ; jamais fade seul/blur-in
- [x] Un moment par section (02 déploiement, 04 démarrage décalé, RECRUTEZ mask, 08 compteurs, 09 prix composés)
- [x] 100 % des interactifs ont un hover travaillé ; nav état actif
- [x] Lenis lerp .08-.1 ; scrub sur moments prévus seulement
- [x] Transition de pages : overlay balayage + monogramme 0.6s (ou View Transitions)
- [x] Commit phase 4

## Phase 5 — Loader & reveal (25 min)
- [x] Manifest pondéré réel (fontes, HDRI, GLB, images hero) → 0-100
- [x] Compteur mono 000→100 + monogramme filaire/lumière
- [x] Reveal : fontes prêtes ET 1er frame 3D → chorégraphie ≤ 2,5 s
- [x] sessionStorage : complet 1×/session puis 400 ms
- [x] Commit phase 5

## Phase 6 — Pages secondaires (50 min)
- [x] Login/Signup/Forgot : split 50/50 formulaire éditorial / panneau matière ; sphère PNG morte ; « SANS CARTE BANCAIRE » supprimé
- [x] Dashboard toutes vues : tokens partout, covers projets (jamais d'initiales), stats display/mono, empty states filaires, sidebar filet argent
- [x] Éditeur : damier sombre fin, règles de coins, panneaux au système
- [x] Landings ×6 : colonne éditoriale home, 65ch, tableau à filets ; mentions gratuites supprimées
- [x] Vitrine + maintenance + home-en alignées, parité EN
- [x] Commit phase 6

## Phase 7 — Performance + QA finale (45 min)
- [x] Budgets : LCP < 2,5s, CLS < 0,05, TBT < 300ms, JS initial < 300KB gz, ≤ 2 fontes préchargées
- [x] 60 fps : transform/opacity only, will-change parcimonieux, zéro blur animé plein écran
- [x] Petits PC : tiering forcé testé (DPR 1, grain off, poster)
- [x] QA finale : toutes pages × 4 viewports → refonte/final/ ; notes 5 axes ≥ 9/10 dans RAPPORT.md
- [x] Vérifs pixel : zéro couture, zéro débordement, zéro texte < 11px, AA, grille
- [x] grep liste noire = 0 occurrence ; diff backend = vide
- [x] Commit phase 7 + RAPPORT.md livré

## Liste de démolition (inventaire phase 0 — à compléter)
- Pastille d'initiales : `avatar` badge.tsx/Sidebar + cartes projets fallback + admin
- ★ texte : src/app/avis/page.tsx:63
- Pills bordurées : chips GivreType/GivreFields + badges « À venir » multiples
- Police Outfit (--font-outfit / --font-display) : fonts.ts + globals.css + usages
- Sphères floues décoratives : login/signup/CTA (SatinSphere)
- Deux corrections produit : « SANS CARTE BANCAIRE », « 3 visuels offerts » → grep exhaustif à faire
