"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronLeft, ChevronRight, X, Check,
  Loader2, Zap, CreditCard, RefreshCw, Trash2,
  Plus, ArrowUpDown, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface Toast { id: number; message: string; type: "success" | "error" }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<Plan, string> = { free: "Free", creator: "Creator", studio: "Studio", pro: "Pro" };
const PLAN_COLORS: Record<Plan, string> = {
  free: "#9A9A9A",
  creator: "#FFD166",
  studio: "#FF7B4B",
  pro: "#A78BFA",
};
const PLAN_CREDITS: Record<Plan, number> = { free: 5, creator: 100, studio: 350, pro: 900 };

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "Aujourd'hui";
  if (days < 30) return `${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mois`;
  return `${Math.floor(months / 12)}an`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toasts({ items }: { items: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {items.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium shadow-xl backdrop-blur-sm ${
            t.type === "success"
              ? "bg-[#4ADE80]/10 border-[#4ADE80]/30 text-[#4ADE80]"
              : "bg-[#FF6B7D]/10 border-[#FF6B7D]/30 text-[#FF6B7D]"
          }`}
        >
          {t.type === "success" ? <Check size={13} /> : <X size={13} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── User Modal ───────────────────────────────────────────────────────────────

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

  // Plan tab
  const [selectedPlan, setSelectedPlan] = useState<Plan>(user.plan);
  const [resetOnChange, setResetOnChange] = useState(false);

  // Creations tab
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
    if (!confirm(`Supprimer l'abonnement de ${user.email} et repasser en Free ?`)) return;
    const data = await callAdmin(`/api/admin/users/${user.id}/plan`, {
      plan: "free",
      resetCredits: false,
      cancelSubscription: true,
    });
    if (data) {
      setSuccess("Abonnement supprimé · plan Free");
      onUpdated({ ...user, plan: "free", credits: data.credits, stripe_subscription_id: null, subscription_status: null });
      setSelectedPlan("free");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="text-sm font-semibold text-[#F5F0E8] mb-0.5 truncate max-w-[280px]">{user.email}</div>
            <div className="flex items-center gap-2 text-[11px] text-[#555]">
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                style={{ color: PLAN_COLORS[user.plan], borderColor: `${PLAN_COLORS[user.plan]}40`, background: `${PLAN_COLORS[user.plan]}12` }}
              >
                {PLAN_LABELS[user.plan].toUpperCase()}
              </span>
              <span className="flex items-center gap-1"><Zap size={9} className="text-[#FFD166]" /> {user.credits.toLocaleString()} créations</span>
              <span>· inscrit {timeAgo(user.created_at)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors mt-0.5">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.06]">
          {(["plan", "creations"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); clearMessages(); }}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                tab === t ? "text-[#F5F0E8] border-b-2 border-[#FF7B4B]" : "text-[#555] hover:text-[#888]"
              }`}
            >
              {t === "plan" ? "Plan & Abonnement" : "Créations"}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {/* ── Plan tab ── */}
          {tab === "plan" && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#666] mb-2">Changer le plan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["free", "creator", "studio", "pro"] as Plan[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlan(p)}
                      className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedPlan === p
                          ? `border-2 text-[${PLAN_COLORS[p]}]`
                          : "border-white/[0.06] text-[#555] hover:text-[#888] hover:border-white/[0.12]"
                      }`}
                      style={selectedPlan === p ? {
                        borderColor: PLAN_COLORS[p],
                        color: PLAN_COLORS[p],
                        background: `${PLAN_COLORS[p]}10`,
                      } : {}}
                    >
                      {PLAN_LABELS[p]}
                      <div className="text-[9px] font-normal mt-0.5 opacity-60">{PLAN_CREDITS[p].toLocaleString()} créations</div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setResetOnChange(v => !v)}
                  className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${resetOnChange ? "bg-[#FF7B4B]" : "bg-white/[0.08]"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${resetOnChange ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-[11px] text-[#666]">Réinitialiser les créations au nouveau plan</span>
              </label>

              <Button
                variant="gradient"
                size="sm"
                className="w-full"
                onClick={handleChangePlan}
                disabled={loading || selectedPlan === user.plan}
              >
                {loading ? <><Loader2 size={12} className="animate-spin" /> Mise à jour…</> : <><Crown size={12} /> Appliquer le plan {PLAN_LABELS[selectedPlan]}</>}
              </Button>

              {user.stripe_subscription_id && (
                <div className="pt-2 border-t border-white/[0.04]">
                  <div className="text-[11px] text-[#555] mb-2 flex items-center gap-1.5">
                    <CreditCard size={10} />
                    Abonnement Stripe actif
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      user.subscription_status === 'active' ? 'border-[#4ADE80]/30 text-[#4ADE80] bg-[#4ADE80]/10' : 'border-[#FF6B7D]/30 text-[#FF6B7D] bg-[#FF6B7D]/10'
                    }`}>
                      {user.subscription_status ?? 'unknown'}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveSub}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-500/20 text-xs text-red-400 hover:bg-red-500/8 transition-all"
                  >
                    <Trash2 size={11} />
                    Supprimer l'abonnement &amp; passer en Free
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Creations tab ── */}
          {tab === "creations" && (
            <div className="space-y-3">
              {/* Add */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="text-[11px] text-[#666] mb-2 flex items-center gap-1.5"><Plus size={10} /> Ajouter des créations</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    placeholder="ex: 500"
                    min={1}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F0E8] placeholder-[#333] outline-none focus:border-white/[0.15] transition-colors"
                  />
                  <Button size="sm" variant="gradient" onClick={handleAddCredits} disabled={loading || !addAmount}>
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Ajouter"}
                  </Button>
                </div>
              </div>

              {/* Set */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="text-[11px] text-[#666] mb-2 flex items-center gap-1.5"><ArrowUpDown size={10} /> Définir à une valeur précise</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={setAmount}
                    onChange={e => setSetAmount(e.target.value)}
                    placeholder="ex: 3000"
                    min={0}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F0E8] placeholder-[#333] outline-none focus:border-white/[0.15] transition-colors"
                  />
                  <Button size="sm" variant="outline" onClick={handleSetCredits} disabled={loading || !setAmount}>
                    {loading ? <Loader2 size={12} className="animate-spin" /> : "Définir"}
                  </Button>
                </div>
              </div>

              {/* Reset */}
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="text-[11px] text-[#666] mb-2 flex items-center gap-1.5"><RefreshCw size={10} /> Réinitialiser au plan</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#888]">
                    Plan <span style={{ color: PLAN_COLORS[user.plan] }}>{PLAN_LABELS[user.plan]}</span> → {PLAN_CREDITS[user.plan].toLocaleString()} créations
                  </span>
                  <button
                    onClick={handleResetCredits}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#888] border border-white/[0.08] hover:text-[#CCCCC0] hover:border-white/[0.15] transition-all"
                  >
                    {loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    Reset
                  </button>
                </div>
              </div>

              {/* Current balance */}
              <div className="text-[11px] text-center text-[#444]">
                Solde actuel : <span className="text-[#FFD166] font-semibold">{user.credits.toLocaleString()} créations</span>
              </div>
            </div>
          )}

          {/* Feedback */}
          {(error || success) && (
            <div className={`mt-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
              error ? "bg-red-500/8 border border-red-500/20 text-red-400" : "bg-[#4ADE80]/8 border border-[#4ADE80]/20 text-[#4ADE80]"
            }`}>
              {error ? <X size={11} /> : <Check size={11} />}
              {error ?? success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminUsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const PER_PAGE = 20;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(query); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

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
    addToast("Utilisateur mis à jour", "success");
  }

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Utilisateurs</h1>
          <p className="text-sm text-[#555] mt-0.5">{total.toLocaleString()} compte{total !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444]" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par email…"
          className="w-full max-w-xs pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-[#F5F0E8] placeholder-[#333] outline-none focus:border-white/[0.14] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.05] text-[10px] font-semibold text-[#444] uppercase tracking-widest">
          <span>Email</span>
          <span className="text-right w-20">Plan</span>
          <span className="text-right w-24">Créations</span>
          <span className="text-right w-20">Inscrit</span>
          <span className="text-right w-16">Action</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-sm text-[#444]">
            <Loader2 size={14} className="animate-spin" /> Chargement…
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-sm text-[#444]">
            {debouncedQ ? `Aucun résultat pour "${debouncedQ}"` : "Aucun utilisateur"}
          </div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors ${
                i < users.length - 1 ? "border-b border-white/[0.04]" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="text-sm text-[#E8E3DB] truncate">{u.email}</div>
                {u.subscription_status && u.subscription_status !== "active" && (
                  <div className="text-[10px] text-[#FF6B7D] mt-0.5">{u.subscription_status}</div>
                )}
              </div>
              <div className="w-20 flex justify-end">
                <span
                  className="text-[10px] font-bold px-2 py-1 rounded-md border"
                  style={{ color: PLAN_COLORS[u.plan], borderColor: `${PLAN_COLORS[u.plan]}40`, background: `${PLAN_COLORS[u.plan]}12` }}
                >
                  {PLAN_LABELS[u.plan].toUpperCase()}
                </span>
              </div>
              <div className="w-24 text-right">
                <span className="text-sm font-semibold text-[#FFD166]">{u.credits.toLocaleString()}</span>
                <span className="text-[10px] text-[#444] ml-1">créations</span>
              </div>
              <div className="w-20 text-right text-xs text-[#555]">
                {timeAgo(u.created_at)}
              </div>
              <div className="w-16 flex justify-end">
                <button
                  onClick={() => setSelectedUser(u)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] text-[#888] border border-white/[0.07] hover:text-[#F5F0E8] hover:border-white/[0.15] transition-all"
                >
                  Gérer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#444]">
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-white/[0.07] text-[#555] hover:text-[#CCCCC0] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-white/[0.07] text-[#555] hover:text-[#CCCCC0] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* User modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={handleUpdated}
        />
      )}

      <Toasts items={toasts} />
    </div>
  );
}
