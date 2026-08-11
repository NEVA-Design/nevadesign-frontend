"use client";

import { useCallback, useState } from "react";
import { Check, Loader2, Plus, Shield, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminEntry = {
  id: string;
  email: string;
  is_active: boolean;
  source: "env" | "database";
  created_at: string | null;
  created_by: string | null;
};

type Toast = { id: number; message: string; type: "success" | "error" };

function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-xl backdrop-blur-sm ${
            item.type === "success"
              ? "border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]"
              : "border-[#FF6B7D]/30 bg-[#FF6B7D]/10 text-[#FF6B7D]"
          }`}
        >
          {item.type === "success" ? <Check size={13} /> : <X size={13} />}
          {item.message}
        </div>
      ))}
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Config .env";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

export function AdminsClient({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
  const [admins, setAdmins] = useState<AdminEntry[]>(initialAdmins);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3500);
  }, []);

  const refreshAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur chargement");
      setAdmins(data.admins ?? []);
    } catch (error) {
      addToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const activeAdmins = admins.filter((admin) => admin.is_active);

  async function addAdmin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur ajout admin");
      setEmail("");
      addToast("Admin ajoute", "success");
      await refreshAdmins();
    } catch (error) {
      addToast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeAdmin(admin: AdminEntry) {
    if (admin.source === "env") {
      addToast("Cet admin vient de ADMIN_EMAILS, il faut le retirer dans .env", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur suppression admin");
      addToast("Admin retire", "success");
      await refreshAdmins();
    } catch (error) {
      addToast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Admins</h1>
          <p className="mt-0.5 text-sm text-[#555]">
            Ajoute ou retire les emails autorises a acceder au panel admin.
          </p>
        </div>
        <div className="rounded-lg border border-[#FF7B4B]/25 bg-[#FF7B4B]/10 px-3 py-2 text-xs font-semibold text-[#FF7B4B]">
          {activeAdmins.length} admin{activeAdmins.length !== 1 ? "s" : ""}
        </div>
      </div>

      <form onSubmit={addAdmin} className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-medium text-[#777]">Email admin</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@tonsite.com"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-sm text-[#F5F0E8] outline-none transition-colors placeholder:text-[#444] focus:border-[#FF7B4B]/45"
          />
        </label>
        <Button type="submit" variant="gradient" disabled={saving || !email.trim()} className="sm:w-auto">
          {saving ? <Loader2 size={15} className="mr-2 animate-spin" /> : <Plus size={15} className="mr-2" />}
          Ajouter admin
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/[0.05] bg-white/[0.02] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#444]">
          <span>Email</span>
          <span className="w-28 text-right">Source</span>
          <span className="w-24 text-right">Action</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#444]">
            <Loader2 size={14} className="animate-spin" />
            Chargement...
          </div>
        ) : activeAdmins.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#444]">Aucun admin actif</div>
        ) : (
          activeAdmins.map((admin, index) => (
            <div
              key={admin.id}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02] ${
                index < activeAdmins.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Shield size={13} className={admin.source === "env" ? "text-[#FFD166]" : "text-[#4ADE80]"} />
                  <span className="truncate text-sm text-[#E8E3DB]">{admin.email}</span>
                </div>
                <div className="mt-0.5 text-[10px] text-[#444]">Ajoute le {formatDate(admin.created_at)}</div>
              </div>

              <div className="w-28 text-right">
                <span
                  className={`rounded-md border px-2 py-1 text-[10px] font-bold ${
                    admin.source === "env"
                      ? "border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]"
                      : "border-[#4ADE80]/30 bg-[#4ADE80]/10 text-[#4ADE80]"
                  }`}
                >
                  {admin.source === "env" ? "ENV" : "BASE"}
                </span>
              </div>

              <div className="flex w-24 justify-end">
                <button
                  type="button"
                  onClick={() => removeAdmin(admin)}
                  disabled={saving || admin.source === "env"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1.5 text-[11px] text-[#888] transition-all hover:border-[#FF6B7D]/35 hover:text-[#FF6B7D] disabled:cursor-not-allowed disabled:opacity-35"
                  title={admin.source === "env" ? "Admin configure dans ADMIN_EMAILS" : "Retirer cet admin"}
                >
                  <Trash2 size={12} />
                  Retirer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-[#777]">
        Les admins marqués <span className="font-semibold text-[#FFD166]">ENV</span> viennent de <code className="text-[#CCCCC0]">ADMIN_EMAILS</code> et servent de secours. Les admins marqués <span className="font-semibold text-[#4ADE80]">BASE</span> sont modifiables depuis cette page.
      </div>

      <Toasts items={toasts} />
    </div>
  );
}
