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
const WALL_Z = -6.5;
const WALL_X0 = -11;
const WALL_W = 22;
const WALL_TOP = FLOOR_Y + 11; // 9.28
const FLOOR_D = 17.5; // z ∈ [WALL_Z, WALL_Z + 17.5]

const WALL_TEX_W = 2560;
const WALL_TEX_H = Math.round((WALL_TEX_W * 11) / WALL_W); // 1280
const FLOOR_TEX_W = 1792;
const FLOOR_TEX_H = Math.round((FLOOR_TEX_W * FLOOR_D) / WALL_W); // ≈ 1425

/* La sculpture vit autour de x = SCULPT_X, posée au sol. Les
   positions des satellites sont partagées avec le peintre du sol
   (ombres, reflets) : une seule vérité. */
const SCULPT_X = 1.25;
const MONO_X = SCULPT_X + 0.15;
/* L'anneau reste dans l'orbite du monogramme : plus près qu'en
   v27 — il ne doit JAMAIS mordre la colonne de texte à gauche
   (zone de sécurité UI). */
const RING_X = SCULPT_X - 0.92;
const RING_Z = 0.5;
const SPHERE_X = SCULPT_X - 0.52;
const SPHERE_Z = -0.5;
const BEAD_X = SCULPT_X + 1.55;
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
const SLANT = 0.42;
const paneU = (wx: number, wy: number) => wx - (wy - FLOOR_Y) * SLANT;

/* Tache principale : u ∈ [-0.7, 1.9], du congé à y = 6.1 */
const PANE_A = { u0: -0.7, u1: 1.9, yTop: 6.1 };
/* Rai secondaire : u ∈ [6.1, 7.5], plus bas et discret */
const PANE_B = { u0: 6.1, u1: 7.5, yTop: 3.4 };

/* Retourne [lumière, ombre-de-croisillon] sur le mur. */
function paneWall(wx: number, wy: number): [number, number] {
  const u = paneU(wx, wy);
  /* les rais meurent avant le congé : le creux du cyc reste vierge */
  const aboveCove = smoothstep(FLOOR_Y + 0.45, FLOOR_Y + 1.05, wy);
  const a =
    slab(u, PANE_A.u0, PANE_A.u1, 0.08) *
    slab(wy, FLOOR_Y + 0.5, PANE_A.yTop, 0.14) *
    aboveCove;
  const b =
    slab(u, PANE_B.u0, PANE_B.u1, 0.08) *
    slab(wy, FLOOR_Y + 0.5, PANE_B.yTop, 0.14) *
    aboveCove;
  /* la tache respire vers sa source (haut-gauche) */
  const srcA = 0.7 + 0.42 * smoothstep(1.9, -0.7, u) * smoothstep(-0.6, 4.4, wy);
  const gain = a * srcA * 0.038 + b * 0.018;
  /* croisillons fins : deux montants + une traverse (il passe
     toujours un carreau derrière chaque pièce de verre), un
     montant dans le rai secondaire */
  let shade = 0;
  shade += bandf(u, -0.05, 0.05, 0.032) * a;
  shade += bandf(u, 1.15, 0.05, 0.032) * a;
  shade += bandf(wy, 2.3, 0.045, 0.03) * a;
  shade += bandf(u, 6.8, 0.055, 0.036) * b;
  return [gain, shade * 0.042];
}

/* ── L'accent Neva — la lame d'aube spectrale ───────────────────
   L'unique point de couleur de la scène : une fente de lumière
   verticale sur le mur, violet en tête → cyan au sol (le spectre
   de la marque), comme une porte entrouverte hors champ. Le verre
   la réfracte : elle réapparaît pliée dans le monogramme. */
const ACCENT_X = 4.35;
const ACCENT_TOP = 3.05;
const VIOLET: readonly number[] = [0.486, 0.416, 1.0];
const CYAN: readonly number[] = [0.298, 0.788, 0.941];

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

/* Le halo aurore — l'unique couleur d'ambiance : une lueur d'aube
   derrière la sculpture, pêche vers le sol, lilas en tête, fondue
   dans l'ivoire sur les bords. */
const AUR_CX = MONO_X + 0.1;
const AUR_CY = 1.6;
const PEACH: readonly number[] = [0.968, 0.848, 0.762];
const LILAC: readonly number[] = [0.802, 0.768, 0.918];

