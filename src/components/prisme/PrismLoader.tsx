"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    /* Posé quand l'ouverture est finie (ou déjà vue) : les timelines
       d'entrée des sections lisent ce drapeau pour caler leur delay. */
    __prismLoaded?: boolean;
  }
}

/*
 * Ouverture — le rideau d'atelier (D30, run 2).
 * Sur l'ivoire du studio (grain 2 octaves, halo aurore), le
 * monogramme ΛV se dessine au trait puis s'extrude en verre — la
 * nappe glacée monte dans le tracé, l'ombre portée s'épaissit, une
 * lame de lumière balaie — pendant qu'un compteur mono suit la
 * VRAIE progression de chargement : DOM 20 %, polices 25 %,
 * poster du hero 25 %, préparation des textures de la scène 30 %
 * (jusqu'à 30 % de sa peinture — le seuil où le poster couvre le
 * canvas ; événements « neva:progress » émis par GlassSculpture).
 * À cache chaud tout est prêt ≤ 1,8 s ; sur réseau lent le
 * compteur reflète la réalité — jamais une fausse barre. Sortie
 * par fondu de cache (l'ivoire du veil = l'ivoire de la page).
 * Une fois par session ; jamais aux navigations internes.
 * Purement décoratif : aucun état React, DOM piloté en temps
 * absolu f(t) — aucune branche reduced-motion (preuve 0 diff).
 */
const DRAW_MS = 620; /* le trait se dessine */
const FILL_MS = 560; /* le verre monte, la lame balaie */
const EXIT_MS = 450; /* fondu du cache */
const MIN_SHOW_MS = DRAW_MS + FILL_MS; /* jamais de sortie avant l'extrusion */
const SWEEP_PERIOD_MS = 2400; /* en attente réelle, la lame repasse */

