"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7B4B]/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          {
            // Sizes
            "h-8 px-3 text-xs rounded-lg gap-1.5": size === "sm",
            "h-10 px-4 text-sm rounded-xl gap-2": size === "md",
            "h-12 px-6 text-base rounded-xl gap-2.5": size === "lg",
            "h-10 w-10 rounded-xl": size === "icon",
            // Variants
            "bg-[#FF7B4B] text-white hover:bg-[#ff6a35] shadow-[0_1px_3px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_12px_rgba(255,123,75,0.4)] active:scale-[0.98]": variant === "primary",
            "bg-[#141414] text-[#F5F0E8] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#333] active:scale-[0.98]": variant === "secondary",
            "text-[#9A9A9A] hover:text-[#F5F0E8] hover:bg-white/5 active:scale-[0.98]": variant === "ghost",
            "border border-[#333] text-[#F5F0E8] hover:border-[#FF7B4B]/40 hover:bg-white/5 active:scale-[0.98]": variant === "outline",
            "bg-gradient-to-r from-[#FF6B7D] via-[#FF7B4B] to-[#FFD166] text-white hover:opacity-90 shadow-[0_4px_20px_rgba(255,123,75,0.35)] active:scale-[0.98]": variant === "gradient",
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
