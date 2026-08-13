# GIVRE — la charte. Direction artistique Neva Design (13/08/2026)

Remplace intégralement la peau « Galerie Argent » et la peau sombre « Prisme ».
**Une seule matière partout** : landing, vitrine, auth, dashboard, studio, admin,
maintenance. Cette charte est la loi du chantier : chaque écran en découle.

## Concept

Les cinq références (`ref/`) racontent la même chose : **des panneaux de verre
dépoli posés sur des scènes vivantes et glacées**. Le fond n'est jamais un
aplat — c'est une scène : dégradé lavande/périwinkle/perle, rubans chromés,
objets de verre, caustiques de lumière. Le verre floute réellement ce qui
passe derrière lui ; la typographie encre indigo se pose dessus, parfaitement
lisible. La lumière est froide, douce, venue du haut ; elle accroche les
arêtes, glisse sur les chromes, respire lentement.

Givre = le studio vu à travers une vitre givrée : on devine la lumière et le
mouvement derrière, et tout ce qui compte est net devant.

## Ce que disent les refs (extraction brute)

| Ref | Leçon |
|---|---|
| `21e14…` (Lexi) | LE modèle UI : panneau de verre ~55 % blanc, blur massif, radius ≈28, arête blanche en tête, fond lavande→périwinkle avec ombres douces projetées, objets en verre qui débordent du panneau, typo indigo, nav en petites caps, ombres portées des objets SUR le verre. |
| `64a9…` (Founder) | L'ambiance : paysage glacé, un seul objet héroïque (sphère de glace au cœur lumineux), typo navy encre géante, CTA pilule encre sombre, palette ciel/glace/neige. |
| `simple.png` (ZE) | La matière chrome : rubans 3D argent-blanc entrelacés, éclairage perle, bandeau de verre discret posé dessus, logo noir au centre. |
| `1784…` (ORIGINE) | L'application pricing : panneau verre gris ~50 % radius ≈24 avec liste noire bold, pilules de verre pour les prix, un objet 3D accent (étoile glossy) sur fond perle. |
| `b2a4…` (PIXEL) | La preuve : les créations GTA/FiveM s'exposent sur la matière claire argentée, bandeaux encre, typo condensée — les œuvres restent la vraie couleur de la page. |

## 1. Palette (tokens exacts)

### Fonds de scène (jamais d'aplat seul — toujours en dégradé + caustiques)
| Token | Hex | Usage |
|---|---|---|
| `frost` | `#EEF0F7` | base de page, brume claire bleutée |
| `pearl` | `#E4E6EF` | perle — creux des scènes, sections calmes |
| `lavender` | `#C9C6E8` | lavande — pôle chaud des dégradés de scène |
| `periwinkle` | `#AFC2EC` | périwinkle — pôle froid des dégradés |
| `glacier` | `#CBDCF2` | glace claire — hautes lumières des scènes |
| `aurora` | `#E9D5E4` | aurore rosée — coins de scène, ≤ 12 % d'opacité |

Dégradé de scène type (hero) :
`radial #FDFDFF 0% → frost 40% → lavender/periwinkle en nappes latérales → pearl en pied`.
Chaque section choisit sa pondération, jamais deux voisines identiques.

### Encres (froides — le noir pur est banni du texte)
| Token | Hex | Usage | Contraste sur verre clair |
|---|---|---|---|
| `ink` | `#1D2340` | titres, texte fort | ≥ 10:1 |
| `slate` | `#3F4767` | texte courant | ≥ 7:1 |
| `mist` | `#697192` | tertiaire, métadonnées | ≥ 4.5:1 |

### Chrome (matière, pas couleur)
| Token | Hex |
|---|---|
| `chrome-hi` | `#FCFCFE` |
| `chrome-mid` | `#C7CAD9` |
| `chrome-low` | `#989DB4` |
Gradients chrome : toujours perpendiculaires à la course du ruban,
contraste de valeur fort (blanc → creux → flash) — c'est le contraste qui
fait le métal.

### Spectre Neva (identité produit — inchangé, usages stricts)
`violet #7C6AFF → cyan #4CC9F0`, magenta `#E879F9` en pointe de halo.
Sur fond clair, versions encrées pour le texte : `#5B48E4 → #2795C9`.
Usages autorisés : un mot-clé en dégradé, liserés fins, jauges, cœur
lumineux d'un objet de verre, halos. **Jamais en aplat.**

### États système (fond clair)
`err #9E4A45/#FBEFEE · ok #3E7A5C/#EFF7F2 · warn #8A6D1F/#FBF6E9 · info #3E6C94/#EFF5FB`

## 2. Le verre (recette stricte — une seule, déclinée)

**Règle d'or inchangée : le verre n'existe qu'au-dessus d'une matière à
flouter.** Le renversement Givre : désormais **chaque scène a de la matière**
(dégradé, rubans, objets), donc le verre redevient possible partout — et
obligatoire pour toute surface posée sur une scène.

