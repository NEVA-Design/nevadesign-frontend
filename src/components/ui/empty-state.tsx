import * as React from "react";
import Image from "next/image";
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
      <Image
        src="/brand/logo-blanc.png"
        alt=""
        aria-hidden
        width={46}
        height={32}
        className="relative mb-5 opacity-20"
      />
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
