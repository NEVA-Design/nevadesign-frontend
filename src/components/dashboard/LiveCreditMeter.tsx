"use client";

import { useEffect, useMemo, useState } from "react";
import { Gauge } from "@/components/ui/gauge";

/*
 * Jauge de créations en temps réel — grand chiffre Geist, jauge
 * spectrale. Écoute l'événement « neva:credits-updated » (déclenché
 * dans le même onglet après chaque génération).
 */
export default function LiveCreditMeter({
  initialCredits,
  maxCredits,
}: {
  userId: string
  initialCredits: number
  maxCredits: number
}) {
  const [credits, setCredits] = useState(initialCredits);

  useEffect(() => {
    const handleCreditSync = (event: Event) => {
      const detail = (event as CustomEvent<{ credits?: number }>).detail;
      if (typeof detail?.credits === "number") setCredits(detail.credits);
    };

    window.addEventListener("neva:credits-updated", handleCreditSync);

    return () => {
      window.removeEventListener("neva:credits-updated", handleCreditSync);
    };
  }, []);

  const remainingPct = useMemo(
    () => Math.min(100, Math.max(0, Math.round((credits / Math.max(maxCredits, 1)) * 100))),
    [credits, maxCredits],
  );
  const usedCredits = Math.max(0, maxCredits - credits);

  return (
    <div>
      <p className="pv-label">Créations restantes</p>
      <p className="pv-display mt-3 text-[42px] leading-none text-ink">
        {credits.toLocaleString("fr-FR")}
        <span className="ml-2 font-mono text-xs tracking-[0.08em] text-mist">
          / {maxCredits.toLocaleString("fr-FR")}
        </span>
      </p>
      <Gauge value={credits} max={maxCredits} className="mt-4" />
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] tracking-[0.1em] text-mist">
        <span>{usedCredits.toLocaleString("fr-FR")} utilisées ce cycle</span>
        <span className="text-[color:var(--num-color)]">{remainingPct}% disponibles</span>
      </div>
    </div>
  );
}
