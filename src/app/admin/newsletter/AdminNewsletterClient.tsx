"use client";

import { useState } from "react";
import { AlertTriangle, Mail, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useToasts, ToastViewport } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Newsletter — composer à gauche, aperçu fidèle de l'e-mail à droite
 * (void, verre, pilule blanche sous halo spectral). L'envoi réel reste
 * verrouillé derrière la saisie exacte de « UPGRADE ».
 */

type Audience = "all" | "free" | "paid";
type SendMode = "test" | "broadcast";

type Stats = {
  total: number;
  free: number;
  paid: number;
  resendConfigured: boolean;
  fromEmail: string;
};

const AUDIENCES: Array<{ id: Audience; label: string; description: string }> = [
  { id: "free", label: "Gratuits", description: "Utilisateurs à convertir en priorité." },
  { id: "all", label: "Tous", description: "Toute la base avec un compte." },
  { id: "paid", label: "Payants", description: "Créateurs et studios actifs." },
];

const DEFAULT_MESSAGE = `Bonjour,

Neva Design évolue vite : Design Studio, Enhance, Audit et Character deviennent beaucoup plus puissants pour produire des visuels FiveM propres, cohérents et prêts à publier.

Passez sur un plan supérieur pour débloquer plus de créations, des exports plus ambitieux et un flux de travail plus fluide pour votre serveur.`;

function countForAudience(stats: Stats, audience: Audience) {
  if (audience === "free") return stats.free;
  if (audience === "paid") return stats.paid;
  return stats.total;
}

