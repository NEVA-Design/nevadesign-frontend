"use client";

import { useCallback, useState } from "react";
import { Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/field";
import { LoadingBlock } from "@/components/ui/spinner";
import { Table, TableHeader, TableRow } from "@/components/ui/table";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { PageHeader, HeaderMeta } from "@/components/admin/PageHeader";

/*
 * Contrôle d'accès — fusion des administrateurs de la configuration
 * (.env) et de la base, formulaire d'ajout en verre, registre à filets.
 */

type AdminEntry = {
  id: string;
  email: string;
  is_active: boolean;
  source: "env" | "database";
  created_at: string | null;
  created_by: string | null;
};

const TABLE_GRID = "min-w-[560px] grid-cols-[minmax(240px,1fr)_100px_110px]";

function formatDate(date: string | null) {
  if (!date) return "Config .env";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

export function AdminsClient({ initialAdmins }: { initialAdmins: AdminEntry[] }) {
  const [admins, setAdmins] = useState<AdminEntry[]>(initialAdmins);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, push } = useToasts();

  const refreshAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur de chargement");
      setAdmins(data.admins ?? []);
    } catch (error) {
      push((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

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
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'ajout de l'administrateur");
      setEmail("");
      push("Administrateur ajouté", "success");
      await refreshAdmins();
    } catch (error) {
      push((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function removeAdmin(admin: AdminEntry) {
    if (admin.source === "env") {
      push("Cet administrateur provient de ADMIN_EMAILS : retirez-le directement dans le fichier .env.", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors du retrait de l'administrateur");
      push("Administrateur retiré", "success");
      await refreshAdmins();
    } catch (error) {
      push((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative overflow-x-clip">
      <div aria-hidden className="pv-halo right-[-10%] top-[-140px] h-[380px] w-[520px] opacity-50" />

      <PageHeader
        eyebrow="Contrôle d'accès"
        title="Administrateurs"
        description="Ajoutez ou retirez les adresses autorisées à accéder au panneau d'administration."
      >
        <HeaderMeta
          value={activeAdmins.length}
          label={`actif${activeAdmins.length !== 1 ? "s" : ""}`}
        />
      </PageHeader>

      {/* Formulaire d'ajout */}
      <Card className="relative mb-6">
        <form onSubmit={addAdmin} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="admin-email">Adresse e-mail</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@votresite.com"
            />
          </div>
          <Button type="submit" disabled={saving || !email.trim()} className="sm:w-auto">
            <Plus size={14} strokeWidth={1.8} />
            {saving ? "Ajout en cours…" : "Ajouter l'administrateur"}
          </Button>
        </form>
      </Card>

      {/* Registre */}
      <Card className="overflow-hidden">
        {loading ? (
          <LoadingBlock label="Chargement des administrateurs…" />
        ) : activeAdmins.length === 0 ? (
          <div className="py-14 text-center text-sm text-dusk">Aucun administrateur actif.</div>
        ) : (
          <Table>
            <TableHeader className={TABLE_GRID}>
              <span>E-mail</span>
              <span className="text-right">Source</span>
              <span className="text-right">Action</span>
            </TableHeader>
            {activeAdmins.map((admin) => (
              <TableRow key={admin.id} className={TABLE_GRID}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Shield
                      size={13}
                      strokeWidth={1.8}
                      aria-hidden
                      className={admin.source === "env" ? "shrink-0 text-[color:var(--num-color)]" : "shrink-0 text-dusk"}
                    />
                    <span className="truncate text-ink/85">{admin.email}</span>
                  </div>
                  <div className="mt-1 pl-[23px] font-mono text-[10px] tracking-[0.06em] text-dusk">
                    {admin.created_at
                      ? `Ajouté le ${formatDate(admin.created_at)}`
                      : "Défini dans la configuration .env"}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Badge variant={admin.source === "env" ? "neva" : "default"}>
                    {admin.source === "env" ? "ENV" : "BASE"}
                  </Badge>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin)}
                    disabled={saving || admin.source === "env"}
                    title={
                      admin.source === "env"
                        ? "Administrateur défini dans ADMIN_EMAILS"
                        : "Retirer cet administrateur"
                    }
                    className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[color:var(--hairline-strong)] px-4 text-xs text-steel transition-colors duration-300 hover:border-err/40 hover:text-err disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Trash2 size={12} strokeWidth={1.8} aria-hidden />
                    Retirer
                  </button>
                </div>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {/* Note pédagogique */}
      <p className="mt-6 max-w-3xl text-xs leading-relaxed text-steel">
        Les administrateurs marqués <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--num-color)]">ENV</span>{" "}
        proviennent de la variable <code className="font-mono text-[11px] text-ink/80">ADMIN_EMAILS</code> et servent de
        secours : ils ne se retirent que dans le fichier .env. Les administrateurs marqués{" "}
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70">BASE</span> se gèrent
        directement depuis cette page.
      </p>

      <ToastViewport toasts={toasts} />
    </div>
  );
}
