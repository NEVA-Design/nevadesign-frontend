import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "neva" | "subtle" | "popular";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-[#1a1a1a] text-[#9A9A9A] border border-[#222]": variant === "default",
          "bg-gradient-to-r from-[#FF6B7D]/20 to-[#FFD166]/20 text-[#FFD166] border border-[#FF7B4B]/30": variant === "neva",
          "bg-white/5 text-[#9A9A9A] border border-white/10": variant === "subtle",
          "bg-gradient-to-r from-[#FF6B7D] via-[#FF7B4B] to-[#FFD166] text-white font-semibold shadow-[0_2px_12px_rgba(255,123,75,0.4)]": variant === "popular",
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
