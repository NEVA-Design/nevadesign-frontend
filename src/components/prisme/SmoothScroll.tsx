"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll Lenis piloté par le ticker GSAP — une seule horloge rAF.
 * Réservé aux surfaces marketing ; le produit garde le scroll natif.
 * Toujours actif : le motion est une décision produit.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    lenis?.on("scroll", ScrollTrigger.update);

    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Ancres internes : Lenis prend la main pour un défilement pondéré
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
      lenisRef.current?.lenis?.scrollTo(el as HTMLElement, { offset: -88 });
      history.replaceState(null, "", hash);
    }
    document.addEventListener("click", onClick);

    return () => {
      lenis?.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(update);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
