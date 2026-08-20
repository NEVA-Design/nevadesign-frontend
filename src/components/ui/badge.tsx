import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neva" | "subtle" | "popular";
}

/*
 * Badge Prisme — étiquette mono en petites capitales espacées.
 * « popular » est le seul endroit du système où le dégradé spectral
 * remplit une surface : un filet de lumière de 18px, pas un aplat.
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] transition-colors",
        {
          "border border-[color:var(--hairline)] bg-linen text-slate":
            variant === "default",
          "border border-[rgba(184,161,232,0.45)] bg-[rgba(184,161,232,0.1)] text-[color:var(--surface-text)]":
            variant === "neva",
          "border border-[color:var(--hairline)] bg-[rgba(255,255,255,0.05)] text-mist": variant === "subtle",
          /* plus d'aplat aurore sur le noir : fond lilas 14 % + liseré */
          "border border-[rgba(184,161,232,0.55)] bg-[rgba(184,161,232,0.14)] font-semibold text-[color:var(--surface-text)]":
            variant === "popular",
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
