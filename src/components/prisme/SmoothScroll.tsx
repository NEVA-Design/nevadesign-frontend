"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { detectSceneTier } from "@/components/givre/scene-tier";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll Lenis piloté par le ticker GSAP — une seule horloge rAF.
 * Réservé aux surfaces marketing ; le produit garde le scroll natif.
 * Run 3 : réservé aussi au tier HIGH — le tick permanent
 * (lenis.raf + ScrollTrigger.update à chaque frame) est LE poste de
 * blocage mesuré sur petit CPU (Lighthouse ×4 : long tasks en
 * continu). En mid/low, l'instance Lenis est détruite au boot :
 * scroll NATIF (plus fluide sur ces machines), ScrollTrigger écoute
 * window comme toujours. ReactLenis reste dans l'arbre dans tous
 * les cas — la structure ne change jamais, rien ne se remonte.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const lenisOff = useRef(false);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (detectSceneTier().tier !== "high") {
      /* petit CPU/GPU : zéro lissage JS — destroy() rend le scroll
         au navigateur et retire les listeners wheel/touch */
      lenisOff.current = true;
      lenis?.destroy();
      return;
    }

    lenis?.on("scroll", ScrollTrigger.update);

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis?.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
    };
  }, []);

  useEffect(() => {
    // Ancres internes : défilement pondéré (Lenis) ou natif lissé
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement).closest?.('a[href^="#"], a[href^="/#"]');
      if (!target) return;
      const href = target.getAttribute("href") ?? "";
      const hash = href.startsWith("/#") ? href.slice(1) : href;
      if (hash.length < 2) return;
      if (href.startsWith("/#") && window.location.pathname !== "/") return;
      const el = document.querySelector(hash);
      if (!el) return;
      event.preventDefault();
      const lenis = lenisRef.current?.lenis;
      if (lenis && !lenisOff.current) {
        lenis.scrollTo(el as HTMLElement, { offset: -88 });
      } else {
        const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top, behavior: "smooth" });
      }
      history.replaceState(null, "", hash);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
