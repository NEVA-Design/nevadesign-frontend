"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { Spinner } from "@/components/ui/spinner";
import { CREATION_PACKS_PUBLIC, RESOURCE_PACKS_PUBLIC } from "@/lib/resources";
import { RevealBlock } from "@/components/prisme/Motion";
import { cn } from "@/lib/utils";

const creationPacks = Object.values(CREATION_PACKS_PUBLIC);
const resourcePacks = Object.values(RESOURCE_PACKS_PUBLIC);

/*
 * 09 — Packs de création (grille run 2). Trois prestations du
 * studio — Identité 19 €, Lancement 49 € (vedette, anneau aurore),
 * Marque 79 € — en cartes d'un même registre ; les ressources
 * Photoshop historiques migrent dans une carte secondaire
 * « Ressources du studio », prix inchangés. Une seule lentille
 * décorative. Le flux Stripe est identique pour tout achat
 * one-shot (401 → connexion, déjà possédé → téléchargements).
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
              "Le paiement n’a pas pu démarrer. Réessayez dans un instant."
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

      <div className="pv-container relative mx-auto px-5 py-20 sm:px-8 lg:py-24">
        {/* En-tête latéral gauche — pagination, label, titre */}
        <RevealBlock>
          <div className="max-w-[700px]">
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>09</b>
              <span>/10</span>
            </div>
            <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("resources.label", "Packs de création")}
            </p>
            <h2 className="pv-display pv-section-title mt-4">
              {t("resources.title.a", "Un pack, un prix,")}{" "}
              <span className="pv-display-strong">
                {t("resources.title.beam", "une identité complète.")}
              </span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.7] text-slate">
              {t(
                "resources.subtitle",
                "Logo, bannières, affiches, charte : des livrables assemblés par le studio, prêts à publier. Un paiement, des fichiers à vous."
              )}
            </p>
          </div>
        </RevealBlock>

        {/* Les trois packs — un même registre, Lancement en vedette */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {creationPacks.map((pack, index) => {
            const isHighlight = pack.id === "pack-lancement";
            return (
              <RevealBlock key={pack.id} delay={index * 0.08}>
                <article
                  className={cn(
                    "pv-card-hover relative flex h-full flex-col rounded-[22px] p-6 sm:p-7",
                    isHighlight
                      ? "pv-glass pv-aurora-ring shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_2px_6px_rgba(96,84,140,0.1),0_16px_40px_rgba(96,84,140,0.13)]"
                      : "pv-glass pv-glass--still shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_5px_rgba(96,84,140,0.08),0_12px_30px_rgba(96,84,140,0.1)]"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                        {t(`resources.pack.${pack.id}.tagline`, pack.tagline)}
                      </p>
                      <h3 className="mt-3 font-display text-[20px] font-medium tracking-[-0.01em] text-ink">
                        {t(`resources.pack.${pack.id}.name`, pack.name)}
                      </h3>
                    </div>
                    {pack.badge ? (
                      <span className="rounded-full bg-[linear-gradient(100deg,#A48BE8,#EFB894)] px-3 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--surface-text)]">
                        {t("resources.badge.complete", "Le plus complet")}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-[13px] leading-[1.65] text-slate">
                    {t(`resources.pack.${pack.id}.description`, pack.description)}
                  </p>

                  <p className="mt-6 flex items-baseline gap-3">
                    <span className="font-display text-[36px] font-light leading-none text-ink">
                      {pack.price}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.08em] text-mist">
                      € · {t("resources.oneShot", "achat unique")}
                    </span>
                  </p>

                  <ul className="mt-6 grid flex-1 content-start gap-2.5 border-t border-[rgba(43,36,80,0.07)] pt-6">
                    {pack.features.map((feature, fi) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-[13px] leading-[1.5] text-slate"
                      >
                        <Check
                          size={13}
                          strokeWidth={2.4}
                          className="mt-[2.5px] shrink-0 text-[color:var(--color-sauge)]"
                        />
                        {t(`resources.pack.${pack.id}.f${fi + 1}`, feature)}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      type="button"
                      className={cn("pv-btn w-full", !isHighlight && "pv-btn--ghost")}
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
                          {t("resources.buy", "Acheter")} — {pack.price}&nbsp;€
                          <ArrowRight size={14} strokeWidth={1.8} />
                        </>
                      )}
                    </button>
                  </div>
                </article>
              </RevealBlock>
            );
          })}
        </div>

        {/* Ressources du studio — les outils Photoshop, en carte
            secondaire : deux rangées d'un même registre */}
        <RevealBlock delay={0.18}>
          <article className="pv-glass pv-glass--still mt-6 rounded-[22px] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_5px_rgba(96,84,140,0.08),0_12px_30px_rgba(96,84,140,0.1)] sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-[17px] font-medium tracking-[-0.01em] text-ink">
                {t("resources.tools.title", "Ressources du studio")}
              </h3>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                {t("resources.tools.tagline", "Les outils Photoshop de l’atelier")}
              </p>
            </div>
            <div className="mt-5 flex flex-col">
              {resourcePacks.map((pack) => (
                <div
                  key={pack.id}
                  className="pv-row flex flex-col gap-3 px-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-display text-[15px] font-medium text-ink">
                      {pack.name}
                      <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                        {t(`resources.pack.${pack.id}.tagline`, pack.tagline)}
                      </span>
                    </p>
                    <p className="mt-1 max-w-[560px] text-[12.5px] leading-[1.6] text-slate">
                      {pack.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="font-display text-[22px] font-light leading-none text-ink">
                      {pack.price}&nbsp;€
                    </span>
                    <button
                      type="button"
                      className="pv-btn pv-btn--ghost h-10 min-h-0 whitespace-nowrap px-4 text-[12.5px]"
                      onClick={() => handleBuy(pack.id)}
                      disabled={loading === pack.id}
                    >
                      {loading === pack.id ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <>
                          <Download size={13} strokeWidth={1.6} />{" "}
                          {t("resources.buy", "Acheter")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </RevealBlock>

        {error ? (
          <p className="mt-8 text-center text-sm text-err" role="alert">
            {error}
          </p>
        ) : null}

        <RevealBlock delay={0.2}>
          <p className="mt-10 text-center font-mono text-[11px] tracking-[0.1em] text-mist">
            {t(
              "resources.trust",
              "Paiement sécurisé Stripe · Livraison dans votre espace · Fichiers à vous, pour toujours"
            )}
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}
