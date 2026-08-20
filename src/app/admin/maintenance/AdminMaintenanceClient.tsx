"use client";

import { useMemo, useState } from "react";
import { Check, Power, ShieldCheck, TriangleAlert } from "lucide-react";
import { BrandMark } from "@/components/prisme/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormMessage, Input, Label, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { PageHeader } from "@/components/admin/PageHeader";
import { isMaintenanceActive, type MaintenanceMode } from "@/lib/maintenance";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Maintenance — le rideau du studio. Deux gros interrupteurs
 * (Ouvert / Maintenance) qui enregistrent immédiatement, le message
 * public, la fenêtre programmée et un aperçu fidèle de la page
 * publique : void, verre, lumière spectrale.
 */

type FormState = {
  enabled: boolean;
  title: string;
  message: string;
  allow_admin_access: boolean;
  starts_at: string;
  ends_at: string;
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromMaintenance(item: MaintenanceMode): FormState {
  return {
    enabled: item.enabled,
    title: item.title,
    message: item.message,
    allow_admin_access: item.allow_admin_access,
    starts_at: toLocalInput(item.starts_at),
    ends_at: toLocalInput(item.ends_at),
  };
}

export function AdminMaintenanceClient({
  initialMaintenance,
  tableMissing,
}: {
  initialMaintenance: MaintenanceMode;
  tableMissing: boolean;
}) {
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [form, setForm] = useState<FormState>(() => fromMaintenance(initialMaintenance));
  const [saving, setSaving] = useState(false);
  const { toasts, push } = useToasts();

  const active = useMemo(() => isMaintenanceActive(maintenance), [maintenance]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(nextForm = form) {
    if (!nextForm.title.trim() || !nextForm.message.trim()) {
      push("Le titre et le message sont requis.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await backendFetch("/admin/maintenance", {
        method: "PATCH",
        body: JSON.stringify(nextForm),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        push(data.error ?? "Erreur serveur. Réessayez.", "error");
        return;
      }

      setMaintenance(data.maintenance as MaintenanceMode);
      setForm(fromMaintenance(data.maintenance as MaintenanceMode));
      push(
        (data.maintenance as MaintenanceMode).enabled
          ? "Maintenance mise à jour."
          : "Maintenance désactivée.",
        "success"
      );
    } catch {
      push("Erreur réseau. Vérifiez votre connexion.", "error");
    } finally {
      setSaving(false);
    }
  }

  function setEnabled(enabled: boolean) {
    const next = { ...form, enabled };
    setForm(next);
    void save(next);
  }

  return (
    <div className="pv-fade-up relative overflow-x-clip">
      <div aria-hidden className="pv-halo -top-24 right-[-6%] h-[340px] w-[460px] opacity-50" />
      <ToastViewport toasts={toasts} />

      <PageHeader
        eyebrow="Console"
        title={
          <>
            Fermer le <span className="pv-beam-underline font-medium text-ink">rideau.</span>
          </>
        }
        description="Coupez l'accès public au site, personnalisez le message affiché et programmez une fenêtre d'intervention."
      >
        <p
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.14em] ${
            active
              ? "border-warn/40 bg-warn/10 text-warn"
              : "border-ok/40 bg-ok/10 text-ok"
          }`}
        >
          <Power size={13} strokeWidth={1.8} />
          {active ? "Maintenance active" : "Site ouvert"}
        </p>
      </PageHeader>

      {tableMissing && (
        <FormMessage tone="warning" className="relative mb-8">
          <span className="flex items-start gap-2.5">
            <TriangleAlert size={16} strokeWidth={1.8} className="mt-0.5 shrink-0" />
            <span>
              La table <code className="font-mono text-ink">site_maintenance</code> n&apos;existe pas
              encore. Appliquez la migration{" "}
              <code className="font-mono text-ink">011_site_maintenance.sql</code> dans Supabase
              avant d&apos;activer le mode.
            </span>
          </span>
        </FormMessage>
      )}

      <div className="relative grid gap-5 lg:grid-cols-[420px_1fr]">
        {/* ── Contrôle global ───────────────────────────────────── */}
        <Card className="h-fit p-6">
          <p className="pv-label mb-6">Contrôle global</p>

          <div className="mb-7 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEnabled(false)}
              disabled={saving}
              aria-pressed={!form.enabled}
              className={`rounded-xl border px-4 py-4 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                !form.enabled
                  ? "border-ok/40 bg-ok/10"
                  : "border-[color:var(--hairline)] hover:border-[rgba(255,255,255,0.14)]"
              }`}
            >
              <Check size={14} strokeWidth={1.8} className={`mb-2.5 ${!form.enabled ? "text-ok" : "text-ink/30"}`} />
              <span className={`block text-sm font-medium ${!form.enabled ? "text-ok" : "text-ink/70"}`}>
                Ouvert
              </span>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.08em] text-dusk">
                Accès normal
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEnabled(true)}
              disabled={saving}
              aria-pressed={form.enabled}
              className={`rounded-xl border px-4 py-4 text-left transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                form.enabled
                  ? "border-warn/40 bg-warn/10"
                  : "border-[color:var(--hairline)] hover:border-[rgba(255,255,255,0.14)]"
              }`}
            >
              <TriangleAlert
                size={14}
                strokeWidth={1.8}
                className={`mb-2.5 ${form.enabled ? "text-warn" : "text-ink/30"}`}
              />
              <span className={`block text-sm font-medium ${form.enabled ? "text-warn" : "text-ink/70"}`}>
                Maintenance
              </span>
              <span className="mt-1 block font-mono text-[10px] tracking-[0.08em] text-dusk">
                Bloque le public
              </span>
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="maintenance-title">Titre public</Label>
                <span className="font-mono text-[10px] tracking-[0.06em] text-dusk">{form.title.length}/90</span>
              </div>
              <Input
                id="maintenance-title"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                maxLength={90}
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="maintenance-message">Message public</Label>
                <span className="font-mono text-[10px] tracking-[0.06em] text-dusk">{form.message.length}/360</span>
              </div>
              <Textarea
                id="maintenance-message"
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                maxLength={360}
                rows={5}
              />
            </div>

            <div className="flex min-h-[48px] items-center justify-between gap-4 rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-3">
              <span className="flex items-center gap-2.5 text-sm text-ink/80">
                <ShieldCheck size={14} strokeWidth={1.8} className="shrink-0 text-[color:var(--num-color)]" />
                Conserver l&apos;accès administrateur
              </span>
              <Switch
                checked={form.allow_admin_access}
                onChange={(next) => updateForm("allow_admin_access", next)}
                aria-label="Conserver l'accès administrateur"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="maintenance-starts">Début (optionnel)</Label>
                <Input
                  id="maintenance-starts"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label htmlFor="maintenance-ends">Fin (optionnelle)</Label>
                <Input
                  id="maintenance-ends"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <Button size="md" className="w-full" onClick={() => save()} disabled={saving}>
              {saving ? <Spinner className="h-3.5 w-3.5" /> : <Check size={14} strokeWidth={1.8} />}
              Enregistrer les modifications
            </Button>
          </div>
        </Card>

        {/* ── État actuel + aperçu de la page publique ──────────── */}
        <section className="space-y-5">
          <Card className="p-6">
            <p className="pv-label mb-5">État actuel</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-4">
                <p className="pv-label text-[10px]">Mode</p>
                <p className={`mt-2 text-sm font-medium ${maintenance.enabled ? "text-warn" : "text-ok"}`}>
                  {maintenance.enabled ? "Activé" : "Désactivé"}
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-4">
                <p className="pv-label text-[10px]">Fenêtre</p>
                <p className="mt-2 text-sm font-medium text-ink">
                  {active ? "En cours" : "Hors période"}
                </p>
              </div>
              <div className="rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-4">
                <p className="pv-label text-[10px]">Dernière modification</p>
                <p className="mt-2 truncate text-sm font-medium text-ink">
                  {maintenance.updated_by ?? "Jamais"}
                </p>
              </div>
            </div>
          </Card>

          {/* Aperçu fidèle de la page publique de maintenance — Prisme */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--hairline)] px-6 py-4">
              <p className="pv-label">Aperçu — page publique</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                Mis à jour en direct
              </span>
            </div>
            {/* L'aperçu reflète la VRAIE page publique : le rideau
                ivoire de l'atelier, plus jamais un aplat sombre (D45) */}
            <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 py-14 text-center">
              <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(40% 50% at 34% 24%, rgba(164,139,232,0.2) 0%, rgba(164,139,232,0) 70%), radial-gradient(36% 46% at 68% 70%, rgba(239,184,148,0.18) 0%, rgba(239,184,148,0) 72%)",
                }}
              />
              <div className="relative flex flex-col items-center">
                <BrandMark size={30} tone="white" />
                <p className="pv-label mt-7">Neva Design</p>
                <h3 className="pv-display mt-4 max-w-lg text-[clamp(1.6rem,3.2vw,2.3rem)] text-ink">
                  {form.title}
                </h3>
                <p className="mt-5 max-w-md text-sm leading-[1.8] text-slate">{form.message}</p>
                <div className="mt-10 flex items-center gap-4">
                  <span aria-hidden className="pv-rule--beam h-px w-12" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                    Le studio revient très vite
                  </span>
                  <span aria-hidden className="pv-rule--beam h-px w-12" />
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
