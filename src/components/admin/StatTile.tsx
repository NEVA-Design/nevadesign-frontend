import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Tuile de statistique — verre, étiquette mono, grand chiffre display.
 * Les tons ok/warn/err restent désaturés ; « beam » réserve le dégradé
 * spectral à un chiffre vedette.
 */

const VALUE_TONES = {
  default: "text-ink",
  beam: "pv-beam-text",
  ok: "text-ok",
  warn: "text-warn",
  err: "text-err",
} as const;

export function StatTile({
  label,
  value,
  detail,
  tone = "default",
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  tone?: keyof typeof VALUE_TONES;
  className?: string;
}) {
  return (
    <div className={cn("pv-glass pv-edge rounded-2xl px-6 py-6", className)}>
      <p className="pv-label text-[10px]">{label}</p>
      <p
        className={cn(
          "pv-display mt-4 text-[clamp(1.7rem,2.5vw,2.4rem)] leading-none",
          VALUE_TONES[tone]
        )}
      >
        {value}
      </p>
      {detail ? (
        <p className="mt-3.5 font-mono text-[10px] leading-relaxed tracking-[0.08em] text-dusk">
          {detail}
        </p>
      ) : null}
    </div>
  );
}
