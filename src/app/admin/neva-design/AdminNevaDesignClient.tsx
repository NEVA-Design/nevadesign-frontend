"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PORTFOLIO_CATEGORIES,
  type NevaDesignPortfolioCategory,
  type NevaDesignPortfolioItem,
} from "@/lib/neva-design-portfolio";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
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
      addToast("Ajoute la migration Supabase avant d'uploader", "error");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("Format invalide: JPG, PNG ou WebP", "error");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      addToast("Image trop lourde: max 12 Mo", "error");
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
        addToast(data.error ?? "Upload impossible", "error");
        return;
      }

      updateForm("image_path", data.image_path);
      addToast("Image uploadee", "success");
    } catch {
      addToast("Erreur reseau pendant l'upload", "error");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function saveItem() {
    if (tableMissing) {
      addToast("Ajoute la migration Supabase avant de sauvegarder", "error");
      return;
    }
    if (!form.title.trim() || !form.tag.trim()) {
      addToast("Titre et tag requis", "error");
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
        addToast(data.error ?? "Erreur serveur", "error");
        return;
      }

      const next = data.item as NevaDesignPortfolioItem;
      setItems((prev) => sortItems(editingId ? prev.map((item) => (item.id === next.id ? next : item)) : [next, ...prev]));
      addToast(editingId ? "Projet mis a jour" : "Projet ajoute", "success");
      resetForm();
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(item: NevaDesignPortfolioItem) {
    if (tableMissing) {
      addToast("Ajoute la migration Supabase avant de supprimer", "error");
      return;
    }
    if (!confirm(`Supprimer "${item.title}" ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/neva-design/portfolio/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur suppression", "error");
        return;
      }
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (editingId === item.id) resetForm();
      addToast("Projet supprime", "success");
    } catch {
      addToast("Erreur reseau", "error");
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
      addToast("Ajoute la migration Supabase avant de modifier", "error");
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
        addToast(data.error ?? "Erreur mise a jour", "error");
        return;
      }
      const next = data.item as NevaDesignPortfolioItem;
      setItems((prev) => prev.map((entry) => (entry.id === next.id ? next : entry)));
      addToast(next.is_active ? "Projet visible" : "Projet masque", "success");
      resetForm();
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Neva Design</h1>
          <p className="mt-0.5 text-sm text-[#555]">
            Portfolio public, visuels et projets affiches sur /neva-design.
          </p>
        </div>
        <a
          href="/neva-design#portfolio"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.08] px-3 text-xs text-[#999] transition hover:border-[#FF7B4B]/35 hover:text-white"
        >
          Voir le portfolio
        </a>
      </div>

      {tableMissing ? (
        <div className="mb-6 rounded-xl border border-[#FFD166]/25 bg-[#FFD166]/10 px-4 py-3 text-sm text-[#FFD166]">
          Table Supabase absente. Lance le SQL ajoute dans `src/lib/supabase/schema.sql` ou la migration dediee.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[410px_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center gap-2">
            {editing ? <Edit3 size={14} className="text-[#FF7B4B]" /> : <Plus size={14} className="text-[#FF7B4B]" />}
            <h2 className="text-sm font-semibold text-[#F5F0E8]">
              {editing ? "Modifier le projet" : "Nouveau projet portfolio"}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Titre</label>
                <input
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Vespucci Nights"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Tag</label>
                <input
                  value={form.tag}
                  onChange={(event) => updateForm("tag", event.target.value)}
                  placeholder="FiveM"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none placeholder:text-[#333] focus:border-white/[0.16]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Categorie</label>
                <select
                  value={form.category}
                  onChange={(event) => updateForm("category", event.target.value as NevaDesignPortfolioCategory)}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-xs text-[#F5F0E8] outline-none focus:border-white/[0.16]"
                >
                  {PORTFOLIO_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Layout</label>
                <select
                  value={form.layout}
                  onChange={(event) => updateForm("layout", event.target.value as NevaDesignPortfolioItem["layout"])}
                  className="w-full rounded-lg border border-white/[0.08] bg-[#111] px-3 py-2 text-xs text-[#F5F0E8] outline-none focus:border-white/[0.16]"
                >
                  <option value="normal">Normal</option>
                  <option value="tall">Tall</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Image du projet</label>
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <div className="relative flex min-h-36 items-center justify-center bg-black/30">
                  {form.image_path ? (
                    <Image
                      src={form.image_path}
                      alt="Apercu projet"
                      fill
                      sizes="410px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-8 text-center text-xs text-[#555]">
                      <ImageIcon size={22} className="text-[#FF7B4B]" />
                      Upload une image pour ce projet
                    </div>
                  )}
                  {uploadingImage ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                      <Loader2 size={15} className="mr-2 animate-spin" />
                      Upload...
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] p-2">
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
                    size="sm"
                    className="flex-1"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage || loading}
                  >
                    {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                    {form.image_path ? "Remplacer image" : "Uploader une image"}
                  </Button>
                  {form.image_path ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
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
              <label className="mb-1.5 block text-[11px] text-[#666]">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                placeholder="Contexte du projet"
                rows={3}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Priorite</label>
                <input
                  type="number"
                  min={0}
                  value={form.priority}
                  onChange={(event) => updateForm("priority", event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none focus:border-white/[0.16]"
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-[11px] text-[#777]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) => updateForm("is_active", event.target.checked)}
                  className="accent-[#FF7B4B]"
                />
                Actif
              </label>
              <label className="flex items-end gap-2 pb-2 text-[11px] text-[#777]">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(event) => updateForm("is_featured", event.target.checked)}
                  className="accent-[#FF7B4B]"
                />
                Hero
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="gradient" size="sm" className="flex-1" onClick={saveItem} disabled={loading || uploadingImage}>
                {loading || uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {editing ? "Enregistrer" : "Ajouter"}
              </Button>
              {editing ? (
                <Button variant="outline" size="sm" onClick={resetForm} disabled={loading}>
                  Annuler
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E8]">
              <ImageIcon size={14} className="text-[#FF7B4B]" />
              Projets configures
            </div>
            <span className="text-xs text-[#444]">{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-[#444]">Aucun projet pour le moment.</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-4 transition-colors hover:bg-white/[0.02]">
                  <div className="flex items-start gap-3">
                    <div className="relative flex h-14 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#FF7B4B]">
                      {item.image_path ? (
                        <Image src={item.image_path} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <ImageIcon size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-[#FF7B4B]/25 bg-[#FF7B4B]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FF7B4B]">
                          {item.category}
                        </span>
                        <span className="text-sm font-semibold text-[#F5F0E8]">{item.title}</span>
                        {item.is_featured ? <span className="text-[10px] text-[#FFD166]">Hero</span> : null}
                        <span className={`text-[10px] ${item.is_active ? "text-[#4ADE80]" : "text-[#777]"}`}>
                          {item.is_active ? "Visible" : "Masque"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#9A9A9A]">{item.description || item.tag}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#444]">
                        <span>Priorite {item.priority}</span>
                        <span>Layout {item.layout}</span>
                        {item.image_path ? <span className="font-mono">{item.image_path}</span> : <span>Placeholder</span>}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => toggleActive(item)}
                        disabled={loading}
                        className="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-white/[0.05] hover:text-[#F5F0E8]"
                        aria-label={item.is_active ? "Masquer" : "Afficher"}
                      >
                        {item.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-white/[0.05] hover:text-[#F5F0E8]"
                        aria-label="Modifier"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        disabled={loading}
                        className="rounded-lg p-1.5 text-[#555] transition-colors hover:bg-red-500/10 hover:text-[#FF6B7D]"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Toasts items={toasts} />
    </div>
  );
}
