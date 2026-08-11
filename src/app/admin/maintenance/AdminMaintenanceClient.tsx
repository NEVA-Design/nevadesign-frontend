"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Clock, Loader2, Power, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isMaintenanceActive, type MaintenanceMode } from "@/lib/maintenance";

interface Toast { id: number; message: string; type: "success" | "error" }

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

function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur-sm ${
            toast.type === "success"
              ? "border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]"
              : "border-[#FF6B7D]/30 bg-[#FF6B7D]/10 text-[#FF6B7D]"
          }`}
        >
          {toast.type === "success" ? <Check size={13} /> : <X size={13} />}
          {toast.message}
        </div>
      ))}
    </div>
  );
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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const active = useMemo(() => isMaintenanceActive(maintenance), [maintenance]);

  function addToast(message: string, type: Toast["type"]) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(nextForm = form) {
    if (!nextForm.title.trim() || !nextForm.message.trim()) {
      addToast("Titre et message requis", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextForm),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur serveur", "error");
        return;
      }

      setMaintenance(data.maintenance as MaintenanceMode);
      setForm(fromMaintenance(data.maintenance as MaintenanceMode));
      addToast((data.maintenance as MaintenanceMode).enabled ? "Maintenance mise a jour" : "Maintenance desactivee", "success");
    } catch {
      addToast("Erreur reseau", "error");
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
    <div>
      <Toasts items={toasts} />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Maintenance</h1>
          <p className="mt-0.5 text-sm text-[#555]">
            Coupe l acces public au site, personnalise le message et programme une fenetre.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
            active
              ? "border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]"
              : "border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]"
          }`}
        >
          <Power size={13} />
          {active ? "Maintenance active" : "Site ouvert"}
        </div>
      </div>

      {tableMissing && (
        <div className="mb-6 rounded-2xl border border-[#FFD166]/25 bg-[#FFD166]/10 p-4 text-sm text-[#FFD166]">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              La table <code className="font-mono text-[#F5F0E8]">site_maintenance</code> n existe pas encore.
              Applique la migration <code className="font-mono text-[#F5F0E8]">011_site_maintenance.sql</code> dans Supabase avant d activer le mode.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Power size={14} className="text-[#FF7B4B]" />
            <h2 className="text-sm font-semibold text-[#F5F0E8]">Controle global</h2>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEnabled(false)}
              disabled={saving}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                !form.enabled
                  ? "border-[#4ADE80]/40 bg-[#4ADE80]/10 text-[#4ADE80]"
                  : "border-white/[0.07] text-[#777] hover:border-white/[0.15]"
              }`}
            >
              <Check size={14} className="mb-2" />
              <span className="block text-sm font-semibold">Ouvert</span>
              <span className="block text-[11px] text-[#666]">Acces normal</span>
            </button>
            <button
              type="button"
              onClick={() => setEnabled(true)}
              disabled={saving}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                form.enabled
                  ? "border-[#FFD166]/40 bg-[#FFD166]/10 text-[#FFD166]"
                  : "border-white/[0.07] text-[#777] hover:border-white/[0.15]"
              }`}
            >
              <AlertTriangle size={14} className="mb-2" />
              <span className="block text-sm font-semibold">Maintenance</span>
              <span className="block text-[11px] text-[#666]">Bloque le public</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Titre public</label>
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                maxLength={90}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Message public</label>
              <textarea
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                maxLength={360}
                rows={5}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
              <span className="flex items-center gap-2 text-sm text-[#CCCCC0]">
                <ShieldCheck size={14} className="text-[#FF7B4B]" />
                Garder l acces admin
              </span>
              <input
                type="checkbox"
                checked={form.allow_admin_access}
                onChange={(event) => updateForm("allow_admin_access", event.target.checked)}
                className="h-4 w-4 accent-[#FF7B4B]"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Debut optionnel</label>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Fin optionnelle</label>
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
            </div>

            <Button variant="gradient" size="md" className="w-full" onClick={() => save()} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Sauvegarder
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Clock size={14} className="text-[#FF7B4B]" />
              <h2 className="text-sm font-semibold text-[#F5F0E8]">Etat actuel</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <span className="text-[11px] uppercase tracking-wider text-[#555]">Mode</span>
                <p className="mt-1 text-sm font-semibold text-[#F5F0E8]">{maintenance.enabled ? "Active" : "Desactive"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <span className="text-[11px] uppercase tracking-wider text-[#555]">Fenetre</span>
                <p className="mt-1 text-sm font-semibold text-[#F5F0E8]">{active ? "En cours" : "Hors periode"}</p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                <span className="text-[11px] uppercase tracking-wider text-[#555]">Derniere edition</span>
                <p className="mt-1 truncate text-sm font-semibold text-[#F5F0E8]">{maintenance.updated_by ?? "Jamais"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#101010] p-6">
            <span className="mb-4 inline-flex rounded-full border border-[#FFD166]/25 bg-[#FFD166]/10 px-3 py-1 text-xs font-semibold text-[#FFD166]">
              Preview page publique
            </span>
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#080808] px-6 text-center">
              <AlertTriangle size={28} className="mb-5 text-[#FF7B4B]" />
              <h3 className="text-2xl font-bold tracking-tight text-[#F5F0E8]">{form.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#9A9A9A]">{form.message}</p>
              <div className="mt-6 rounded-full border border-white/[0.08] px-3 py-1.5 text-[11px] text-[#555]">
                Neva AI
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
