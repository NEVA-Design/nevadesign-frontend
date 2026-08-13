"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock } from "@/components/prisme/Motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Le moment typographique, réécrit Givre — plus jamais de masse
 * extra-bold : le mot passe en Outfit medium, encadré comme dans
 * un objet imprimé par deux filets blancs bord à bord. Les vraies
 * miniatures vivent toujours par transparence dans les lettres et
 * le mot monte sous son masque au fil du scroll. Scène glacier :
 * le voisin enhance vit sur dawn-calm, jamais deux fonds jumeaux.
 * Pas de pagination ici — le moment 04 est partagé avec enhance.
 */
export default function GivreType() {
  const { t } = useTranslations();
  const scope = useRef<HTMLElement>(null);
  const word = t("typemoment.word", "Cliquez");
  /* Le mot va du bord au bord quelle que soit sa longueur :
     « Cliquez » (7 lettres) comme « Click » (5). */
  const vw = (164 / Math.max(word.length, 4)).toFixed(1);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);

      /* Les filets se tirent une fois, comme les règles du hero */
      gsap.fromTo(
        q("[data-rule]"),
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          stagger: 0.15,
          ease: "expo.out",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 88%",
            once: true,
          },
        }
      );

      /* Le remplissage — la mécanique d'origine, conservée */
      gsap.fromTo(
        q("[data-word]"),
        { yPercent: 88, opacity: 0.4 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 94%",
            end: "top 40%",
            scrub: 0.5,
          },
        }
      );
    },
    { scope }
  );

  return (
    <section ref={scope} className="pv-scene pb-10 pt-10 sm:pb-12 sm:pt-12">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--glacier" />
      <div aria-hidden className="pv-caustics" />

      {/* Filet haut — bord à bord, le cadre éditorial du mot */}
      <div
        aria-hidden
        data-rule
        className="relative h-px w-full bg-[rgba(255,255,255,0.55)]"
      />

      <div className="relative overflow-hidden py-6 sm:py-9">
        <h2
          data-word
          className="w-full whitespace-nowrap text-center font-display font-medium uppercase leading-[0.92] tracking-[-0.02em]"
          style={{
            fontSize: `clamp(90px, ${vw}vw, 260px)`,
            /* Base encre sous la mosaïque : les lettres restent encrées
               sur la brume, les miniatures vivent par transparence. */
            backgroundImage:
              "linear-gradient(rgba(29,35,64,0.44), rgba(29,35,64,0.44)), url(/showcase/cliquez-fill.webp)",
            backgroundSize: "cover, cover",
            backgroundPosition: "50% 50%, 50% 50%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextStroke: "1px rgba(29,35,64,0.24)",
          }}
        >
          {word}
        </h2>
      </div>

      {/* Filet bas — referme le cadre */}
      <div
        aria-hidden
        data-rule
        className="relative h-px w-full bg-[rgba(255,255,255,0.55)]"
      />

      <RevealBlock delay={0.1}>
        <p className="relative mx-auto mt-7 max-w-[880px] px-5 text-center font-mono text-[11px] uppercase leading-[2] tracking-[0.18em] text-slate">
          {t(
            "typemoment.caption",
            "Miniatures pensées pour le clic — visage, titre massif, contraste. Lisibles à 120 pixels."
          )}
        </p>
      </RevealBlock>
    </section>
  );
}
