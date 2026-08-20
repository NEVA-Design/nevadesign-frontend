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
    { value: 8, suffix: "K", label: t("stats.exports", "définition d'export max") },
    { value: 12, suffix: " s", label: t("stats.speed", "du brief au rendu") },
  ];

  return (
    <section id="chiffres" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div aria-hidden className="pv-caustics" />

      <div className="relative mx-auto pv-container px-5 py-16 sm:px-8 lg:py-20">
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
                  <p className="font-display text-[36px] font-light leading-none text-ink sm:text-[44px]">
                    <CountUp value={stat.value} />
                    <span className="text-mist">{stat.suffix}</span>
                  </p>
                  <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
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
              {[false, true].map((hidden) => (
                <div
                  key={hidden ? "b" : "a"}
                  aria-hidden={hidden}
                  className="flex shrink-0 items-center gap-14 pr-14"
                >
                  {CLIENT_LOGOS.map((logo) => (
                    /* encombrement FIXE par logo (h-7 × w-20, logo
                       contain centré) : le rythme du marquee reste
                       régulier quelles que soient les proportions ;
                       opacité 45 % → 70 % au survol (hover system) */
                    <span
                      key={`${logo.src}-${hidden ? "b" : "a"}`}
                      className="flex h-7 w-20 shrink-0 items-center justify-center"
                    >
                      <Image
                        src={logo.src}
                        alt={hidden ? "" : logo.alt}
                        width={88}
                        height={22}
                        className="max-h-[22px] w-auto object-contain opacity-45 transition-opacity duration-200 hover:opacity-70"
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