/* le grain de l'atelier — le MÊME motif 2 octaves que les fonds
   de scène (.pv-scene::after), fréquence 0,8, 256 px */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function PrismLoader() {
  const veilRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGGElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const sheenRef = useRef<SVGRectElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;

    const seen = window.sessionStorage.getItem("prism-overture");
    if (seen) {
      window.__prismLoaded = true;
      veil.style.display = "none";
      return;
    }

    /* ── la vraie progression ─────────────────────────────────── */
    const marks = { dom: 0, fonts: 0, poster: 0, scene: 0 };
    const cleanups: (() => void)[] = [];

    if (document.readyState !== "loading") {
      marks.dom = 1;
    } else {
      const onDom = () => {
        marks.dom = 1;
      };
      document.addEventListener("DOMContentLoaded", onDom, { once: true });
      cleanups.push(() => document.removeEventListener("DOMContentLoaded", onDom));
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        marks.fonts = 1;
      });
    } else {
      marks.fonts = 1;
    }

    const posterImg = document.querySelector<HTMLImageElement>(
      "#top picture img"
    );
    if (!posterImg || (posterImg.complete && posterImg.naturalWidth > 0)) {
      marks.poster = 1;
    } else {
      const onPoster = () => {
        marks.poster = 1;
      };
      posterImg.addEventListener("load", onPoster, { once: true });
      posterImg.addEventListener("error", onPoster, { once: true });
      cleanups.push(() => {
        posterImg.removeEventListener("load", onPoster);
        posterImg.removeEventListener("error", onPoster);
      });
    }

    const onScene = (e: Event) => {
      const p = (e as CustomEvent<{ p?: number }>).detail?.p ?? 0;
      if (p > marks.scene) marks.scene = p;
    };
    window.addEventListener("neva:progress", onScene);
    cleanups.push(() => window.removeEventListener("neva:progress", onScene));
    /* filet : si la scène n'émet jamais (WebGL absent, page sans
       hero), sa part se libère après 2,6 s — le loader ne retient
       jamais l'utilisateur en otage d'un canvas mort */
    const sceneFallback = window.setTimeout(() => {
      marks.scene = Math.max(marks.scene, 0.22);
    }, 2600);
    cleanups.push(() => window.clearTimeout(sceneFallback));

    /* seuil scène 22 % : le poster couvre le canvas bien au-delà —
       à cache chaud, p atteint 100 vers 1,4-1,6 s (sortie ≤ 1,8 s) */
    const realProgress = () =>
      marks.dom * 0.2 +
      marks.fonts * 0.25 +
      marks.poster * 0.25 +
      Math.min(marks.scene / 0.22, 1) * 0.3;

    /* ── la chorégraphie f(t) + le compteur réel ──────────────── */
    const t0 = performance.now();
    let raf = 0;
    let leaveTimer = 0;
    let shown = 0; /* le compteur ne recule jamais */
    let leaving = false;
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const tick = (t: number) => {
      const el = t - t0;
      /* compteur : approche exponentielle de la progression RÉELLE
         (rattrapage ~220 ms — des incréments doux, pas de sauts) */
      const target = realProgress() * 100;
      shown = Math.max(shown, shown + (target - shown) * 0.22);
      if (countRef.current)
        countRef.current.textContent = `${String(Math.min(100, Math.round(shown))).padStart(3, "0")} — 100`;
      /* phase 1 : le trait se dessine */
      const pd = easeOut(Math.min(el / DRAW_MS, 1));
      if (strokeRef.current)
        strokeRef.current.style.strokeDashoffset = String(1 - pd);
      /* phase 2 : l'extrusion — le verre monte dans le tracé,
         l'ombre portée s'épaissit sous la pièce */
      const pf = easeOut(Math.min(Math.max((el - DRAW_MS) / FILL_MS, 0), 1));
      if (fillRef.current) fillRef.current.style.opacity = String(pf);
      if (shadowRef.current) {
        shadowRef.current.style.opacity = String(0.16 * pf);
        shadowRef.current.setAttribute("rx", String(560 + 140 * pf));
      }
      /* la lame : un balayage pendant l'extrusion, puis — si le
         chargement réel se prolonge — elle repasse (période fixe,
         fonction absolue du temps) */
      if (sheenRef.current) {
        let sx = -560;
        if (el <= DRAW_MS + FILL_MS) {
          sx = -560 + pf * 2560;
        } else {
          const loop = ((el - DRAW_MS - FILL_MS) % SWEEP_PERIOD_MS) / SWEEP_PERIOD_MS;
          sx = loop < 0.42 ? -560 + easeOut(loop / 0.42) * 2560 : 2000;
        }
        sheenRef.current.setAttribute("x", String(sx));
      }

      const done = realProgress() >= 1 && el >= MIN_SHOW_MS;
      if (!done) {
        raf = requestAnimationFrame(tick);
      } else if (!leaving) {
        leaving = true;
        if (countRef.current) countRef.current.textContent = "100 — 100";
        window.sessionStorage.setItem("prism-overture", "1");
        window.__prismLoaded = true;
        /* sortie : le cache s'éteint en fondu — l'ivoire du veil
           EST l'ivoire de la page, la scène est déjà derrière */
        veil.style.transition = `opacity ${EXIT_MS}ms cubic-bezier(0.65,0,0.35,1)`;
        veil.style.opacity = "0";
        veil.style.pointerEvents = "none";
        leaveTimer = window.setTimeout(() => {
          veil.style.display = "none";
        }, EXIT_MS + 60);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(leaveTimer);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={veilRef}
      aria-hidden
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#F1EFE9]"
    >
      {/* le halo de l'atelier respire déjà derrière le monogramme */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(30% 38% at 40% 34%, rgba(164,139,232,0.16) 0%, rgba(164,139,232,0) 70%), radial-gradient(26% 34% at 60% 62%, rgba(239,184,148,0.15) 0%, rgba(239,184,148,0) 72%)",
        }}
      />
      {/* le grain de l'atelier — 2 octaves, comme chaque scène */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: GRAIN_URI,
          backgroundSize: "256px 256px",
          opacity: 0.028,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative flex w-[240px] flex-col items-center gap-7">
        <svg viewBox="0 0 1441 1120" className="w-[120px]">
          <defs>
            <linearGradient id="pvGlassFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(164,139,232,0.2)" />
              <stop offset="55%" stopColor="rgba(246,243,238,0.55)" />
              <stop offset="100%" stopColor="rgba(239,184,148,0.24)" />
            </linearGradient>
            <clipPath id="pvMonoClip">
              <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
              <path d="M439.5 710 L559.2 1000 L320 1000 Z" />
              <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
              <path d="M893.4 0 L1134.1 0 L1013.7 292 Z" />
            </clipPath>
          </defs>
          {/* l'ombre portée de l'extrusion — la pièce se pose */}
          <ellipse
            ref={shadowRef}
            cx="720"
            cy="1078"
            rx="560"
            ry="26"
            fill="rgba(43,36,80,1)"
            style={{ opacity: 0, filter: "blur(14px)" }}
          />
          {/* le verre — monte dans le tracé, avec sa lame */}
          <g ref={fillRef} style={{ opacity: 0 }}>
            <g clipPath="url(#pvMonoClip)">
              <rect width="1441" height="1000" fill="url(#pvGlassFill)" />
              <rect
                ref={sheenRef}
                x="-560"
                y="-60"
                width="360"
                height="1120"
                fill="rgba(255,255,255,0.55)"
                transform="skewX(-14)"
              />
            </g>
          </g>
          {/* le trait — se dessine en premier */}
          <g
            ref={strokeRef}
            fill="none"
            stroke="#2B2450"
            strokeWidth="7"
            pathLength={1}
            strokeDasharray="1"
            style={{ strokeDashoffset: 1 }}
          >
            <path pathLength={1} d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
            <path pathLength={1} d="M439.5 710 L559.2 1000 L320 1000 Z" />
            <path pathLength={1} d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
            <path pathLength={1} d="M893.4 0 L1134.1 0 L1013.7 292 Z" />
          </g>
        </svg>
        <span
          ref={countRef}
          className="font-mono text-[10px] tracking-[0.3em] text-mist"
        >
          000 — 100
        </span>
      </div>
    </div>
  );
}
