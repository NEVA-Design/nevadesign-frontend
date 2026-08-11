"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, ShieldCheck, ShieldX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SignupSecurityEvent, SignupSecurityStatus } from "@/lib/signup-security";

const STATUS_LABELS: Record<SignupSecurityStatus, string> = {
  allowed: "Allowed",
  blocked: "Blocked",
  pending_review: "Pending",
  approved_by_admin: "Approved",
  rejected_by_admin: "Rejected",
};

const STATUS_COLORS: Record<SignupSecurityStatus, string> = {
  allowed: "#4ADE80",
  blocked: "#FF6B7D",
  pending_review: "#FFD166",
  approved_by_admin: "#4ADE80",
  rejected_by_admin: "#FF6B7D",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function SecurityAlertsClient({ initialAlerts }: { initialAlerts: SignupSecurityEvent[] }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SignupSecurityStatus | "all">("pending_review");
  const [error, setError] = useState<string | null>(null);

  const visibleAlerts = useMemo(() => {
    if (filter === "all") return alerts;
    return alerts.filter((alert) => alert.status === filter);
  }, [alerts, filter]);

  async function act(alert: SignupSecurityEvent, action: "approve" | "reject" | "safe" | "abuse") {
    setSavingId(alert.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/security-alerts/${alert.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Erreur serveur");
        return;
      }
      setAlerts((prev) => prev.map((item) => (item.id === alert.id ? data.alert : item)));
    } catch {
      setError("Erreur reseau");
    } finally {
      setSavingId(null);
    }
  }

  const pendingCount = alerts.filter((alert) => alert.status === "pending_review").length;
  const blockedCount = alerts.filter((alert) => alert.status === "blocked").length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF7B4B]">Abuse prevention</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#F5F0E8]">Security Alerts</h1>
          <p className="mt-1 text-sm text-[#666]">
            Controle les credits gratuits suspects sans bloquer les comptes.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-xl border border-[#FFD166]/25 bg-[#FFD166]/10 px-3 py-2 text-xs text-[#FFD166]">
            {pendingCount} pending
          </div>
          <div className="rounded-xl border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-3 py-2 text-xs text-[#FF6B7D]">
            {blockedCount} blocked
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-4 py-3 text-sm text-[#FF6B7D]">
          <X size={14} />
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["pending_review", "blocked", "allowed", "approved_by_admin", "rejected_by_admin", "all"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
              filter === status
                ? "border-[#FF7B4B]/40 bg-[#FF7B4B]/10 text-[#FF7B4B]"
                : "border-white/[0.07] text-[#777] hover:border-white/[0.14] hover:text-[#F5F0E8]"
            }`}
          >
            {status === "all" ? "All" : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07]">
        <div className="grid grid-cols-[1.1fr_130px_100px_1fr_130px_240px] gap-4 border-b border-white/[0.05] bg-white/[0.02] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#444]">
          <span>Email</span>
          <span>IP</span>
          <span>Risk</span>
          <span>Reason</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>

        {visibleAlerts.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#444]">Aucune alerte dans ce filtre</div>
        ) : (
          visibleAlerts.map((alert, index) => {
            const color = STATUS_COLORS[alert.status];
            const pendingAction = savingId === alert.id;
            const canReview = alert.status === "pending_review" || alert.status === "blocked";

            return (
              <div
                key={alert.id}
                className={`grid grid-cols-[1.1fr_130px_100px_1fr_130px_240px] items-center gap-4 px-5 py-3 text-sm ${
                  index < visibleAlerts.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-[#E8E3DB]">{alert.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-[#555]">
                    <span className="rounded-md border px-1.5 py-0.5 font-semibold" style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
                      {STATUS_LABELS[alert.status]}
                    </span>
                    {alert.matching_user_ids.length} match{alert.matching_user_ids.length !== 1 ? "es" : ""}
                  </div>
                </div>
                <div className="truncate font-mono text-xs text-[#777]">{alert.ip_address}</div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} style={{ color }} />
                  <span className="font-semibold text-[#F5F0E8]">{alert.risk_score}</span>
                </div>
                <div className="line-clamp-2 text-xs leading-5 text-[#888]">{alert.reason}</div>
                <div className="text-xs text-[#666]">{formatDate(alert.created_at)}</div>
                <div className="flex justify-end gap-2">
                  {canReview ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => act(alert, "reject")} disabled={pendingAction}>
                        {pendingAction ? <Loader2 size={12} className="animate-spin" /> : <ShieldX size={12} />}
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => act(alert, "abuse")} disabled={pendingAction}>
                        <ShieldX size={12} />
                        Abuse
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => act(alert, "safe")} disabled={pendingAction}>
                        <ShieldCheck size={12} />
                        Safe
                      </Button>
                      <Button size="sm" variant="gradient" onClick={() => act(alert, "approve")} disabled={pendingAction}>
                        <Check size={12} />
                        Approve
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-[#555]">Reviewed</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
