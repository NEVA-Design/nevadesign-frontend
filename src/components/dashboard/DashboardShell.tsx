"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
}

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
    const supabase = createClient();
    const channel = supabase
      .channel(`profile-credits-${user.email}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const next = payload.new as { credits?: number; plan?: string };
          if (typeof next.credits === "number") setLiveCredits(next.credits);
          if (next.plan) setLivePlan(next.plan);
        },
      )
      .subscribe();

    const handleCreditSync = (event: Event) => {
      const detail = (event as CustomEvent<{ credits?: number; plan?: string }>).detail;
      if (!detail) return;
      if (typeof detail.credits === "number") setLiveCredits(detail.credits);
      if (detail.plan) setLivePlan(detail.plan);
    };

    window.addEventListener("neva:credits-updated", handleCreditSync);

    return () => {
      window.removeEventListener("neva:credits-updated", handleCreditSync);
      supabase.removeChannel(channel);
    };
  }, [user.email, user.id]);

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
      return "Votre compte est en cours de verification avant l'activation des credits gratuits.";
    }

    if (user.creditReviewStatus === "blocked" || user.creditReviewStatus === "rejected_by_admin") {
      return "Les credits gratuits ne sont pas disponibles sur ce compte. Vous pouvez toujours utiliser Neva AI avec un abonnement ou un pack de credits.";
    }

    return null;
  }, [user.creditReviewStatus]);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#050505]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.026),transparent_240px)]" />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar user={liveUser} onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="relative z-10 flex min-h-screen w-full flex-1 flex-col overflow-x-hidden lg:ml-[252px]">
        <div className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#050505]/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 text-[#777] transition-colors hover:bg-white/5 hover:text-[#F5F0E8]"
            aria-label="Ouvrir le menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-[#F5F0E8]">Neva AI</span>
        </div>

        {reviewMessage && (
          <div className="mx-4 mt-4 rounded-xl border border-[#FFD166]/20 bg-[#FFD166]/10 px-4 py-3 text-sm text-[#FFD166] sm:mx-6 lg:mx-8">
            {reviewMessage}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
