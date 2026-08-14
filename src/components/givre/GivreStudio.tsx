"use client";

/*
 * 02 — Le studio en marche. Structure latérale (aucune voisine ne
 * la partage) : un rail éditorial étroit à gauche — pagination,
 * micro-label, note —, un filet vertical blanc, puis la démo
 * AppMockup existante posée dans un cadre qui déborde du bord
 * droit de l'écran : l'asymétrie éditoriale de la ref. L'objet
 * arrive légèrement incliné et se redresse au fil du scroll.
 */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AppMockup from "@/components/prisme/AppMockup";
import { RevealBlock } from "@/components/prisme/Motion";
import { useTranslations } from "@/components/LanguageProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function GivreStudio() {
  const { t } = useTranslations();
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);

      gsap.set(q("[data-stage]"), {
        opacity: 0,
        y: 90,
        rotateX: 8,
        scale: 0.985,
      });

      gsap.to(q("[data-stage]"), {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 82%",
          once: true,
        },
      });

      /* Redressement adouci — rotateX 8 → 0, scrub continu */
      gsap.to(q("[data-stage]"), {
        rotateX: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top 78%",
          end: "top 16%",
          scrub: 0.6,
        },
      });
    },
    { scope }
  );

  return (
    <section ref={scope} id="studio" className="pv-scene pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />

      {/* Aligné au cadre éditorial à gauche ; à droite, la marge
          disparaît en desktop pour laisser la démo filer hors champ */}
      <div
        className="relative z-10 pr-[calc(var(--frame-inset)_+_24px)] lg:pr-0"
        style={{ paddingLeft: "calc(var(--frame-inset) + 24px)" }}
      >
        {/* ≥ 1680 : le plateau se borne (la maquette s'étirait sur
            ~3 000 px à 3440, l'intérieur se vidait) et se centre —
            gouttières fluides autour */}
        <div className="lg:grid lg:grid-cols-[300px_1px_minmax(0,1fr)] lg:gap-x-10 min-[1680px]:mx-auto min-[1680px]:max-w-[1720px]">
          {/* Rail éditorial — l'UI chuchote à gauche */}
          <div className="lg:pt-2">
            <RevealBlock>
              <div className="pv-page-num [&>b]:text-[44px]">
                <b>02</b>
                <span>/10</span>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.08}>
              <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                {t("demo.label", "Design Studio — en direct")}
              </p>
            </RevealBlock>
            <RevealBlock delay={0.14}>
              <p className="mt-4 max-w-[280px] text-[15px] leading-[1.7] text-slate">
                {t(
                  "bento.design.desc",
                  "Miniatures, affiches, bannières : un brief, des rendus prêts à publier."
                )}
              </p>
            </RevealBlock>
          </div>

          {/* Filet vertical blanc — la frontière du rail */}
          <div
            aria-hidden
            className="hidden w-px bg-[rgba(255,255,255,0.55)] lg:block"
          />

          {/* La démo — elle déborde du bord droit de l'écran */}
          <div
            className="mt-10 lg:mt-0 lg:mr-[calc(-1*var(--frame-inset))]"
            style={{ perspective: "1700px" }}
          >
            <div data-stage className="relative will-change-transform">
              <div className="pv-shadow-mauve rounded-[24px]">
                <AppMockup className="relative" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
