"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import type { SignupSecurityEvent, SignupSecurityStatus } from "@/lib/signup-security";

/*
 * Alertes de sécurité — surveillance des créations gratuites suspectes :
 * compteurs en tuiles de verre, filtres en pilules, registre six
 * colonnes avec décision par ligne.
 */

const STATUS_LABELS: Record<SignupSecurityStatus, string> = {
  allowed: "Autorisé",
  blocked: "Bloqué",
  pending_review: "En attente",
  approved_by_admin: "Approuvé",
  rejected_by_admin: "Rejeté",
};

/* États système désaturés : warn = à traiter, err = refusé, ok = accordé. */
const STATUS_BADGES: Record<SignupSecurityStatus, string> = {
  allowed: "border-[#C5DCD2] bg-[#EEF4F1] text-[#5E9B84]",
  blocked: "border-[#EFC9C6] bg-[#FBEFEE] text-[#9E4A45]",
  pending_review: "border-[#EAD9A8] bg-[#FBF6E9] text-[#8A6D1F]",
  approved_by_admin: "border-[#C5DCD2] bg-[#EEF4F1] text-[#5E9B84]",
  rejected_by_admin: "border-[#EFC9C6] bg-[#FBEFEE] text-[#9E4A45]",
};

const STATUS_ICON_COLORS: Record<SignupSecurityStatus, string> = {
  allowed: "text-ok",
  blocked: "text-err",
  pending_review: "text-warn",
  approved_by_admin: "text-ok",
  rejected_by_admin: "text-err",
};

const TABLE_GRID =
  "min-w-[1060px] grid-cols-[minmax(210px,1.1fr)_120px_80px_minmax(200px,1fr)_130px_230px]";

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
      setError("Erreur réseau");
    } finally {
      setSavingId(null);
    }
  }

  const pendingCount = alerts.filter((alert) => alert.status === "pending_review").length;
  const blockedCount = alerts.filter((alert) => alert.status === "blocked").length;

  return (
    <div className="relative overflow-x-clip">
      <div aria-hidden className="pv-halo right-[-10%] top-[-140px] h-[380px] w-[520px] opacity-50" />

      <PageHeader
        eyebrow="Prévention des abus"
        title={
          <>
            Alertes de <span className="pv-beam-text">sécurité.</span>
          </>
        }
        description="Contrôlez l'attribution des créations gratuites suspectes sans bloquer les comptes."
      />

      {/* Compteurs en tuiles de verre */}
      <div className="mb-7 grid max-w-lg grid-cols-2 gap-4">
        <StatTile
          label="En attente"
          value={pendingCount}
          tone={pendingCount > 0 ? "warn" : "default"}
          detail="dossiers à trancher"
        />
        <StatTile
          label="Bloquées"
          value={blockedCount}
          tone={blockedCount > 0 ? "err" : "default"}
          detail="dotations retenues"
        />
      </div>

      {/* Bannière d'erreur */}
      {error && (
        <FormMessage tone="error" className="mb-4">
          {error}
        </FormMessage>
      )}

      {/* Filtres */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending_review", "blocked", "allowed", "approved_by_admin", "rejected_by_admin", "all"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`h-10 rounded-full border px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
              filter === status
                ? "border-[rgba(164,139,232,0.35)] bg-[rgba(164,139,232,0.08)] text-[color:var(--num-color)]"
                : "border-[color:var(--hairline)] text-steel hover:text-ink"
            }`}
          >
            {status === "all" ? "Tout" : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Registre */}
      <Card className="overflow-hidden">
        {visibleAlerts.length === 0 ? (
          <div className="py-14 text-center text-sm text-dusk">
            Aucune alerte dans ce filtre.
          </div>
        ) : (
          <Table>
            <TableHeader className={TABLE_GRID}>
              <span>E-mail</span>
              <span>IP</span>
              <span>Risque</span>
              <span>Motif</span>
              <span>Date</span>
              <span className="text-right">Actions</span>
            </TableHeader>
            {visibleAlerts.map((alert) => {
              const pendingAction = savingId === alert.id;
              const canReview = alert.status === "pending_review" || alert.status === "blocked";

              return (
                <TableRow key={alert.id} className={TABLE_GRID}>
                  <div className="min-w-0">
                    <div className="truncate text-ink/85">{alert.email}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-[2px] font-mono text-[9px] font-medium uppercase tracking-[0.12em] ${STATUS_BADGES[alert.status]}`}
                      >
                        {STATUS_LABELS[alert.status]}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.04em] text-dusk">
                        {alert.matching_user_ids.length} correspondance{alert.matching_user_ids.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="truncate font-mono text-xs text-steel">{alert.ip_address}</div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} strokeWidth={1.8} aria-hidden className={STATUS_ICON_COLORS[alert.status]} />
                    <span className="font-mono text-xs text-ink/85">{alert.risk_score}</span>
                  </div>

                  <div className="line-clamp-2 text-xs leading-5 text-steel">{alert.reason}</div>

                  <div className="font-mono text-[11px] text-dusk">{formatDate(alert.created_at)}</div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {canReview ? (
                      <>
                        <button
                          type="button"
                          onClick={() => act(alert, "reject")}
                          disabled={pendingAction}
                          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-err/30 px-3.5 text-xs font-medium text-err transition-colors duration-300 hover:bg-err/10 disabled:pointer-events-none disabled:opacity-45"
                        >
                          {pendingAction ? <Spinner className="h-3.5 w-3.5" /> : <ShieldX size={12} strokeWidth={1.8} aria-hidden />}
                          Rejeter
                        </button>
                        <button
                          type="button"
                          onClick={() => act(alert, "abuse")}
                          disabled={pendingAction}
                          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-err/30 px-3.5 text-xs font-medium text-err transition-colors duration-300 hover:bg-err/10 disabled:pointer-events-none disabled:opacity-45"
                        >
                          <AlertTriangle size={12} strokeWidth={1.8} aria-hidden />
                          Abus
                        </button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-10"
                          onClick={() => act(alert, "safe")}
                          disabled={pendingAction}
                        >
                          <ShieldCheck size={12} strokeWidth={1.8} aria-hidden />
                          Fiable
                        </Button>
                        <Button
                          size="sm"
                          className="h-10"
                          onClick={() => act(alert, "approve")}
                          disabled={pendingAction}
                        >
                          <Check size={12} strokeWidth={1.8} aria-hidden />
                          Approuver
                        </Button>
                      </>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                        Traité
                      </span>
                    )}
                  </div>
                </TableRow>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
