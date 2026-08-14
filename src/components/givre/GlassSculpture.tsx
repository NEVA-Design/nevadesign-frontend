"use client";

/*
 * La sculpture de verre — le cœur du hero Givre.
 * Une scène three.js réelle : le monogramme Neva (ΛV) sculpté dans
 * le cristal, posé dans une chambre du matin — un vrai mur et un
 * vrai sol dont la jonction dessine l'horizon, des taches de
 * fenêtre à croisillons sur le mur, une lame d'aube spectrale
 * (l'unique accent de marque), un anneau posé, une sphère en
 * lévitation. Rotation complète très lente, aucune interaction
 * souris : la scène vit seule.
 *
 * Transmission : pipeline NATIF de MeshPhysicalMaterial, mais
 * l'échantillon de transmission est REMPLACÉ (onBeforeCompile) par
 * un raycast analytique mur/sol : le rayon réfracté est intersecté
 * avec les deux plans du décor et lit leurs textures en unités
 * monde. La réfraction est géométriquement juste (l'horizon se plie
 * réellement dans le verre) et le décor réfracté reste net à tous
 * les cadrages — le render target de transmission de three 0.185
 * perdait map/vertexColors (décor blanc, verre laiteux), il n'est
 * plus lu et sa passe est réduite à néant via
 * transmissionResolutionScale.
 *
 * Budget (GIVRE §4/§8) : DPR ≤ 1.5, rendu coupé hors viewport,
 * environnement 256 rendu une seule fois, un seul canvas par page.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/* ── Petits outils de peinture ─────────────────────────────────── */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/* Bande triangulaire douce */
const band = (x: number, c: number, w: number) =>
  smoothstep(c - w, c, x) * smoothstep(c + w, c, x);
/* Bande à plateau : cœur plein de demi-largeur w, bord fondu f */
const bandf = (x: number, c: number, w: number, f: number) =>
  smoothstep(c - w - f, c - w + f, x) *
  (1 - smoothstep(c + w - f, c + w + f, x));
/* Plateau entre x0 et x1, bord fondu f — les taches de fenêtre */
const slab = (x: number, x0: number, x1: number, f: number) =>
  smoothstep(x0 - f, x0 + f, x) * (1 - smoothstep(x1 - f, x1 + f, x));
const mix3 = (a: number[], b: readonly number[], t: number) => {
  a[0] += (b[0] - a[0]) * t;
  a[1] += (b[1] - a[1]) * t;
  a[2] += (b[2] - a[2]) * t;
};
const lerp3 = (
  a: readonly number[],
  b: readonly number[],
  t: number
): [number, number, number] => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
/* Hash déterministe : le dither ne change pas d'une session à
   l'autre — captures comparables au pixel. */
const hash2 = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

/* ── Easings de la chorégraphie ─────────────────────────────────
   Tout mouvement est une fonction ABSOLUE du temps f(t) : deux
   sessions au même instant rendent le même pixel (preuve
   reduced-motion). progress() borne la fenêtre, easeOutCubic pose
   sans rebond, settle() pose avec un très léger dépassement
   (~2,5 %) — jamais nerveux. */
const progress = (t: number, t0: number, dur: number) =>
  clamp01((t - t0) / dur);
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
const settle = (p: number) => {
  const k = 1.15;
  const q = p - 1;
  return 1 + (k + 1) * q * q * q + k * q * q;
};

/* La dérive de scroll — écrite par un listener passif, lue chaque
   frame : la caméra recule et la sculpture glisse pendant que la
   première section arrive. Fonction pure de scrollY : identique
   pour tous, et nulle à scroll 0 (preuves). */
const SCROLL = { p: 0 };

/* ── Le monde (unités monde, identique à tous les cadrages) ─────
   Un vrai décor : le mur est un plan vertical à z = WALL_Z, le sol
   un plan horizontal à y = FLOOR_Y — leur jonction EST la ligne
   d'horizon, nette par construction à toutes les tailles d'écran.
   Les compositions par breakpoint sont des mouvements de CAMÉRA :
   la sculpture, ses ombres peintes et ses reflets ne bougent
   jamais du monde. */
const FLOOR_Y = -1.72;
const WALL_X0 = -11;
const WALL_W = 22;
const WALL_TOP = FLOOR_Y + 11; // 9.28
/* WALL_Z et FLOOR_D dérivent du layout (VIEW, plus bas) : le
   cyclorama RECULE aux grands paliers — legacy : -6.5 / 17.5. */

/* ── Cadrages — la même scène, dix compositions ────────────────
   La sculpture ne bouge jamais : chaque palier est un mouvement de
   caméra (position, focale, visée). Déclaré ICI (avant le layout
   de scène : il lit la pose du chargement pour caler le frustum).
   ≥ 1680 (grands écrans, run 2) : la caméra se rapproche — le
   monogramme tient 55-62 % de la hauteur du viewport, mesuré au
   pixel sur capture ; le frustum reste DANS le décor peint à tous
   les aspects (vérifié : 17,8 u visibles sur 22 à 3440×1440).
   ≤ 1679 : cadrages du run 1, au pixel (home 1440/390 validée). */
type Pose = {
  pos: [number, number, number];
  fov: number;
  look: [number, number, number];
  /* aspect minimal requis (21:9 réels) — sinon on passe à la
     pose suivante : une fenêtre 2900×2000 n'est PAS un 21:9 */
  minAspect?: number;
};

const POSES: { min: number; pose: Pose }[] = [
  /* 21:9 réel (34″ client, et tout ultra-wide ≥ 2880) : sculpture
     au centre-droit, satellites très écartés (layout), annotations
     dans les tiers latéraux — AVANT l'entrée 4K : un 3840×1600
     est un 21:9, pas un 4K */
  { min: 2880, pose: { pos: [0.3, 0.97, 7.4], fov: 29, look: [0.85, 0.09, 0], minAspect: 2 } },
  /* 3840×2160 (4K 16:9) : même resserrage que 1920, l'espace px
     est composé par les satellites et la typo fluide */
  { min: 3560, pose: { pos: [0.5, 0.97, 7.35], fov: 29, look: [0.8, 0.09, 0] } },
  /* ≥ 2200 : la composition « grand écran » du brief s'applique */
  { min: 2200, pose: { pos: [0.42, 0.97, 7.35], fov: 29, look: [0.83, 0.09, 0] } },
  { min: 1920, pose: { pos: [0.5, 0.97, 7.35], fov: 29, look: [0.8, 0.09, 0] } },
  /* palier de transition : entre la home validée (39 %) et la
     cible grands écrans (58 %) — ~48 % à 1680-1919 */
  { min: 1680, pose: { pos: [0.4, 1.0, 8.9], fov: 29, look: [0.85, 0.25, 0] } },
  { min: 1360, pose: { pos: [0.22, 1.0, 10.9], fov: 31, look: [0.85, 0.44, 0] } },
  { min: 1152, pose: { pos: [0.18, 0.98, 10.6], fov: 32, look: [0.83, 0.42, 0] } },
  { min: 1024, pose: { pos: [0.3, 0.96, 10.9], fov: 33, look: [0.62, 0.4, 0] } },
  /* < lg : le monogramme est cadré ENTIER dans la fenêtre entre le
     titre et les CTA — jamais tronqué (viser bas descend la
     sculpture à l'écran, la garde au sol visible autour) */
  { min: 600, pose: { pos: [1.0, 0.95, 12.6], fov: 36, look: [1.0, 0.52, 0] } },
  /* aligné sur le monogramme (MONO_X = 1.4) : la pièce reste
     centrée et ENTIÈRE dans le cadre à toutes les largeurs */
  { min: 390, pose: { pos: [1.35, 0.9, 13.2], fov: 40, look: [1.35, 0.45, 0] } },
  /* très petits écrans (360×780) : le bloc texte mange plus de
     hauteur — la caméra recule et vise haut pour poser la
     sculpture plus bas, sous le sous-texte, entière */
  { min: 0, pose: { pos: [1.35, 1.0, 15.0], fov: 40, look: [1.35, 2.5, 0] } },
];

function poseFor(w: number, aspect: number): Pose {
  for (const { min, pose } of POSES) {
    if (w < min) continue;
    if (pose.minAspect && aspect < pose.minAspect) continue;
    return pose;
  }
  return POSES[POSES.length - 1].pose;
}

/* ── Le layout de scène — figé au chargement (run 2) ────────────
   Comme l'opacité du filigrane (ghInk) : la peinture et la mise en
   place suivent le device au moment du paint. Legacy (< 1680) :
   géométrie et textures du run 1, identiques au pixel. Wide :
   satellites écartés selon l'aspect, annotations recalées dans le
   frustum réel, textures denses — les champs 2048 sont upscalés
   puis grille/annotations/filigrane/grain sont redessinés NATIFS
   à la résolution cible (≥ 1,5 × la résolution affichée sur la
   part visible du mur ; re-peindre 20 Mpx par pixel coûterait
   ~18 s — l'upscale ne concerne que les dégradés basse fréquence,
   toutes les hautes fréquences sont natives). */
const VIEW = (() => {
  const ssr = typeof window === "undefined";
  const vw = ssr ? 1440 : window.innerWidth;
  const vh = ssr ? 900 : window.innerHeight;
  const aspect = vw / Math.max(1, vh);
  const wide = vw >= 1680;
  /* écartement des satellites : nul jusqu'à 16:10, plein à 2,35:1
     — ET seulement aux paliers grands écrans */
  const spread = wide ? clamp01((aspect - 1.6) / 0.75) : 0;
  const pose = poseFor(vw, aspect);
  const tanHalf = Math.tan((pose.fov * Math.PI) / 360);
  /* Le cyclorama RECULE aux grands paliers : la caméra proche de
     la sculpture (55-62 % vh) zoomerait sinon dans le mur peint —
     filigrane écrasant, halo débordant, atelier illisible (mesuré
     v1 : 61 % du mur seulement). Le recul est calé sur le BORD
     DROIT du mur : le frustum s'arrête à wx ≈ 10,3 (+0,7 de garde
     pour l'erreur d'approximation plane, mesurée 0,55 u) — soit
     ~17,6-18 u du dessin utile visibles à TOUS les aspects, zéro
     lecture du clamp de texture. Legacy : -6,5 exact. */
  const kDir = (pose.look[0] - pose.pos[0]) / (pose.pos[2] - pose.look[2] || 1);
  const wallZ = wide
    ? Math.max(
        -15,
        Math.min(
          -6.5,
          -((10.15 - pose.pos[0]) / (kDir + tanHalf * aspect) - pose.pos[2])
        )
      )
    : -6.5;
  const floorD = 11 - wallZ; /* le sol court du mur à z = +11, comme au run 1 (17,5) */
  /* frustum au mur (approximation plane : visée prolongée) */
  const dWall = pose.pos[2] - wallZ;
  const halfH = dWall * tanHalf;
  const halfW = halfH * aspect;
  const dir = pose.look[0] - pose.pos[0];
  const cx = pose.pos[0] + (dir / (pose.pos[2] - pose.look[2] || 1)) * dWall;
  const frustum = { left: cx - halfW, right: cx + halfW, width: 2 * halfW };
  /* pas de la grille éditoriale : ~120 px apparents à l'écran,
     borné [0.55, 1.1] — legacy reste 1.1 exactement */
  const pxPerU = vw / frustum.width;
  const gridStep = wide
    ? Math.min(1.1, Math.max(0.55, +(120 / pxPerU).toFixed(3)))
    : 1.1;
  /* le halo aurore suit le frustum (« élargi proportionnellement »,
     cibles ΔE/chroma inchangées : mêmes couleurs, plus grand) */
  const haloScale = wide ? Math.min(1.45, Math.max(1, frustum.width / 14.98)) : 1;
  /* résolution des textures : 1,5 × la résolution affichée sur la
     part visible du mur, plafonnée par le GPU (lu sur un contexte
     jetable) et bornée à 8192 */
  let maxTex = 8192;
  if (!ssr && wide) {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (gl) maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    } catch {
      /* garde le plafond par défaut */
    }
  }
  const visible = Math.min(WALL_W, frustum.width);
  const idealW = Math.ceil((1.5 * vw * WALL_W) / visible / 64) * 64;
  /* plafond 6144 : 1,5 × est atteint jusqu'à 3440 (le 34″ du
     brief) ; un 4K NATIF sans scaling tombe à 1,3 × — compromis
     mémoire GPU (75 Mo vs 101 Mo) documenté au rapport */
  const wallOutW = wide ? Math.min(6144, maxTex, Math.max(2048, idealW)) : 2048;
  const wallOutH = Math.round((wallOutW * 11) / WALL_W);
  /* le sol : rasance oblige, la perspective le suréchantillonne
     verticalement — 0,72 × la densité du mur suffit à ses détails
     (reflets/ombres floues par nature), le grain reste natif */
  const floorOutW = wide
    ? Math.min(8192, maxTex, Math.max(1536, Math.round(wallOutW * 0.72)))
    : 1536;
  const floorOutH = Math.min(4608, Math.round((floorOutW * floorD) / WALL_W));
  return {
    wide, spread, aspect, vw, vh, frustum, gridStep, haloScale,
    wallZ, floorD, wallOutW, wallOutH, floorOutW, floorOutH,
  };
})();

