"use client";
import { useState, Suspense } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { PLANS, TOPUPS } from "@/lib/plans";
import { useSearchParams } from "next/navigation";

/*
 * Abonnement — formules en cartes de verre (vedette Creator soulignée
 * violet, comme la landing), packs de créations en rangées à filets.
 * Toute la mécanique Stripe (checkout, portail, états de chargement)
 * est conservée à l'identique.
 */

async function redirectToCheckout(priceId: string, mode: "subscription" | "payment"): Promise<string | null> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, mode }),
  });
  const text = await res.text();
  if (!text) return "Erreur serveur (réponse vide). Vérifiez les Price IDs dans .env.local.";
  const data = JSON.parse(text);
  if (data.url) { window.location.href = data.url; return null; }
  return data.error ?? "Erreur inconnue";
}

async function redirectToPortal() {
  const res = await fetch("/api/stripe/portal", { method: "POST" });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handle = async (id: string, priceId: string, mode: "subscription" | "payment") => {
    setLoadingId(id);
    setCheckoutError(null);
    const err = await redirectToCheckout(priceId, mode);
    if (err) setCheckoutError(err);
    setLoadingId(null);
  };

  const planList = [PLANS.free, PLANS.creator, PLANS.studio, PLANS.pro];

  return (
    <div className="relative mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div
        aria-hidden
        className="pv-halo--violet pv-halo right-[-12%] top-[-6%] h-[480px] w-[540px]"
        style={{ opacity: 0.55 }}
      />

      {/* ── En-tête ─────────────────────────────────────────────── */}
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="pv-label text-[color:var(--num-color)]">Compte</p>
          <h1 className="pv-display mt-4 text-[clamp(2rem,4vw,2.8rem)] text-ink">Abonnement</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-steel">
            Gérez votre formule mensuelle et vos packs de créations. Facturation et
            moyens de paiement se règlent depuis le portail sécurisé Stripe.
          </p>
        </div>
        <Button variant="secondary" onClick={redirectToPortal} className="w-fit shrink-0">
          Gérer mon abonnement
          <ArrowUpRight size={14} className="text-[color:var(--num-color)]" />
        </Button>
      </div>

      {checkoutError ? (
        <FormMessage tone="error" className="relative mt-8">
          {checkoutError}
        </FormMessage>
      ) : null}

      {success ? (
        <FormMessage tone="success" className="relative mt-8">
          Paiement confirmé. Vos créations ont été ajoutées à votre compte.
        </FormMessage>
      ) : null}

      {/* ── Formules ────────────────────────────────────────────── */}
      <section className="relative mt-12">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="pv-display text-xl text-ink">Formules mensuelles</h2>
          <span className="pv-label">Sans engagement</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {planList.map((plan) => {
            const isFree = plan.id === "free";
            const featured = plan.id === "creator";
            return (
              <article
                key={plan.id}
                className={
                  "pv-glass pv-edge pv-ignite rounded-2xl relative flex h-full flex-col p-6 " +
                  (featured ? "border-t-2 border-t-violet" : "")
                }
              >
                {featured ? (
                  <span className="absolute -top-3 left-6 rounded-full bg-[linear-gradient(100deg,#A48BE8,#EFB894)] px-2.5 py-[3px] font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink">
                    Le plus choisi
                  </span>
                ) : null}

                <h3 className="pv-display text-xl text-ink">{plan.name}</h3>
                <p className="mt-2 min-h-[40px] text-[13px] leading-relaxed text-steel">
                  {plan.description}
                </p>

                <p className="mt-5 flex items-baseline gap-2">
                  <span className="pv-display text-[38px] leading-none text-ink">
                    {plan.price}&nbsp;€
                  </span>
                  {!isFree ? <span className="pv-meta">/ mois</span> : null}
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--num-color)]">
                  {plan.credits.toLocaleString("fr-FR")} créations{isFree ? " à l’inscription" : " / mois"}
                </p>

                <ul className="mt-5 flex flex-col gap-2 border-t border-[color:var(--hairline)] pt-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-steel">
                      <Check size={12} className="mt-[3px] shrink-0 text-[color:var(--num-color)]/70" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {isFree ? (
                    <p className="flex h-10 items-center justify-center rounded-lg border border-dashed border-[color:var(--hairline-strong)] font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                      Inclus à l&apos;inscription
                    </p>
                  ) : (
                    <Button
                      variant={featured ? "primary" : "outline"}
                      className="w-full"
                      disabled={loadingId === plan.id}
                      onClick={() => handle(plan.id, plan.priceId!, "subscription")}
                    >
                      {loadingId === plan.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>Choisir {plan.name}</>
                      )}
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Les règles de la grille — affichées avec elle (run 2) */}
      <p className="relative mt-8 text-center font-mono text-[11.5px] leading-[1.9] tracking-[0.08em] text-steel">
        5 retouches incluses par création — au-delà, 1 création
        <span className="px-2 text-dusk" aria-hidden>
          ·
        </span>
        Report des créations non utilisées : 1 mois
      </p>

      {/* ── Recharges de créations (2,90 € l’unité) ─────────────── */}
      <section className="relative mt-14">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="pv-display text-xl text-ink">Recharges de créations</h2>
          <span className="pv-label">Paiement unique</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {TOPUPS.map((topup) => (
            <div key={topup.id} className="pv-glass pv-edge pv-ignite flex flex-col rounded-2xl p-6">
              <p className="pv-display text-[34px] leading-none text-ink">
                {topup.credits.toLocaleString("fr-FR")}
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                créations · {(topup.price / topup.credits).toFixed(2)} € l’unité
              </p>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[color:var(--hairline)] pt-5">
                <span className="pv-display text-xl text-ink">{topup.price}&nbsp;€</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loadingId === topup.id}
                  onClick={() => handle(topup.id, topup.priceId, "payment")}
                >
                  {loadingId === topup.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Acheter"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="pv-meta relative mt-12 text-center">
        Paiements sécurisés via Stripe · Annulation à tout moment · Remboursement sous 7 jours
      </p>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
