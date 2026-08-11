"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Mail,
  Radio,
  Send,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Audience = "all" | "free" | "paid";
type SendMode = "test" | "broadcast";

type Stats = {
  total: number;
  free: number;
  paid: number;
  resendConfigured: boolean;
  fromEmail: string;
};

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

const AUDIENCES: Array<{ id: Audience; label: string; description: string }> = [
  { id: "free", label: "Free", description: "Utilisateurs a convertir en priorite." },
  { id: "all", label: "Tous", description: "Toute la base avec un compte." },
  { id: "paid", label: "Payants", description: "Creators et studios actifs." },
];

const DEFAULT_MESSAGE = `Salut,

Neva AI evolue vite: Neva Design, Enhance, Audit et Character deviennent beaucoup plus puissants pour produire des visuels FiveM propres, coherents et prets a poster.

Passe sur un plan superieur pour debloquer plus de creations, des exports plus ambitieux et un workflow plus fluide pour ton serveur.`;

function countForAudience(stats: Stats, audience: Audience) {
  if (audience === "free") return stats.free;
  if (audience === "paid") return stats.paid;
  return stats.total;
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

export function AdminNewsletterClient({
  initialStats,
  adminEmail,
}: {
  initialStats: Stats;
  adminEmail: string;
}) {
  const [stats, setStats] = useState(initialStats);
  const [audience, setAudience] = useState<Audience>("free");
  const [subject, setSubject] = useState("Upgrade ton compte Neva AI");
  const [preheader, setPreheader] = useState("Plus de creations, plus de formats, plus de visuels prets a poster.");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [ctaLabel, setCtaLabel] = useState("Upgrade maintenant");
  const [ctaUrl, setCtaUrl] = useState("/dashboard/billing");
  const [testRecipient, setTestRecipient] = useState(adminEmail);
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState<SendMode | "refresh" | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const audienceCount = countForAudience(stats, audience);
  const canBroadcast = stats.resendConfigured && subject.trim() && message.trim() && confirmation === "UPGRADE";
  const previewParagraphs = message.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);

  function addToast(messageText: string, type: Toast["type"]) {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, message: messageText, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3200);
  }

  async function refreshStats() {
    setLoading("refresh");
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast(data.error ?? "Erreur stats", "error");
        return;
      }
      setStats(data);
      addToast("Stats mises a jour", "success");
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(null);
    }
  }

  async function send(mode: SendMode) {
    if (mode === "broadcast" && !confirm(`Envoyer cette newsletter a ${audienceCount} utilisateur(s) ?`)) return;

    setLoading(mode);
    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        addToast(data.error ?? "Erreur envoi", "error");
        return;
      }

      addToast(
        mode === "test"
          ? `Email test envoye a ${testRecipient}`
          : `Newsletter envoyee a ${data.sent} utilisateur(s)`,
        "success"
      );
      if (mode === "broadcast") setConfirmation("");
    } catch {
      addToast("Erreur reseau", "error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#FF7B4B]">
            <Radio size={12} />
            Newsletter admin
          </div>
          <h1 className="text-xl font-bold text-[#F5F0E8]">Campagne upgrade</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#555]">
            Prepare un email, teste-le sur ta boite, puis envoie-le a une audience precise.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`rounded-lg border px-3 py-2 text-xs ${stats.resendConfigured ? "border-[#4ADE80]/25 bg-[#4ADE80]/8 text-[#4ADE80]" : "border-[#FFD166]/25 bg-[#FFD166]/8 text-[#FFD166]"}`}>
            {stats.resendConfigured ? `From ${stats.fromEmail}` : "Resend non configure"}
          </div>
          <Button variant="outline" size="sm" onClick={refreshStats} disabled={loading !== null}>
            {loading === "refresh" ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
            Actualiser
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total", value: stats.total, color: "#F5F0E8" },
          { label: "Free", value: stats.free, color: "#FFD166" },
          { label: "Payants", value: stats.paid, color: "#4ADE80" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#444]">{item.label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: item.color }}>
              {item.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div className="mb-4 flex items-center gap-2">
            <Mail size={14} className="text-[#FF7B4B]" />
            <h2 className="text-sm font-semibold text-[#F5F0E8]">Composer</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Audience</label>
              <div className="grid grid-cols-3 gap-1.5">
                {AUDIENCES.map((item) => {
                  const active = audience === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAudience(item.id)}
                      className={`rounded-lg border px-2 py-2 text-left transition-all ${
                        active
                          ? "border-[#FF7B4B]/50 bg-[#FF7B4B]/10 text-[#FF7B4B]"
                          : "border-white/[0.07] text-[#666] hover:border-white/[0.15] hover:text-[#CCCCC0]"
                      }`}
                    >
                      <div className="text-xs font-semibold">{item.label}</div>
                      <div className="mt-0.5 text-[9px] leading-tight text-current opacity-60">{countForAudience(stats, item.id).toLocaleString()}</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-[#444]">
                {AUDIENCES.find((item) => item.id === audience)?.description}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Sujet</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Preheader</label>
              <input
                value={preheader}
                onChange={(event) => setPreheader(event.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#666]">Message</label>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={10}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-[#F5F0E8] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Bouton</label>
                <input
                  value={ctaLabel}
                  onChange={(event) => setCtaLabel(event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] text-[#666]">Lien</label>
                <input
                  value={ctaUrl}
                  onChange={(event) => setCtaUrl(event.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
              <label className="mb-1.5 block text-[11px] text-[#666]">Email de test</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(event) => setTestRecipient(event.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors focus:border-white/[0.16]"
                />
                <Button variant="outline" size="sm" onClick={() => send("test")} disabled={loading !== null || !stats.resendConfigured}>
                  {loading === "test" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Tester
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-[#FFD166]/20 bg-[#FFD166]/5 p-3">
              <div className="mb-2 flex items-start gap-2 text-xs text-[#FFD166]">
                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                <span>Envoi reel vers {audienceCount.toLocaleString()} utilisateur(s). Tape UPGRADE pour deverrouiller.</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="UPGRADE"
                  className="min-w-0 flex-1 rounded-lg border border-[#FFD166]/20 bg-black/20 px-3 py-2 text-xs text-[#F5F0E8] outline-none transition-colors placeholder:text-[#5f5131] focus:border-[#FFD166]/40"
                />
                <Button variant="gradient" size="sm" onClick={() => send("broadcast")} disabled={loading !== null || !canBroadcast}>
                  {loading === "broadcast" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#0c0c0c] p-5">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.05] pb-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-[#444]">Preview</div>
              <div className="mt-1 text-sm font-semibold text-[#F5F0E8]">{subject || "Sujet de la newsletter"}</div>
            </div>
            <div className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-[11px] text-[#666]">
              {audienceCount.toLocaleString()} destinataire(s)
            </div>
          </div>

          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111]">
            <div className="border-b border-white/[0.07] px-6 py-5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF7B4B]">Neva AI</div>
              <div className="mt-1 text-2xl font-bold text-[#F5F0E8]">Passe au niveau superieur</div>
              {preheader && <div className="mt-2 text-sm text-[#666]">{preheader}</div>}
            </div>
            <div className="px-6 py-6">
              {previewParagraphs.length === 0 ? (
                <p className="text-sm text-[#444]">Ton message apparaitra ici.</p>
              ) : (
                previewParagraphs.map((paragraph, index) => (
                  <p key={index} className="mb-4 text-sm leading-relaxed text-[#d8d2c8]">
                    {paragraph}
                  </p>
                ))
              )}
              {ctaUrl && (
                <div className="mt-3 inline-flex rounded-lg bg-[#FF7B4B] px-4 py-3 text-sm font-bold text-white">
                  {ctaLabel || "Upgrade maintenant"}
                </div>
              )}
            </div>
            <div className="border-t border-white/[0.06] px-6 py-4 text-xs leading-relaxed text-[#666]">
              Tu recois cet email car tu as un compte Neva AI. Pour toute question, reponds simplement a cet email.
            </div>
          </div>
        </section>
      </div>

      <Toasts items={toasts} />
    </div>
  );
}
