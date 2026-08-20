# DEFECTS — Run qualité totale (démarré le 20/08/2026)

Statuts : `OUVERT` → `CORRIGÉ (non vérifié)` → `VÉRIFIÉ` (preuve re-capture) / `NON REPRO` (résolu avant ce run, preuve à l'appui) / `DÉPEND DE SAMI`.

Captures : `../captures/qa/iter-<N>/`. Rapport auto : `qa/report-iter-<N>.json`. Mesure des marches : `qa/seams.mjs`.

## Défauts signalés (calibrage du 20/08 17 h) — verdicts iter-1

| N° | Page | Défaut | Preuve iter-1 | Cause racine | Correctif | Statut |
|---|---|---|---|---|---|---|
| D01 | /login /signup /forgot | Fond boueux marron-violet + banding ; sphère recouverte par la carte ; cadre hairline viewport ; (inputs bleu-gris : plus le cas) | `full-login-1440.png` : nappes brunes floues (satin sous-échantillonné + halos inline pêche/lilas à 0.20-0.21), cadre viewport présent, sphère chevauchée par la carte | halos inline ×4 trop forts (login:76-79), satin renderScale 0.5 flou sous voiles, cadre login:83-87, sphère login:114-117 | Phase 4 : fond = base #060606 + UN champ aurore 5-7 % propre + grain ; cadre supprimé ; sphère entière ou retirée ; inputs spec 3 %/10 %/ring aurore | OUVERT |
| D02 | home §03 avis | Colonne pull-quote vide | `slices/home-1440-s01.jpg` : pull-quote AFFICHÉE (quote + méta + avatar initiales) après scroll naturel | reveal `once:true` OK au scroll ; l'état vide du 20/08 (probable remontage LocaleKeyed/reveal raté) non reproduit | fiabiliser quand même : reveal avec `ScrollTrigger.refresh()` après montage ? — décision : surveiller iter-2, pas de sur-correction | NON REPRO (surveillé) |
| D03 | home marquee | Tuile grise vide ; doublons visibles (REWIND, TICKETS) ; hauteurs incohérentes | `slices/home-1440-s02.jpg` : REWIND ×2 simultanés rangée B (postergrandfivem2.webp + Prime_pack_9.webp = même artwork serveur) ; pas de tuile vide ; hauteurs uniformes 176 px | fichiers distincts, même artwork, adjacents dans ROW_B | réordonner ROW_B / remplacer un des REWIND ; vérifier TICKETS (pack_4 vs sunset) | OUVERT |
| D04 | home §06 (01) | Image principale vide | `slices/home-1440-s03.jpg` : image VIBE affichée | résolu run 8 | — | NON REPRO |
| D05 | home Scènes GTA | 3 slots vides | `slices/home-1440-s06/s07.jpg` : poser/ordi/plage affichés | résolu run 8 (webp présents) | — | NON REPRO |
| D06 | home modèles Discord | 4 previews vides | `slices/home-1440-s07.jpg` : 6/6 previews affichées | SVG créés run 8 21h07 | — | NON REPRO |
| D07 | home transitions | Bords horizontaux nets | `scroll-home-03.png` y≈461 (couture 03→04), y≈763 (bord haut bande marquee) ; `scroll-home-04.png` y≈312 (bord bas bande marquee) ; `scroll-home-06.png` y≈87 et 208 (bande RECRUTEZ opaque) ; `scroll-home-10.png` y≈873 (sortie bento 07) | des sous-blocs à fond opaque/bande (marquee, GivreType RECRUTEZ, bento) masquent le satin avec des bords francs — les voiles 420 px du run 8 ne couvrent pas ces blocs | Phase 2.4 : fondre ces fonds (dégradé ≥400 px ou continuité satin) | OUVERT |
| D08 | dashboard | Décor coupé, sidebar courte | `scroll-dash-projets-01.png` : décor fixed continu, sidebar pleine hauteur ; marches seams = bordures de cartes | résolu run 8 (fixed) | vérifier admin + halo pv-field-light sur pages longues en iter-2 | NON REPRO (à confirmer sur admin) |
| D09 | hero 3D | Tore touche le texte ; monogramme graphite pas verre | `slices/home-1440-s00.jpg` + `f-46-11511ms.jpg` : tore chevauche la colonne texte (« Discord, suivi en direct ») ; monogramme lit chrome sombre | table POSES (GlassSculpture:155-184) ; matière du mono | Phase 3 : pose 1440/1680 reculée ou décalée, marge ≥48 px ; matière verre (transmission/teinte) à raviver | OUVERT |
| D10 | module Brand | Pastille vert acide | `scroll-home-10.png` pastille verte visible | `#C7F464` + 4 hex bleutés (GivreModules.tsx:108) | palette aurore : lilas/pêche/ivoire/gris neutres | OUVERT |
| D11 | §08 logos | Opacités inégales, trous | `slices/home-1440-s06.jpg` : logos quasi invisibles vs visibles, un logo coupé au bord | PNG « ink » teintés #2B2450 (encre pour site CLAIR d'avant le pivot noir) — illisibles sur #060606 ; largeur fixe h-22 pour des masses différentes | régénérer les PNG en ivoire normalisé (outillage logos-ink.mjs adapté) ; opacité 45 %/70 % hover ; espacement régulier | OUVERT |
| D12 | chargement | Loader mort puis freeze puis départ tardif ; objets lents | `load-frames/` : compteur à 000 de 2,0 à 8,0 s (Fast 3G), 000→096 en <1 s, frames 33-35+37 manquantes (main thread bloqué ~750 ms), hero à 11,5 s | (a) rideau SSR statique mort jusqu'à l'hydratation ; (b) l'ouverture sort sans attendre `marks.canvas` → poster AVIF low upscalé perçu « zoomé/flou/figé » ; (c) rotation idle ±0,38 rad/32 s ≈ 4,3 °/s max ; (d) parallax souris inexistante (canvas pointerEvents:none) | Phase 3 : compteur pré-hydratation (script inline sur resource timings), ouverture attend le canvas (filet 4 s), rotation 10-16 °/s, parallax lerp 0.08-0.12, flottement 6-10 px / 4-6 s | OUVERT |

## Défauts additionnels (audit iter-1)

| N° | Page | Défaut | Preuve | Correctif | Statut |
|---|---|---|---|---|---|
| D13 | home §02 | `TODO_PSEUDO_1..4` affichés (G3) | `scroll-home-01.png` | présentation par rôle designée sans pseudo (fallback) ; pseudos réels = DÉPEND DE SAMI | OUVERT |
| D14 | home §03 | 9 avatars `/avatars/*.webp` en 404 réseau | report-iter-1 | supprimer la tentative réseau (initiales d'office) tant que les fichiers n'existent pas | OUVERT |
| D15 | /neva-design | 9 logos portfolio en `.png` inexistants (fallback backend) | code neva-design-portfolio.ts:154-266 | passer les 9 chemins en `.webp` | OUVERT |
| D16 | site EN | 25 clés FR sans EN (avis, rôles équipe…) | i18n.ts vs i18n-en.ts | compléter i18n-en (clés visibles) | OUVERT |
| D17 | /forgot-password | seule page auth sans sphère | code | trancher en Phase 4 (cohérence famille) | OUVERT |
| D18 | home rail | SectionRail 9 points pour 10 sections | SectionRail.tsx:13-22 | ajouter la FAQ | OUVERT |
| D19 | mesure fps | 22 fps headless = SwiftShader, non représentatif | report-iter-1 | mesurer G9 en `--headed` | OUVERT (mesure) |
| D20 | home modèles Discord | « 680×240 » écrit dans minimal-ink.svg (G3 l'interdit littéralement) | `slices/home-1440-s07.jpg` | remplacer la mention par un élément éditorial neutre | OUVERT |
| D21 | home CTA final | sphère coupée par le bord haut du panneau ; lueurs brunes bas-droite | `slices/home-1440-s08.jpg` | sphère entière ou hors panneau ; nappes pêche assagies | OUVERT |
| D22 | home §07 | mockups des modules « À venir » à opacity-55 : le panneau prompt lit gris béton délavé, carte Character très blanche | `scroll-home-10.png` | affiner : baisser l'opacité des SEULES surfaces claires, garder le liseré | OUVERT |
| D23 | harnais | hovers btn-secondaire/tuile-marquee/ligne-avis/carte-modele introuvables | report-iter-1 errors | poser des `data-qa` dans le code + re-run | OUVERT |

## Notes
- ERR_ABORTED (grain-128.png, typo-fill-recrutez.webp) = annulations de chargement, fichiers présents (HEAD 200) — exclus du verdict G1 par confirmation HEAD.
- Le calibrage 17 h décrivait un état antérieur au run 8 (21 h) : D04/D05/D06/D08 et l'essentiel de D02 étaient déjà résolus ; ce run les a re-prouvés sur captures fraîches.
- G3 : « — € / mois » des PriceCards est un état designé (badge « accès anticipé — prix bientôt ») : prix réels = DÉPEND DE SAMI.
