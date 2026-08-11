"use client";

import { useRef, useState } from "react";
import {
  Bell,
  Check,
  Edit3,
  ExternalLink,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ACCENT_STYLES,
  KIND_LABELS,
  type AnnouncementAccent,
  type AnnouncementKind,
  type SiteAnnouncement,
} from "@/lib/announcements";

interface Toast { id: number; message: string; type: "success" | "error" }

interface FormState {
  title: string;
  message: string;
  kind: AnnouncementKind;
  badge: string;
  cta_label: string;
  href: string;
  accent: AnnouncementAccent;
  is_active: boolean;
  priority: string;
  starts_at: string;
  ends_at: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  message: "",
  kind: "info",
  badge: "",
  cta_label: "",
  href: "",
  accent: "orange",
  is_active: true,
  priority: "0",
  starts_at: "",
  ends_at: "",
};

function toLocalInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromAnnouncement(item: SiteAnnouncement): FormState {
  return {
    title: item.title,
    message: item.message,
    kind: item.kind,
    badge: item.badge ?? "",
    cta_label: item.cta_label ?? "",
    href: item.href ?? "",
    accent: item.accent,
    is_active: item.is_active,
    priority: String(item.priority),
    starts_at: toLocalInput(item.starts_at),
    ends_at: toLocalInput(item.ends_at),
  };
}

