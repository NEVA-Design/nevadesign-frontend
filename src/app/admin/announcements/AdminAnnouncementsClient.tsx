"use client";

import { useState } from "react";
import { Edit3, ExternalLink, Megaphone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { PageHeader, HeaderMeta } from "@/components/admin/PageHeader";
import {
  ACCENT_STYLES,
  KIND_LABELS,
  type AnnouncementAccent,
  type AnnouncementKind,
  type SiteAnnouncement,
} from "@/lib/announcements";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Affichages — composer de verre à gauche, registre des messages à
 * droite. Les pastilles de couleur viennent d'ACCENT_STYLES, déjà
 * remappées sur les états désaturés de Prisme.
 */

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

/* Statut calculé — états système désaturés de Prisme. */
function statusLabel(item: SiteAnnouncement) {
  const now = Date.now();
  const starts = item.starts_at ? new Date(item.starts_at).getTime() : null;
  const ends = item.ends_at ? new Date(item.ends_at).getTime() : null;

  if (!item.is_active) return { label: "Inactif", color: "rgba(255,255,255,0.4)" };
  if (starts && starts > now) return { label: "Programmé", color: "#E5C36E" };
  if (ends && ends < now) return { label: "Expiré", color: "#F08A85" };
  return { label: "Visible", color: "#8FC7B2" };
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
  const { toasts, push } = useToasts();
  const confirm = useConfirm();

  const editing = items.find((item) => item.id === editingId) ?? null;

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
      push("Titre et message requis", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await backendFetch(editingId ? `/admin/announcements/${editingId}` : "/admin/announcements", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority || 0),
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        push(data.error ?? "Erreur serveur", "error");
        return;
      }

      const next = data.announcement as SiteAnnouncement;
      setItems((prev) => {
        const merged = editingId
          ? prev.map((item) => (item.id === next.id ? next : item))
          : [next, ...prev];
        return merged.sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at));
      });
      push(editingId ? "Affichage mis à jour" : "Affichage créé", "success");
      resetForm();
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAnnouncement(item: SiteAnnouncement) {
    const ok = await confirm({
      title: "Supprimer l'affichage",
      description: `Supprimer « ${item.title} » ?`,
      confirmLabel: "Supprimer",
      tone: "danger",
    });
    if (!ok) return;
    setLoading(true);
    try {
      const res = await backendFetch(`/admin/announcements/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors de la suppression", "error");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      push("Affichage supprimé", "success");
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: SiteAnnouncement) {
    setLoading(true);
    try {
      const res = await backendFetch(`/admin/announcements/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...fromAnnouncement(item),
          is_active: !item.is_active,
          priority: item.priority,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors de la mise à jour", "error");
        return;
      }
      const next = data.announcement as SiteAnnouncement;
      setItems((prev) => prev.map((entry) => (entry.id === next.id ? next : entry)));
      push(next.is_active ? "Affichage activé" : "Affichage masqué", "success");
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <div aria-hidden className="pv-halo -top-24 right-[-4%] h-[340px] w-[460px] opacity-50" />

      <PageHeader
        eyebrow="Communication"
        title={
          <>
            Affichages du <span className="pv-beam-underline font-medium text-ink">produit.</span>
          </>
        }
        description="Image de marque, codes promo, nouveautés et messages de mise à jour visibles dans le tableau de bord."
      >
        <HeaderMeta value={items.length} label={`affichage${items.length > 1 ? "s" : ""}`} />
      </PageHeader>

      <div className="relative grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* ── Composer ──────────────────────────────────────────── */}
        <Card className="h-fit p-6">
          <div className="mb-6 flex items-center gap-2.5 border-b border-[color:var(--hairline)] pb-5">
            {editing ? (
              <Edit3 size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            ) : (
              <Plus size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            )}
            <h2 className="pv-label">{editing ? "Modifier l'affichage" : "Nouvel affichage"}</h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(KIND_LABELS) as AnnouncementKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => updateForm("kind", kind)}
                    className={`flex min-h-10 items-center justify-center rounded-lg border px-2 py-2 text-xs transition-colors duration-300 ${
                      form.kind === kind
                        ? "border-[rgba(164,139,232,0.35)] bg-[rgba(164,139,232,0.08)] text-[color:var(--num-color)]"
                        : "border-[color:var(--hairline)] text-steel hover:border-[#C9C9C0] hover:text-ink"
                    }`}
                  >
                    {KIND_LABELS[kind]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="announcement-title">Titre</Label>
                <Input
                  id="announcement-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Ex. : Summer Drop"
                />
              </div>
              <div>
                <Label htmlFor="announcement-badge">Badge</Label>
                <Input
                  id="announcement-badge"
                  value={form.badge}
                  onChange={(event) => updateForm("badge", event.target.value)}
                  placeholder="Ex. : -30 %"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea
                id="announcement-message"
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                placeholder="Texte visible dans le tableau de bord"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="announcement-cta">CTA</Label>
                <Input
                  id="announcement-cta"
                  value={form.cta_label}
                  onChange={(event) => updateForm("cta_label", event.target.value)}
                  placeholder="Ex. : Voir"
                />
              </div>
              <div>
                <Label htmlFor="announcement-href">Lien</Label>
                <Input
                  id="announcement-href"
                  value={form.href}
                  onChange={(event) => updateForm("href", event.target.value)}
                  placeholder="/dashboard/billing"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="announcement-priority">Priorité</Label>
                <Input
                  id="announcement-priority"
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(event) => updateForm("priority", event.target.value)}
                />
              </div>
              <div>
                <Label>Couleur</Label>
                <div className="flex h-[43px] items-center gap-2.5">
                  {(Object.keys(ACCENT_STYLES) as AnnouncementAccent[]).map((accent) => (
                    <button
                      key={accent}
                      type="button"
                      onClick={() => updateForm("accent", accent)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform duration-300 ${
                        form.accent === accent ? "scale-110 border-ink/60" : "border-transparent"
                      }`}
                      style={{ background: ACCENT_STYLES[accent].color }}
                      aria-label={`Couleur ${accent}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="announcement-starts">Début</Label>
                <Input
                  id="announcement-starts"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="announcement-ends">Fin</Label>
                <Input
                  id="announcement-ends"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-3.5">
              <span className="text-[13px] text-ink/80">Visible dans le tableau de bord</span>
              <Switch
                checked={form.is_active}
                onChange={(next) => updateForm("is_active", next)}
                aria-label="Activer l'affichage"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={saveAnnouncement} disabled={loading}>
                {loading ? <Spinner className="h-3.5 w-3.5" /> : <Megaphone size={13} strokeWidth={1.8} />}
                {editing ? "Enregistrer" : "Publier"}
              </Button>
              {editing && (
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* ── Registre des affichages ───────────────────────────── */}
        <Card className="h-fit overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Megaphone size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
              <h2 className="pv-label">Affichages configurés</h2>
            </div>
            <span className="font-mono text-[11px] text-dusk">{items.length} au total</span>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold tracking-[-0.01em] text-ink/90">
                Aucun affichage pour le moment.
              </p>
              <p className="mt-3 font-mono text-xs tracking-[0.04em] text-dusk">
                Composez votre premier message dans le formulaire.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--hairline)]">
              {items.map((item) => {
                const style = ACCENT_STYLES[item.accent];
                const status = statusLabel(item);
                return (
                  <div
                    key={item.id}
                    className="px-6 py-5 transition-colors duration-300 hover:bg-ink/[0.03]"
                  >
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span
                        className="rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em]"
                        style={{ borderColor: style.border, color: style.color, background: style.bg }}
                      >
                        {item.badge || KIND_LABELS[item.kind]}
                      </span>
                      <span className="text-sm font-medium text-ink">{item.title}</span>
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.12em]"
                        style={{ color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-steel">{item.message}</p>

                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.06em] text-dusk">
                        <span>Priorité {item.priority}</span>
                        {item.cta_label && <span>CTA {item.cta_label}</span>}
                        {item.href && (
                          <span className="flex items-center gap-1">
                            <ExternalLink size={10} strokeWidth={1.8} />
                            {item.href}
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => toggleActive(item)}
                          disabled={loading}
                          className="flex h-10 items-center rounded-full border border-[color:var(--hairline)] px-4 font-mono text-[10px] uppercase tracking-[0.12em] text-steel transition-colors duration-300 hover:border-[rgba(164,139,232,0.45)] hover:text-ink disabled:pointer-events-none disabled:opacity-45"
                        >
                          {item.is_active ? "Masquer" : "Activer"}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-steel transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
                          aria-label="Modifier"
                        >
                          <Edit3 size={14} strokeWidth={1.8} />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(item)}
                          disabled={loading}
                          className="flex h-10 w-10 items-center justify-center rounded-full text-steel transition-colors duration-300 hover:bg-err/10 hover:text-err disabled:pointer-events-none disabled:opacity-45"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <ToastViewport toasts={toasts} />
    </div>
  );
}
