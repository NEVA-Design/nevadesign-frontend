"use client";

import { useEffect, useRef } from "react";

/*
 * Rail de sections — la navigation silencieuse du bord gauche.
 * Un point par chapitre (01–10), cliquable, synchronisé au scroll
 * (IntersectionObserver sur la bande centrale du viewport). Fixed :
 * il accompagne toute la lecture, en lg+ seulement.
 */
const SECTIONS: readonly [string, string][] = [
  ["top", "01 — Le studio"],
  ["studio", "02 — Studio en direct"],
  ["creations", "03 — Créations"],
  ["enhance", "04 — Enhance"],
  ["terrains", "05 — Terrains"],
  ["modules", "06 — Modules"],
  ["chiffres", "07 — Chiffres"],
  ["pricing", "08 — Tarifs"],
  ["packs", "09 — Packs"],
  ["faq", "10 — FAQ"],
];

export default function SectionRail() {
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = nav.current;
    if (!root) return;
    const byId = new Map<string, HTMLAnchorElement>();
    root.querySelectorAll("a").forEach((l) => {
      byId.set(decodeURIComponent(l.hash.slice(1)), l as HTMLAnchorElement);
    });
    let current: HTMLAnchorElement | null =
      byId.get("top") ?? null;
    current?.classList.add("is-active");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const link = byId.get(e.target.id);
          if (link && link !== current) {
            current?.classList.remove("is-active");
            link.classList.add("is-active");
            current = link;
          }
        }
      },
      /* la section qui traverse la bande centrale du viewport */
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    for (const [id] of SECTIONS) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <nav
      ref={nav}
      className="pv-dot-rail fixed top-1/2 z-30 hidden -translate-y-1/2 lg:flex"
      style={{ left: "calc(var(--frame-inset) + 26px)" }}
      aria-label="Sections de la page"
    >
      {SECTIONS.map(([id, label]) => (
        <a key={id} href={`#${id}`} aria-label={label} title={label} />
      ))}
    </nav>
  );
}
