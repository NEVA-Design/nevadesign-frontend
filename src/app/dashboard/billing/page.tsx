"use client";
import { useState, Suspense } from "react";
import { CreditCard, Zap, Check, Loader2, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, TOPUPS } from "@/lib/plans";
import { useSearchParams } from "next/navigation";

async function redirectToCheckout(priceId: string, mode: "subscription" | "payment"): Promise<string | null> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, mode }),
  });
  const text = await res.text();
  if (!text) return "Erreur serveur (réponse vide). Vérifie les Price IDs dans .env.local.";
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-[#FF7B4B]" />
            <h1 className="text-2xl font-bold text-[#F5F0E8]">Billing</h1>
          </div>
          <p className="text-sm text-[#666]">Gère ton abonnement et tes créations disponibles.</p>
        </div>
        <button
          onClick={redirectToPortal}
          className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] text-[#9A9A9A] hover:text-[#F5F0E8] transition-all"
        >
          Gérer mon abonnement
        </button>
      </div>

      {checkoutError && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
          {checkoutError}
        </div>
      )}

      {success && (
        <div className="mb-6 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 flex items-center gap-2">
          <Check size={14} /> Paiement réussi ! Tes créations ont été ajoutées.
        </div>
      )}

      {/* Plans */}
      <h2 className="text-sm font-semibold text-[#9A9A9A] uppercase tracking-widest mb-4">Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {planList.map((plan) => {
          const isFree = plan.id === "free";
          const isPopular = plan.id === "creator";
          return (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-5 border flex flex-col gap-4 ${
                isPopular ? "border-[#FF7B4B]/40 relative" : "border-white/[0.06]"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#FF6B7D] to-[#FFD166] text-[10px] font-bold text-white">
                  LE PLUS POPULAIRE
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-[#F5F0E8] mb-0.5">{plan.name}</div>
                <div className="text-xs text-[#555]">{plan.description}</div>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-[#F5F0E8]">${plan.price}</span>
                {!isFree && <span className="text-xs text-[#555] mb-1">/mois</span>}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#FF7B4B] font-semibold">
                <Zap size={11} /> {plan.credits.toLocaleString()} créations{!isFree ? "/mois" : " offertes"}
              </div>
              <ul className="flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                    <Check size={10} className="text-[#4ADE80] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {isFree ? (
                  <div className="w-full py-2 rounded-xl text-xs text-center text-[#444] border border-white/[0.06]">
                    Inclus à l&apos;inscription
                  </div>
                ) : (
                  <Button
                    variant={isPopular ? "gradient" : "secondary"}
                    size="sm"
                    className="w-full"
                    disabled={loadingId === plan.id}
                    onClick={() => handle(plan.id, plan.priceId!, "subscription")}
                  >
                    {loadingId === plan.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>Choisir {plan.name} <ArrowRight size={12} /></>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top-ups */}
      <h2 className="text-sm font-semibold text-[#9A9A9A] uppercase tracking-widest mb-4">
        Créations supplémentaires
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOPUPS.map((topup) => (
          <div key={topup.id} className="glass-card rounded-xl p-4 border border-white/[0.06] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F5F0E8] mb-0.5">
                <Plus size={13} className="text-[#FF7B4B]" />
                {topup.credits.toLocaleString()} créations
              </div>
              <div className="text-xs text-[#555]">
                {(topup.price / topup.credits).toFixed(2)}€ par création
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-lg font-bold text-[#F5F0E8]">${topup.price}</span>
              <Button
                size="sm"
                disabled={loadingId === topup.id}
                onClick={() => handle(topup.id, topup.priceId, "payment")}
              >
                {loadingId === topup.id ? <Loader2 size={12} className="animate-spin" /> : "Acheter"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#333] mt-8 text-center">
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
