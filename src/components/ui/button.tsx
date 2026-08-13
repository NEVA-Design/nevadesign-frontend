"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
}

/*
 * Bouton Galerie Argent.
 * « primary » : la pilule encre — le CTA signature de la maison.
 * « gradient » : même pilule encre, sertie du liseré spectral
 * (le CTA vedette). La couleur vit dans le liseré, jamais dans
 * le remplissage.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex select-none cursor-pointer items-center justify-center font-medium tracking-[0.01em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface-page)] disabled:pointer-events-none disabled:opacity-45",
          {
            // Tailles
            "h-8 gap-2 rounded-full px-4 text-xs": size === "sm",
            "h-10 gap-2 rounded-full px-5 text-sm": size === "md",
            "h-12 gap-3 rounded-full px-7 text-[15px]": size === "lg",
            "h-10 w-10 rounded-full": size === "icon",
            // Variantes
            "bg-[color:var(--btn-primary-bg)] text-[color:var(--btn-primary-text)] shadow-[0_1px_2px_rgba(29,35,64,0.14),0_8px_22px_rgba(29,35,64,0.2)] hover:-translate-y-px hover:bg-[color:var(--btn-primary-hover)] active:translate-y-0 active:scale-[0.99]":
              variant === "primary",
            "bg-[color:var(--btn-primary-bg)] text-[color:var(--btn-primary-text)] shadow-[0_0_0_1px_rgba(124,106,255,0.45),0_4px_24px_rgba(124,106,255,0.3),0_1px_2px_rgba(29,35,64,0.2)] hover:-translate-y-px hover:bg-[color:var(--btn-primary-hover)] hover:shadow-[0_0_0_1px_rgba(124,106,255,0.6),0_6px_32px_rgba(124,106,255,0.4),0_1px_2px_rgba(29,35,64,0.2)] active:translate-y-0 active:scale-[0.99]":
              variant === "gradient",
            "border border-[color:var(--hairline-glass)] bg-white/70 text-[color:var(--surface-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(29,35,64,0.05)] backdrop-blur-md hover:bg-white/90 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_4px_rgba(29,35,64,0.06),0_12px_28px_rgba(29,35,64,0.1)] active:scale-[0.99]":
              variant === "secondary",
            "text-slate hover:bg-ink/5 hover:text-ink active:scale-[0.99]":
              variant === "ghost",
            "border border-[color:var(--hairline-strong)] text-ink hover:border-[rgba(109,91,232,0.5)] hover:shadow-[0_0_16px_rgba(124,106,255,0.18)] active:scale-[0.99]":
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
