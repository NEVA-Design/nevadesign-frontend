import * as React from "react";
import { cn } from "@/lib/utils";

/* Arc spectral en rotation — l'attente selon Prisme. */
export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden className={cn("pv-spinner inline-block", className)} />;
}

/* Bloc de chargement avec étiquette mono. */
export function LoadingBlock({
  label = "Chargement…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-12", className)}>
      <Spinner />
      <span className="font-mono text-xs tracking-[0.08em] text-dusk">{label}</span>
    </div>
  );
}

/* Squelette de chargement. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("pv-skeleton", className)} />;
}
