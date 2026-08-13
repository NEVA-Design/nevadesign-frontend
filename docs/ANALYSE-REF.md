# Analyse froide — ref `original-d11d…` vs site actuel (13/08/2026)

Montage : `../../captures/chantier/montage-ref-vs-actuel.png` (ref à gauche, site à droite).
Verdict d'entrée : **la différence n'est pas le flou, c'est une scène.** La passe
« glassmorphisme » a posé deux bulles sur l'ancien layout ; la ref est un monde.

## 1. La scène — l'écart fondamental

| | Ref | Site actuel |
|---|---|---|
| Nature du fond | **Rendu 3D** : sol réel, objets posés, lumière directionnelle | Nappe 2D floue gris-lavande, sans direction |
| Objets | Sphère, tore couché, cylindre incliné, prisme — **verre épais** qui réfracte (la géométrie derrière se déforme dedans), dispersion chromatique subtile | Deux bulles décoratives sans poids, dégradé radial interne, zéro réfraction |
| Ombres | **Portées au sol, longues, douces, teintées mauve-gris** — elles posent les objets | Quasi inexistantes, aucun sol |
| Lumière | Fenêtre haut-droite : **rais diagonaux visibles** sur le fond, hautes lumières qui accrochent les arêtes | Éclairage plat, aucun rai, aucune arête allumée |
| Étalonnage | Lilas → rose, **ni noir pur ni blanc pur nulle part** ; coins rosés, creux lavande | Gris terne, ruptures de sections en blanc pur, finale en îlot noir |

## 2. La composition

- **Ref : asymétrique, éditoriale.** Un **cadre en filets 1px** délimite la page
  comme un objet imprimé. Colonne gauche : pagination géante `01/08` light,
  titre en 3 lignes, court paragraphe, CTA discret. Centre : la sculpture.
  Droite : menu contextuel hiérarchisé (Hey Lexi). Bas-droit : prix.
  Gauche : points de nav verticaux + pastilles. Marges intérieures énormes.
- **Actuel : template centré.** Badge → H1 → sous-titre → 2 CTA → micro-preuve,
  le tout dans une colonne symétrique. Aucun cadre, aucune pagination, aucun
  élément latéral, nav pleine largeur avec pilule sombre.

## 3. La typographie

- **Ref :** géométrique ronde en **light et medium**. Encre **ardoise-violet**
  (~`#3E3E5C`), jamais noir. `01` immense et léger, `/08` grisé. Nav en
  petites caps très espacées. Le titre respire sur 3 lignes courtes.
- **Actuel :** Geist **extra-bold ~120 px quasi noir** sur 2 lignes serrées —
  la masse écrase tout le luxe. Un mot en dégradé spectral saturé qui jure
  avec la douceur pastel. C'est le premier tueur d'ambiance.

## 4. L'interface

- **Ref :** l'UI **chuchote autour de la scène** — filets 1px, micro-labels
  caps, points, pastilles, avatar. Tout est petit, précis, espacé.
- **Actuel :** l'UI parle fort au centre — gros boutons, gros badge, gros titre.

## 5. Le reste de la page (sections)

Marquee de créations sur **fond blanc pur** ; « CLIQUEZ » masqué noir massif ;
cartes **blanches opaques** partout (studio, bento, packs) ; jauges en dégradé
spectral ; **finale en îlot noir** (vestige Prisme) ; footer wordmark gris.
Aucune section ne vit dans le monde lilas/rose de la ref.

## Ce que la reconstruction doit produire

1. **Une scène 3D réelle au hero** : verre en transmission (réfraction vraie),
   sol, ombres portées teintées, rais de fenêtre, dégradé lilas/rose sans purs.
2. **Un cadre éditorial** : filets 1px, pagination `01/08`, points latéraux,
   micro-labels caps, air massif.
3. **Une typo light/medium encre ardoise-violet** — plus jamais d'extra-bold noir.
4. **Un étalonnage continu** : toute la page (et tout le site) vit entre blanc
   cassé, lilas, pervenche, pointe de rose ; ombres toujours colorées.
5. **Chaque section repensée comme la ref l'aurait traitée** — pas un
   rhabillage : créations, tarifs, packs, studio, finale, puis déclinaison
   calme sur auth/dashboard/admin/maintenance.

Ce que la ref n'est pas : notre contenu. Textes, offre, prix restent
strictement inchangés (loi GIVRE §9) — on transpose le **langage**, pas le
discours.