/* Le monde dérive du layout — tout le fichier (peinture, GLSL,
   géométrie, reflets) lit ces deux constantes : une seule vérité. */
const WALL_Z = VIEW.wallZ;
const FLOOR_D = VIEW.floorD;

const WALL_TEX_W = 2048;
const WALL_TEX_H = Math.round((WALL_TEX_W * 11) / WALL_W); // 1024
const FLOOR_TEX_W = 1536;
const FLOOR_TEX_H = Math.round((FLOOR_TEX_W * FLOOR_D) / WALL_W); // legacy ≈ 1222

/* La sculpture vit autour de x = SCULPT_X, posée au sol. Les
   positions des satellites sont partagées avec le peintre du sol
   (ombres, reflets) : une seule vérité. En 21:9 elles s'écartent
   (VIEW.spread) — l'espace gagné est composé, pas laissé mort. */
const SCULPT_X = 1.25;
const MONO_X = SCULPT_X + 0.15;
/* L'anneau reste dans l'orbite du monogramme : plus près qu'en
   v27 — il ne doit JAMAIS mordre la colonne de texte à gauche
   (zone de sécurité UI ; à 21:9 le texte vit vers wx −7…−4, le
   tore écarté reste à wx ≥ −0.6). */
/* écartement modéré (× 0,55) : à × 0,85 le tore trop à gauche ne
   réfractait plus que le sol nu et virait au lait (le piège
   documenté du tube fin) — il garde ici le monogramme et ses
   ombres dans son champ réfracté */
const RING_X = SCULPT_X - 0.92 - VIEW.spread * 0.55;
/* aux paliers wide, le tore RECULE (z 0,5 → −0,5…−0,7) : la
   caméra rapprochée le rendait énorme et coupé par le bord bas
   (mesuré v4 : il mordait la pilule tarifaire à 1920) — reculé,
   il se glisse derrière l'épaule gauche du monogramme, entier */
const RING_Z = 0.5 - (VIEW.wide ? 0.9 : 0) - VIEW.spread * 0.25;
const SPHERE_X = SCULPT_X - 0.52 - VIEW.spread * 0.6;
const SPHERE_Z = -0.5;
const BEAD_X = SCULPT_X + 1.55 + VIEW.spread * 1.15;
/* Mur virtuel derrière la caméra : le fallback des rayons
   réfractés qui repartent vers l'avant (tore incliné, chanfreins).
   Sans lui, ils sortiraient du monde et liraient un bord de
   texture — le voile laiteux. */
const BACK_WALL_Z = 14;

/* ── La lumière de fenêtre — AFFINÉE (v28 cyclorama) ────────────
   Des rais fins et précis, plus des nappes : la lumière du matin
   glisse en diagonale sur le cyc, découpée par des montants
   minces. Une tache principale derrière la sculpture, un rai
   secondaire discret à droite. Le centre du plateau reste PROPRE :
   aucune brume, aucune lueur diffuse. */
/* Angle unique des lames : 22,0° exactement (tan 22° = 0,404). */
const SLANT = 0.404;
const paneU = (wx: number, wy: number) => wx - (wy - FLOOR_Y) * SLANT;

/* Trois lames — bords adoucis ≥ 40 px (0,35 unité à 116 px/unité) */
const PANE_A = { u0: -0.9, u1: 1.15, yTop: 6.3 }; /* principale */
const PANE_A2 = { u0: 1.75, u1: 2.6, yTop: 5.2 }; /* fine compagne */
const PANE_B = { u0: 6.1, u1: 7.5, yTop: 3.4 }; /* discrète, droite */
const PANE_SOFT = 0.35;

/* Derrière la sculpture, les lames s'effacent (−50 % de gain) : le
   verre garde son propre modelé au lieu d'être lavé par la lumière. */
function sculptShield(wx: number, wy: number): number {
  return (
    1 -
    0.5 *
      smoothstep(1.0, 0.3, Math.hypot((wx - MONO_X) / 2.35, (wy - 1.35) / 1.95))
  );
}

/* Retourne [lumière, ombre-de-croisillon] sur le mur. */
function paneWall(wx: number, wy: number): [number, number] {
  const u = paneU(wx, wy);
  /* les rais meurent avant le congé : le creux du cyc reste vierge */
  const aboveCove = smoothstep(FLOOR_Y + 0.45, FLOOR_Y + 1.05, wy);
  const a =
    slab(u, PANE_A.u0, PANE_A.u1, PANE_SOFT) *
    slab(wy, FLOOR_Y + 0.5, PANE_A.yTop, 0.6) *
    aboveCove;
  const a2 =
    slab(u, PANE_A2.u0, PANE_A2.u1, PANE_SOFT) *
    slab(wy, FLOOR_Y + 0.5, PANE_A2.yTop, 0.6) *
    aboveCove;
  const b =
    slab(u, PANE_B.u0, PANE_B.u1, PANE_SOFT) *
    slab(wy, FLOOR_Y + 0.5, PANE_B.yTop, 0.6) *
    aboveCove;
  /* falloff vertical : la lame respire vers sa source (haut-gauche) */
  const srcA = 0.66 + 0.4 * smoothstep(1.9, -0.9, u) * smoothstep(-0.6, 4.6, wy);
  const shield = sculptShield(wx, wy);
  const gain = (a * srcA * 0.052 + a2 * 0.028 + b * 0.018) * shield;
  /* croisillons : deux montants + une traverse, adoucis */
  let shade = 0;
  shade += bandf(u, -0.12, 0.05, 0.06) * a;
  shade += bandf(wy, 2.3, 0.045, 0.06) * a;
  shade += bandf(u, 6.8, 0.055, 0.06) * b;
  return [gain, shade * 0.038 * shield];
}

/* ── L'accent Neva — la lame d'aube spectrale ───────────────────
   L'unique point de couleur de la scène : une fente de lumière
   verticale sur le mur, violet en tête → cyan au sol (le spectre
   de la marque), comme une porte entrouverte hors champ. Le verre
   la réfracte : elle réapparaît pliée dans le monogramme. */
const ACCENT_X = 4.35;
const ACCENT_TOP = 3.05;
/* La lame d'aube parle désormais la langue du site : lilas en
   tête → pêche au sol (le spectre violet→cyan est banni). */
const VIOLET: readonly number[] = [0.643, 0.545, 0.91];
const CYAN: readonly number[] = [0.937, 0.722, 0.58];

function accentWall(wx: number, wy: number): [number, number, number] {
  const inY = slab(wy, FLOOR_Y - 0.1, ACCENT_TOP, 0.55);
  if (inY <= 0.001 || Math.abs(wx - ACCENT_X) > 1.2)
    return [0, 0, 0];
  const core = bandf(wx, ACCENT_X, 0.055, 0.04);
  const halo = band(wx, ACCENT_X, 0.7);
  const fadeTop = smoothstep(ACCENT_TOP + 0.4, 1.2, wy);
  const k = (core * 0.30 + halo * 0.038) * inY * (0.45 + 0.55 * fadeTop);
  const c = lerp3(CYAN, VIOLET, smoothstep(-1.5, 2.8, wy));
  return [c[0] * k, c[1] * k, c[2] * k];
}

/* ── Le cyclorama — l'atelier (v28) ─────────────────────────────
   Un studio photo infini : mur et sol ivoire/blanc cassé, reliés
   par un CONGÉ — pas d'arête, un creux d'ombre douce continu des
   deux côtés de la jonction, comme un vrai cyc de shooting
   produit. La couleur ne teinte plus la scène : elle se concentre
   dans UN halo aurore (lilas → pêche) derrière la sculpture. */

/* Le congé : les deux surfaces convergent vers la MÊME couleur
   d'assise sur le dernier CYC_R, puis un creux d'occlusion
   symétrique — continuité exacte à la jonction, la couture
   n'existe pas. dist = distance à la jonction le long de la
   surface (mur : wy − FLOOR_Y ; sol : wz − WALL_Z). */
const CYC_R = 1.05;
const CYC_SEAT: readonly number[] = [0.902, 0.895, 0.876];
const CYC_HOLLOW: readonly number[] = [0.836, 0.828, 0.812];
const cycBlend = (dist: number) => smoothstep(CYC_R + 0.35, 0.0, dist);
const cycOcc = (dist: number) =>
  Math.pow(smoothstep(CYC_R, 0.0, dist), 1.4);

/* Le halo aurore v2 — DEUX lobes gaussiens : lilas haut-gauche du
   monogramme, pêche bas-droite, fondus dans l'ivoire. Cibles
   mesurées (rapports/baseline) : au cœur des lobes ΔE OKLab ≥ 8 et
   chroma ≥ 0,035 vs mur nu ; retour au nu à 1,6 × le rayon.
   Rayon d'ensemble ≈ 38 % de la largeur viewport (~4,6 unités
   monde à 1440). Le dither du grain (paintCanvas) tue le banding. */
/* Les lobes s'échelonnent avec le frustum (VIEW.haloScale) autour
   du pivot (MONO_X, 1.6) : mêmes couleurs et mêmes cœurs (ΔE et
   chroma inchangés), rayon d'ensemble ~38 % de la largeur
   viewport à tous les paliers. Legacy (HS = 1) : valeurs du
   run 1 au centième. */
