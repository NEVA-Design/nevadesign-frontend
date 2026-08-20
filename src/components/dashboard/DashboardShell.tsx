"use client";

import "./dashboard-skin.css";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/prisme/Brand";

interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  initials: string
  credits: number
  maxCredits: number
  plan: string
  creditReviewStatus?: string | null
  isAdmin?: boolean
}

/*
 * Coquille de l'atelier — Givre, registre dawn calme. L'aube diluée
 * (scène fixe + caustiques discrètes) respire sous le plan de
 * travail : le produit est l'endroit le plus calme du site. La
 * sidebar est un panneau de verre flottant qui floute la scène.
 * Crédits synchronisés dans l'onglet via l'événement
 * « neva:credits-updated ».
 */
export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: UserProfile
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);
  const [livePlan, setLivePlan] = useState<string | null>(null);

  useEffect(() => {
    const handleCreditSync = (event: Event) => {
      const detail = (event as CustomEvent<{ credits?: number; plan?: string }>).detail;
      if (!detail) return;
      if (typeof detail.credits === "number") setLiveCredits(detail.credits);
      if (detail.plan) setLivePlan(detail.plan);
    };

    window.addEventListener("neva:credits-updated", handleCreditSync);

    return () => {
      window.removeEventListener("neva:credits-updated", handleCreditSync);
    };
  }, []);

  const liveUser = useMemo(
    () => ({
      ...user,
      credits: liveCredits ?? user.credits,
      plan: livePlan ?? user.plan,
    }),
    [liveCredits, livePlan, user],
  );

  const reviewMessage = useMemo(() => {
    if (user.creditReviewStatus === "pending_review") {
      return "Votre compte est en cours de vérification avant l'activation des créations offertes.";
    }

    if (user.creditReviewStatus === "blocked" || user.creditReviewStatus === "rejected_by_admin") {
      return "Les créations offertes ne sont pas disponibles sur ce compte. Vous pouvez utiliser Neva Design avec un abonnement ou un pack de créations.";
    }

    return null;
  }, [user.creditReviewStatus]);

  return (
    <div className="pv-light pv-atelier relative flex min-h-screen text-ink">
      <style>{`html{color-scheme:dark}`}</style>
      {/* La scène — aube diluée, fixe : le fond de travail du produit */}
      <div aria-hidden className="pv-scene-bg--dawn-calm pointer-events-none fixed inset-0" />
      {/* Caustiques très discrètes — la seule vie du fond */}
      <div aria-hidden className="pv-caustics !fixed opacity-60" />
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-[rgba(56,50,88,0.34)] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Le panneau de verre flotte sur la scène — marge de 12px */}
      <div
        className={`fixed bottom-0 left-0 top-0 z-40 p-3 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar user={liveUser} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="relative z-10 flex min-h-screen w-full flex-1 flex-col overflow-x-hidden lg:ml-[288px]">
        {/* L'atmosphère de la zone de travail — un seul champ de
            lumière aurore, haut-droit. Le grain et la vignette sont
            déjà montés site-wide par le layout racine. */}
        <div aria-hidden className="pv-field-light pv-field-light--tr" />
        {/* Barre mobile — voile nav : filet bas encré, aucune ombre */}
        <div className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center gap-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,10,0.6)] px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer rounded-lg p-2 text-slate transition-colors duration-[var(--dur-base)] hover:bg-ink/5 hover:text-ink"
            aria-label="Ouvrir le menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>
          <span className="flex items-center gap-3">
            <BrandMark size={16} tone="white" />
            <span className="text-sm font-medium tracking-[-0.01em] text-ink">
              Neva Design
            </span>
          </span>
        </div>

        {reviewMessage ? (
          <div className="relative z-10 mx-4 mt-4 rounded-[12px] border border-[rgba(138,109,31,0.22)] bg-[rgba(10,10,10,0.78)] px-4 py-3 text-sm text-warn shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_10px_26px_rgba(0,0,0,0.37)] sm:mx-6 lg:mx-8">
            {reviewMessage}
          </div>
        ) : null}

        <div className="relative z-10 flex w-full flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
