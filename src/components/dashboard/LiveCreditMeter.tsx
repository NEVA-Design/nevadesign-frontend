"use client";

import { useEffect, useMemo, useState } from "react";

/*
 * Jauge de créations en temps réel — la carte majeure de l'accueil.
 * Grand chiffre display à gauche, anneau de progression SVG à
 * droite : piste blanc 8 %, arc en dégradé aurore lilas → pêche,
 * bouts ronds. Écoute l'événement « neva:credits-updated »
 * (déclenché dans le même onglet après chaque génération).
 */

const RING_SIZE = 72;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

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
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <p className="pv-label">Créations restantes</p>
        <p className="pv-display mt-4 text-[46px] leading-none text-ink">
          {credits.toLocaleString("fr-FR")}
          <span className="ml-2 font-mono text-xs tracking-[0.08em] text-mist">
            / {maxCredits.toLocaleString("fr-FR")}
          </span>
        </p>
        <p className="mt-4 font-mono text-[10px] tracking-[0.1em] text-mist">
          {usedCredits.toLocaleString("fr-FR")} utilisées ce cycle
        </p>
      </div>

      {/* L'anneau — la mesure portée par le spectre, jamais en aplat */}
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="shrink-0"
        role="img"
        aria-label={`${remainingPct} % de créations disponibles`}
      >
        <defs>
          <linearGradient id="nv-ring-aurore" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8A1E8" />
            <stop offset="100%" stopColor="#F0C5A8" />
          </linearGradient>
        </defs>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="url(#nv-ring-aurore)"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRC}
          strokeDashoffset={RING_CIRC * (1 - remainingPct / 100)}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.65,0,0.35,1)" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="#9A9A9A"
          style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.04em" }}
        >
          {remainingPct}%
        </text>
      </svg>
    </div>
  );
}
