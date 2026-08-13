"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
}

/*
 * Bouton « verre encré ».
 * « primary » : dégradé violet nuit, liseré interne de lumière,
 * sheen aurore au survol — le CTA signature de la maison.
 * « secondary » : surface carte ivoire, le liseré s'allume lilas.
 * Disabled : encre 28 % sur carte, jamais de gris neutre.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex select-none cursor-pointer items-center justify-center font-medium tracking-[0.01em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)] disabled:pointer-events-none",
          {
            // Tailles
            "h-8 gap-2 rounded-full px-4 text-xs": size === "sm",
            "h-10 gap-2 rounded-full px-5 text-sm": size === "md",
            "h-12 gap-3 rounded-full px-7 text-[15px]": size === "lg",
            "h-10 w-10 rounded-full": size === "icon",
            // Variantes
            "pv-btn-sheen bg-[image:var(--btn-primary-bg)] text-[color:var(--btn-primary-text)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(43,36,80,0.16),0_10px_30px_rgba(43,36,80,0.28)] hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.26),0_2px_4px_rgba(43,36,80,0.16),0_16px_40px_rgba(43,36,80,0.32)] active:translate-y-[1px] active:brightness-[0.99] disabled:bg-[image:none] disabled:bg-carte disabled:text-[rgba(43,36,80,0.28)] disabled:border disabled:border-carte-brd disabled:shadow-[0_1px_2px_rgba(43,36,80,0.05)]":
              variant === "primary" || variant === "gradient",
            "border border-carte-brd bg-carte text-[color:var(--surface-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(43,36,80,0.05)] hover:border-[color:var(--color-violet)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_4px_rgba(43,36,80,0.06),0_12px_28px_rgba(43,36,80,0.1)] active:translate-y-[1px] disabled:opacity-45":
              variant === "secondary",
            "text-slate hover:bg-ink/5 hover:text-ink active:scale-[0.99] disabled:opacity-45":
              variant === "ghost",
            "border border-[color:var(--hairline-strong)] text-ink hover:border-[color:var(--color-violet)] hover:shadow-[0_0_16px_rgba(164,139,232,0.22)] active:scale-[0.99] disabled:opacity-45":
              variant === "outline",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
