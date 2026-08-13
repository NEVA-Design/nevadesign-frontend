import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Jauge Prisme — le spectre mesure, sur piste de verre éteinte.
 * La jauge du système : crédits, scores, progression.
 */
export function Gauge({
  value,
  max = 100,
  className,
}: {
  value: number;
  max?: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / Math.max(max, 1)) * 100)));
  return (
    <div
      className={cn("pv-gauge", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

/* Compteur mono associé : « 82 / 100 » */
export function GaugeFigure({
  value,
  max,
  unit,
  className,
}: {
  value: number;
  max?: number;
  unit?: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-xs tracking-[0.06em] text-steel", className)}>
      <span className="text-[color:var(--surface-text)]">{value.toLocaleString("fr-FR")}</span>
      {typeof max === "number" ? <span> / {max.toLocaleString("fr-FR")}</span> : null}
      {unit ? <span> {unit}</span> : null}
    </span>
  );
}
