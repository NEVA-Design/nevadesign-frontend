"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormMessage, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  PORTFOLIO_CATEGORIES,
  type NevaDesignPortfolioCategory,
  type NevaDesignPortfolioItem,
} from "@/lib/neva-design-portfolio";

/*
 * Portfolio Neva Design — formulaire de projet à gauche (téléversement
 * validé côté client), registre des projets à droite : vignettes de
 * verre, méta mono, œil de visibilité.
 */

interface FormState {
  title: string;
  category: NevaDesignPortfolioCategory;
  tag: string;
  image_path: string;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  priority: string;
  layout: NevaDesignPortfolioItem["layout"];
}

const EMPTY_FORM: FormState = {
  title: "",
  category: "Logos",
  tag: "FiveM",
  image_path: "",
  description: "",
  is_featured: false,
  is_active: true,
  priority: "0",
  layout: "normal",
};

function fromItem(item: NevaDesignPortfolioItem): FormState {
  return {
    title: item.title,
    category: item.category,
    tag: item.tag,
    image_path: item.image_path ?? "",
    description: item.description ?? "",
    is_featured: item.is_featured,
    is_active: item.is_active,
    priority: String(item.priority),
    layout: item.layout,
  };
}

export function AdminNevaDesignClient({
  initialItems,
  tableMissing = false,
}: {
  initialItems: NevaDesignPortfolioItem[];
  tableMissing?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const { toasts, push } = useToasts();
  const editing = items.find((item) => item.id === editingId) ?? null;

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(item: NevaDesignPortfolioItem) {
    setEditingId(item.id);
    setForm(fromItem(item));
  }

  function sortItems(nextItems: NevaDesignPortfolioItem[]) {
    return [...nextItems].sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at));
  }

  async function uploadPortfolioImage(file: File | null | undefined) {
    if (!file) return;
    if (tableMissing) {
      push("Ajoutez la migration Supabase avant de téléverser", "error");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      push("Format invalide : JPG, PNG ou WebP", "error");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      push("Image trop lourde : 12 Mo maximum", "error");
      return;
    }

    const body = new FormData();
    body.append("image", file);

    setUploadingImage(true);
    try {
      const res = await fetch("/api/admin/neva-design/portfolio/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok || data.error || !data.image_path) {
        push(data.error ?? "Téléversement impossible", "error");
        return;
      }

      updateForm("image_path", data.image_path);
      push("Image téléversée", "success");
    } catch {
      push("Erreur réseau pendant le téléversement", "error");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function saveItem() {
    if (tableMissing) {
      push("Ajoutez la migration Supabase avant d'enregistrer", "error");
      return;
    }
    if (!form.title.trim() || !form.tag.trim()) {
      push("Titre et tag requis", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/neva-design/portfolio/${editingId}` : "/api/admin/neva-design/portfolio",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            priority: Number(form.priority || 0),
          }),
        }
      );
      const data = await res.json();

      if (!res.ok || data.error) {
        push(data.error ?? "Erreur serveur", "error");
        return;
      }

      const next = data.item as NevaDesignPortfolioItem;
      setItems((prev) => sortItems(editingId ? prev.map((item) => (item.id === next.id ? next : item)) : [next, ...prev]));
      push(editingId ? "Projet mis à jour" : "Projet ajouté", "success");
      resetForm();
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(item: NevaDesignPortfolioItem) {
    if (tableMissing) {
      push("Ajoutez la migration Supabase avant de supprimer", "error");
      return;
    }
    if (!confirm(`Supprimer « ${item.title} » ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/neva-design/portfolio/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors de la suppression", "error");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      push("Projet supprimé", "success");
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item: NevaDesignPortfolioItem) {
    setForm(fromItem({ ...item, is_active: !item.is_active }));
    setEditingId(item.id);
    await saveDirect({ ...item, is_active: !item.is_active });
  }

  async function saveDirect(item: NevaDesignPortfolioItem) {
    if (tableMissing) {
      push("Ajoutez la migration Supabase avant de modifier", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/neva-design/portfolio/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          category: item.category,
          tag: item.tag,
          image_path: item.image_path ?? "",
          description: item.description ?? "",
          is_featured: item.is_featured,
          is_active: item.is_active,
          priority: item.priority,
          layout: item.layout,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors de la mise à jour", "error");
        return;
      }
      const next = data.item as NevaDesignPortfolioItem;
      setItems((prev) => prev.map((entry) => (entry.id === next.id ? next : entry)));
      push(next.is_active ? "Projet visible" : "Projet masqué", "success");
      resetForm();
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
        eyebrow="Portfolio"
        title={
          <>
            <span className="pv-beam-text">Vitrine</span> Neva Design.
          </>
        }
        description="Les visuels et projets publics affichés sur la page Neva Design."
      >
        <a href="/neva-design#portfolio" className="pv-link inline-flex items-center gap-2 text-[13px]">
          Voir le portfolio
          <ArrowUpRight size={13} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
        </a>
      </PageHeader>

      {tableMissing ? (
        <FormMessage tone="warning" className="relative mb-6">
          Table Supabase absente. Lancez le SQL ajouté dans{" "}
          <code className="font-mono text-xs">src/lib/supabase/schema.sql</code> ou la migration
          dédiée.
        </FormMessage>
      ) : null}

      <div className="relative grid gap-5 lg:grid-cols-[410px_1fr]">
        {/* ── Formulaire de projet ──────────────────────────────── */}
        <Card className="h-fit p-6">
          <div className="mb-6 flex items-center gap-2.5 border-b border-[color:var(--hairline)] pb-5">
            {editing ? (
              <Edit3 size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            ) : (
              <Plus size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            )}
            <h2 className="pv-label">{editing ? "Modifier le projet" : "Nouveau projet"}</h2>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="portfolio-title">Titre</Label>
                <Input
                  id="portfolio-title"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Vespucci Nights"
                />
              </div>
              <div>
                <Label htmlFor="portfolio-tag">Tag</Label>
                <Input
                  id="portfolio-tag"
                  value={form.tag}
                  onChange={(event) => updateForm("tag", event.target.value)}
                  placeholder="FiveM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="portfolio-category">Catégorie</Label>
                <Select
                  id="portfolio-category"
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value as NevaDesignPortfolioCategory)}
                >
                  {PORTFOLIO_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="portfolio-layout">Disposition</Label>
                <Select
                  id="portfolio-layout"
                  value={form.layout}
                  onChange={(event) => updateForm("layout", event.target.value as NevaDesignPortfolioItem["layout"])}
                >
                  <option value="normal">Normale</option>
                  <option value="tall">Haute (tall)</option>
                  <option value="wide">Large (wide)</option>
                </Select>
              </div>
            </div>

            <div>
              <Label>Image du projet</Label>
              <div className="overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss">
                <div className="relative flex min-h-36 items-center justify-center">
                  {form.image_path ? (
                    <Image
                      src={form.image_path}
                      alt="Aperçu du projet"
                      fill
                      sizes="410px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 py-8 text-center text-xs text-dusk">
                      <ImageIcon size={20} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
                      Téléversez une image pour ce projet
                    </div>
                  )}
                  {uploadingImage ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 bg-ink/70 text-xs text-ink backdrop-blur-sm">
                      <Spinner className="h-4 w-4" />
                      Téléversement…
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-[color:var(--hairline)] p-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => uploadPortfolioImage(event.target.files?.[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage || loading}
                  >
                    {uploadingImage ? <Spinner className="h-3.5 w-3.5" /> : <UploadCloud size={13} strokeWidth={1.8} />}
                    {form.image_path ? "Remplacer l'image" : "Téléverser une image"}
                  </Button>
                  {form.image_path ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => updateForm("image_path", "")}
                      disabled={uploadingImage || loading}
                    >
                      Retirer
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="portfolio-description">Description</Label>
              <Textarea
                id="portfolio-description"
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Contexte du projet"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="portfolio-priority">Priorité</Label>
              <Input
                id="portfolio-priority"
                type="number"
                min={0}
                value={form.priority}
                onChange={(event) => updateForm("priority", event.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-3">
                <span className="text-[13px] text-ink/80">Actif</span>
                <Switch
                  checked={form.is_active}
                  onChange={(next) => updateForm("is_active", next)}
                  aria-label="Rendre le projet visible"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--hairline)] bg-abyss px-4 py-3">
                <span className="text-[13px] text-ink/80">Hero</span>
                <Switch
                  checked={form.is_featured}
                  onChange={(next) => updateForm("is_featured", next)}
                  aria-label="Mettre le projet en vedette"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1" onClick={saveItem} disabled={loading || uploadingImage}>
                {loading || uploadingImage ? <Spinner className="h-3.5 w-3.5" /> : <Check size={13} strokeWidth={1.8} />}
                {editing ? "Enregistrer" : "Ajouter"}
              </Button>
              {editing ? (
                <Button variant="outline" onClick={resetForm} disabled={loading}>
                  Annuler
                </Button>
              ) : null}
            </div>
          </div>
        </Card>

        {/* ── Registre des projets ──────────────────────────────── */}
        <Card className="h-fit overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <ImageIcon size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
              <h2 className="pv-label">Projets configurés</h2>
            </div>
            <span className="font-mono text-[11px] text-dusk">{items.length} au total</span>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-lg font-semibold tracking-[-0.01em] text-ink/90">
                Aucun projet pour le moment.
              </p>
              <p className="mt-3 font-mono text-xs tracking-[0.04em] text-dusk">
                Ajoutez votre première création dans le formulaire.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[color:var(--hairline)]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="px-5 py-5 transition-colors duration-300 hover:bg-ink/[0.03] sm:px-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline)] bg-abyss">
                      {item.image_path ? (
                        <Image src={item.image_path} alt="" fill sizes="96px" className="object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-ink/25">
                          <ImageIcon size={16} strokeWidth={1.8} />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        <Badge variant="neva">{item.category}</Badge>
                        <span className="text-sm font-medium text-ink">{item.title}</span>
                        {item.is_featured ? <Badge variant="popular">Hero</Badge> : null}
                        <span
                          className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                            item.is_active ? "text-ok" : "text-dusk"
                          }`}
                        >
                          {item.is_active ? "Visible" : "Masqué"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-steel">
                        {item.description || item.tag}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 sm:pl-[112px]">
                    <div className="flex min-w-0 flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.06em] text-dusk">
                      <span>Priorité {item.priority}</span>
                      <span>Disposition {item.layout}</span>
                      {item.image_path ? (
                        <span className="break-all">{item.image_path}</span>
                      ) : (
                        <span>Sans image</span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => toggleActive(item)}
                        disabled={loading}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-steel transition-colors duration-300 hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-45"
                        aria-label={item.is_active ? "Masquer" : "Afficher"}
                      >
                        {item.is_active ? <EyeOff size={14} strokeWidth={1.8} /> : <Eye size={14} strokeWidth={1.8} />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-steel transition-colors duration-300 hover:bg-ink/5 hover:text-ink"
                        aria-label="Modifier"
                      >
                        <Edit3 size={14} strokeWidth={1.8} />
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        disabled={loading}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-steel transition-colors duration-300 hover:bg-err/10 hover:text-err disabled:pointer-events-none disabled:opacity-45"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ToastViewport toasts={toasts} />
    </div>
  );
}