export function AdminNewsletterClient({
  initialStats,
  adminEmail,
}: {
  initialStats: Stats;
  adminEmail: string;
}) {
  const [stats, setStats] = useState(initialStats);
  const [audience, setAudience] = useState<Audience>("free");
  const [subject, setSubject] = useState("Passez au niveau supérieur avec Neva Design");
  const [preheader, setPreheader] = useState("Plus de créations, plus de formats, plus de visuels prêts à publier.");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [ctaLabel, setCtaLabel] = useState("Passer au niveau supérieur");
  const [ctaUrl, setCtaUrl] = useState("/dashboard/billing");
  const [testRecipient, setTestRecipient] = useState(adminEmail);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState<SendMode | "refresh" | null>(null);
  const { toasts, push } = useToasts();
  const confirm = useConfirm();

  const audienceCount = countForAudience(stats, audience);
  const canBroadcast = stats.resendConfigured && subject.trim() && message.trim() && confirmation === "UPGRADE";
  const previewParagraphs = message.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  async function refreshStats() {
    setLoading("refresh");
    try {
      const res = await backendFetch("/admin/newsletter");
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors du chargement des statistiques", "error");
        return;
      }
      setStats(data);
      push("Statistiques mises à jour", "success");
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(null);
    }
  }

  async function send(mode: SendMode) {
    if (mode === "broadcast") {
      const ok = await confirm({
        title: "Envoyer la newsletter",
        description: `Envoyer cette newsletter à ${audienceCount} utilisateur(s) ?`,
        confirmLabel: "Envoyer",
      });
      if (!ok) return;
    }

    setLoading(mode);
    try {
      const res = await backendFetch("/admin/newsletter", {
        method: "POST",
        body: JSON.stringify({
          mode,
          audience,
          subject,
          preheader,
          message,
          ctaLabel,
          ctaUrl,
          testRecipient,
          confirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        push(data.error ?? "Erreur lors de l'envoi", "error");
        return;
      }

      push(
        mode === "test"
          ? `E-mail de test envoyé à ${testRecipient}`
          : `Newsletter envoyée à ${data.sent} utilisateur(s)`,
        "success"
      );
      if (mode === "broadcast") setConfirmation("");
    } catch {
      push("Erreur réseau", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative">
      <div aria-hidden className="pv-halo -top-24 right-[-4%] h-[340px] w-[460px] opacity-50" />

      <PageHeader
        eyebrow="Newsletter"
        title={
          <>
            Campagne de <span className="pv-beam-underline font-medium text-ink">conversion.</span>
          </>
        }
        description="Préparez un e-mail, testez-le sur votre boîte, puis envoyez-le à une audience précise."
      >
        <span
          className={`inline-flex h-9 items-center rounded-full border px-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] ${
            stats.resendConfigured
              ? "border-[rgba(111,191,159,0.40)] bg-[rgba(111,191,159,0.10)] text-[#6FBF9F]"
              : "border-[rgba(217,178,74,0.40)] bg-[rgba(217,178,74,0.10)] text-[#D9B24A]"
          }`}
        >
          {stats.resendConfigured ? `Expéditeur · ${stats.fromEmail}` : "Resend non configuré"}
        </span>
        <Button variant="outline" onClick={refreshStats} disabled={loading !== null}>
          {loading === "refresh" ? <Spinner className="h-3.5 w-3.5" /> : <Users size={13} strokeWidth={1.8} />}
          Actualiser
        </Button>
      </PageHeader>

      {/* ── Tuiles d'audience ─────────────────────────────────── */}
      <section className="relative mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Comptes au total" value={stats.total.toLocaleString()} />
        <StatTile label="Plan gratuit" value={stats.free.toLocaleString()} />
        <StatTile label="Plans payants" value={stats.paid.toLocaleString()} />
      </section>

      <div className="relative grid gap-5 lg:grid-cols-[420px_1fr]">
        {/* ── Composer ──────────────────────────────────────────── */}
        <Card className="h-fit p-6">
          <div className="mb-6 flex items-center gap-2.5 border-b border-[color:var(--hairline)] pb-5">
            <Mail size={14} strokeWidth={1.8} className="text-[color:var(--num-color)]" />
            <h2 className="pv-label">Composer</h2>
          </div>

          <div className="space-y-5">
            <div>
              <Label>Audience</Label>
              <div className="grid grid-cols-3 gap-2">
                {AUDIENCES.map((item) => {
                  const active = audience === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAudience(item.id)}
                      className={`min-h-10 rounded-lg border px-2.5 py-2 text-left transition-colors duration-300 ${
                        active
                          ? "border-[rgba(185,167,218,0.35)] bg-[rgba(185,167,218,0.08)] text-[color:var(--num-color)]"
                          : "border-[color:var(--hairline)] text-steel hover:border-[rgba(255,255,255,0.14)] hover:text-ink"
                      }`}
                    >
                      <span className="block text-xs font-medium">{item.label}</span>
                      <span className="mt-0.5 block font-mono text-[10px] tracking-[0.06em] opacity-70">
                        {countForAudience(stats, item.id).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-dusk">
                {AUDIENCES.find((item) => item.id === audience)?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="newsletter-subject">Sujet</Label>
              <Input
                id="newsletter-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="newsletter-preheader">Texte d&apos;aperçu</Label>
              <Input
                id="newsletter-preheader"
                value={preheader}
                onChange={(event) => setPreheader(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="newsletter-message">Message</Label>
              <Textarea
                id="newsletter-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={10}
                className="leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="newsletter-cta-label">Libellé du bouton</Label>
                <Input
                  id="newsletter-cta-label"
                  value={ctaLabel}
                  onChange={(event) => setCtaLabel(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newsletter-cta-url">Lien du bouton</Label>
                <Input
                  id="newsletter-cta-url"
                  value={ctaUrl}
                  onChange={(event) => setCtaUrl(event.target.value)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[color:var(--hairline)] bg-abyss p-4">
              <Label htmlFor="newsletter-test-recipient">E-mail de test</Label>
              <div className="flex gap-2">
                <Input
                  id="newsletter-test-recipient"
                  type="email"
                  value={testRecipient}
                  onChange={(event) => setTestRecipient(event.target.value)}
                  className="min-w-0 flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => send("test")}
                  disabled={loading !== null || !stats.resendConfigured}
                >
                  {loading === "test" ? <Spinner className="h-3.5 w-3.5" /> : <Send size={13} strokeWidth={1.8} />}
                  Tester
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-warn/25 bg-warn/[0.06] p-4">
              <div className="mb-3 flex items-start gap-2 text-xs leading-relaxed text-warn">
                <AlertTriangle size={13} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                <span>
                  Envoi réel vers {audienceCount.toLocaleString()} utilisateur(s). Saisissez
                  UPGRADE pour déverrouiller l&apos;envoi.
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="UPGRADE"
                  aria-label="Confirmation d'envoi"
                  className="min-w-0 flex-1 font-mono tracking-[0.08em]"
                />
                <Button onClick={() => send("broadcast")} disabled={loading !== null || !canBroadcast}>
                  {loading === "broadcast" ? <Spinner className="h-3.5 w-3.5" /> : <Send size={13} strokeWidth={1.8} />}
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Aperçu de l'e-mail — le mockup posé sur sa lueur ──── */}
        <Card className="h-fit p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--hairline)] pb-5">
            <div className="min-w-0">
              <p className="pv-label">Aperçu</p>
              <p className="mt-1.5 truncate text-sm font-medium text-ink">
                {subject || "Sujet de la newsletter"}
              </p>
            </div>
            <span className="shrink-0 font-mono text-[11px] tracking-[0.06em] text-dusk">
              {audienceCount.toLocaleString()} destinataire(s)
            </span>
          </div>

          <div className="relative mx-auto max-w-2xl">
            <div className="relative z-10 overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-abyss shadow-[var(--shadow-glass)]">
              <div className="relative overflow-hidden border-b border-[color:var(--hairline)] px-7 py-7">
                <div aria-hidden className="pv-halo right-[-70px] top-[-100px] h-[240px] w-[320px] opacity-70" />
                <p className="pv-label relative text-[color:var(--num-color)]">Neva Design</p>
                <p className="pv-display relative mt-2.5 text-2xl text-ink">
                  Passez au niveau supérieur
                </p>
                {preheader && (
                  <p className="relative mt-2.5 text-sm leading-relaxed text-steel">{preheader}</p>
                )}
              </div>
              <div className="px-7 py-7">
                {previewParagraphs.length === 0 ? (
                  <p className="text-sm text-ink/35">Votre message apparaîtra ici.</p>
                ) : (
                  previewParagraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4 text-sm leading-relaxed text-ink/80 last:mb-0">
                      {paragraph}
                    </p>
                  ))
                )}
                {ctaUrl && (
                  <div className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-[#060606] shadow-[0_0_0_1px_rgba(185,167,218,0.4),0_4px_24px_rgba(185,167,218,0.28)]">
                    {ctaLabel || "Passer au niveau supérieur"}
                  </div>
                )}
              </div>
              <div className="border-t border-[color:var(--hairline)] px-7 py-4 text-xs leading-relaxed text-dusk">
                Vous recevez cet e-mail car vous disposez d&apos;un compte Neva Design. Pour toute
                question, répondez simplement à cet e-mail.
              </div>
            </div>
            <div aria-hidden className="pv-underglow" />
          </div>
        </Card>
      </div>

      <ToastViewport toasts={toasts} />
    </div>
  );
}