const HS = VIEW.haloScale;
const LOBE_LILAC = {
  cx: MONO_X - 1.7 * HS,
  cy: 1.6 + 1.25 * HS,
  rx: 3.2 * HS,
  ry: 2.3 * HS,
};
const LOBE_PEACH = {
  cx: MONO_X + 1.75 * HS,
  cy: 1.6 - 0.9 * HS,
  rx: 2.55 * HS,
  ry: 2.1 * HS,
};
const PEACH: readonly number[] = [0.98, 0.762, 0.598];
const LILAC: readonly number[] = [0.755, 0.702, 0.918];

/* Gaussienne réelle (fondu sans bord) — nulle au-delà de 1,6 r */
function lobe(wx: number, wy: number, L: { cx: number; cy: number; rx: number; ry: number }) {
  const rr = Math.hypot((wx - L.cx) / L.rx, (wy - L.cy) / L.ry);
  if (rr >= 1.6) return 0;
  return Math.exp(-rr * rr * 2.6) * smoothstep(1.6, 1.15, rr);
}

function auroraWall(wx: number, wy: number): [number, number, number] {
  const gl = lobe(wx, wy, LOBE_LILAC);
  const gp = lobe(wx, wy, LOBE_PEACH);
  if (gl + gp <= 0.002) return [0, 0, 0];
  const wl = gl * 0.78;
  const wp = gp * 0.88;
  return [
    LILAC[0] * wl + PEACH[0] * wp,
    LILAC[1] * wl + PEACH[1] * wp,
    LILAC[2] * wl + PEACH[2] * wp,
  ];
}
/* Poids du halo (0–1) au même point — pour fondre l'ivoire dessous */
function auroraMask(wx: number, wy: number): number {
  return clamp01(lobe(wx, wy, LOBE_LILAC) * 0.78 + lobe(wx, wy, LOBE_PEACH) * 0.88);
}

function wallColor(wx: number, wy: number): [number, number, number] {
  const top: readonly number[] = [0.925, 0.917, 0.895];
  const mid: readonly number[] = [0.949, 0.943, 0.925];
  const low: readonly number[] = [0.958, 0.953, 0.938];

  const h = clamp01((wy - FLOOR_Y) / (WALL_TOP - FLOOR_Y));
  const col: number[] =
    h < 0.42
      ? lerp3(low, mid, smoothstep(0, 0.42, h))
      : lerp3(mid, top, smoothstep(0.42, 1, h));

  /* vignette neutre chaude des bords — le plateau se referme sans
     jamais se colorer */
  mix3(col, [0.888, 0.881, 0.862], smoothstep(6.4, 10.8, Math.abs(wx)) * 0.5);
  mix3(col, [0.902, 0.895, 0.876], smoothstep(6.2, 9.2, wy) * 0.35);

  /* le halo aurore — la seule couleur du fond : l'ivoire cède sa
     place au prorata du masque, la lueur prend le relais — un
     fondu, jamais une addition qui sature */
  const am = auroraMask(wx, wy);
  if (am > 0.001) {
    const [ar, ag, ab] = auroraWall(wx, wy);
    col[0] = col[0] * (1 - am) + ar;
    col[1] = col[1] * (1 - am) + ag;
    col[2] = col[2] * (1 - am) + ab;
  }

  /* rais de fenêtre affinés + croisillons */
  const [gain, shade] = paneWall(wx, wy);
  col[0] += gain;
  col[1] += gain * 0.995;
  col[2] += gain * 0.985;
  col[0] -= shade;
  col[1] -= shade * 0.97;
  col[2] -= shade * 0.9; /* ombres à peine bleutées */

  /* (la lame d'aube spectrale est ajoutée en passe additive sur le
     canvas final — voir addAccentToCanvas : le cache d'allumage de
     l'intro doit pouvoir reproduire ce mur SANS elle, au pixel) */

  /* le congé : convergence vers l'assise puis creux d'occlusion */
  const dist = wy - FLOOR_Y;
  mix3(col, CYC_SEAT, cycBlend(dist) * 0.85);
  mix3(col, CYC_HOLLOW, cycOcc(dist) * 0.5);

  return [
    Math.min(0.985, Math.max(0.14, col[0])),
    Math.min(0.985, Math.max(0.14, col[1])),
    Math.min(0.985, Math.max(0.14, col[2])),
  ];
}

/* ── Le sol du cyc ──────────────────────────────────────────────
   Ivoire continu depuis le congé, qui se referme à peine vers
   l'avant-scène (vignette de studio, jamais de couleur). Il
   reçoit : le reflet doux du halo aurore, la retombée des rais,
   les ombres portées gris-mauve de la sculpture, ses reflets
   verticaux discrets, une caustique au pied du monogramme. */
function floorColor(wx: number, wz: number): [number, number, number] {
  const nearJ: readonly number[] = [0.952, 0.946, 0.93];
  const farC: readonly number[] = [0.912, 0.905, 0.886];

  const d = wz - WALL_Z; /* profondeur depuis le mur */
  const col: number[] = lerp3(nearJ, farC, smoothstep(0.8, 9.0, d));
  /* vignette latérale seulement : les BORDS se referment ; la
     profondeur, elle, remonte vers le mur (voir fondu d'horizon en
     fin de fonction) — l'ancienne vignette de fond créait la
     marche claire mesurée à la ligne d'horizon (57 niv/px). */
  mix3(col, [0.872, 0.865, 0.848], smoothstep(6.2, 10.8, Math.abs(wx)) * 0.4 * (1 - smoothstep(6.0, 14.0, d) * 0.85));

  /* reflet du halo aurore — le lobe pêche se pose sur le sol,
     fondu en ~2,5 unités ; une trace lilas plus discrète à gauche */
  const glowP = smoothstep(1.0, 0.08, Math.hypot((wx - LOBE_PEACH.cx) / 3.0, d / 2.5));
  if (glowP > 0.001) {
    const k = glowP * 0.3;
    col[0] = col[0] * (1 - k) + PEACH[0] * k;
    col[1] = col[1] * (1 - k) + PEACH[1] * k;
    col[2] = col[2] * (1 - k) + PEACH[2] * k;
  }
  const glowL = smoothstep(1.0, 0.1, Math.hypot((wx - LOBE_LILAC.cx) / 2.6, d / 1.9));
  if (glowL > 0.001) {
    const k = glowL * 0.14;
    col[0] = col[0] * (1 - k) + LILAC[0] * k;
    col[1] = col[1] * (1 - k) + LILAC[1] * k;
    col[2] = col[2] * (1 - k) + LILAC[2] * k;
  }

  /* retombée des lames — fine, mourant avant le congé et avant
     l'avant-scène */
  const uf = wx - d * SLANT * 0.55;
  const depthFade =
    slab(d, 0.75, 4.4, 0.5) * (1 - smoothstep(2.4, 4.4, d) * 0.6);
  const fa = slab(uf, PANE_A.u0, PANE_A.u1, PANE_SOFT) * depthFade;
  const fa2 = slab(uf, PANE_A2.u0, PANE_A2.u1, PANE_SOFT) * depthFade;
  const fb = slab(uf, PANE_B.u0, PANE_B.u1, PANE_SOFT) * depthFade;
  const gain = fa * 0.042 + fa2 * 0.02 + fb * 0.022;
  let shade = 0;
  shade += bandf(uf, -0.28, 0.08, 0.09) * fa;
  shade += bandf(uf, 1.84, 0.08, 0.09) * fa2;
  shade += bandf(uf, 6.9, 0.08, 0.09) * fb;
  col[0] += gain - shade * 0.04;
  col[1] += gain * 0.99 - shade * 0.038;
  col[2] += gain * 0.985 - shade * 0.032;

  /* flaque de la lame spectrale, discrète au pied du mur */
  const puddle =
    band(wx, ACCENT_X + 0.12, 0.42) *
    slab(d, 0.02, 1.5, 0.32) *
    (1 - smoothstep(0.5, 1.5, d) * 0.6);
  const pc = lerp3(VIOLET, CYAN, smoothstep(0.1, 1.4, d));
  col[0] += pc[0] * puddle * 0.10;
  col[1] += pc[1] * puddle * 0.10;
  col[2] += pc[2] * puddle * 0.10;

  /* ── ombres portées — gris-mauve doux (colorées, jamais noires,
     jamais lourdes : un cyc éclairé large fait des ombres tendres) */
  const shx = (wx - MONO_X - 0.5) / 2.3;
  const shz = (wz - 0.55) / 1.4;
  mix3(col, [0.708, 0.696, 0.762], smoothstep(1.0, 0.12, Math.hypot(shx, shz)) * 0.5);
  /* cœur de contact du monogramme */
  mix3(
    col,
    [0.598, 0.585, 0.668],
    smoothstep(0.92, 0.1, Math.hypot((wx - MONO_X - 0.1) / 1.62, (wz - 0.3) / 0.66)) *
      0.55
  );
  /* ombre de l'anneau */
  mix3(
    col,
    [0.665, 0.652, 0.728],
    smoothstep(
      0.9,
      0.14,
      Math.hypot((wx - RING_X - 0.13) / 0.55, (wz - RING_Z - 0.24) / 0.4)
    ) * 0.5
  );
  /* ombre de contact de la sphère en lévitation — elliptique,
     décalée bas-droite (la clé vient du haut-gauche), cœur alpha
     0,22 et bord fondu ≈ 24 px : elle POSE la sphère dans la scène */
  const sphD = Math.hypot((wx - SPHERE_X - 0.22) / 0.52, (wz - SPHERE_Z - 0.16) / 0.36);
  mix3(col, [0.598, 0.585, 0.668], smoothstep(1.0, 0.3, sphD) * 0.22);
  mix3(col, [0.665, 0.652, 0.728], smoothstep(1.9, 0.85, sphD) * 0.1);
  /* la bille haute : une ombre plus diffuse (elle flotte à 3,3) */
  const beadD = Math.hypot((wx - BEAD_X - 0.16) / 0.32, (wz + 0.7 - 0.12) / 0.23);
  mix3(col, [0.7, 0.688, 0.755], smoothstep(1.0, 0.3, beadD) * 0.09);

  /* ── reflets — un cyc peint est mat : traces verticales à peine
     suggérées */
  const reflMono =
    slab(wx, MONO_X - 1.42, MONO_X + 1.42, 0.22) *
    slab(wz, 0.45, 2.6, 0.3) *
    (1 - smoothstep(0.45, 2.6, wz)) *
    (0.55 +
      0.45 *
        Math.max(
          band(wx, MONO_X - 0.82, 0.34),
          band(wx, MONO_X + 0.55, 0.42)
        ));
  mix3(col, [0.792, 0.782, 0.845], reflMono * 0.14);
  const reflHi =
    Math.max(band(wx, MONO_X - 0.28, 0.16), band(wx, MONO_X + 1.05, 0.13)) *
    slab(wz, 0.5, 2.0, 0.3) *
    (1 - smoothstep(0.5, 2.0, wz));
  col[0] += reflHi * 0.03;
  col[1] += reflHi * 0.03;
  col[2] += reflHi * 0.033;
  const reflRing =
    band(wx, RING_X + 0.1, 0.44) *
    slab(wz, RING_Z + 0.5, RING_Z + 1.2, 0.25) *
    (1 - smoothstep(RING_Z + 0.5, RING_Z + 1.2, wz));
  mix3(col, [0.808, 0.798, 0.858], reflRing * 0.11);
  const reflSph =
    band(wx, SPHERE_X, 0.36) *
    slab(wz, SPHERE_Z + 0.4, SPHERE_Z + 1.2, 0.3) *
    (1 - smoothstep(SPHERE_Z + 0.4, SPHERE_Z + 1.2, wz));
  mix3(col, [0.845, 0.838, 0.885], reflSph * 0.06);

  /* caustique — le pied du cristal concentre un éclat, teinté aube */
  const caust =
    band(wx, MONO_X + 0.85, 0.5) * band(wz, 0.95, 0.4) +
    band(wx, MONO_X - 0.6, 0.3) * band(wz, 0.72, 0.28) * 0.7;
  col[0] += caust * 0.062;
  col[1] += caust * 0.056;
  col[2] += caust * 0.048;

  /* le congé, côté sol — mêmes fonctions que le mur : continuité */
  const dist = wz - WALL_Z;
  mix3(col, CYC_SEAT, cycBlend(dist) * 0.85);
  mix3(col, CYC_HOLLOW, cycOcc(dist) * 0.5);

  /* Fondu d'horizon (anti-seam) : en perspective rasante, l'écran
     colle le sol LOINTAIN contre le bas du mur — les deux doivent
     porter la même valeur AU MÊME x. Le sol converge vers la
     couleur exacte de la base du mur (halo compris), lue dans la
     ligne PRÉ-CALCULÉE (un appel wallColor par pixel gelait le
     main thread ~9 s). Preuve : dérivée < 2 niveaux/px. */
  const horizon = smoothstep(6.5, FLOOR_D - 1.6, d);
  if (horizon > 0.001 && wallBottomRow) {
    const i =
      Math.max(
        0,
        Math.min(
          FLOOR_TEX_W - 1,
          Math.round(((wx - WALL_X0) / WALL_W) * (FLOOR_TEX_W - 1))
        )
      ) * 3;
    mix3(
      col,
      [wallBottomRow[i], wallBottomRow[i + 1], wallBottomRow[i + 2]],
      horizon * 0.97
    );
  }

  return [
    Math.min(0.985, Math.max(0.14, col[0])),
    Math.min(0.985, Math.max(0.14, col[1])),
    Math.min(0.985, Math.max(0.14, col[2])),
  ];
}