function auroraWall(wx: number, wy: number): [number, number, number] {
  const rr = Math.hypot((wx - AUR_CX) / 3.4, (wy - AUR_CY) / 3.0);
  const glow = smoothstep(1.0, 0.1, rr);
  if (glow <= 0.001) return [0, 0, 0];
  const tv = smoothstep(AUR_CY - 2.6, AUR_CY + 2.4, wy);
  const tint = lerp3(PEACH, LILAC, tv);
  /* cœur d'aube plus chaud, bas, juste derrière le monogramme */
  const core = smoothstep(1.0, 0.0, Math.hypot((wx - AUR_CX) / 1.6, (wy - 0.3) / 1.15));
  return [
    tint[0] * glow * 0.58 + PEACH[0] * core * 0.3,
    tint[1] * glow * 0.58 + PEACH[1] * core * 0.3,
    tint[2] * glow * 0.58 + PEACH[2] * core * 0.3,
  ];
}
/* Poids du halo (0–1) au même point — pour fondre l'ivoire dessous */
function auroraMask(wx: number, wy: number): number {
  const rr = Math.hypot((wx - AUR_CX) / 3.4, (wy - AUR_CY) / 3.0);
  const glow = smoothstep(1.0, 0.1, rr);
  const core = smoothstep(1.0, 0.0, Math.hypot((wx - AUR_CX) / 1.6, (wy - 0.3) / 1.15));
  return clamp01(glow * 0.58 + core * 0.3);
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
  const farC: readonly number[] = [0.899, 0.892, 0.872];

  const d = wz - WALL_Z; /* profondeur depuis le mur */
  const col: number[] = lerp3(nearJ, farC, smoothstep(0.8, 9.0, d));
  /* vignette studio : l'avant-scène et les bords se referment
     doucement, en neutre chaud */
  mix3(col, [0.848, 0.84, 0.822], smoothstep(9.0, 16.5, d) * 0.55);
  mix3(col, [0.872, 0.865, 0.848], smoothstep(6.2, 10.8, Math.abs(wx)) * 0.4);

  /* reflet du halo aurore — la lueur d'aube se pose sur le sol,
     pêche près du mur, fondue en ~2,5 unités */
  const glowR = smoothstep(1.0, 0.08, Math.hypot((wx - AUR_CX) / 3.1, d / 2.4));
  if (glowR > 0.001) {
    const tint = lerp3(PEACH, LILAC, smoothstep(2.2, 0.0, d) * 0.35);
    const k = glowR * 0.24;
    col[0] = col[0] * (1 - k) + tint[0] * k;
    col[1] = col[1] * (1 - k) + tint[1] * k;
    col[2] = col[2] * (1 - k) + tint[2] * k;
  }

  /* retombée des rais — fine, mourant avant le congé et avant
     l'avant-scène */
  const uf = wx - d * SLANT * 0.55;
  const depthFade =
    slab(d, 0.75, 4.4, 0.5) * (1 - smoothstep(2.4, 4.4, d) * 0.6);
  const fa = slab(uf, PANE_A.u0, PANE_A.u1, 0.12) * depthFade;
  const fb = slab(uf, PANE_B.u0, PANE_B.u1, 0.12) * depthFade;
  const gain = fa * 0.042 + fb * 0.022;
  let shade = 0;
  shade += bandf(uf, -0.28, 0.08, 0.05) * fa;
  shade += bandf(uf, 0.78, 0.08, 0.05) * fa;
  shade += bandf(uf, 1.84, 0.08, 0.05) * fa;
  shade += bandf(uf, 6.9, 0.08, 0.05) * fb;
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
  /* ombre douce de la sphère en lévitation */
  mix3(
    col,
    [0.748, 0.738, 0.795],
    smoothstep(
      0.85,
      0.1,
      Math.hypot((wx - SPHERE_X - 0.1) / 0.6, (wz - SPHERE_Z - 0.1) / 0.45)
    ) * 0.2
  );

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

  return [
    Math.min(0.985, Math.max(0.14, col[0])),
    Math.min(0.985, Math.max(0.14, col[1])),
    Math.min(0.985, Math.max(0.14, col[2])),
  ];
}

/* ── Peinture des textures (une seule fois, cache module) ────── */

