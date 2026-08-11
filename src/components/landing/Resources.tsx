"use client";
import { useState } from "react";
import { Check, Download, Loader2, Package, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RESOURCE_PACKS_PUBLIC } from "@/lib/resources";

const packs = Object.values(RESOURCE_PACKS_PUBLIC);

export default function Resources() {
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
        router.push("/login?redirect=/#resources");
        return;
      }

      if (data.alreadyOwned) {
        router.push("/dashboard/downloads");
        return;
      }

      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur lors du checkout.");
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="resources" className="relative py-28 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb orb-orange w-[500px] h-[500px] right-0 top-1/4 opacity-[0.05]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#9A9A9A] mb-6">
            <Package size={11} className="text-[#FF7B4B]" />
            Ressources
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#F5F0E8] mb-4">
            Outils pour créateurs FiveM
          </h2>
          <p className="text-[#9A9A9A] text-lg max-w-xl leading-relaxed">
            Des ressources premium conçues pour accélérer ta création visuelle — brushes, templates et guides professionnels.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {packs.map((pack) => {
            const isHighlight = pack.id === "neva-pack";
            return (
              <div
                key={pack.id}
                className={`relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                  isHighlight
                    ? "bg-gradient-to-b from-[#FF7B4B]/10 to-[#FF6B7D]/5 border border-[#FF7B4B]/30 shadow-[0_0_50px_rgba(255,123,75,0.10)]"
                    : "glass-card glass-card-hover"
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FF7B4B] to-[#FFD166] text-[#0a0a0a] shadow-[0_4px_16px_rgba(255,123,75,0.5)]">
                      <Star size={9} fill="currentColor" />
                      {pack.badge}
                    </span>
                  </div>
                )}

                {/* Pack header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isHighlight ? "bg-[#FF7B4B]/20" : "bg-white/5"}`}>
                      <Download size={13} className={isHighlight ? "text-[#FF7B4B]" : "text-[#666]"} />
                    </div>
                    <span className="text-xs font-semibold text-[#555] uppercase tracking-widest">{pack.tagline}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#F5F0E8] tracking-tight mb-1">{pack.name}</h3>
                  <p className="text-sm text-[#666] leading-relaxed">{pack.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-5">
                  <span className="text-4xl font-bold text-[#F5F0E8] tracking-tighter">{pack.price}€</span>
                  <span className="text-[#555] text-sm">· achat unique</span>
                </div>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {pack.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#CCCCC0]">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isHighlight ? "bg-[#FF7B4B]/20" : "bg-white/5"}`}>
                        <Check size={9} className={isHighlight ? "text-[#FF7B4B]" : "text-[#666]"} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleBuy(pack.id)}
                  disabled={loading === pack.id}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 ${
                    isHighlight
                      ? "bg-gradient-to-r from-[#FF7B4B] to-[#FFD166] text-[#0a0a0a] hover:opacity-90 shadow-[0_4px_20px_rgba(255,123,75,0.35)]"
                      : "bg-white/[0.07] border border-white/[0.1] text-[#F5F0E8] hover:bg-white/[0.1]"
                  }`}
                >
                  {loading === pack.id ? (
                    <><Loader2 size={14} className="animate-spin" /> Redirection…</>
                  ) : (
                    <><Download size={14} /> Acheter — {pack.price}€</>
                  )}
                </button>

                {!isHighlight && (
                  <p className="text-center text-[10px] text-[#2e2e2e] mt-2">
                    Tout inclus dans le Neva Pack
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-sm text-red-400 mt-6">{error}</p>
        )}

        {/* Trust note */}
        <p className="text-center text-xs text-[#333] mt-10">
          Paiement sécurisé via Stripe · Téléchargement immédiat · Accès depuis ton dashboard
        </p>
      </div>
    </section>
  );
}