| Usage | Fond | Blur | Bordure & arête | Ombre |
|---|---|---|---|---|
| **Panneau** `pv-glass` | `rgba(255,255,255,0.55)` | `28px saturate(1.45)` | 1px `rgba(255,255,255,0.62)` ; arête `inset 0 1px 0 rgba(255,255,255,0.92)` | `0 2px 6px rgba(29,35,64,0.05), 0 28px 68px rgba(29,35,64,0.11)` |
| **Panneau fort** `--strong` (formulaires, modales) | `rgba(255,255,255,0.72)` | idem | idem | idem + modal plus profonde |
| **Pilule** `pv-pill` | `rgba(255,255,255,0.5)` | `20px` | idem | courte + diffuse légère |
| **Lentille** `pv-lens` (objet de verre) | `rgba(255,255,255,0.16)` | `18px` | double : blanche en haut, encre 4 % en bas | ombre portée au sol séparée |
| **Voile nav** | `rgba(244,245,250,0.6)` | `24px` | filet bas `rgba(29,35,64,0.06)` | aucune |

- Radius : panneaux 28, cartes internes 20, médias 12, pilules full.
- Le contenu POSÉ sur verre : jamais de texte < `slate` ; les métadonnées
  `mist` uniquement en ≥ 12px mono.
- Le verre teinté (rare, îlots produit) : `rgba(240,240,250,0.5)`.
- Un objet (ruban, sphère) peut **déborder** d'un panneau : il passe net
  devant le verre — c'est ce chevauchement qui vend la profondeur (ref Lexi).

## 3. La lumière

- **Source unique : haut, légèrement à gauche.** Toutes les ombres portées
  tombent bas-droit ; toutes les arêtes s'allument en haut.
- **Arêtes** : tout verre attrape un fil blanc en tête (`inset 0 1px 0`),
  les chromes un flash spéculaire fin (2–4px).
- **Caustiques** : chaque scène porte 1–2 nappes de lumière très diluées
  (radial-gradients blancs/glacier 8–14 %) qui dérivent en boucle lente
  (40–60s, transform only). C'est la « vie » du fond.
- **Ombres : encre bleutée, jamais noir neutre.** Base `rgba(29,35,64,α)`.
  Toujours doubles : une serrée de contact, une longue diffuse.
- Les objets de verre projettent une **ombre au sol** elliptique très douce
  (blur 24+, opacité ≤ 0.18) — c'est elle qui les « pose » dans la scène.

## 4. Chrome & objets 3D (technique retenue — révisée 13/08/2026)

**Décision révisée sur directive client : la scène héroïque est un vrai
rendu 3D temps réel.** L'ancienne interdiction de Three.js est levée — la
passe « bulles floues sur divs » a prouvé qu'on n'atteint pas la ref sans
vraie réfraction.

1. **Scène hero** : three.js via @react-three/fiber 9 + drei 10.
   Sculpture de primitives (sphère, tore, cylindre, prisme) en
   `MeshTransmissionMaterial` — transmission 1, thickness marquée,
   ior ≈ 1.5, roughness très faible, pointe de `chromaticAberration` et de
   `distortion`. Environnement lumineux doux (lightformers), ombres de
   contact teintées violet-gris au sol, rotation lente autonome (60s+).
2. **Garde-fous perf (non négociables)** : DPR plafonné ≤ 1.5,
   `frameloop` coupé hors viewport (IntersectionObserver), resolution du
   buffer de transmission contenue (≤ 1024, backside ≤ 512), samples ≤ 6 ;
   1 seul canvas 3D monté par page. Si le mobile ne tient pas un 60 fps
   propre : la scène est bakée en image/boucle vidéo très haute qualité —
   jamais de rendu dégradé.
3. **Sections calmes** : les techniques légères restent (SVG chromés,
   lentilles CSS `pv-lens`, caustiques en gradients) pour les rappels de
   matière hors hero.
4. Budget par page : 1 scène héroïque, 2–3 rappels de matière calmes.

## 5. Typographie (révisée 13/08/2026)

- **Trois voix** (aucun serif — interdit client) : **Outfit porte le
  display** (la géométrique ronde de la ref), Geist porte l'interface,
  Geist Mono la précision : labels 10.5–11px, tracking 0.16–0.2em,
  uppercase ; compteurs, pagination.
- Display : **Outfit 300 (light), accent en 500 (medium)** — jamais plus
  gras : le luxe de la ref vient de la légèreté, l'accent vient du
  CONTRASTE de graisse. `lh 1.06–1.1`, `tracking -0.015em`. Couleur :
  titres `slate`, l'accent seul en `ink` — plus jamais de noir pur.
