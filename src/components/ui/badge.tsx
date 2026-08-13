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
          "border border-[rgba(109,91,232,0.28)] bg-[rgba(124,106,255,0.07)] text-[color:var(--num-color)]":
            variant === "neva",
          "border border-[color:var(--hairline)] bg-white text-mist": variant === "subtle",
          "border-0 bg-[linear-gradient(115deg,#7C6AFF,#4CC9F0)] font-semibold text-white":
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
