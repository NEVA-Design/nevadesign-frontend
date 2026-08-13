import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * En-tête de page de la console — eyebrow mono, titre display Geist,
 * description acier, zone d'actions calée à droite. Un seul mot-clé
 * du titre peut porter le dégradé spectral (pv-beam-text), pas plus.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header
      className={cn(
        "relative mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
          {eyebrow}
        </p>
        <h1 className="pv-display mt-3.5 text-[clamp(1.9rem,3.2vw,2.6rem)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3.5 text-sm leading-relaxed text-slate">{description}</p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">{children}</div>
      ) : null}
    </header>
  );
}

/* Compteur de synthèse — pilule de verre, chiffre spectral. */
export function HeaderMeta({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-[color:var(--hairline)] bg-ink/[0.04] px-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-mist",
        className
      )}
    >
      <span className="pv-beam-text text-xs font-medium tracking-[0.06em]">{value}</span>
      {label}
    </span>
  );
}
