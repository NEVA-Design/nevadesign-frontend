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
 * Ouverture — le rideau d'atelier (D30).
 * Sur l'ivoire du studio, le monogramme ΛV se dessine au trait,
 * puis le trait se remplit de verre (une nappe glacée lilas→pêche
 * traversée par une lame de lumière) pendant que le compteur mono
 * grimpe 000 → 100. Sortie par fondu du cache — jamais d'écran
 * blanc, jamais plus de 1,8 s. Une fois par session.
 * Purement décoratif : aucun état React, le DOM est piloté en
 * temps absolu f(t).
 */
const DRAW_MS = 750; /* le trait se dessine */
const FILL_MS = 650; /* le verre monte, la lame balaie */
const EXIT_MS = 450; /* fondu du cache */

export default function PrismLoader() {
  const veilRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGGElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const sheenRef = useRef<SVGRectElement>(null);
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

    const t0 = performance.now();
    const total = DRAW_MS + FILL_MS;
    let raf = 0;
    let leaveTimer = 0;
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const tick = (t: number) => {
      const el = t - t0;
      /* compteur : sur toute la durée, 000 → 100 */
      const pc = Math.min(el / total, 1);
      if (countRef.current)
        countRef.current.textContent = `${String(Math.round(easeOut(pc) * 100)).padStart(3, "0")} — 100`;
      /* phase 1 : le trait */
      const pd = easeOut(Math.min(el / DRAW_MS, 1));
      if (strokeRef.current)
        strokeRef.current.style.strokeDashoffset = String(1 - pd);
      /* phase 2 : le verre + la lame */
      const pf = easeOut(Math.min(Math.max((el - DRAW_MS) / FILL_MS, 0), 1));
      if (fillRef.current) fillRef.current.style.opacity = String(pf);
      if (sheenRef.current)
        sheenRef.current.setAttribute(
          "x",
          String(-560 + pf * 2560)
        );
      if (pc < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.sessionStorage.setItem("prism-overture", "1");
        window.__prismLoaded = true;
        /* sortie : le cache s'éteint en fondu — la scène est déjà
           derrière, aucun écran blanc */
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
      <div className="relative flex w-[240px] flex-col items-center gap-7">
        <svg viewBox="0 0 1441 1000" className="w-[120px]">
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
          {/* le verre — apparaît sous le trait, avec sa lame */}
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