function statusLabel(item: SiteAnnouncement) {
  const now = Date.now();
  const starts = item.starts_at ? new Date(item.starts_at).getTime() : null;
  const ends = item.ends_at ? new Date(item.ends_at).getTime() : null;

  if (!item.is_active) return { label: "Inactif", color: "#777" };
  if (starts && starts > now) return { label: "Programme", color: "#FFD166" };
  if (ends && ends < now) return { label: "Expire", color: "#FF6B7D" };
  return { label: "Visible", color: "#4ADE80" };
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

export function AdminAnnouncementsClient({
  initialAnnouncements,
}: {
  initialAnnouncements: SiteAnnouncement[];
}) {
  const [items, setItems] = useState(initialAnnouncements);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const editing = items.find((item) => item.id === editingId) ?? null;

  function addToast(message: string, type: Toast["type"]) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(item: SiteAnnouncement) {
    setEditingId(item.id);
    setForm(fromAnnouncement(item));
  }

  async function saveAnnouncement() {
    if (!form.title.trim() || !form.message.trim()) {
      addToast("Titre et message requis", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(editingId ? `/api/admin/announcements/${editingId}` : "/api/admin/announcements", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority || 0),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur serveur", "error");
        return;
      }

      const next = data.announcement as SiteAnnouncement;
      setItems((prev) => {
        const merged = editingId
          ? prev.map((item) => (item.id === next.id ? next : item))
          : [next, ...prev];
        return merged.sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at));
      });
      addToast(editingId ? "Affichage mis a jour" : "Affichage cree", "success");
      resetForm();
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnouncement(item: SiteAnnouncement) {
    if (!confirm(`Supprimer "${item.title}" ?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur suppression", "error");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      addToast("Affichage supprime", "success");
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: SiteAnnouncement) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fromAnnouncement(item),
          is_active: !item.is_active,
          priority: item.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur mise a jour", "error");
        return;
      }
      const next = data.announcement as SiteAnnouncement;
      setItems((prev) => prev.map((entry) => (entry.id === next.id ? next : entry)));
      addToast(next.is_active ? "Affichage active" : "Affichage masque", "success");
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Affichages</h1>
          <p className="mt-0.5 text-sm text-[#555]">
            Branding, codes promo, nouveautes et messages de mise a jour.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center gap-2">
            {editing ? <Edit3 size={14} className="text-[#FF7B4B]" /> : <Plus size={14} className="text-[#FF7B4B]" />}
            <h2 className="text-sm font-semibold text-[#F5F0E8]">
              {editing ? "Modifier l affichage" : "Nouvel affichage"}
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(KIND_LABELS) as AnnouncementKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => updateForm("kind", kind)}
                    className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition-all ${
                      form.kind === kind
                        ? "border-[#FF7B4B]/50 bg-[#FF7B4B]/10 text-[#FF7B4B]"
                        : "border-white/[0.07] text-[#666] hover:border-white/[0.15] hover:text-[#CCCCC0]"
                    }`}
                  >
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Titre</label>
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Ex: Summer Drop"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Badge</label>
                <input
                  value={form.badge}
                  onChange={(event) => updateForm("badge", event.target.value)}
                  placeholder="Ex: -30%"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Message</label>
              <textarea
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                placeholder="Texte visible dans le dashboard"
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">CTA</label>
                <input
                  value={form.cta_label}
                  onChange={(event) => updateForm("cta_label", event.target.value)}
                  placeholder="Ex: Voir"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Lien</label>
                <input
                  value={form.href}
                  onChange={(event) => updateForm("href", event.target.value)}
                  placeholder="/dashboard/billing"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Priorite</label>
                <input
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(event) => updateForm("priority", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Couleur</label>
                <div className="flex h-8 items-center gap-2">
                  {(Object.keys(ACCENT_STYLES) as AnnouncementAccent[]).map((accent) => (
                    <button
                      key={accent}
                      type="button"
                      onClick={() => updateForm("accent", accent)}
                      className={`h-6 w-6 rounded-full border transition-transform ${form.accent === accent ? "scale-110 border-white" : "border-white/10"}`}
                      style={{ background: ACCENT_STYLES[accent].color }}
                      aria-label={`Couleur ${accent}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Debut</label>
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Fin</label>
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2">
              <button
                type="button"
                onClick={() => updateForm("is_active", !form.is_active)}
                className={`relative h-4 w-8 rounded-full transition-colors ${form.is_active ? "bg-[#FF7B4B]" : "bg-white/[0.08]"}`}
                aria-label="Activer affichage"
              >
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${form.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-[11px] text-[#666]">Afficher dans le dashboard</span>
            </label>

            <div className="flex gap-2 pt-1">
              <Button
                variant="gradient"
                size="sm"
                className="flex-1"
                onClick={saveAnnouncement}
                disabled={loading}
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Megaphone size={12} />}
                {editing ? "Enregistrer" : "Publier"}
              </Button>
              {editing && (
                <Button variant="outline" size="sm" onClick={resetForm} disabled={loading}>
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E8]">
              <Bell size={14} className="text-[#FF7B4B]" />
              Affichages configures
            </div>
            <span className="text-xs text-[#444]">{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-[#444]">
              Aucun affichage pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {items.map((item) => {
                const style = ACCENT_STYLES[item.accent];
                const status = statusLabel(item);
                return (
                  <div key={item.id} className="px-5 py-4 transition-colors hover:bg-white/[0.02]">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border"
                        style={{ background: style.bg, borderColor: style.border, color: style.color }}
                      >
                        <Megaphone size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase"
                            style={{ borderColor: style.border, color: style.color, background: style.bg }}
                          >
                            {item.badge || KIND_LABELS[item.kind]}
                          </span>
                          <span className="text-sm font-semibold text-[#F5F0E8]">{item.title}</span>
                          <span className="text-[10px]" style={{ color: status.color }}>{status.label}</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#9A9A9A]">{item.message}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#444]">
                          <span>Priorite {item.priority}</span>
                          {item.cta_label && <span>CTA {item.cta_label}</span>}
                          {item.href && (
                            <span className="flex items-center gap-1">
                              <ExternalLink size={10} />
                              {item.href}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => toggleActive(item)}
                          disabled={loading}
                          className="rounded-lg border border-white/[0.07] px-2 py-1.5 text-[11px] text-[#777] transition-all hover:border-white/[0.15] hover:text-[#F5F0E8]"
                        >
                          {item.is_active ? "Masquer" : "Activer"}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-white/[0.05] hover:text-[#F5F0E8]"
                          aria-label="Modifier"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(item)}
                          disabled={loading}
                          className="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-red-500/10 hover:text-[#FF6B7D]"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Toasts items={toasts} />
    </div>
  );
}