function paintCanvas(
  w: number,
  h: number,
  color: (u: number, v: number) => [number, number, number]
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let py = 0; py < h; py++) {
    const v = 1 - py / (h - 1); /* v=1 en haut du canvas */
    for (let px = 0; px < w; px++) {
      const u = px / (w - 1);
      const col = color(u, v);
      /* grain de film — deux octaves déterministes (hash2) : le
         fin tue le banding, le grossier tue le « digital plat » */
      const dith =
        (hash2(u * 1400, v * 1400) - 0.5) * 0.016 +
        (hash2(u * 340 + 7.3, v * 340 + 2.1) - 0.5) * 0.009;
      const i = (py * w + px) * 4;
      data[i] = Math.round(clamp01(col[0] + dith) * 255);
      data[i + 1] = Math.round(clamp01(col[1] + dith) * 255);
      data[i + 2] = Math.round(clamp01(col[2] + dith) * 255);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ── La couche atelier — le graphisme du plan de travail ────────
   Par-dessus la peinture du mur : la grille éditoriale ultra fine,
   la lettre fantôme du logomark en filigrane, les hirondelles,
   cotes et annotations d'un studio de création. Dessinée en
   vectoriel 2D sur le canvas AVANT la création de la texture :
   elle vit dans la scène, derrière le verre — le monogramme la
   réfracte. Tout est en positions FIXES : déterministe au pixel. */
const INK_R = 46, INK_G = 50, INK_B = 86; /* encre ardoise-violet */

function drawAtelierLayer(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const unit = W / WALL_W; /* px par unité monde */
  const X = (wx: number) => ((wx - WALL_X0) / WALL_W) * W;
  const Y = (wy: number) => (1 - (wy - FLOOR_Y) / (WALL_TOP - FLOOR_Y)) * H;
  const ink = (a: number) => `rgba(${INK_R},${INK_G},${INK_B},${a})`;

  /* 1 — la grille éditoriale : colonnes et lignes de base à peine
     visibles, qui meurent avant le congé */
  const gridBottom = FLOOR_Y + 0.55;
  ctx.lineWidth = Math.max(1.5, unit * 0.012);
  for (let i = -4; i <= 13; i++) {
    const wx = -9.9 + i * 1.1;
    const major = ((i % 4) + 4) % 4 === 0;
    ctx.strokeStyle = ink(major ? 0.034 : 0.021);
    ctx.beginPath();
    ctx.moveTo(X(wx), Y(8.6));
    ctx.lineTo(X(wx), Y(gridBottom));
    ctx.stroke();
  }
  for (let j = 0; j <= 13; j++) {
    const wy = gridBottom + j * 0.55;
    ctx.strokeStyle = ink(j % 4 === 0 ? 0.03 : 0.019);
    ctx.beginPath();
    ctx.moveTo(X(-10.6), Y(wy));
    ctx.lineTo(X(10.6), Y(wy));
    ctx.stroke();
  }

  /* 2 — la lettre fantôme : le logomark géant en filigrane,
     décalé derrière/à droite de la sculpture, posé au sol */
  const GH_H = 5.3;
  const GH_W = GH_H * LOGO_RATIO;
  const ghCx = MONO_X + 1.35;
  ctx.fillStyle = ink(0.036);
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
  /* cote horizontale au-dessus de la zone */
  const dimY = Y(by1 + 0.42);
  ctx.strokeStyle = ink(0.12);
  ctx.beginPath();
  ctx.moveTo(X(bx0), dimY);
  ctx.lineTo(X(bx1), dimY);
  ctx.moveTo(X(bx0), dimY - unit * 0.05);
  ctx.lineTo(X(bx0), dimY + unit * 0.05);
  ctx.moveTo(X(bx1), dimY - unit * 0.05);
  ctx.lineTo(X(bx1), dimY + unit * 0.05);
  ctx.stroke();
  /* annotations mono minuscules — jamais dans l'axe des colonnes
     UI (Terrains vit à droite au-dessus du congé) */
  ctx.fillStyle = ink(0.1);
  ctx.font = `${Math.round(unit * 0.13)}px Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.fillText("2260", X((bx0 + bx1) / 2), dimY - unit * 0.07);
  ctx.textAlign = "left";
  ctx.fillStyle = ink(0.08);
  ctx.fillText("ΛV — EXTRUSION 0.40", X(6.45), Y(FLOOR_Y + 0.34));
  ctx.fillText("R 0.05", X(6.45), Y(FLOOR_Y + 0.12));
  ctx.fillStyle = ink(0.1);
  ctx.fillText("BASELINE 0.55", X(-6.85), Y(6.88));
  ctx.fillText("NV—27", X(-6.85), Y(7.12));
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
   comme toute la peinture) */
function addAccentToCanvas(canvas: HTMLCanvasElement) {
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
  for (let py = py0; py < py1; py++) {
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
  }
  ctx.putImageData(img, px0, py0);
}

/* Le mur de base (SANS lame) — peint une seule fois, sert deux
   maîtres : la texture finale (base + lame) et le cache d'allumage
   (copie exacte de la région, lame éteinte). */
let wallBaseCanvas: HTMLCanvasElement | null = null;
function getWallBaseCanvas() {
  if (!wallBaseCanvas) {
    wallBaseCanvas = paintCanvas(WALL_TEX_W, WALL_TEX_H, (u, v) =>
      /* v=1 ↔ haut du mur */
      wallColor(WALL_X0 + u * WALL_W, FLOOR_Y + v * (WALL_TOP - FLOOR_Y))
    );
    drawAtelierLayer(wallBaseCanvas);
  }
  return wallBaseCanvas;
}

let wallTexture: THREE.CanvasTexture | null = null;
function getWallTexture() {
  if (!wallTexture) {
    const base = getWallBaseCanvas();
    const canvas = document.createElement("canvas");
    canvas.width = base.width;
    canvas.height = base.height;
    canvas.getContext("2d")!.drawImage(base, 0, 0);
    addAccentToCanvas(canvas);
    wallTexture = makeTexture(canvas, 4);
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

let floorTexture: THREE.CanvasTexture | null = null;
function getFloorTexture() {
  if (!floorTexture) {
    floorTexture = makeTexture(
      paintCanvas(FLOOR_TEX_W, FLOOR_TEX_H, (u, v) =>
        /* v=1 ↔ fond du sol (contre le mur, z = WALL_Z) */
        floorColor(WALL_X0 + u * WALL_W, WALL_Z + (1 - v) * FLOOR_D)
      ),
      8
    );
  }
  return floorTexture;
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
			s = textureBicubic( uFloorMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(FLOOR_TEX_W))} * rr );
		} else if ( tBack < tWall ) {
			/* mur virtuel derrière la caméra — même matière, en miroir */
			vec3 p = ro + rd * tBack;
			vec2 uv = vec2( 1.0 - ( p.x - ${fmt(WALL_X0)} ) / ${fmt(WALL_W)}, ( p.y - ${fmt(FLOOR_Y)} ) / ${fmt(WALL_TOP - FLOOR_Y)} );
			s = textureBicubic( uWallMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(WALL_TEX_W))} * ( rr + 0.06 ) );
		} else {
			vec3 p = ro + rd * min( tWall, 44.0 );
			vec2 uv = vec2( ( p.x - ${fmt(WALL_X0)} ) / ${fmt(WALL_W)}, ( p.y - ${fmt(FLOOR_Y)} ) / ${fmt(WALL_TOP - FLOOR_Y)} );
			s = textureBicubic( uWallMap, clamp( uv, 0.002, 0.998 ), ${fmt(Math.log2(WALL_TEX_W))} * rr );
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
        {/* rebonds de scène : lavande à gauche, rosé à droite */}
        <Lightformer
          form="rect"
          intensity={0.35}
          color="#cabdf0"
          position={[-6.8, 1.2, 0.6]}
          scale={[4, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={0.3}
          color="#f4ccd9"
          position={[6.8, 0.4, 2.2]}
          scale={[3, 4, 1]}
          target={[0, 0, 0]}
        />
      </Environment>
    </>
  );
}

/* ── Cadrages — la même scène, six compositions ────────────────
   La sculpture ne bouge jamais : chaque breakpoint est un
   mouvement de caméra (position, focale, visée). ≥ 1024 : la
   sculpture vit à droite du texte ; en dessous : elle revient au
   centre, sous le texte. */
type Pose = {
  pos: [number, number, number];
  fov: number;
  look: [number, number, number];
};

const POSES: { min: number; pose: Pose }[] = [
  { min: 1680, pose: { pos: [0.3, 1.02, 11.6], fov: 29, look: [0.9, 0.46, 0] } },
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

function poseForWidth(w: number): Pose {
  for (const { min, pose } of POSES) if (w >= min) return pose;
  return POSES[POSES.length - 1].pose;
}

function CameraRig() {
  const appliedFov = useRef(-1);

  useFrame((state) => {
    const pose = poseForWidth(window.innerWidth);
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
      <Canvas
        dpr={[1, 1.5]}
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
          }
        }}
        style={{ pointerEvents: "none" }}
      >
        <CameraRig />
        <DawnRoom />
        <DawnBreath />
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
    </div>
  );
}
