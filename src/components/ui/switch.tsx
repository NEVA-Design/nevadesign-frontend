"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* Interrupteur Prisme — piste de verre, actif traversé par le spectre. */
export function Switch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-40",
        checked
          ? "border-transparent bg-[linear-gradient(115deg,rgba(185,167,218,0.8),rgba(233,198,162,0.8))]"
          : "border-[color:var(--hairline-strong)] bg-ink/8",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          checked
            ? "left-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
            : "left-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.40)]"
        )}
      />
    </button>
  );
}
