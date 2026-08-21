# PLAN — Refonte frontend « niveau 50k »

Reprise après interruption : lire ce fichier + NOTES.md, vérifier la phase en cours ci-dessous, serveurs (front :3001, backend :4000 DEV_LOCAL_MODE), branche `refonte-50k`.

## Phase 0 — Recon & baseline
- [x] Digest des skills écrit dans NOTES.md (ui-ux-pro-max + frontend-design + AGENTS/CLAUDE.md repo)
- [x] Stack identifiée (NOTES.md) — aucune lib à ajouter
- [ ] Branche `refonte-50k` + commit de l'état pré-refonte
- [ ] Baseline : toutes pages × 390/768/1440/2560 → refonte/baseline/
- [ ] Inventaire des patterns bannis (liste de démolition ci-dessous)

## Phase 1 — Fondations (35 min)
- [ ] Tokens verrouillés §4.1 (palette --noir-*, --ligne, --ivoire, --gris, --argent, --aurore-a/b)
- [ ] Fontes : A/B/C display (Archivo / Anybody / Bricolage) sur le hero → choix justifié → Outfit supprimée du projet
- [ ] Échelle typo §4.2 (H1 clamp 64→148, H2 40→76, body 16-17/1.6 65ch, mono 11-12 tracking .14em)
- [ ] Grille 12 col / gouttière 24 / marges clamp(24,5vw,96) ; padding sections 140-180 ; aucun vide > 220px
- [ ] Primitives : bouton (fond glissant + flèche 4px), lien (soulignement gauche→droite), input (ligne basse + label mono + erreur en ligne)
- [ ] Grain film 1,2-2 % fixe ; une source de lumière par vue
- [ ] Commit `feat(refonte): phase 1 — fondations`

## Phase 2 — Hero + matière 3D (65 min)
- [ ] Verre : MeshPhysicalMaterial transmission 1.0 / thickness 1.2-2.5 / roughness .06-.12 / ior 1.5 / clearcoat 1 / dispersion si dispo
- [ ] HDRI studio neutre PMREM + plan lumineux aurore derrière le monogramme
- [ ] Vie : float 6-10px 6-8s + inertie souris lerp .06 + UNE mécanique scroll
- [ ] Satellites : composition ou suppression ; sphères floues login/signup/CTA supprimées
- [ ] DPR ≤ 2, pause hors viewport, budget 3D ≤ 3,5 Mo, jamais d'affichage avant 1er frame rendu
- [ ] Typo hero recomposée (jeu de largeurs) + colonne Terrains en index mono
- [ ] Commit phase 2

## Phase 3 — Tuer le template (80 min)
- [ ] 02 Équipe : rangées éditoriales (index mono, filet, hover argent + visuel) — plus de cartes à pastilles
- [ ] Process : timeline horizontale unique liée au scroll
- [ ] Chips : rangée mono séparée par « · »
- [ ] 03 Avis : lignes fines sans cartes, masque fondu, défilement lent pause hover, étoiles SVG dessinées
- [ ] 04 Portfolio : marquee full bleed 2 rangées opposées, radius ≤ 6, hover scale 1.03 + légende mono ; trou comblé
- [ ] 05 Enhance : cadre affiné, poignée ligne+pastille argent, auto-balayage
- [ ] RECRUTEZ : mask scroll-driven, crop vérifié 4 viewports
- [ ] 06 Terrains : filets verticaux, ( 01 ) display, légendes mono, cadres unifiés
- [ ] 07 Modules : bento 2 tailles max, un seul badge « À venir » mono
- [ ] 08 Stats : chiffres display massifs, filets verticaux, logos opacité .5→1
- [ ] 09 Offres : colonnes éditoriales, prix display, features à filets, CTA pleine largeur ; grille bannières unifiée
- [ ] 10 FAQ : filets, numéros mono, chevron 45°, réponses ≤ 65ch
- [ ] CTA final : monogramme (échelle réduite) ou apothéose aurore — la sphère décorative dégage
- [ ] Footer : colonnes sur grille, watermark raffiné
- [ ] Commit phase 3

## Phase 4 — Motion system (50 min)
- [ ] Tokens motion (--dur-1/2/3, --ease-out, --ease-inout, stagger 70ms)
- [ ] Entrées : titres par lignes masquées, images scale 1.06→1 en masque ; jamais fade seul/blur-in
- [ ] Un moment par section (02 déploiement, 04 démarrage décalé, RECRUTEZ mask, 08 compteurs, 09 prix composés)
- [ ] 100 % des interactifs ont un hover travaillé ; nav état actif
- [ ] Lenis lerp .08-.1 ; scrub sur moments prévus seulement
- [ ] Transition de pages : overlay balayage + monogramme 0.6s (ou View Transitions)
- [ ] Commit phase 4

## Phase 5 — Loader & reveal (25 min)
- [ ] Manifest pondéré réel (fontes, HDRI, GLB, images hero) → 0-100
- [ ] Compteur mono 000→100 + monogramme filaire/lumière
- [ ] Reveal : fontes prêtes ET 1er frame 3D → chorégraphie ≤ 2,5 s
- [ ] sessionStorage : complet 1×/session puis 400 ms
- [ ] Commit phase 5

## Phase 6 — Pages secondaires (50 min)
- [ ] Login/Signup/Forgot : split 50/50 formulaire éditorial / panneau matière ; sphère PNG morte ; « SANS CARTE BANCAIRE » supprimé
- [ ] Dashboard toutes vues : tokens partout, covers projets (jamais d'initiales), stats display/mono, empty states filaires, sidebar filet argent
- [ ] Éditeur : damier sombre fin, règles de coins, panneaux au système
- [ ] Landings ×6 : colonne éditoriale home, 65ch, tableau à filets ; mentions gratuites supprimées
- [ ] Vitrine + maintenance + home-en alignées, parité EN
- [ ] Commit phase 6

## Phase 7 — Performance + QA finale (45 min)
- [ ] Budgets : LCP < 2,5s, CLS < 0,05, TBT < 300ms, JS initial < 300KB gz, ≤ 2 fontes préchargées
- [ ] 60 fps : transform/opacity only, will-change parcimonieux, zéro blur animé plein écran
- [ ] Petits PC : tiering forcé testé (DPR 1, grain off, poster)
- [ ] QA finale : toutes pages × 4 viewports → refonte/final/ ; notes 5 axes ≥ 9/10 dans RAPPORT.md
- [ ] Vérifs pixel : zéro couture, zéro débordement, zéro texte < 11px, AA, grille
- [ ] grep liste noire = 0 occurrence ; diff backend = vide
- [ ] Commit phase 7 + RAPPORT.md livré

## Liste de démolition (inventaire phase 0 — à compléter)
- Pastille d'initiales : `avatar` badge.tsx/Sidebar + cartes projets fallback + admin
- ★ texte : src/app/avis/page.tsx:63
- Pills bordurées : chips GivreType/GivreFields + badges « À venir » multiples
- Police Outfit (--font-outfit / --font-display) : fonts.ts + globals.css + usages
- Sphères floues décoratives : login/signup/CTA (SatinSphere)
- Deux corrections produit : « SANS CARTE BANCAIRE », « 3 visuels offerts » → grep exhaustif à faire