- Un seul mot en dégradé spectral encré par écran, maximum (souvent
  aucun : la ref n'en a pas).
- Corps 15–17px `slate`, `lh 1.65`, paragraphes ≤ 560px.
- Chiffres : prix en Outfit light grand corps, devise/périodicité en
  mono `mist`. Pagination éditoriale `01 /08` : Outfit light + mono.

## 6. Profondeur — anatomie d'une scène (l'ordre des couches)

```
z0  fond : dégradé de scène + caustiques dérivantes + grain 2.5 %
z1  matière : rubans chromés / objets de verre SVG (blur CSS léger = DOF)
z2  verre : panneau(x) dépoli(s) qui floutent z0+z1
z3  contenu : typo encre, médias purs, pilules, boutons
z4  dépassements : un objet de z1 repasse DEVANT le panneau (net)
```
Jamais deux sections voisines avec la même structure de scène (interdit
client). La scène peut être : pleine (hero), latérale (un ruban qui longe),
en médaillon (objet derrière une carte), en bandeau (transition).

## 7. Motion (au chargement, au scroll, en boucle — jamais à la souris)

- **Interdits absolus** : effets pilotés par la position souris, curseur
  custom, tilt, spotlight, parallaxe pointeur. Hover = lift -2px + ombre +
  arête, rien d'autre.
- **Chargement (hero)** : fond/caustiques (fade 2s) → rubans (draw/fade
  1.4s) → panneau verre (fade + 24px) → lignes de titre sous masque
  (stagger 0.12) → CTA/preuve. Total ≤ 1.8s, expo.out.
- **Scroll** : reveals `once:true` (fade + 18–24px, start 85%) ; scrub
  léger réservé aux objets de scène (dérive ±40px, rotation ≤ 8°) ; pas de
  pin sauf moment signature unique.
- **Boucles autonomes** : caustiques 40–60s ; halos 5–7s (breathe) ;
  rotation d'objets de verre 60s+ ; marquee créations. Tout transform/opacity.
- **Le motion ne se coupe jamais** (exigence client) : aucune branche
  `prefers-reduced-motion`.
- Lenis conservé sur le marketing ; produit en scroll natif.

## 8. Performance (critère de design)

- **Budget backdrop-filter : ≤ 3 surfaces visibles simultanément** dans un
  viewport (nav + 1 panneau + 1 groupe de pilules). Les lentilles : petites
  (≤ 320px), 2 max par scène, 1 sur mobile.
- Jamais de blur CSS > 34px sur un élément plein écran ; les caustiques
  sont des gradients (pas de filter: blur plein écran animé).
- ogl : 1 canvas max monté, DPR ≤ 1.5, `IntersectionObserver` pour pauser.
- Animations : transform/opacity uniquement ; `will-change` posé par GSAP,
  pas à la main ; `contain: layout paint` sur les scènes.
- Images créations : `next/image`, lazy, `sizes` justes.
- Mobile 390 : mêmes scènes, blur 20→16px, 1 lentille, rubans simplifiés
  (2 passes au lieu de 4) — le rendu perçu reste identique.
- Vérif obligatoire : scroll fluide 60fps en 1440 et 390 (DevTools
  Performance), pas de long task > 120ms au chargement.

## 9. Marque & voix

- **Sur fond clair : logo noir** (`/brand/logo-noir.png` + wordmark ink).
  `nevanoir.jpg` pour les pastilles/monogrammes. Blanc réservé aux îlots sombres.
- Textes, tarifs, plans validés — **on ne touche pas au contenu** :
  0/19/49/99 €, packs 30/90 €, 5 créations offertes, 8K, 6 modules,
  2 400+ créateurs, 12s. Vouvoiement, accents parfaits.
- « Neva Design », jamais « Neva Agency ». « Givre » ne s'écrit nulle part
  dans l'UI.

## 10. Interdits (hérités + Givre)

- Étoiles/sparkles bannis (✦ ✨, lucide `Sparkles`) — partout.
- Jamais deux sections consécutives de même structure ; jamais titre +
  paragraphe + 3 cartes identiques ; jamais de liste nue > 3 lignes.
- Spectre jamais en aplat (sauf badge « Le plus choisi », exception
  historique 18px).
- **Nouveau** : plus aucun fond de section en aplat blanc/gris uni — toute
  section vit sur une scène (même très calme). Plus de « carte blanche
  opaque » : sur scène, une surface est de verre ou n'est pas.
- **Nouveau** : plus de noir pur en texte (`ink` indigo partout) ; ombres
  toujours encrées bleutées.
- Le dégradé violet-sur-blanc générique « template IA » : proscrit. La
  couleur vient de la scène (lavande/périwinkle désaturés), le spectre vif
  reste un fil.
- Lisibilité sacrée : tout texte sur verre respecte les contrastes du §1 ;
  si un fond vivant menace la lecture, on renforce le verre (`--strong`),
  jamais l'inverse.

## 11. Check-list de sortie d'écran

1. La scène de fond existe-t-elle (dégradé + au moins une matière vivante) ?
2. Le verre floute-t-il quelque chose de réel ? (sinon : pas de verre)
3. Arête haute allumée, ombres encrées doubles, radius 12/20/28 ?
4. Titres `ink`, corps `slate`, contrastes AA vérifiés sur les captures ?
5. ≤ 3 backdrop-filters simultanés ? 60fps au scroll (1440 + 390) ?
6. Un seul moment spectral ? ≤ 3 chromes ? Aucune étoile ?
7. Structure de section différente de ses voisines ?
8. Captures 1440 + 390 faites, regardées, autocritiquées contre `ref/` ?
