"use client";

import Link from "next/link";
import { useTranslations } from "@/components/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";
import { cn } from "@/lib/utils";

const PLAN_ORDER = ["free", "creator", "studio", "pro"] as const;
const FEATURED_PLAN = "creator";

/*
 * 07 — Tarifs. La leçon de la ref ORIGINE : UN panneau de verre,
 * une liste — pas quatre cartes. Les quatre plans vivent en
 * rangées d'un même registre, séparées par des filets encre ;
 * seul le panneau porteur floute réellement la scène (le budget
 * backdrop-filter reste ≤ 3 : les pilules ghost des rangées sont
 * dépolies par le panneau lui-même). Le plan vedette s'éclaire
 * d'un fond de verre plus dense sous un filet chrome.
 */
export default function GivrePricing() {
  const { t } = useTranslations();

  return (
    <section id="pricing" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight opacity-60" />

      <div className="relative mx-auto max-w-[1140px] px-5 py-20 sm:px-8 lg:py-24">
        {/* En-tête centré — pagination, label, titre, sous-titre */}
        <div className="text-center">
          <RevealBlock>
            <div className="pv-page-num justify-center [&>b]:text-[44px]">
              <b>08</b>
              <span>/10</span>
            </div>
            <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("pricing.label", "Tarifs")}
            </p>
          </RevealBlock>
          <RevealMask className="mt-4">
            <h2 className="pv-display mx-auto max-w-[720px] text-[clamp(2rem,4.6vw,3.4rem)]">
              {t("pricing.title.a", "Moins cher qu'un logo.")}{" "}
              <span className="pv-display-strong">
                {t("pricing.title.beam", "Pour toute une identité.")}
              </span>
            </h2>
          </RevealMask>
          <RevealBlock delay={0.12}>
            <p className="mx-auto mt-5 max-w-[500px] text-[15px] leading-[1.7] text-slate">
              {t(
                "pricing.subtitle",
                "Commencez avec 5 créations offertes. Montez en volume quand vos publications s'enchaînent — sans engagement."
              )}
            </p>
          </RevealBlock>
        </div>

        {/* LE panneau — quatre plans en rangées, filets encre entre eux */}
        <RevealBlock delay={0.15} className="mt-12">
          <div className="pv-glass relative mx-auto max-w-[940px] rounded-[22px] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_2px_6px_rgba(96,84,140,0.1),0_16px_40px_rgba(96,84,140,0.13)] sm:px-5 sm:py-4">
            {PLAN_ORDER.map((planId, index) => {
              const plan = PLANS[planId];
              const featured = planId === FEATURED_PLAN;
              return (
                <div key={planId}>
                  {index > 0 ? (
                    /* filet encre entre rangées (desktop) — l'anneau
                       aurore porte seul l'emphase de la vedette */
                    <span
                      aria-hidden
                      className="hidden h-px bg-[rgba(43,36,80,0.07)] lg:block"
                    />
                  ) : null}

                  <article
                    className={cn(
                      /* Mobile : chaque offre est une carte du même
                         gabarit (D13) ; desktop : les rangées du
                         panneau, la leçon ORIGINE. */
                      "pv-ignite relative grid items-center gap-x-8 gap-y-5 rounded-[16px] px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.3fr)_auto]",
                      "mb-3 border border-carte-brd bg-carte lg:mb-0 lg:border-0 lg:bg-transparent",
                      featured &&
                        "pv-aurora-ring border-transparent bg-[rgba(255,255,255,0.72)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_22px_rgba(96,84,140,0.14)] lg:bg-[rgba(255,255,255,0.55)]"
                    )}
                  >
                    {/* Identité du plan : badge DANS le flux (D11),
                        nom, tagline, quota exact */}
                    <div>
                      {featured ? (
                        <Badge variant="popular" className="mb-3">
                          {t("pricing.popular", "Le plus choisi")}
                        </Badge>
                      ) : null}
                      <h3 className="font-display text-[19px] font-medium leading-snug text-ink">
                        {t(`pricing.plan.${planId}.name`, plan.name)}
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-[1.6] text-slate">
                        {t(`pricing.plan.${planId}.description`, plan.description)}
                      </p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--num-color)]">
                        {plan.credits.toLocaleString("fr-FR")}{" "}
                        {t("pricing.creations", "créations / mois")}
                      </p>
                    </div>

                    {/* Features en deux colonnes, coches sauge (D15) */}
                    <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      {plan.features.map((feature, fi) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 font-mono text-[12px] leading-[1.55] text-slate [text-wrap:pretty]"
                        >
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            className="mt-[0.28em] h-[13px] w-[13px] shrink-0 stroke-[color:var(--color-sauge)]"
                            fill="none"
                            strokeWidth={2.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4.5 12.8 9.6 18 19.5 6.5" />
                          </svg>
                          {t(`pricing.plan.${planId}.f${fi + 1}`, feature)}
                        </li>
                      ))}
                    </ul>

                    {/* Prix sur sa ligne, CTA pleine largeur dessous
                        en mobile (D11) ; à droite en desktop */}
                    <div className="flex flex-col items-stretch gap-3 lg:items-end lg:gap-4">
                      <p className="flex items-baseline gap-2 whitespace-nowrap">
                        <span className="font-display text-[32px] font-light leading-none text-ink">
                          {plan.price}
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.08em] text-mist">
                          €&nbsp;{t("pricing.perMonth", "/ mois")}
                        </span>
                      </p>
                      <Link
                        href="/signup"
                        className={cn(
                          "pv-btn h-11 min-h-0 whitespace-nowrap px-5 text-[13px] lg:h-10",
                          !featured && "pv-btn--ghost"
                        )}
                      >
                        {planId === "free"
                          ? t("pricing.cta.free", "Commencer gratuitement")
                          : `${t("pricing.cta.paid", "Choisir")} ${t(
                              `pricing.plan.${planId}.name`,
                              plan.name
                            )}`}
                      </Link>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </RevealBlock>

        {/* La réassurance, sous le panneau */}
        <RevealBlock delay={0.22}>
          <p className="mt-10 text-center font-mono text-[11px] tracking-[0.1em] text-mist">
            {t(
              "pricing.note",
              "Sans engagement · Annulation en deux clics · Packs de créations additionnels depuis votre espace"
            )}
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}