/* ── Peinture des textures (une seule fois, cache module) ────── */

/* La peinture par pixel, découpable : sans `yieldFn` elle est
   strictement synchrone (mêmes pixels, même ordre — le filet de
   sécurité des getters) ; avec, elle rend la main au navigateur
   toutes les ~96 lignes — le main thread respire (le gel mesuré
   à 3440 était un long task de 8,7 s), le loader anime et reçoit
   la vraie progression. */
type YieldFn = (() => Promise<void>) | null;

function paintCanvasInto(
  w: number,
  h: number,
  color: (u: number, v: number) => [number, number, number],
  withGrain: boolean,
  yieldFn: YieldFn,
  onRow?: (row: number) => void
): HTMLCanvasElement | Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  const paintRow = (py: number) => {
    const v = 1 - py / (h - 1); /* v=1 en haut du canvas */
    for (let px = 0; px < w; px++) {
      const u = px / (w - 1);
      const col = color(u, v);
      /* grain de film — deux octaves déterministes (hash2) : le
         fin tue le banding, le grossier tue le « digital plat ».
         (En mode wide, le grain est reposé NATIF après upscale.) */
      const dith = withGrain
        ? (hash2(u * 1400, v * 1400) - 0.5) * 0.016 +
          (hash2(u * 340 + 7.3, v * 340 + 2.1) - 0.5) * 0.009
        : 0;
      const i = (py * w + px) * 4;
      data[i] = Math.round(clamp01(col[0] + dith) * 255);
      data[i + 1] = Math.round(clamp01(col[1] + dith) * 255);
      data[i + 2] = Math.round(clamp01(col[2] + dith) * 255);
      data[i + 3] = 255;
    }
  };
  if (!yieldFn) {
    for (let py = 0; py < h; py++) paintRow(py);
    ctx.putImageData(img, 0, 0);
    return canvas;
  }
  return (async () => {
    for (let py = 0; py < h; py++) {
      paintRow(py);
      if (py % 96 === 95) {
        onRow?.(py);
        await yieldFn();
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  })();
}

function paintCanvas(
  w: number,
  h: number,
  color: (u: number, v: number) => [number, number, number],
  withGrain = true
): HTMLCanvasElement {
  return paintCanvasInto(w, h, color, withGrain, null) as HTMLCanvasElement;
}

/* ── Grain natif pour textures upscalées (mode wide) ────────────
   La même signature 2 octaves, précalculée en tuile 512² : le
   hash par pixel sur 20 Mpx coûterait ~1,5 s ; un bruit répété ne
   trahit jamais sa tuile. Mêmes amplitudes qu'en peinture (±0,016
   et ±0,009), mêmes périodes en px de texture — la taille du
   grain PERÇU reste celle du run 1 : il tue banding et plat. */
const GRAIN_T = 512;
let grainTile: Int8Array | null = null;
function getGrainTile() {
  if (!grainTile) {
    grainTile = new Int8Array(GRAIN_T * GRAIN_T);
    for (let y = 0; y < GRAIN_T; y++) {
      for (let x = 0; x < GRAIN_T; x++) {
        const d =
          (hash2(x * 0.684, y * 1.368) - 0.5) * 0.016 +
          (hash2(x * 0.166 + 7.3, y * 0.332 + 2.1) - 0.5) * 0.009;
        grainTile[y * GRAIN_T + x] = Math.max(
          -127,
          Math.min(127, Math.round(d * 255))
        );
      }
    }
  }
  return grainTile;
}
function addFilmGrain(canvas: HTMLCanvasElement): void;
function addFilmGrain(canvas: HTMLCanvasElement, yieldFn: YieldFn): Promise<void> | void;
function addFilmGrain(canvas: HTMLCanvasElement, yieldFn: YieldFn = null) {
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = img.data;
  const tile = getGrainTile();
  const W = canvas.width;
  const H = canvas.height;
  const grainRow = (py: number) => {
    const trow = (py % GRAIN_T) * GRAIN_T;
    let i = py * W * 4;
    for (let px = 0; px < W; px++, i += 4) {
      const d = tile[trow + (px % GRAIN_T)];
      data[i] = Math.max(0, Math.min(255, data[i] + d));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + d));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + d));
    }
  };
  if (!yieldFn) {
    for (let py = 0; py < H; py++) grainRow(py);
    ctx.putImageData(img, 0, 0);
    return;
  }
  return (async () => {
    for (let py = 0; py < H; py++) {
      grainRow(py);
      if (py % 512 === 511) await yieldFn();
    }
    ctx.putImageData(img, 0, 0);
  })();
}

/* Upscale bicubique navigateur — ne concerne QUE les champs basse
   fréquence (halo, rais, congé, ombres) : un dégradé interpolé est
   indiscernable d'un dégradé repeint. */
function upscaleCanvas(src: HTMLCanvasElement, w: number, h: number) {
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return out;
}

/* ── La couche atelier — le graphisme du plan de travail ────────
   Par-dessus la peinture du mur : la grille éditoriale ultra fine,
   la lettre fantôme du logomark en filigrane, les hirondelles,
   cotes et annotations d'un studio de création. Dessinée en
   vectoriel 2D sur le canvas AVANT la création de la texture :
   elle vit dans la scène, derrière le verre — le monogramme la
   réfracte. Tout est en positions FIXES : déterministe au pixel. */
const INK_R = 43, INK_G = 36, INK_B = 80; /* encre aurore #2B2450 */

