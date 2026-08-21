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
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";
import CreationsMarquee from "@/components/prisme/CreationsMarquee";

export default function GivreCreations() {
  const { t } = useTranslations();

  return (
    <section id="creations" className="pv-scene pv-section--tight">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      {/* La seule des trois sections à recevoir les rais — discrets,
          et ÉTEINTS sur la moitié basse (QA 20/08, R1) : actifs au
          niveau du bandeau full-bleed, ils lavaient le drapé d'un
          côté du filet pendant que l'autre côté restait satin nu —
          la « marche de matière » mesurée au boost ×4. */}
      <div
        aria-hidden
        className="pv-windowlight opacity-60"
        style={{
          /* l'inline remplace le masque de classe : on refait AUSSI
             le fondu du bord haut ici */
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0, black 26%, black 42%, transparent 66%)",
          maskImage:
            "linear-gradient(180deg, transparent 0, black 26%, black 42%, transparent 66%)",
        }}
      />

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
            <RevealMask>
              <h2 className="pv-display pv-t-creations">
                {t("wall.title.a", "Les créations sortent")}{" "}
                <b>{t("wall.title.b", "d'ici.")}</b>
              </h2>
            </RevealMask>
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

      {/* Pagination à droite — miroir du hero qui la porte à gauche.
          Refonte 50k : resserrée (le trou noir au-dessus du bandeau
          est comblé). */}
      <RevealBlock delay={0.06}>
        <div
          className="relative z-10 mt-8 flex justify-end"
          style={{ paddingRight: "calc(var(--frame-inset) + 24px)" }}
        >
          <div className="pv-page-num [&>b]:text-[44px]">
            <b>04</b>
            <span>/10</span>
          </div>
        </div>
      </RevealBlock>

      {/* Le bandeau — pleine largeur, serti de deux filets blancs */}
      <RevealBlock delay={0.12}>
        <div className="relative z-10 mt-5">
          <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.14)]" />
          <div className="py-4">
            <CreationsMarquee />
          </div>
          <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.14)]" />
        </div>
      </RevealBlock>
    </section>
  );
}
