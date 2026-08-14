"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";
import { Loader2 } from "lucide-react";

/*
 * Remplace window.confirm / window.prompt par des modales Neva
 * (verre dépoli, boutons pv-btn-sheen). Un seul provider monté à la
 * racine ; useConfirm()/usePrompt() renvoient une Promise, comme les
 * API natives — même ergonomie côté appelant, juste awaité.
 */

type ConfirmOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

type PromptOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  validate?: (value: string) => string | null;
};

type PendingConfirm = { kind: "confirm"; options: ConfirmOptions; resolve: (value: boolean) => void };
type PendingPrompt = { kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };
type Pending = PendingConfirm | PendingPrompt;

const ConfirmDialogContext = React.createContext<{
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
} | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<Pending | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [promptValue, setPromptValue] = React.useState("");
  const [promptError, setPromptError] = React.useState<string | null>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ kind: "confirm", options, resolve });
    });
  }, []);

  const prompt = React.useCallback((options: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(options.defaultValue ?? "");
      setPromptError(null);
      setPending({ kind: "prompt", options, resolve });
    });
  }, []);

  const close = () => {
    setPending(null);
    setBusy(false);
    setPromptValue("");
    setPromptError(null);
  };

  const handleCancel = () => {
    if (busy) return;
    if (pending?.kind === "confirm") pending.resolve(false);
    if (pending?.kind === "prompt") pending.resolve(null);
    close();
  };

  const handleConfirm = () => {
    if (!pending || busy) return;
    if (pending.kind === "confirm") {
      pending.resolve(true);
      close();
      return;
    }
    const trimmed = promptValue.trim();
    const error = pending.options.validate?.(trimmed) ?? null;
    if (error) {
      setPromptError(error);
      return;
    }
    pending.resolve(trimmed);
    close();
  };

  const value = React.useMemo(() => ({ confirm, prompt }), [confirm, prompt]);

  const isDanger = pending?.kind === "confirm" && pending.options.tone === "danger";

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <Modal
        open={pending !== null}
        onClose={handleCancel}
        title={pending?.options.title}
        widthClassName="max-w-md"
      >
        {pending ? (
          <div className="flex flex-col gap-5">
            {pending.options.description ? (
              <p className="text-sm leading-relaxed text-steel">{pending.options.description}</p>
            ) : null}

            {pending.kind === "prompt" ? (
              <div>
                {pending.options.label ? (
                  <Label htmlFor="confirm-dialog-input">{pending.options.label}</Label>
                ) : null}
                <Input
                  id="confirm-dialog-input"
                  autoFocus
                  value={promptValue}
                  placeholder={pending.options.placeholder}
                  onChange={(e) => {
                    setPromptValue(e.target.value);
                    if (promptError) setPromptError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirm();
                    }
                  }}
                />
                {promptError ? <FormMessage tone="error">{promptError}</FormMessage> : null}
              </div>
            ) : null}

            <div className="mt-1 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={busy}>
                {pending.options.cancelLabel ?? "Annuler"}
              </Button>
              <Button
                type="button"
                variant={isDanger ? "outline" : "primary"}
                className={isDanger ? "border-err/40 text-err hover:border-err hover:shadow-[0_0_16px_rgba(220,90,90,0.22)]" : undefined}
                onClick={handleConfirm}
                disabled={busy || (pending.kind === "prompt" && !promptValue.trim())}
              >
                {busy ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Patientez…
                  </>
                ) : (
                  pending.options.confirmLabel ?? (pending.kind === "prompt" ? "Valider" : "Confirmer")
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

function useConfirmDialogContext() {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirm/usePrompt must be used within a ConfirmDialogProvider");
  return ctx;
}

export function useConfirm() {
  return useConfirmDialogContext().confirm;
}

export function usePrompt() {
  return useConfirmDialogContext().prompt;
}
