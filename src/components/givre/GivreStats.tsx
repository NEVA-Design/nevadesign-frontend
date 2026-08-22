"use client";

import Image from "next/image";
import { useTranslations } from "@/components/LanguageProvider";
import { CLIENT_LOGOS } from "@/lib/client-logos";
import { CountUp, RevealBlock } from "@/components/prisme/Motion";

/*
 * 06 — Le studio en chiffres, format bandeau éditorial.
 * Pas de panneau ici : la section respire entre deux moments
 * forts. Deux filets blancs tiennent quatre compteurs en ligne
 * (display léger, labels mono), séparés par des filets verticaux ;
 * dessous, les serveurs qui publient déjà défilent en marquee.
 */
export default function GivreStats() {
  const { t } = useTranslations();

  const stats = [
    { value: 2400, suffix: "+", label: t("stats.creators", "créateurs actifs") },
    { value: 6, suffix: "", label: t("stats.modules", "modules spécialisés") },
    { value: 8, suffix: "K", label: t("stats.exports", "définition d’export max") },
    { value: 12, suffix: " s", label: t("stats.speed", "du brief au rendu") },
  ];

  return (
    <section id="chiffres" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div aria-hidden className="pv-caustics" />

      <div className="pv-section--tight relative mx-auto pv-container px-5 sm:px-8">
        {/* Pagination discrète, label en regard — la ligne d'en-tête */}
        <RevealBlock>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>08</b>
              <span>/10</span>
            </div>
            <p className="pb-1 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("stats.label", "Le studio tourne déjà")}
            </p>
          </div>
        </RevealBlock>

        {/* Le bandeau : deux filets blancs, quatre compteurs en ligne */}
        <RevealBlock delay={0.08} className="mt-7">
          <div className="border-y border-[rgba(255,255,255,0.14)]">
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={[
                    "px-5 py-8 sm:px-8 lg:py-9",
                    i > 0 ? "lg:border-l lg:border-[rgba(255,255,255,0.14)]" : "",
                    i % 2 === 1 ? "border-l border-[rgba(255,255,255,0.14)]" : "",
                    i > 1 ? "border-t border-[rgba(255,255,255,0.14)] lg:border-t-0" : "",
                  ].join(" ")}
                >
                  {/* Refonte 50k : le chiffre est un DISPLAY massif
                      expanded — la voix d'accent d'Archivo */}
                  <p className="font-display text-[clamp(44px,4.6vw,76px)] font-[640] leading-none tracking-[-0.015em] text-ink [font-stretch:122%] tabular-nums">
                    <CountUp value={stat.value} />
                    <span className="font-[300] text-mist [font-stretch:82%]">{stat.suffix}</span>
                  </p>
                  <p className="mt-3.5 pv-label !text-[color:var(--color-mist)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </RevealBlock>

        {/* Les serveurs qui publient déjà — le marquee de preuves */}
        <RevealBlock delay={0.16} className="mt-12">
          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)",
            }}
          >
            <div
              className="pv-marquee"
              style={{ "--marquee-duration": "38s" } as React.CSSProperties}
            >
              {/* TROIS copies (le keyframe pv-marquee translate
                  d'exactement 1/3 — deux copies laissaient un saut
                  de boucle, bug hérité run 5) ; opacité 50 % → 100 %
                  au survol (protocole 08). */}
              {[0, 1, 2].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy > 0}
                  className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
                >
                  {CLIENT_LOGOS.map((logo) => (
                    <span
                      key={`${logo.src}-${copy}`}
                      className="flex h-7 w-20 shrink-0 items-center justify-center"
                    >
                      <Image
                        src={logo.src}
                        alt={copy > 0 ? "" : logo.alt}
                        width={88}
                        height={22}
                        className="max-h-[22px] w-auto object-contain opacity-50 transition-opacity duration-300 hover:opacity-100"
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
