# NOTES — Refonte « niveau 50k »

## Digest des skills (phase 0 — règles retenues et appliquées)

1. **ui-ux-pro-max (projet)** : contraste AA 4,5:1 sur le corps de texte, focus visible partout, cibles tactiles ≥ 44 px, un seul style d'icônes SVG (jamais d'emoji), tokens sémantiques (zéro hex en dur dans les composants), tabular-nums sur les chiffres/prix.
2. **ui-ux-pro-max — motion** : entrée ease-out / sortie ease-in plus courte (~65 %), stagger 30-70 ms, animations sur transform/opacity uniquement, jamais de layout shift animé ; chaque animation exprime une cause→effet, pas une décoration.
3. **ui-ux-pro-max — formulaires** : label visible (jamais placeholder seul), erreur sous le champ concerné, validation au blur, feedback de soumission (chargement → succès/erreur), autocomplete sémantique.
4. **frontend-design (système)** : une seule idée-matière poussée à fond (ici : verre + lumière dans le noir), la boldness dépensée à UN endroit (le hero), tout le reste discipliné ; la typo porte la personnalité, la structure encode de l'information (la numérotation 01→10 du site est un vrai sommaire éditorial — conservée).
5. **frontend-design — calibrage anti-template** : fuir les trois looks IA par défaut ; ici le risque est le noir profond → le différenciant est la matière (verre physique, lumière aurore rare, grain film), pas un accent acide.
6. **AGENTS.md (repo)** : Next 16 ≠ Next connu — lire `node_modules/next/dist/docs/` avant tout code touchant au framework ; le bloc AGENTS.md est régénéré par `next dev`, on le committe tel quel.
7. **CLAUDE.md (repo)** : toute passe visuelle se prouve par captures pleine page (harnais `qa/capture.mjs`, 390/768/1440/2560, auth DEV_LOCAL_MODE) ; on ne juge jamais sans regarder les captures.
8. **Écriture UI** : verbes actifs, l'action garde son nom du bouton au toast, les états vides invitent à agir, les erreurs disent la cause + le remède.
9. **Arbitrage protocole > skills** : le protocole client impose « animations toujours actives » (aucune branche prefers-reduced-motion qui les coupe) — il PRIME sur la règle reduced-motion des skills (décision documentée du propriétaire, bug Windows « effets d'animation OFF » vécu au run 10).
10. **Périmètre absolu** : frontend uniquement — zéro fichier serveur/backend touché, zéro génération d'images produit ; tout besoin backend va dans RAPPORT.md.

## Stack identifiée (phase 0)

- **Next.js 16.3.2** (App Router, Turbopack dev) + React 19.2.4 + TypeScript.
- **Tailwind 4** (@theme dans globals.css — les tokens vivent là) + CSS custom `@layer components` (~2000 lignes de peau « Givre noir »).
- **GSAP 3.15 + @gsap/react** (timelines d'entrée), **Lenis 1.3.26** (smooth scroll, `SmoothScroll.tsx`), **framer-motion 12** (présent, peu utilisé → à vérifier).
- **React Three Fiber 9.7 + drei 10.7 + three 0.185** : scène hero `GlassSculpture.tsx` (2832 lignes, tiers scene-tier, posters bakés), fond satin `SoieNoire.tsx` (shader simplex plein site).
- **Radix UI** (dialog, select, switch… — primitives fonctionnelles, la peau est custom), **lucide-react** (icônes trait).
- Fontes actuelles : Outfit (display arrondie → À SUPPRIMER), Geist (body), Geist Mono (labels — conservée).
- Harnais de preuve : `qa/capture.mjs` (fullpage/scroll/hover/load/fps/media, 4 viewports, login dev), `qa/seams.mjs` (coutures), `qa/archive-site.mjs`.
- Serveurs : front dev :3001, backend :4000 (DEV_LOCAL_MODE=1, déjà lancé).
- **Aucune lib à ajouter** a priori : GSAP + Lenis + R3F + Tailwind couvrent tout le protocole. (Si dispersion verre indisponible dans three 0.185 → post légère, pas de lib.)

## Inventaire visuel baseline (phase 0 — captures regardées)

Vu sur `../captures/qa/iter-baseline/full-home-1440.png` (crops t00/t01) :
1. **Hero** : titre Outfit light gris ~84px — mou, sans tension ; monogramme ΛV en TISSU ivoire monochrome (aucune couleur dans la page, l'aurore ≤ 8 % est invisible) ; pilule bordurée « 5/5 avis ».
2. **02 Studio** : 7 pills bordurées en rafale (services) ; 4 cartes équipe identiques avec pastilles d'initiales DA/LI/PF/MO sur disque dégradé ; process en 4 boîtes grises accolées. → Les 3 patterns bannis majeurs, concentrés dans une section.
3. **Vide ~350 px** entre le CTA Discord (02) et le folio 03 — au-dessus de la limite 220 px.
4. **CTA final** : sphère satinée décorative CSS à droite (GivreFooter l.97-121) — à supprimer (liste noire №9).
5. **Avis** : étoiles SVG fines stroke pêche = aurore posée sur un glyphe UI → à passer argent.
6. **Marquee logos clients (08)** : 2 copies avec keyframe −33,33 % calibré 3 copies → boucle discontinue (bug hérité, cf. mémoire run 5).
7. ★ texte restant : src/app/avis/page.tsx:63 (page /avis, hors home).
8. FAQ : q2 « plan gratuit » et q4 « Creative Director » décrivent l'offre d'avant le pivot studio — signalé dans RAPPORT.md (contenu, pas mon appel).

## Décisions de session

- Branche de travail : `refonte-50k` ; premier commit = état pré-refonte (modifs cookies run 12 en cours, non mêlées aux phases).
- Captures : harnais existant → `../captures/qa/iter-<N>` ; copie de la baseline dans `refonte/baseline/` (gitignoré — les binaires restent hors git, convention repo).
- `.pv-light` reste le nom de la peau (~90 fichiers la posent) — on remplace ses VALEURS, pas son nom.
