"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    /* Posé quand l'ouverture est finie (ou déjà vue) : les timelines
       d'entrée des sections lisent ce drapeau pour caler leur delay. */
    __prismLoaded?: boolean;
  }
}

/*
 * Ouverture — le rideau blanc de la galerie.
 * Une barre d'un pixel se remplit du spectre, le compteur mono grimpe,
 * puis le voile glisse vers le haut et révèle les murs blancs.
 * Ne joue qu'une fois par session.
 * Purement décoratif : aucun état React, le DOM est piloté en direct.
 */
export default function PrismLoader() {
  const veilRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
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
    const duration = 900;
    let raf = 0;
    let leaveTimer = 0;

    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(eased * 100);
      if (barRef.current) barRef.current.style.width = `${v}%`;
      if (countRef.current)
        countRef.current.textContent = `${String(v).padStart(2, "0")} — 100`;
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        window.sessionStorage.setItem("prism-overture", "1");
        window.__prismLoaded = true;
        veil.style.transitionDelay = "0.1s";
        veil.style.transform = "translateY(-101%)";
        veil.style.pointerEvents = "none";
        leaveTimer = window.setTimeout(() => {
          veil.style.display = "none";
        }, 1000);
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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#EEF0F7] transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="flex w-[200px] flex-col items-center gap-6">
        <Image
          src="/brand/logo-noir.png"
          alt=""
          width={44}
          height={30}
          preload
          className="h-[30px] w-auto"
        />
        <span className="block h-px w-full overflow-hidden bg-[rgba(43,36,80,0.12)]">
          <span
            ref={barRef}
            className="block h-full w-0 bg-[linear-gradient(115deg,#A48BE8,#EFB894)]"
          />
        </span>
        <span
          ref={countRef}
          className="font-mono text-[10px] tracking-[0.3em] text-[#697192]"
        >
          00 — 100
        </span>
      </div>
    </div>
  );
}
