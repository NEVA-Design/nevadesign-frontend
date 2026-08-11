"use client";

import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LiveCreditMeter({
  userId,
  initialCredits,
  maxCredits,
}: {
  userId: string
  initialCredits: number
  maxCredits: number
}) {
  const [credits, setCredits] = useState(initialCredits);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-credit-meter-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (payload) => {
          const next = payload.new as { credits?: number };
          if (typeof next.credits === "number") setCredits(next.credits);
        },
      )
      .subscribe();

    const handleCreditSync = (event: Event) => {
      const detail = (event as CustomEvent<{ credits?: number }>).detail;
      if (typeof detail?.credits === "number") setCredits(detail.credits);
    };

    window.addEventListener("neva:credits-updated", handleCreditSync);

    return () => {
      window.removeEventListener("neva:credits-updated", handleCreditSync);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const remainingPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round((credits / Math.max(maxCredits, 1)) * 100))),
    [credits, maxCredits],
  );
  const usedCredits = Math.max(0, maxCredits - credits);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#080808]/80 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[#A9A39B]">Credits remaining</div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight text-[#F8F3EA]">{credits.toLocaleString()}</span>
            <span className="pb-1 text-sm text-[#777]">/ {maxCredits.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#FFD166]/20 bg-[#FFD166]/10 text-[#FFD166]">
          <Zap size={19} />
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#FF6B7D,#FF7B4B,#FFD166)] transition-[width] duration-500"
          style={{ width: `${remainingPct}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[#777]">
        <span>{usedCredits.toLocaleString()} used this cycle</span>
        <span>{remainingPct}% available</span>
      </div>
    </div>
  );
}
