"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/*
 * Toasts Prisme — filet spectral à gauche, coin bas-droit,
 * disparition automatique.
 */

export type Toast = {
  id: number;
  message: string;
  tone?: "default" | "success" | "error";
};

export function useToasts(autoDismissMs = 3500) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback(
    (message: string, tone: Toast["tone"] = "default") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, tone }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, autoDismissMs);
    },
    [autoDismissMs]
  );
  return { toasts, push };
}

export function ToastViewport({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[110] flex w-[calc(100vw-40px)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pv-toast-in pointer-events-auto rounded-lg border border-[color:var(--hairline-glass)] bg-[rgba(18,18,18,0.88)] py-3 pl-4 pr-5 text-sm text-ink/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),var(--shadow-float)] backdrop-blur-xl",
            "border-l-2",
            {
              "border-l-violet": toast.tone === "default" || !toast.tone,
              "border-l-ok": toast.tone === "success",
              "border-l-err": toast.tone === "error",
            }
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
