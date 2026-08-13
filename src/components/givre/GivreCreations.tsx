"use client";

/*
 * 03 — Les créations en bandeau full-bleed. La ligne éditoriale
 * reste contenue dans le cadre (point pervenche + label mono à
 * gauche, portfolio à droite), la pagination se pose à droite —
 * miroir du hero —, puis la galerie file d'un bord à l'autre de
 * l'écran entre deux filets blancs. Les œuvres restent la vraie
 * couleur de la page ; la scène dawn respire derrière.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock } from "@/components/prisme/Motion";
import CreationsMarquee from "@/components/prisme/CreationsMarquee";

export default function GivreCreations() {
  const { t } = useTranslations();

  return (
    <section id="creations" className="pv-scene pb-20 pt-20 sm:pb-24 sm:pt-24">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      {/* La seule des trois sections à recevoir les rais — discrets */}
      <div aria-hidden className="pv-windowlight opacity-60" />

      {/* En-tête de section — titre display + label + lien (D03) */}
      <RevealBlock>
        <div
          className="relative z-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-5"
          style={{
            paddingLeft: "calc(var(--frame-inset) + 24px)",
            paddingRight: "calc(var(--frame-inset) + 24px)",
          }}
        >
          <div>
            <h2 className="font-display text-[clamp(28px,3.6vw,44px)] font-light leading-[1.1] tracking-[-0.015em] text-slate">
              {t("wall.title.a", "Les créations sortent")}{" "}
              <span className="font-medium text-ink">
                {t("wall.title.b", "d'ici.")}
              </span>
            </h2>
            <p className="mt-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              <span
                aria-hidden
                className="h-[5px] w-[5px] shrink-0 rounded-full bg-violet"
              />
              {t(
                "hero.marquee",
                "Produites par le studio — publiées par 2 400+ créateurs"
              )}
            </p>
          </div>
          <Link
            href="/neva-design"
            className="pv-link inline-flex items-center gap-2 text-sm"
          >
            {t("wall.cta", "Le portfolio complet du studio")}
            <ArrowRight size={15} className="text-[color:var(--num-color)]" />
          </Link>
        </div>
      </RevealBlock>

      {/* Pagination à droite — miroir du hero qui la porte à gauche */}
      <RevealBlock delay={0.06}>
        <div
          className="relative z-10 mt-12 flex justify-end sm:mt-14"
          style={{ paddingRight: "calc(var(--frame-inset) + 24px)" }}
        >
          <div className="pv-page-num [&>b]:text-[44px]">
            <b>03</b>
            <span>/10</span>
          </div>
        </div>
      </RevealBlock>

      {/* Le bandeau — pleine largeur, serti de deux filets blancs */}
      <RevealBlock delay={0.12}>
        <div className="relative z-10 mt-6">
          <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.55)]" />
          <div className="py-4">
            <CreationsMarquee />
          </div>
          <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.55)]" />
        </div>
      </RevealBlock>
    </section>
  );
}