function drawAtelierLayer(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const unit = W / WALL_W; /* px par unité monde */
  const X = (wx: number) => ((wx - WALL_X0) / WALL_W) * W;
  const Y = (wy: number) => (1 - (wy - FLOOR_Y) / (WALL_TOP - FLOOR_Y)) * H;
  const ink = (a: number) => `rgba(${INK_R},${INK_G},${INK_B},${a})`;

  /* 1 — la grille éditoriale : colonnes et lignes de base à peine
     visibles, qui meurent avant le congé. Le pas suit le palier
     (VIEW.gridStep : ~120 px apparents ; legacy = 1,1 u exact) —
     les verticales meurent toujours à la lame d'aube (wx 4,4). */
  const gridBottom = FLOOR_Y + 0.55;
  const step = VIEW.gridStep;
  ctx.lineWidth = Math.max(1.5, unit * 0.012);
  const iMax = Math.round(14.3 / step);
  for (let i = -4; i <= iMax; i++) {
    const wx = -9.9 + i * step;
    const major = ((i % 4) + 4) % 4 === 0;
    ctx.strokeStyle = ink(major ? 0.034 : 0.021);
    ctx.beginPath();
    ctx.moveTo(X(wx), Y(8.6));
    ctx.lineTo(X(wx), Y(gridBottom));
    ctx.stroke();
  }
  const stepY = step / 2;
  const jMax = Math.round(7.15 / stepY);
  for (let j = 0; j <= jMax; j++) {
    const wy = gridBottom + j * stepY;
    ctx.strokeStyle = ink(j % 4 === 0 ? 0.03 : 0.019);
    ctx.beginPath();
    ctx.moveTo(X(-10.6), Y(wy));
    ctx.lineTo(X(10.6), Y(wy));
    ctx.stroke();
  }

  /* 2 — la lettre fantôme : le logomark géant en filigrane, un
     gaufrage — plus grand et plus doux que v28 (ink ≤ 0,03 desktop,
     ≤ 0,022 mobile), centré derrière la sculpture, posé au sol.
     La texture est peinte côté client : l'opacité suit le device. */
  const GH_H = 6.4;
  const GH_W = GH_H * LOGO_RATIO;
  const ghCx = MONO_X + 1.15;
  const ghInk =
    typeof window !== "undefined" && window.innerWidth < 640 ? 0.022 : 0.03;
  ctx.fillStyle = ink(ghInk);
  ctx.beginPath();
  for (const poly of LOGO_POLYS) {
    poly.forEach(([nx, ny], i) => {
      const px = X(ghCx + (nx - 0.5) * GH_W);
      const py = Y(FLOOR_Y + (1 - ny) * GH_H);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
  }
  ctx.fill();

  /* 3 — les repères techniques : hirondelles aux coins de la zone
     de travail, cotes, croix de calage, annotations mono */
  const bx0 = -2.35, bx1 = 5.15, by0 = FLOOR_Y + 0.72, by1 = FLOOR_Y + 4.55;
  const mark = 0.16;
  const off = 0.055;
  ctx.lineWidth = Math.max(1.5, unit * 0.011);
  ctx.strokeStyle = ink(0.11);
  for (const [cx, cy, sx, sy] of [
    [bx0, by0, -1, -1], [bx1, by0, 1, -1], [bx0, by1, -1, 1], [bx1, by1, 1, 1],
  ] as const) {
    ctx.beginPath(); /* trait horizontal, décalé hors de la zone */
    ctx.moveTo(X(cx + sx * off), Y(cy));
    ctx.lineTo(X(cx + sx * (off + mark)), Y(cy));
    /* trait vertical */
    ctx.moveTo(X(cx), Y(cy + sy * off));
    ctx.lineTo(X(cx), Y(cy + sy * (off + mark)));
    ctx.stroke();
  }
  /* croix de calage éparses */
  ctx.strokeStyle = ink(0.08);
  for (const [wx, wy] of [
    [-4.6, 5.5], [7.95, 6.15], [-6.9, 1.05], [9.6, 0.65], [3.4, 7.6],
  ] as const) {
    const px = X(wx), py = Y(wy);
    const c = unit * 0.07;
    ctx.beginPath();
    ctx.moveTo(px - c, py);
    ctx.lineTo(px + c, py);
    ctx.moveTo(px, py - c);
    ctx.lineTo(px, py + c);
    ctx.stroke();
  }
  /* cote horizontale au-dessus de la zone — legacy uniquement :
     aux paliers wide le frustum recadré la posait dans la navbar
     (mesurée sur « PACKS » à 1920) ; les annotations latérales
     assurent la voix technique */
  const dimY = Y(by1 + 0.42);
  if (!VIEW.wide) {
    ctx.strokeStyle = ink(0.12);
    ctx.beginPath();
    ctx.moveTo(X(bx0), dimY);
    ctx.lineTo(X(bx1), dimY);
    ctx.moveTo(X(bx0), dimY - unit * 0.05);
    ctx.lineTo(X(bx0), dimY + unit * 0.05);
    ctx.moveTo(X(bx1), dimY - unit * 0.05);
    ctx.lineTo(X(bx1), dimY + unit * 0.05);
    ctx.stroke();
  }
  /* annotations mono — lisibilité de décor assumée (ink 0,42 ≈
     contraste 2,4:1, cible ≥ 2,2:1) et positions hors de TOUTE
     colonne de texte : le folio vit haut-gauche (wx −8…−6,
     wy 6…7,5), le bloc titre à gauche (wy 1,5…5), TERRAINS à
     droite (wx 5,5…8, wy 2…3,5) — les annotations occupent le
     haut-centre et le haut-droit, jamais ces zones.
     Aux grands paliers (frustum recadré : le haut du mur sort du
     champ), elles se recalent dans les TIERS LATÉRAUX du frustum
     réel — mêmes textes, hauteur ~91 % du champ visible. */
  ctx.fillStyle = ink(0.42);
  ctx.font = `${Math.round(unit * 0.13)}px Consolas, monospace`;
  if (!VIEW.wide) {
    ctx.textAlign = "center";
    ctx.fillText("2260", X((bx0 + bx1) / 2), dimY - unit * 0.07);
    ctx.textAlign = "left";
    ctx.fillText("ΛV — EXTRUSION 0.40", X(6.3), Y(7.0));
    ctx.fillText("R 0.05", X(6.3), Y(6.76));
    ctx.fillText("BASELINE 0.55", X(-6.85), Y(6.88));
    ctx.fillText("NV—27", X(-6.85), Y(7.12));
  } else {
    ctx.textAlign = "left";
    const fr = VIEW.frustum;
    /* le frustum vertical au mur pour la pose du chargement */
    const pose = poseFor(VIEW.vw, VIEW.aspect);
    const dWall = pose.pos[2] - WALL_Z;
    const halfH = dWall * Math.tan((pose.fov * Math.PI) / 360);
    const cy = pose.pos[1] + ((pose.look[1] - pose.pos[1]) / (pose.pos[2] - pose.look[2] || 1)) * dWall;
    const topY = cy + halfH;
    const wxR = fr.right - 0.16 * fr.width;
    /* la colonne gauche démarre à ~180 px écran : toujours à
       droite du logo navbar, quel que soit le palier */
    const wxL = Math.max(WALL_X0 + 0.6, fr.left + (180 / VIEW.vw) * fr.width);
    ctx.fillText("ΛV — EXTRUSION 0.40", X(wxR), Y(topY - 0.09 * 2 * halfH));
    ctx.fillText("R 0.05", X(wxR), Y(topY - 0.09 * 2 * halfH - 0.26));
    ctx.fillText("BASELINE 0.55", X(wxL), Y(topY - 0.07 * 2 * halfH));
    ctx.fillText("NV—27", X(wxL), Y(topY - 0.07 * 2 * halfH - 0.26));
  }
}

function makeTexture(canvas: HTMLCanvasElement, anisotropy: number) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = anisotropy;
  return tex;
}

/* Région de la lame sur le mur (unités monde) — partagée entre la
   passe additive et le cache d'allumage de l'intro */
const ACC_X0 = ACCENT_X - 1.3;
const ACC_X1 = ACCENT_X + 1.3;
const ACC_Y0 = FLOOR_Y;
const ACC_Y1 = ACCENT_TOP + 1.5;

/* La lame, en passe additive sur le canvas fini (espace sRGB,
   comme toute la peinture) — découpable comme la peinture */
function addAccentToCanvas(canvas: HTMLCanvasElement): void;
function addAccentToCanvas(canvas: HTMLCanvasElement, yieldFn: YieldFn): Promise<void> | void;
function addAccentToCanvas(canvas: HTMLCanvasElement, yieldFn: YieldFn = null) {
  const W = canvas.width;
  const H = canvas.height;
  const px0 = Math.floor(((ACC_X0 - WALL_X0) / WALL_W) * W);
  const px1 = Math.ceil(((ACC_X1 - WALL_X0) / WALL_W) * W);
  const py0 = Math.floor((1 - (ACC_Y1 - FLOOR_Y) / (WALL_TOP - FLOOR_Y)) * H);
  const py1 = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(px0, py0, px1 - px0, py1 - py0);
  const data = img.data;
  const rw = px1 - px0;
  const accentRow = (py: number) => {
    const wy = FLOOR_Y + (1 - py / (H - 1)) * (WALL_TOP - FLOOR_Y);
    for (let px = px0; px < px1; px++) {
      const wx = WALL_X0 + (px / (W - 1)) * WALL_W;
      const [r, g, b] = accentWall(wx, wy);
      if (r + g + b <= 0.001) continue;
      const i = ((py - py0) * rw + (px - px0)) * 4;
      data[i] = Math.min(252, data[i] + Math.round(r * 255));
      data[i + 1] = Math.min(252, data[i + 1] + Math.round(g * 255));
      data[i + 2] = Math.min(252, data[i + 2] + Math.round(b * 255));
    }
  };
  if (!yieldFn) {
    for (let py = py0; py < py1; py++) accentRow(py);
    ctx.putImageData(img, px0, py0);
    return;
  }
  return (async () => {
    for (let py = py0; py < py1; py++) {
      accentRow(py);
      if ((py - py0) % 256 === 255) await yieldFn();
    }
    ctx.putImageData(img, px0, py0);
  })();
}

/* Le mur de base (SANS lame) — peint une seule fois, sert deux
   maîtres : la texture finale (base + lame) et le cache d'allumage
   (copie exacte de la région, lame éteinte). */
/* Construction du mur de base — MÊME séquence en sync (filet des
   getters) et en async découpé (prepareSceneTextures) : une seule
   écriture, zéro divergence de pixels. */
let wallBaseCanvas: HTMLCanvasElement | null = null;
const wallField = (u: number, v: number) =>
  /* v=1 ↔ haut du mur */
  wallColor(WALL_X0 + u * WALL_W, FLOOR_Y + v * (WALL_TOP - FLOOR_Y));

async function buildWallBaseAsync(yieldFn: YieldFn, onStep: (p: number) => void) {
  if (wallBaseCanvas) return wallBaseCanvas;
  if (!VIEW.wide) {
    const c = await paintCanvasInto(WALL_TEX_W, WALL_TEX_H, wallField, true, yieldFn, (row) =>
      onStep((row / WALL_TEX_H) * 0.9)
    );
    drawAtelierLayer(c);
    onStep(1);
    wallBaseCanvas = c;
  } else {
    const fields = await paintCanvasInto(WALL_TEX_W, WALL_TEX_H, wallField, false, yieldFn, (row) =>
      onStep((row / WALL_TEX_H) * 0.5)
    );
    const up = upscaleCanvas(fields, VIEW.wallOutW, VIEW.wallOutH);
    onStep(0.55);
    await addFilmGrain(up, yieldFn);
    onStep(0.9);
    drawAtelierLayer(up);
    onStep(1);
    wallBaseCanvas = up;
  }
  return wallBaseCanvas;
}

function getWallBaseCanvas() {
  if (!wallBaseCanvas) {
    if (!VIEW.wide) {
      /* legacy : le pipeline du run 1, identique au pixel */
      wallBaseCanvas = paintCanvas(WALL_TEX_W, WALL_TEX_H, wallField);
      drawAtelierLayer(wallBaseCanvas);
    } else {
      /* wide : champs 2048 → upscale → grain natif → vectoriel
         natif (grille, filigrane, annotations à pleine densité) */
      const fields = paintCanvas(WALL_TEX_W, WALL_TEX_H, wallField, false);
      wallBaseCanvas = upscaleCanvas(fields, VIEW.wallOutW, VIEW.wallOutH);
      addFilmGrain(wallBaseCanvas);
      drawAtelierLayer(wallBaseCanvas);
    }
  }
  return wallBaseCanvas;
}

let wallFinalCanvas: HTMLCanvasElement | null = null;
let wallTexture: THREE.CanvasTexture | null = null;
function getWallTexture() {
  if (!wallTexture) {
    if (!wallFinalCanvas) {
      const base = getWallBaseCanvas();
      wallFinalCanvas = document.createElement("canvas");
      wallFinalCanvas.width = base.width;
      wallFinalCanvas.height = base.height;
      wallFinalCanvas.getContext("2d")!.drawImage(base, 0, 0);
      addAccentToCanvas(wallFinalCanvas);
    }
    wallTexture = makeTexture(wallFinalCanvas, 4);
  }
  return wallTexture;
}

/* La texture du cache d'allumage : la région de la lame, copiée du
   mur SANS lame — posée devant le mur, elle l'éteint ; son fondu
   l'allume. */
let accentCoverTexture: THREE.CanvasTexture | null = null;
function getAccentCoverTexture() {
  if (!accentCoverTexture) {
    const base = getWallBaseCanvas();
    const W = base.width;
    const H = base.height;
    const px0 = Math.floor(((ACC_X0 - WALL_X0) / WALL_W) * W);
    const px1 = Math.ceil(((ACC_X1 - WALL_X0) / WALL_W) * W);
    const py0 = Math.floor((1 - (ACC_Y1 - FLOOR_Y) / (WALL_TOP - FLOOR_Y)) * H);
    const canvas = document.createElement("canvas");
    canvas.width = px1 - px0;
    canvas.height = H - py0;
    canvas
      .getContext("2d")!
      .drawImage(base, px0, py0, px1 - px0, H - py0, 0, 0, px1 - px0, H - py0);
    accentCoverTexture = makeTexture(canvas, 4);
  }
  return accentCoverTexture;
}

/* Le reflet du monogramme sur le sol — la silhouette ΛV couchée
   vers la caméra, roughness élevée (blur), opacité 0,12 au pied,
   éteinte en ≈ 120 px (1,05 unité). Le détail que les jurés
   zooment : il pose la pièce dans la matière du studio. */
function drawMonogramReflection(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const X = (wx: number) => ((wx - WALL_X0) / WALL_W) * W;
  const ZP = (wz: number) => (1 - (wz - WALL_Z) / FLOOR_D) * H;
  /* la rasance de la caméra compresse l'avant-scène : le reflet
     s'ÉTIRE (×1,4) pour rester lisible à l'écran (~120 px) */
  const STRETCH = 1.4;
  const grad = ctx.createLinearGradient(0, ZP(0.32), 0, ZP(0.32 + LOGO_H * STRETCH));
  grad.addColorStop(0, "rgba(43,36,80,0.16)");
  grad.addColorStop(0.45, "rgba(52,44,96,0.07)");
  grad.addColorStop(1, "rgba(43,36,80,0)");
  ctx.save();
  /* le blur suit la densité de la texture (5 px @ 1536) */
  ctx.filter = `blur(${((5 * W) / 1536).toFixed(1)}px)`;
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (const poly of LOGO_POLYS) {
    poly.forEach(([nx, ny], i) => {
      /* miroir : le pied (ny = 1) reste au contact, le sommet part
         vers la caméra ; léger écrasement (pose tournée −0,3 rad) */
      const wxp = MONO_X + 0.06 + (nx - 0.5) * LOGO_H * LOGO_RATIO * 0.95;
      const wzp = 0.32 + (1 - ny) * LOGO_H * STRETCH;
      const px = X(wxp);
      const py = ZP(wzp);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.closePath();
  }
  ctx.fill();
  ctx.restore();
}

/* La ligne de base du mur, pré-calculée colonne par colonne : le
   fondu d'horizon du sol la lit par index. */
let wallBottomRow: Float32Array | null = null;
function buildWallBottomRow() {
  if (wallBottomRow) return;
  const row = new Float32Array(FLOOR_TEX_W * 3);
  for (let i = 0; i < FLOOR_TEX_W; i++) {
    const wx = WALL_X0 + (i / (FLOOR_TEX_W - 1)) * WALL_W;
    const c = wallColor(wx, FLOOR_Y + 0.02);
    row[i * 3] = c[0];
    row[i * 3 + 1] = c[1];
    row[i * 3 + 2] = c[2];
  }
  wallBottomRow = row;
}

let floorFinalCanvas: HTMLCanvasElement | null = null;
let floorTexture: THREE.CanvasTexture | null = null;
const floorField = (u: number, v: number) =>
  /* v=1 ↔ fond du sol (contre le mur, z = WALL_Z) */
  floorColor(WALL_X0 + u * WALL_W, WALL_Z + (1 - v) * FLOOR_D);

async function buildFloorAsync(yieldFn: YieldFn, onStep: (p: number) => void) {
  if (floorFinalCanvas) return floorFinalCanvas;
  buildWallBottomRow();
  if (!VIEW.wide) {
    const c = await paintCanvasInto(FLOOR_TEX_W, FLOOR_TEX_H, floorField, true, yieldFn, (row) =>
      onStep((row / FLOOR_TEX_H) * 0.92)
    );
    drawMonogramReflection(c);
    onStep(1);
    floorFinalCanvas = c;
  } else {
    const fields = await paintCanvasInto(FLOOR_TEX_W, FLOOR_TEX_H, floorField, false, yieldFn, (row) =>
      onStep((row / FLOOR_TEX_H) * 0.55)
    );
    const up = upscaleCanvas(fields, VIEW.floorOutW, VIEW.floorOutH);
    onStep(0.6);
    await addFilmGrain(up, yieldFn);
    onStep(0.95);
    drawMonogramReflection(up);
    onStep(1);
    floorFinalCanvas = up;
  }
  return floorFinalCanvas;
}

function getFloorTexture() {
  if (!floorTexture) {
    if (!floorFinalCanvas) {
      buildWallBottomRow();
      if (!VIEW.wide) {
        floorFinalCanvas = paintCanvas(FLOOR_TEX_W, FLOOR_TEX_H, floorField);
        drawMonogramReflection(floorFinalCanvas);
      } else {
        const fields = paintCanvas(FLOOR_TEX_W, FLOOR_TEX_H, floorField, false);
        floorFinalCanvas = upscaleCanvas(fields, VIEW.floorOutW, VIEW.floorOutH);
        addFilmGrain(floorFinalCanvas);
        drawMonogramReflection(floorFinalCanvas);
      }
    }
    floorTexture = makeTexture(floorFinalCanvas, 8);
  }
  return floorTexture;
}

/* ── Préparation asynchrone des textures — la scène sans gel ────
   Peint tout AVANT le montage du Canvas, en tranches qui rendent
   la main (~10-20 ms de travail par macro-tâche) : le poster et
   le loader restent vivants, et chaque étape émet sa progression
   RÉELLE (window « neva:progress », consommée par l'ouverture).
   Idempotent ; strictement les mêmes pixels que le chemin sync. */
let scenePrepPromise: Promise<void> | null = null;
export function prepareSceneTextures(
  onProgress?: (p: number) => void
): Promise<void> {
  if (scenePrepPromise) return scenePrepPromise;
  const yieldFn: YieldFn = () => new Promise((r) => setTimeout(r, 0));
  /* pondération : mur (peinture+grain) ~55 %, lame 8 %, sol 37 % */
  const emit = (p: number) => {
    onProgress?.(p);
    try {
      window.dispatchEvent(
        new CustomEvent("neva:progress", { detail: { phase: "scene", p } })
      );
    } catch {
      /* environnement sans CustomEvent : silencieux */
    }
  };
  scenePrepPromise = (async () => {
    await buildWallBaseAsync(yieldFn, (p) => emit(p * 0.5));
    const base = wallBaseCanvas!;
    if (!wallFinalCanvas) {
      const c = document.createElement("canvas");
      c.width = base.width;
      c.height = base.height;
      c.getContext("2d")!.drawImage(base, 0, 0);
      await addAccentToCanvas(c, yieldFn);
      wallFinalCanvas = c;
    }
    emit(0.58);
    await buildFloorAsync(yieldFn, (p) => emit(0.58 + p * 0.4));
    emit(1);
  })();
  return scenePrepPromise;
}

/* ── Le décor que l'œil voit — deux plans réels ────────────────
   Leur jonction géométrique est la ligne d'horizon : nette à
   toutes les tailles, sans couture possible. */
function DawnRoom() {
  const wallTex = useMemo(() => getWallTexture(), []);
  const floorTex = useMemo(() => getFloorTexture(), []);

  return (
    <>
      <mesh position={[0, (FLOOR_Y + WALL_TOP) / 2, WALL_Z]}>
        <planeGeometry args={[WALL_W, WALL_TOP - FLOOR_Y]} />
        <meshBasicMaterial map={wallTex} toneMapped={false} />
      </mesh>
      <mesh
        position={[0, FLOOR_Y, WALL_Z + FLOOR_D / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[WALL_W, FLOOR_D]} />
        <meshBasicMaterial map={floorTex} toneMapped={false} />
      </mesh>
    </>
  );
}

/* La respiration de la lumière — un voile additif strictement
   aligné sur les taches de fenêtre du mur, dont l'opacité ondule
   très lentement. Transparent : il vit à l'écran seulement, le
   décor réfracté reste stable. */
function DawnBreath() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const texture = useMemo(() => {
    const w = 1024;
    const h = Math.round((w * (WALL_TOP - FLOOR_Y)) / WALL_W);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let py = 0; py < h; py++) {
      const v = 1 - py / (h - 1);
      for (let px = 0; px < w; px++) {
        const u = px / (w - 1);
        const wy = FLOOR_Y + v * (WALL_TOP - FLOOR_Y);
        const [gain] = paneWall(WALL_X0 + u * WALL_W, wy);
        const i = (py * w + px) * 4;
        data[i] = 255;
        data[i + 1] = 253;
        data[i + 2] = 255;
        data[i + 3] = Math.round(clamp01(gain * 5.2) * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    if (matRef.current) {
      /* période ≈ 30 s, sans jamais s'éteindre ni saturer — et la
         respiration s'éveille avec l'assemblage (fenêtre 1→4 s) */
      const t = state.clock.elapsedTime;
      matRef.current.opacity =
        (0.042 + 0.042 * Math.sin(t * 0.21)) *
        easeOutCubic(progress(t, 1.0, 3.0));
    }
  });

  return (
    <mesh
      position={[0, (FLOOR_Y + WALL_TOP) / 2, WALL_Z + 0.02]}
      renderOrder={-9}
    >
      <planeGeometry args={[WALL_W, WALL_TOP - FLOOR_Y]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Caustiques au sol — la lumière ressort du verre ────────────
   Trois arcs très dilués au pied du monogramme, en dérive f(t)
   absolue ultra lente (offset de texture + opacité sinusoïdale).
   Gain ≤ 0,05 : une vibration de matière, pas un effet. */
function FloorCaustics() {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const texture = useMemo(() => {
    const w = 512;
    const h = 320;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    /* arcs elliptiques emboîtés, flous — la signature caustique */
    ctx.filter = "blur(7px)";
    const arcs: [number, number, number, number, number, number, number][] = [
      /* cx, cy, rx, ry, a0, a1, alpha */
      [w * 0.46, h * 0.5, 92, 40, -0.4, 2.6, 0.5],
      [w * 0.52, h * 0.56, 132, 55, 2.9, 5.6, 0.36],
      [w * 0.38, h * 0.44, 58, 26, 0.6, 3.4, 0.42],
      [w * 0.62, h * 0.5, 70, 30, 3.6, 6.1, 0.3],
    ];
    for (const [cx, cy, rx, ry, a0, a1, al] of arcs) {
      ctx.strokeStyle = `rgba(255, 250, 242, ${al})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0.2, a0, a1);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (matRef.current) {
      /* opacité : jamais nulle, jamais > 0,05 d'apport perçu ;
         s'éveille avec l'assemblage (fenêtre 1,2 → 3,6 s) */
      matRef.current.opacity =
        (0.032 + 0.016 * Math.sin((t * Math.PI * 2) / 38)) *
        easeOutCubic(progress(t, 1.2, 2.4));
    }
    /* la nappe dérive en f(t) absolu — offset de texture, pas de
       transform de mesh : le pattern glisse dans son cadre */
    texture.offset.x = 0.012 * Math.sin((t * Math.PI * 2) / 71);
    texture.offset.y = 0.01 * Math.sin((t * Math.PI * 2) / 53 + 1.7);
  });

  return (
    <mesh
      position={[MONO_X + 0.15, FLOOR_Y + 0.012, 1.05]}
      rotation={[-Math.PI / 2, 0, 0.12]}
      renderOrder={-8}
    >
      <planeGeometry args={[4.6, 2.6]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        toneMapped={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ── Le verre — une seule recette, déclinée ──────────────────────
   MeshPhysicalMaterial natif : transmission à fond, roughness au
   plancher (la réfraction reste nette), ior de verre réel, une
   pointe de dispersion pour l'aberration chromatique des arêtes.
   Couleur blanche, toujours : la teinte vient du décor réfracté et
   d'une atténuation très claire — jamais d'une peinture.

   getIBLVolumeRefraction est patché : le rayon réfracté est
   intersecté avec les plans réels du décor (mur z = WALL_Z, sol
   y = FLOOR_Y) et lit leurs textures en unités monde — réfraction
   géométriquement juste, netteté indépendante de l'écran. uBend
   dose la « cassure » PAR PIÈCE : 0 = plaque à faces parallèles
   (le fond traverse à peine déplacé), 1 = plein rayon réfracté
   (cristal dramatique). Le monogramme massif casse fort ; le tube
   fin de l'anneau reste une lentille locale — sinon il
   échantillonne des zones lointaines uniformes et vire au lait. */
const DEFAULT_BEND = 0.72;

const fmt = (n: number) => n.toFixed(4);
const GLSL_UNIFORMS = `
	uniform sampler2D uWallMap;
	uniform sampler2D uFloorMap;
	uniform float uBend;
`;
/* Insérée APRÈS textureBicubic/applyIorToRoughness (pas de
   hoisting en GLSL : l'ordre des définitions est la loi). */
const GLSL_SAMPLER = `
	vec4 sampleDawnWorld( const in vec3 ro, const in vec3 rdRefract, const in float roughness, const in float ior ) {
		vec3 rd = normalize( mix( normalize( ro - cameraPosition ), normalize( rdRefract ), uBend ) );
		/* seules les intersections DEVANT le rayon comptent : un point
		   de sortie passé sous le sol (thickness > garde au sol) rend
		   un t négatif — sans ce rejet, le verre lit un bord de
		   texture et vire au lait */
		float tWall = rd.z < -0.0001 ? ( ${fmt(WALL_Z)} - ro.z ) / rd.z : 1e8;
		if ( tWall < 0.0 ) tWall = 1e8;
		float tFloor = rd.y < -0.0001 ? ( ${fmt(FLOOR_Y)} - ro.y ) / rd.y : 1e8;
		if ( tFloor < 0.0 ) tFloor = 1e8;
		float tBack = rd.z > 0.0001 ? ( ${fmt(BACK_WALL_Z)} - ro.z ) / rd.z : 1e8;
		if ( tBack < 0.0 ) tBack = 1e8;
		float rr = applyIorToRoughness( roughness, ior );
		vec4 s;
		if ( tFloor < tWall && tFloor < tBack ) {
			vec3 p = ro + rd * tFloor;
			vec2 uv = vec2( ( p.x - ${fmt(WALL_X0)} ) / ${fmt(WALL_W)}, 1.0 - ( p.z - ${fmt(WALL_Z)} ) / ${fmt(FLOOR_D)} );
			s = textureBicubic( uFloorMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(VIEW.floorOutW))} * rr );
		} else if ( tBack < tWall ) {
			/* mur virtuel derrière la caméra — même matière, en miroir */
			vec3 p = ro + rd * tBack;
			vec2 uv = vec2( 1.0 - ( p.x - ${fmt(WALL_X0)} ) / ${fmt(WALL_W)}, ( p.y - ${fmt(FLOOR_Y)} ) / ${fmt(WALL_TOP - FLOOR_Y)} );
			s = textureBicubic( uWallMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(VIEW.wallOutW))} * ( rr + 0.06 ) );
		} else {
			vec3 p = ro + rd * min( tWall, 44.0 );
			vec2 uv = vec2( ( p.x - ${fmt(WALL_X0)} ) / ${fmt(WALL_W)}, ( p.y - ${fmt(FLOOR_Y)} ) / ${fmt(WALL_TOP - FLOOR_Y)} );
			s = textureBicubic( uWallMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(VIEW.wallOutW))} * rr );
		}
		/* le cristal concentre : gain de contraste sur le décor
		   traversé, pivot calé sur l'ivoire du cyc (~0.88) — les
		   ombres, la grille et la lettre fantôme s'enfoncent dans le
		   verre, les clairs restent clairs sans jamais saturer */
		s.rgb = clamp( ( s.rgb - 0.88 ) * 1.34 + 0.878, vec3( 0.10 ), vec3( 0.988 ) );
		return s;
	}
`;

function patchGlassShader(
  this: THREE.MeshPhysicalMaterial,
  shader: {
    uniforms: Record<string, unknown>;
    fragmentShader: string;
  }
) {
  shader.uniforms.uWallMap = { value: getWallTexture() };
  shader.uniforms.uFloorMap = { value: getFloorTexture() };
  /* le bend vit sur le matériau : même programme compilé pour
     toutes les pièces, uniforms distincts */
  shader.uniforms.uBend = {
    value: (this.userData.bend as number | undefined) ?? DEFAULT_BEND,
  };
  /* Les #include ne sont résolus qu'à la compilation : on substitue
     nous-mêmes le chunk de transmission, modifié. */
  const chunk = THREE.ShaderChunk.transmission_pars_fragment
    .replace(
      "uniform sampler2D transmissionSamplerMap;",
      "uniform sampler2D transmissionSamplerMap;" + GLSL_UNIFORMS
    )
    .replace(
      "vec4 getIBLVolumeRefraction(",
      GLSL_SAMPLER + "\n\tvec4 getIBLVolumeRefraction("
    )
    .replace(
      "vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );",
      "vec4 transmissionSample = sampleDawnWorld( refractedRayExit, transmissionRay, roughness, iors[ i ] );"
    )
    .replace(
      "transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );",
      "transmittedLight = sampleDawnWorld( refractedRayExit, transmissionRay, roughness, ior );"
    );
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <transmission_pars_fragment>",
    chunk
  );
}
const glassCacheKey = () => "dawn-glass-14";

type GlassProps = {
  thickness?: number;
  ior?: number;
  roughness?: number;
  dispersion?: number;
  attenuationDistance?: number;
  attenuationColor?: string;
  envMapIntensity?: number;
  bend?: number;
};

function Glass({
  thickness = 1.0,
  ior = 1.5,
  roughness = 0.025,
  dispersion = 0.25,
  attenuationDistance = 6,
  attenuationColor = "#f1edfb",
  envMapIntensity = 0.35,
  bend = DEFAULT_BEND,
}: GlassProps) {
  /* Matériau construit impérativement : R3F n'applique pas
     onBeforeCompile/customProgramCacheKey passés en props JSX — le
     patch de shader n'existerait pas. */
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness,
      ior,
      roughness,
      dispersion,
      metalness: 0,
      color: "#ffffff",
      attenuationColor,
      attenuationDistance,
      specularIntensity: 1,
      envMapIntensity,
    });
    m.userData.bend = bend;
    m.onBeforeCompile = patchGlassShader;
    m.customProgramCacheKey = glassCacheKey;
    return m;
  }, [
    thickness,
    ior,
    roughness,
    dispersion,
    attenuationDistance,
    attenuationColor,
    envMapIntensity,
    bend,
  ]);

  useEffect(() => () => material.dispose(), [material]);

  return <primitive object={material} attach="material" />;
}

/* ── Le monogramme Neva — le logomark ΛV taillé dans le cristal ─
   Contours vectorisés depuis /brand/logo-noir-large.png (scan des
   runs noirs, ratio 1.441). Quatre pièces solidaires : le grand Λ,
   son ▲ intérieur, le grand V, son ▼ intérieur. Extrusion avec
   chanfrein PLAT (bevelSegments 1) : de vraies facettes qui
   cassent la lumière — puis normales par face (flat shading) pour
   que chaque arête existe par son liseré. */
const LOGO_RATIO = 1.441;
const LOGO_H = 2.02;
const LOGO_DEPTH = 0.4;
const LOGO_BEVEL = 0.05;

/* (x, y) normalisés image — y vers le bas */
const LOGO_POLYS: [number, number][][] = [
  /* grand Λ : sommet, pied droit, remontée intérieure, creux,
     descente intérieure, pied gauche */
  [
    [0.3055, 0.0],
    [0.6, 1.0],
    [0.482, 1.0],
    [0.306, 0.379],
    [0.125, 1.0],
    [0.0, 1.0],
  ],
  /* ▲ intérieur */
  [
    [0.305, 0.71],
    [0.388, 1.0],
    [0.222, 1.0],
  ],
  /* grand V : coin haut-gauche, creux intérieur, coin haut-droit,
     pointe basse */
  [
    [0.399, 0.0],
    [0.524, 0.0],
    [0.703, 0.618],
    [0.879, 0.0],
    [0.998, 0.0],
    [0.7045, 0.99],
  ],
  /* ▼ intérieur */
  [
    [0.62, 0.0],
    [0.787, 0.0],
    [0.7035, 0.292],
  ],
];

function useMonogramGeometry() {
  const geometry = useMemo(() => {
    const shapes = LOGO_POLYS.map((poly) => {
      const s = new THREE.Shape();
      poly.forEach(([nx, ny], i) => {
        const x = (nx - 0.5) * LOGO_RATIO * LOGO_H;
        const y = (0.5 - ny) * LOGO_H;
        if (i === 0) s.moveTo(x, y);
        else s.lineTo(x, y);
      });
      s.closePath();
      return s;
    });
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: LOGO_DEPTH,
      bevelEnabled: true,
      bevelThickness: LOGO_BEVEL,
      bevelSize: LOGO_BEVEL,
      bevelOffset: 0,
      bevelSegments: 1,
      curveSegments: 4,
    });
    g.translate(0, 0, -LOGO_DEPTH / 2);
    g.computeVertexNormals();
    return g;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return geometry;
}

const MONO_REST_Y = FLOOR_Y + LOGO_H / 2 + LOGO_BEVEL + 0.005;

function Monogram() {
  const geometry = useMonogramGeometry();
  const mesh = useRef<THREE.Mesh>(null);

  /* Assemblage : le monogramme monte du sol et se pose avec un
     très léger dépassement (settle), pendant le fondu d'entrée du
     canvas. Vie : oscillation lente (±15°, période 80 s — un logo
     vu de dos se lit en miroir : jamais de tour complet) et la
     dispersion qui glisse doucement dans ses teintes. */
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    const rise = settle(progress(t, 0.15, 1.9));
    mesh.current.position.y = MONO_REST_Y - (1 - rise) * 0.85;
    mesh.current.rotation.y = -0.3 + 0.26 * Math.sin((t * Math.PI * 2) / 80);
    const mat = mesh.current.material as THREE.MeshPhysicalMaterial;
    if (mat && "dispersion" in mat) {
      mat.dispersion = 0.55 + 0.12 * Math.sin((t * Math.PI * 2) / 45);
    }
  });

  return (
    <mesh
      ref={mesh}
      geometry={geometry}
      position={[MONO_X, MONO_REST_Y, 0]}
      rotation={[0, -0.34, 0]}
    >
      <Glass
        thickness={1.45}
        ior={1.52}
        dispersion={0.55}
        roughness={0.015}
        attenuationDistance={2.4}
        attenuationColor="#f2eefb"
        envMapIntensity={0.85}
      />
    </mesh>
  );
}

/* ── La sculpture — le monogramme et ses satellites ─────────────
   Assemblage décalé à l'arrivée (chaque satellite dérive à sa
   place), puis vie au ralenti : précession de l'anneau, dérive
   verticale à peine perceptible de la sphère et de la bille. Le
   groupe entier glisse doucement au scroll (SCROLL.p). */
function Sculpture() {
  const root = useRef<THREE.Group>(null);
  const sphere = useRef<THREE.Mesh>(null);
  const bead = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (root.current) {
      root.current.position.y = -SCROLL.p * 0.55;
    }
    if (sphere.current) {
      const arrive = easeOutCubic(progress(t, 0.85, 2.0));
      sphere.current.position.x = SPHERE_X + (1 - arrive) * 0.35;
      sphere.current.position.y =
        FLOOR_Y + 2.52 + (1 - arrive) * 0.95 + Math.sin(t * 0.3) * 0.038;
    }
    if (bead.current) {
      const arrive = easeOutCubic(progress(t, 1.15, 2.0));
      bead.current.position.y =
        FLOOR_Y + 3.28 + (1 - arrive) * 0.6 + Math.sin(t * 0.27) * 0.07;
    }
    /* précession : l'axe de l'anneau tangue très lentement pendant
       que le tore tourne sur lui-même — orientation ABSOLUE f(t),
       jamais incrémentale (preuve pixel) */
    if (ring.current) {
      const arrive = easeOutCubic(progress(t, 0.55, 1.9));
      ring.current.position.x = RING_X - (1 - arrive) * 0.65;
      ring.current.position.y = FLOOR_Y + 0.61 + (1 - arrive) * 0.28;
      ring.current.position.z = RING_Z + (1 - arrive) * 0.35;
      ring.current.rotation.set(
        Math.PI / 2 - 1.32 + 0.07 * Math.sin((t * Math.PI * 2) / 44),
        0.05 * Math.sin((t * Math.PI * 2) / 61),
        0.3
      );
      ring.current.rotateZ((t * 0.05) % (Math.PI * 2));
    }
  });

  return (
    <group ref={root}>
      <Monogram />

      {/* L'anneau — posé devant l'épaule gauche du monogramme,
          presque couché : sa tranche épaisse plie l'horizon dans
          son anneau */}
      <mesh
        ref={ring}
        position={[RING_X, FLOOR_Y + 0.61, RING_Z]}
        rotation={[Math.PI / 2 - 1.32, 0, 0.3]}
      >
        <torusGeometry args={[0.42, 0.185, 64, 160]} />
        <Glass
          thickness={0.3}
          ior={1.5}
          dispersion={0.22}
          roughness={0.02}
          attenuationDistance={1.4}
          attenuationColor="#eae5f6"
          envMapIntensity={0.15}
          bend={0.34}
        />
      </mesh>

      {/* La sphère — en lévitation au-dessus de l'épaule gauche du
          monogramme. Un verre à peine satiné : elle attrape le
          reflet net des softbox fenêtre */}
      <mesh ref={sphere} position={[SPHERE_X, FLOOR_Y + 2.52, SPHERE_Z]}>
        <sphereGeometry args={[0.4, 64, 64]} />
        <Glass
          thickness={0.8}
          ior={1.45}
          dispersion={0.08}
          roughness={0.17}
          attenuationDistance={2.8}
          attenuationColor="#eee9f8"
          envMapIntensity={1.0}
          bend={0.5}
        />
      </mesh>

      {/* La bille — en lévitation haute à droite, la respiration
          de la scène */}
      <mesh ref={bead} position={[BEAD_X, FLOOR_Y + 3.28, -0.7]}>
        <sphereGeometry args={[0.14, 48, 48]} />
        <Glass thickness={0.28} roughness={0.02} dispersion={0.15} bend={0.45} />
      </mesh>
    </group>
  );
}

/* ── Lumière — studio du matin ─────────────────────────────────
   L'environnement est rendu UNE fois (frames=1, resolution 256).
   Deux softbox « fenêtre » verticales haut-gauche sculptent les
   chanfreins en liserés ; un rail horizontal allume les arêtes
   hautes ; un rim froid à droite détache les silhouettes ; le
   reste ne fait qu'empêcher le noir. Aucune couleur spectrale ici
   — l'accent vit sur le mur, uniquement. */
function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 7, 5]} intensity={0.45} color="#fff6f2" />
      <Environment resolution={512} frames={1}>
        {/* softbox fenêtre — deux montants ÉTROITS : le verre poli
            se reconnaît à ses reflets fins, les grandes nappes
            rendent les courbes laiteuses */}
        <Lightformer
          form="rect"
          intensity={7}
          position={[-3.9, 5.4, 4.4]}
          scale={[0.55, 3.2, 1]}
          target={[0, 0.3, 0]}
        />
        <Lightformer
          form="rect"
          intensity={5}
          position={[-1.8, 5.6, 4.1]}
          scale={[0.4, 2.8, 1]}
          target={[0, 0.3, 0]}
        />
        {/* rail — le flash des chanfreins horizontaux */}
        <Lightformer
          form="rect"
          intensity={3.5}
          position={[1.2, 6.2, 2.6]}
          scale={[7, 0.26, 1]}
          target={[0.6, 0, 0]}
        />
        {/* ciel de studio — la nappe qui blanchit les faces
            tournées vers le haut (la ref a ses faces sup. blanc
            pur) sans toucher les faces frontales */}
        <Lightformer
          form="rect"
          intensity={4.6}
          position={[-1.5, 7.6, 2.2]}
          scale={[5, 1.5, 1]}
          target={[0.8, 0, 0]}
        />
        {/* rim froid à droite — détache les bords */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[6.2, 1.6, 1.6]}
          scale={[0.22, 4.5, 1]}
          target={[0.8, 0.2, 0]}
        />
        {/* strip bas-avant très faible : les chanfreins inférieurs
            ne meurent pas noirs */}
        <Lightformer
          form="rect"
          intensity={0.55}
          position={[0.5, -2.6, 5]}
          scale={[6, 0.3, 1]}
          target={[0.8, -0.4, 0]}
        />
        {/* assise ambiante — juste ne pas mourir */}
        <Lightformer
          form="rect"
          intensity={0.08}
          position={[0, 3.5, 5]}
          scale={[11, 6, 1]}
          target={[0, 0, 0]}
        />
        {/* rebonds du halo : les deux lobes du mur existent aussi
            dans l'environnement — la sphère satinée et les chanfreins
            attrapent le lilas haut-gauche et la pêche bas-droite */}
        <Lightformer
          form="rect"
          intensity={0.55}
          color="#c3b0f0"
          position={[-5.4, 4.6, -1.2]}
          scale={[4.5, 4, 1]}
          target={[0, 1.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#f6c9a2"
          position={[6.4, 0.5, 0.8]}
          scale={[3.5, 3, 1]}
          target={[0.5, 0.5, 0]}
        />
      </Environment>
    </>
  );
}

/* (Les cadrages POSES vivent en tête de module : le layout de
   scène VIEW en dépend pour caler le frustum du chargement.) */

function CameraRig() {
  const appliedFov = useRef(-1);

  useFrame((state) => {
    const pose = poseFor(
      window.innerWidth,
      window.innerWidth / Math.max(1, window.innerHeight)
    );
    const cam = state.camera as THREE.PerspectiveCamera;
    if (appliedFov.current !== pose.fov) {
      appliedFov.current = pose.fov;
      cam.fov = pose.fov;
      cam.updateProjectionMatrix();
    }
    /* scrub de scroll : la caméra recule et s'élève à peine
       pendant que la première section arrive — fonction pure de
       scrollY, nulle en haut de page */
    const p = SCROLL.p;
    cam.position.set(pose.pos[0], pose.pos[1] + p * 0.3, pose.pos[2] + p * 1.3);
    cam.lookAt(pose.look[0], pose.look[1] + p * 0.12, pose.look[2]);
  });

  return null;
}

/* ── L'allumage de la lame — le cache d'intro ───────────────────
   Une copie exacte de la région du mur SANS la lame, posée juste
   devant lui : au chargement elle éteint la traînée prismatique,
   puis se fond (t ∈ [2.2, 4.6]) — la lame s'allume dans un mur
   par ailleurs identique au pixel. */
function AccentReveal() {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => getAccentCoverTexture(), []);

  useFrame((state) => {
    if (mat.current) {
      mat.current.opacity =
        1 - easeOutCubic(progress(state.clock.elapsedTime, 2.2, 2.4));
    }
  });

  return (
    <mesh
      position={[
        (ACC_X0 + ACC_X1) / 2,
        (ACC_Y0 + ACC_Y1) / 2,
        WALL_Z + 0.03,
      ]}
      renderOrder={-8}
    >
      <planeGeometry args={[ACC_X1 - ACC_X0, ACC_Y1 - ACC_Y0]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={1}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Le canvas — visibilité, DPR, crossfade ──────────────────── */
export default function GlassSculpture({
  className,
  onReady,
}: {
  className?: string;
  onReady?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [ready, setReady] = useState(false);
  /* les textures se peignent AVANT le montage du Canvas, en
     tranches asynchrones : zéro long task (8,7 s de gel mesurés à
     3440 en un seul bloc), le poster reste vivant, le loader lit
     la progression réelle */
  const [texReady, setTexReady] = useState(false);

  useEffect(() => {
    let alive = true;
    prepareSceneTextures().then(() => {
      if (alive) setTexReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* la dérive de scroll — listener passif, valeur lue par frame */
  useEffect(() => {
    const read = () => {
      SCROLL.p = clamp01(window.scrollY / (window.innerHeight * 1.15));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  return (
    <div
      ref={host}
      className={className}
      style={{
        opacity: ready ? 1 : 0,
        transition: "opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-hidden
    >
      {/* Si WebGL est réellement indisponible, le Canvas rend son
          fallback (rien) et le poster baké de GivreHero — la même
          scène, en image — reste visible dessous. Jamais d'autre
          design. */}
      {texReady ? (
      <Canvas
        /* run 2 : plafond 2 (un 4K en scaling 200 % rend natif) —
           jamais au-delà, budget GIVRE §4 */
        dpr={[1, 2]}
        flat
        fallback={null}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0.22, 0.58, 11.6], fov: 31 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={(state) => {
          state.gl.setClearColor("#f1efe9", 1);
          /* La passe de transmission interne n'est plus lue (le
             verre raycast le décor) : on la réduit à néant. */
          (
            state.gl as unknown as { transmissionResolutionScale: number }
          ).transmissionResolutionScale = 0.15;
          setReady(true);
          onReady?.();
          if (process.env.NODE_ENV === "development") {
            (window as unknown as { __sculpt?: unknown }).__sculpt = state;
            (window as unknown as { __sculptView?: unknown }).__sculptView = VIEW;
          }
        }}
        style={{ pointerEvents: "none" }}
      >
        <CameraRig />
        <DawnRoom />
        <DawnBreath />
        <FloorCaustics />
        <AccentReveal />
        <SceneLights />
        <Sculpture />
        <ContactShadows
          position={[SCULPT_X, FLOOR_Y + 0.01, 0.35]}
          scale={8.5}
          far={3}
          blur={2.1}
          opacity={0.26}
          color="#8b7fa9"
          resolution={512}
        />
      </Canvas>
      ) : null}
    </div>
  );
}
