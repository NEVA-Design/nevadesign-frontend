"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Crown,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, FormMessage } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { LoadingBlock } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableRow } from "@/components/ui/table";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { PageHeader, HeaderMeta } from "@/components/admin/PageHeader";

/*
 * Registre des utilisateurs — recherche débouncée, registre de verre,
 * fiche de gestion en modale (plan, abonnement, créations).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type Plan = "free" | "creator" | "studio" | "pro";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  plan: Plan;
  credits: number;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<Plan, string> = { free: "Free", creator: "Creator", studio: "Studio", pro: "Pro" };
const PLAN_CREDITS: Record<Plan, number> = { free: 5, creator: 100, studio: 350, pro: 900 };

const TABLE_GRID =
  "min-w-[680px] grid-cols-[minmax(240px,1fr)_90px_110px_100px_90px]";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mois`;
  return `${Math.floor(months / 12)}an`;
}

// ─── Fiche utilisateur (modale) ───────────────────────────────────────────────

function UserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (updated: AdminUser) => void;
}) {
  const [tab, setTab] = useState<"plan" | "creations">("plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Onglet Plan
  const [selectedPlan, setSelectedPlan] = useState<Plan>(user.plan);
  const [resetOnChange, setResetOnChange] = useState(false);

  // Onglet Créations
  const [addAmount, setAddAmount] = useState("");
  const [setAmount, setSetAmount] = useState("");

  const clearMessages = () => { setError(null); setSuccess(null); };

  async function callAdmin(path: string, body: Record<string, unknown>) {
    setLoading(true);
    clearMessages();
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur serveur");
        return null;
      }
      return data;
    } catch {
      setError("Erreur réseau");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePlan() {
    const data = await callAdmin(`/api/admin/users/${user.id}/plan`, {
      plan: selectedPlan,
      resetCredits: resetOnChange,
    });
    if (data) {
      setSuccess(`Plan changé en ${PLAN_LABELS[selectedPlan]}${resetOnChange ? ` · créations réinitialisées à ${PLAN_CREDITS[selectedPlan]}` : ""}`);
      onUpdated({ ...user, plan: selectedPlan, credits: data.credits });
    }
  }

  async function handleAddCredits() {
    const n = parseInt(addAmount, 10);
    if (!n || n <= 0) { setError("Montant invalide"); return; }
    const data = await callAdmin(`/api/admin/users/${user.id}/credits`, { action: "add", amount: n });
    if (data) {
      setSuccess(`+${n} créations ajoutées (total : ${data.credits})`);
      onUpdated({ ...user, credits: data.credits });
      setAddAmount("");
    }
  }

  async function handleSetCredits() {
    const n = parseInt(setAmount, 10);
    if (n === undefined || n < 0) { setError("Montant invalide"); return; }
    const data = await callAdmin(`/api/admin/users/${user.id}/credits`, { action: "set", amount: n });
    if (data) {
      setSuccess(`Créations définies à ${data.credits}`);
      onUpdated({ ...user, credits: data.credits });
      setSetAmount("");
    }
  }

  async function handleResetCredits() {
    const data = await callAdmin(`/api/admin/users/${user.id}/credits`, { action: "reset" });
    if (data) {
      setSuccess(`Créations réinitialisées à ${data.credits} (plan ${PLAN_LABELS[user.plan]})`);
      onUpdated({ ...user, credits: data.credits });
    }
  }

  async function handleRemoveSub() {
    if (!confirm(`Résilier l'abonnement de ${user.email} et revenir au plan Free ?`)) return;
    const data = await callAdmin(`/api/admin/users/${user.id}/plan`, {
      plan: "free",
      resetCredits: false,
      cancelSubscription: true,
    });
    if (data) {
      setSuccess("Abonnement résilié · retour au plan Free");
      onUpdated({ ...user, plan: "free", credits: data.credits, stripe_subscription_id: null, subscription_status: null });
      setSelectedPlan("free");
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="Fiche utilisateur"
      title={<span className="break-all text-lg sm:text-xl">{user.email}</span>}
      widthClassName="max-w-md"
    >
      {/* Signalétique du compte */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge variant={user.plan === "free" ? "subtle" : "neva"}>{PLAN_LABELS[user.plan]}</Badge>
        <span className="font-mono text-[11px] tracking-[0.08em] text-[color:var(--num-color)]">
          {user.credits.toLocaleString("fr-FR")} créations
        </span>
        <span className="font-mono text-[10px] tracking-[0.08em] text-dusk">
          Inscription : {timeAgo(user.created_at)}
        </span>
      </div>

      {/* Onglets */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        {(["plan", "creations"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); clearMessages(); }}
            className={`h-10 rounded-lg border font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
              tab === t
                ? "border-[rgba(109,91,232,0.35)] bg-[rgba(124,106,255,0.08)] text-[color:var(--num-color)]"
                : "border-[color:var(--hairline)] text-steel hover:text-ink"
            }`}
          >
            {t === "plan" ? "Plan & Abonnement" : "Créations"}
          </button>
        ))}
      </div>

      {/* ── Onglet Plan & Abonnement ── */}
      {tab === "plan" && (
        <div className="mt-5 space-y-5">
          <div>
            <Label>Changer le plan</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["free", "creator", "studio", "pro"] as Plan[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedPlan(p)}
                  className={`min-h-[56px] rounded-lg border px-2 py-2.5 text-center transition-colors duration-300 ${
                    selectedPlan === p
                      ? "border-[rgba(109,91,232,0.35)] bg-[rgba(124,106,255,0.08)]"
                      : "border-[color:var(--hairline)] hover:border-[#C9C9C0]"
                  }`}
                >
                  <span className={`block text-[13px] font-medium ${selectedPlan === p ? "text-[color:var(--num-color)]" : "text-ink/70"}`}>
                    {PLAN_LABELS[p]}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] tracking-[0.06em] text-dusk">
                    {PLAN_CREDITS[p].toLocaleString("fr-FR")} créations
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={resetOnChange}
              onChange={setResetOnChange}
              aria-label="Réinitialiser les créations au nouveau plan"
            />
            <span className="text-[13px] text-steel">Réinitialiser les créations au nouveau plan</span>
          </div>

          <Button
            className="w-full"
            onClick={handleChangePlan}
            disabled={loading || selectedPlan === user.plan}
          >
            {loading ? "Mise à jour…" : (
              <>
                <Crown size={14} strokeWidth={1.8} />
                Appliquer le plan {PLAN_LABELS[selectedPlan]}
              </>
            )}
          </Button>

          {user.stripe_subscription_id && (
            <div className="border-t border-[color:var(--hairline)] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <CreditCard size={13} strokeWidth={1.8} className="text-dusk" />
                <span className="text-[13px] text-steel">Abonnement Stripe actif</span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] ${
                    user.subscription_status === "active"
                      ? "border-[#C4E3D2] bg-[#EFF7F2] text-[#3E7A5C]"
                      : "border-[#EFC9C6] bg-[#FBEFEE] text-[#9E4A45]"
                  }`}
                >
                  {user.subscription_status ?? "inconnu"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveSub}
                disabled={loading}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-err/30 text-[13px] text-err transition-colors duration-300 hover:bg-err/10 disabled:pointer-events-none disabled:opacity-45"
              >
                <Trash2 size={13} strokeWidth={1.8} />
                Résilier l&apos;abonnement et revenir au plan Free
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Créations ── */}
      {tab === "creations" && (
        <div className="mt-5 space-y-3">
          {/* Ajouter */}
          <div className="rounded-xl border border-[color:var(--hairline)] bg-white/[0.02] p-4">
            <p className="pv-label mb-3 flex items-center gap-2 text-[10px]">
              <Plus size={11} strokeWidth={1.8} aria-hidden />
              Ajouter des créations
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="ex. 500"
                min={1}
                aria-label="Nombre de créations à ajouter"
                className="flex-1"
              />
              <Button onClick={handleAddCredits} disabled={loading || !addAmount}>
                Ajouter
              </Button>
            </div>
          </div>

          {/* Définir */}
          <div className="rounded-xl border border-[color:var(--hairline)] bg-white/[0.02] p-4">
            <p className="pv-label mb-3 flex items-center gap-2 text-[10px]">
              <ArrowUpDown size={11} strokeWidth={1.8} aria-hidden />
              Définir à une valeur précise
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={setAmount}
                onChange={(e) => setSetAmount(e.target.value)}
                placeholder="ex. 3000"
                min={0}
                aria-label="Nouveau solde de créations"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSetCredits} disabled={loading || !setAmount}>
                Définir
              </Button>
            </div>
          </div>

          {/* Réinitialiser */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[color:var(--hairline)] bg-white/[0.02] p-4">
            <div className="min-w-0">
              <p className="pv-label mb-1.5 flex items-center gap-2 text-[10px]">
                <RefreshCw size={11} strokeWidth={1.8} aria-hidden />
                Réinitialiser au plan
              </p>
              <p className="text-xs text-steel">
                Plan <span className="text-[color:var(--num-color)]">{PLAN_LABELS[user.plan]}</span> → {PLAN_CREDITS[user.plan].toLocaleString("fr-FR")} créations
              </p>
            </div>
            <Button variant="outline" size="sm" className="h-10" onClick={handleResetCredits} disabled={loading}>
              Réinitialiser
            </Button>
          </div>

          {/* Solde actuel */}
          <p className="pt-1 text-center font-mono text-[11px] tracking-[0.08em] text-dusk">
            Solde actuel : <span className="text-[color:var(--num-color)]">{user.credits.toLocaleString("fr-FR")} créations</span>
          </p>
        </div>
      )}

      {/* Retour d'état */}
      {error ? <FormMessage tone="error" className="mt-4">{error}</FormMessage> : null}
      {success ? <FormMessage tone="success" className="mt-4">{success}</FormMessage> : null}
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toasts, push } = useToasts();
  const PER_PAGE = 20;

  // Recherche débouncée
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(PER_PAGE) });
      if (debouncedQ) params.set("q", debouncedQ);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, debouncedQ]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  function handleUpdated(updated: AdminUser) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    if (selectedUser?.id === updated.id) setSelectedUser(updated);
    push("Utilisateur mis à jour", "success");
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="relative overflow-x-clip">
      <div aria-hidden className="pv-halo right-[-10%] top-[-140px] h-[380px] w-[520px] opacity-50" />

      <PageHeader
        eyebrow="Registre des comptes"
        title="Utilisateurs"
        description="Plans, abonnements et créations de chaque compte, gérés depuis un seul registre."
      >
        <HeaderMeta
          value={total.toLocaleString("fr-FR")}
          label={`compte${total !== 1 ? "s" : ""}`}
        />
      </PageHeader>

      {/* Recherche */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-dusk" aria-hidden />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par adresse e-mail…"
          aria-label="Rechercher un utilisateur par adresse e-mail"
          className="pl-10"
        />
      </div>

      {/* Registre */}
      {loading ? (
        <Card>
          <LoadingBlock label="Chargement des comptes…" />
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          title={debouncedQ ? `Aucun résultat pour « ${debouncedQ} »` : "Aucun utilisateur pour le moment"}
          hint={debouncedQ ? "Essayez une autre adresse e-mail." : "Les comptes apparaîtront ici dès la première inscription."}
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className={TABLE_GRID}>
              <span>E-mail</span>
              <span className="text-right">Plan</span>
              <span className="text-right">Créations</span>
              <span className="text-right">Inscription</span>
              <span className="text-right">Action</span>
            </TableHeader>
            {users.map((u) => (
              <TableRow key={u.id} className={TABLE_GRID}>
                <div className="min-w-0">
                  <div className="truncate text-ink/85">{u.email}</div>
                  {u.subscription_status && u.subscription_status !== "active" && (
                    <div className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-err">
                      {u.subscription_status}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Badge variant={u.plan === "free" ? "subtle" : "neva"}>{PLAN_LABELS[u.plan]}</Badge>
                </div>
                <div className="text-right font-mono text-xs text-ink">
                  {u.credits.toLocaleString("fr-FR")}
                  <span className="ml-1 text-ink/30">cr</span>
                </div>
                <div className="text-right font-mono text-[11px] text-dusk">
                  {timeAgo(u.created_at)}
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-10 px-4" onClick={() => setSelectedUser(u)}>
                    Gérer
                  </Button>
                </div>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-[0.06em] text-dusk">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Page précédente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-steel transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={15} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Page suivante"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-steel transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      )}

      {/* Fiche utilisateur */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={handleUpdated}
        />
      )}

      <ToastViewport toasts={toasts} />
    </div>
  );
}
