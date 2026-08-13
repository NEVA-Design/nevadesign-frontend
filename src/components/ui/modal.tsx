"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

/*
 * Modale Galerie — panneau de verre dépoli sur voile d'encre
 * diluée : le flou de l'arrière-plan donne sa matière au verre.
 * Fermeture par Échap, clic sur le voile ou bouton dédié.
 */
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  className,
  widthClassName = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  widthClassName?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[rgba(29,35,64,0.38)] backdrop-blur-[8px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "pv-scale-in relative w-full rounded-2xl border border-[color:var(--hairline-glass)] bg-[rgba(255,255,255,0.86)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),var(--shadow-modal)] backdrop-blur-2xl",
          widthClassName,
          className
        )}
      >
        <div className="pv-hairline flex items-start justify-between gap-4 border-b px-6 py-5">
          <div>
            {eyebrow ? (
              <p className="pv-label mb-2 text-[color:var(--num-color)]">{eyebrow}</p>
            ) : null}
            {title ? (
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink sm:text-[22px]">
                {title}
              </h2>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="cursor-pointer rounded-full p-2 text-slate transition-colors duration-[var(--dur-base)] hover:bg-ink/5 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
