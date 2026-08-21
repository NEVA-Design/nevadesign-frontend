import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * État vide Givre noir — le monogramme en veilleuse sous un halo
 * aurore, une ligne qui dit quoi faire, une action. Jamais un
 * constat d'échec, jamais de pointillés : une carte de verre
 * calme (dégradé blanc 5 → 3 %, arête haute allumée).
 */
export function EmptyState({
  title,
  hint,
  action,
  className,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/[0.10] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-14 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(185,167,218,0.10),transparent_70%)]"
      />
      {/* refonte 50k : l'illustration FILAIRE ΛV — le trait de la
          maison, jamais un aplat */}
      <svg
        viewBox="0 0 1441 1000"
        aria-hidden
        className="relative mb-5 h-8 w-auto"
        fill="none"
        stroke="rgba(244,242,238,0.28)"
        strokeWidth="22"
      >
        <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
        <path d="M439.5 710 L559.2 1000 L320 1000 Z" />
        <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
        <path d="M893.4 0 L1134.1 0 L1013.7 292 Z" />
      </svg>
      <p className="relative max-w-sm text-lg font-semibold tracking-[-0.01em] text-ink/90">{title}</p>
      {hint ? (
        <p className="relative mt-3 max-w-xs font-mono text-xs leading-relaxed tracking-[0.04em] text-mist">
          {hint}
        </p>
      ) : null}
      {action ? <div className="relative mt-6">{action}</div> : null}
    </div>
  );
}
