import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * État vide Prisme — le monogramme en veilleuse sous un halo
 * spectral, une invitation à agir. Jamais un constat d'échec.
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
        "relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[color:var(--hairline-strong)] bg-linen/60 px-6 py-14 text-center",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,106,255,0.08),transparent_70%)]"
      />
      <Image
        src="/brand/logo-noir.png"
        alt=""
        aria-hidden
        width={46}
        height={32}
        className="mb-5 opacity-20"
      />
      <p className="max-w-sm text-lg font-semibold tracking-[-0.01em] text-ink/90">{title}</p>
      {hint ? (
        <p className="mt-3 max-w-xs font-mono text-xs leading-relaxed tracking-[0.04em] text-mist">
          {hint}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
