"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { Spinner } from "@/components/ui/spinner";
import { RESOURCE_PACKS_PUBLIC } from "@/lib/resources";
import { RevealBlock } from "@/components/prisme/Motion";
import { cn } from "@/lib/utils";

const packs = Object.values(RESOURCE_PACKS_PUBLIC);

/*
 * 08 — Packs. Deux panneaux asymétriques — rien à voir avec la
 * liste des tarifs : le Pack Brush en verre figé (~40 %), le
 * Neva Pack en vrai verre dépoli serti d'une arête chrome (~60 %).
 * Une seule lentille dérive dans le coin haut droit : l'unique
 * objet décoratif de la scène. Le flux Stripe est inchangé
 * (401 → connexion, déjà possédé → téléchargements).
 */
export default function GivrePacks() {
  const { t } = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async (packId: string) => {
    setLoading(packId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/resource-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });

      const data = await res.json();

      if (res.status === 401) {
        router.push("/login?redirect=/#packs");
        return;
      }

      if (data.alreadyOwned) {
        router.push("/dashboard/downloads");
        return;
      }

      if (!res.ok || data.error) {
        setError(
          data.error ??
            t(
              "resources.error.checkout",
              "Le paiement n'a pas pu démarrer. Réessayez dans un instant."
            )
        );
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError(
        t("resources.error.network", "Connexion interrompue. Vérifiez votre réseau et réessayez.")
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="packs" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div aria-hidden className="pv-caustics" />
      {/* L'unique objet décoratif — une lentille en dérive lente */}
      <div
        aria-hidden
        className="pv-lens pv-float hidden md:block"
        style={
          {
            width: 200,
            height: 200,
            top: "8%",
            right: "5%",
            "--float-dur": "12s",
            "--float-y": "-12px",
          } as React.CSSProperties
        }
      />

      <div className="relative mx-auto max-w-[1140px] px-5 py-20 sm:px-8 lg:py-24">
        {/* En-tête latéral gauche — pagination, label, titre */}
        <RevealBlock>
          <div className="max-w-[700px]">
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>09</b>
              <span>/10</span>
            </div>
            <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("resources.label", "Packs du studio")}
            </p>
            <h2 className="pv-display mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">
              {t("resources.title.a", "Les outils du studio,")}{" "}
              <span className="pv-display-strong">
                {t("resources.title.beam", "dans vos mains.")}
              </span>
            </h2>
            <p className="mt-5 max-w-[500px] text-[15px] leading-[1.7] text-slate">
              {t(
                "resources.subtitle",
                "Brushes, templates et systèmes graphiques taillés pour FiveM. Un paiement, un téléchargement, aucune limite."
              )}
            </p>
          </div>
        </RevealBlock>

        {/* Grid asymétrique : verre figé ~40 % | verre chrome ~60 % */}
        <div className="mt-12 grid gap-5 lg:grid-cols-10">
          {packs.map((pack, index) => {
            const isHighlight = pack.id === "neva-pack";
            return (
              <RevealBlock
                key={pack.id}
                delay={index * 0.1}
                className={cn(isHighlight ? "lg:col-span-6" : "lg:col-span-4")}
              >
                <article
                  className={cn(
                    /* plus de chrome-edge : son ::before rectangulaire
                       débordait des coins arrondis (l'artefact D14) —
                       l'anneau aurore porte l'emphase, clippé au rayon */
                    "pv-card-hover relative flex h-full flex-col rounded-[22px] p-6 sm:p-7",
                    isHighlight
                      ? "pv-glass pv-aurora-ring shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_2px_6px_rgba(96,84,140,0.1),0_16px_40px_rgba(96,84,140,0.13)] lg:p-8"
                      : "pv-glass pv-glass--still shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_5px_rgba(96,84,140,0.08),0_12px_30px_rgba(96,84,140,0.1)]"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                        {pack.tagline}
                      </p>
                      <h3 className="mt-3 font-display text-[20px] font-medium tracking-[-0.01em] text-ink">
                        {pack.name}
                      </h3>
                    </div>
                    {pack.badge ? (
                      <span className="rounded-full bg-[linear-gradient(100deg,#A48BE8,#EFB894)] px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--surface-text)]">
                        {t("resources.badge.complete", "Le plus complet")}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 max-w-[420px] text-[13px] leading-[1.65] text-slate">
                    {pack.description}
                  </p>

                  <p className="mt-6 flex items-baseline gap-3">
                    <span className="font-display text-[36px] font-light leading-none text-ink">
                      {pack.price}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.08em] text-mist">
                      € · {t("resources.oneShot", "achat unique")}
                    </span>
                  </p>

                  <ul
                    className={cn(
                      "mt-6 grid flex-1 content-start gap-2.5 border-t border-[rgba(43,36,80,0.07)] pt-6",
                      isHighlight && "sm:grid-cols-2"
                    )}
                  >
                    {pack.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[13px] leading-[1.5] text-slate"
                      >
                        <Check
                          size={13}
                          strokeWidth={2.4}
                          className="mt-[2.5px] shrink-0 text-[color:var(--color-sauge)]"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      type="button"
                      className="pv-btn w-full"
                      onClick={() => handleBuy(pack.id)}
                      disabled={loading === pack.id}
                    >
                      {loading === pack.id ? (
                        <>
                          <Spinner className="h-3.5 w-3.5" />{" "}
                          {t("resources.redirecting", "Redirection…")}
                        </>
                      ) : (
                        <>
                          <Download size={14} strokeWidth={1.6} />{" "}
                          {t("resources.buy", "Acheter")} — {pack.price}&nbsp;€
                        </>
                      )}
                    </button>
                    {!isHighlight ? (
                      <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-mist">
                        {t("resources.included", "Tout est inclus dans le Neva Pack")}
                      </p>
                    ) : null}
                  </div>
                </article>
              </RevealBlock>
            );
          })}
        </div>

        {error ? (
          <p className="mt-8 text-center text-sm text-err" role="alert">
            {error}
          </p>
        ) : null}

        <RevealBlock delay={0.2}>
          <p className="mt-10 text-center font-mono text-[11px] tracking-[0.1em] text-mist">
            {t(
              "resources.trust",
              "Paiement sécurisé Stripe · Téléchargement immédiat · Accès à vie depuis votre espace"
            )}
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}
