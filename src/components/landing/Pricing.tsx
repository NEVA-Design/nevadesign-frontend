"use client";

import { Check, Lock, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/plans";

const planCards = [
  { plan: PLANS.free, label: "Preview", variant: "secondary" as const, highlight: false, note: "Tester sans debloquer toute la valeur." },
  { plan: PLANS.creator, label: "Creator", variant: "gradient" as const, highlight: true, note: "Le plan ideal pour publier sans watermark." },
  { plan: PLANS.studio, label: "Studio", variant: "outline" as const, highlight: false, note: "Pour equipes et serveurs actifs." },
  { plan: PLANS.pro, label: "Agency", variant: "outline" as const, highlight: false, note: "Volume, priorite et production client." },
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#9A9A9A]">
            <Zap size={11} className="text-[#FFD166]" />
            Freemium built for profitability
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F0E8] sm:text-5xl">
            Essayez gratuitement. Deverrouillez quand ca devient utile.
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-[#9A9A9A]">
            Free sert a tester le workflow. Les plans payants debloquent les exports propres, la bibliotheque, l&apos;usage commercial et la production premium.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {planCards.map(({ plan, label, variant, highlight, note }) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 transition-all duration-300 ${
                highlight
                  ? "border border-[#FF7B4B]/30 bg-gradient-to-b from-[#FF7B4B]/10 to-[#FF6B7D]/5 shadow-[0_0_50px_rgba(255,123,75,0.12)]"
                  : "glass-card glass-card-hover"
              }`}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[#FF7B4B]/35 bg-[#120d0b] px-3 py-1 text-xs font-semibold text-[#FF7B4B]">
                  Best conversion
                </div>
              )}

              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-[#9A9A9A]">{label}</h3>
                  {plan.id === "free" ? <Lock size={14} className="text-[#555]" /> : <Sparkles size={14} className="text-[#FFD166]" />}
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight text-[#F5F0E8]">{plan.price}€</span>
                  <span className="text-sm text-[#666]">/mo</span>
                </div>
                <p className="text-sm leading-6 text-[#777]">{note}</p>
              </div>

              <div className="mb-6 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm font-medium text-[#9A9A9A]">
                <Zap size={13} className={highlight ? "text-[#FF7B4B]" : "text-[#666]"} />
                {plan.credits} credits / mois
              </div>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-[#CCCCC0]">
                    <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${highlight ? "bg-[#FF7B4B]/20" : "bg-white/5"}`}>
                      <Check size={10} className={highlight ? "text-[#FF7B4B]" : "text-[#666]"} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button variant={variant} size="md" className="w-full">
                  {plan.id === "free" ? "Tester en preview" : `Choisir ${plan.name}`}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#555]">
          Credits mensuels inclus. Packs de credits additionnels disponibles separement. Annulation possible a tout moment.
        </p>
      </div>
    </section>
  );
}
