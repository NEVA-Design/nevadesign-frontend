"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { finalizeLogoMaster, generateLogoProposals, type LogoWizardAnswers } from "@/lib/api/engine";
import { cn } from "@/lib/utils";

/*
 * Étape 1 obligatoire — le logo, la base de tout. Version 5.2 :
 * UNE question (« Ton logo idéal ? »), illustrée typographiquement en CSS
 * — plus aucun écran de style, plus aucune vignette générée par IA. Le
 * style et la palette viennent du mapping du projet (univers, énergie,
 * époque, couleur). Puis 3 propositions en 1K passées à l'OCR gate,
 * choix, master 4K détouré côté serveur. Zéro prompt visible.
 */

type Props = {
  projectId: string;
  projectName: string;
};

const STEPS = ["Ton logo idéal", "Propositions"] as const;

const TYPES = [
  {
    id: "lettre" as const,
    label: "Une lettre",
    detail: "Un monogramme fort, lisible en petit",
  },
  {
    id: "nom" as const,
    label: "Le nom entier",
    detail: "Le nom du serveur en lettrage dessiné",
  },
  {
    id: "embleme" as const,
    label: "Un emblème",
    detail: "Un symbole pur, sans aucune lettre",
  },
];

export default function LogoWizard({ projectId, projectName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [type, setType] = useState<LogoWizardAnswers["type"] | null>(null);

  const [generating, setGenerating] = useState(false);
  const [assetId, setAssetId] = useState<string | undefined>();
  const [proposals, setProposals] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [retouchesUsed, setRetouchesUsed] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [master, setMaster] = useState<{ url: string; whiteUrl: string; blackUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function launchProposals(again = false) {
    if (!type || generating) return;
    setGenerating(true);
    setError(null);
    setChosen(null);
    if (step !== 1) {
      setDirection(1);
      setStep(1);
    }
    try {
      const result = await generateLogoProposals({
        projectId,
        assetId: again ? assetId : undefined,
        answers: { type },
      });
      setAssetId(result.assetId);
      setProposals(result.proposals);
      setRetouchesUsed(result.retouchesUsed);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function validateChoice() {
    if (!assetId || !chosen || finalizing) return;
    setFinalizing(true);
    setError(null);
    try {
      const result = await finalizeLogoMaster({ projectId, assetId, chosenUrl: chosen });
      setMaster(result.logoMaster);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFinalizing(false);
    }
  }

  // ── Écran final : master en place ──────────────────────────────────────
  if (master) {
    return (
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
        <p className="pv-label text-[color:var(--num-color)]">Logo master</p>
        <h1 className="pv-display mt-3 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
          {projectName} a sa signature.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
          Master 4K détouré + déclinaisons blanc et noir. Chaque création du projet
          l&apos;intègre automatiquement — il se compose, il ne se régénère pas.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Master couleur", url: master.url, checker: true },
            { label: "Déclinaison blanche", url: master.whiteUrl, dark: true },
            { label: "Déclinaison noire", url: master.blackUrl },
          ].map((item) => (
            <figure key={item.label}>
              <div
                className={cn(
                  "flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[color:var(--hairline-strong)] p-6",
                  item.dark ? "bg-[#191624]" : "bg-white",
                  item.checker &&
                    "bg-[conic-gradient(#EFECF4_90deg,#FFFFFF_90deg_180deg,#EFECF4_180deg_270deg,#FFFFFF_270deg)] bg-[length:22px_22px]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.label} className="max-h-full max-w-full object-contain" />
              </div>
              <figcaption className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href={`/dashboard/projects/${projectId}/create`}>
            <span className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] transition-colors hover:bg-[#35305E]">
              <Sparkles size={15} />
              Lancer une création
            </span>
          </Link>
          <Link href={`/dashboard/projects/${projectId}`} className="pv-link text-[13px]">
            Voir le projet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
      {/* Progression */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between">
          <p className="pv-label text-[color:var(--num-color)]">Étape 1 — le logo</p>
          <p className="font-mono text-[11px] tracking-[0.12em] text-dusk">
            {step + 1} / {STEPS.length} — {STEPS[step]}
          </p>
        </div>
        <div className="mt-4 h-[3px] overflow-hidden rounded-full bg-ink/[0.07]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#7C6BD4,#A48BE8,#C9B8F5)]"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          initial={{ opacity: 0, x: direction * 42 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -42 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          {step === 0 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Ton logo idéal&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Le style, les matières et les couleurs viennent de ton projet — ici on choisit
                juste la forme.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {TYPES.map((item) => {
                  const selected = type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={cn(
                        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_18px_44px_rgba(96,84,140,0.22)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                      )}
                    >
                      {/* Illustration typographique réelle (CSS) — jamais une génération */}
                      <div className="relative flex h-[120px] items-center justify-center bg-[#14111F]">
                        {item.id === "lettre" ? (
                          <span className="pv-display text-[64px] leading-none text-white">
                            {projectName.trim()[0]?.toUpperCase() ?? "N"}
                          </span>
                        ) : item.id === "nom" ? (
                          <span className="pv-display max-w-[90%] truncate text-[26px] leading-none tracking-tight text-white">
                            {projectName.toUpperCase()}
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="h-[74px] w-[64px] bg-[linear-gradient(160deg,#C9B8F5,#7C6BD4)] [clip-path:polygon(50%_0,100%_18%,100%_68%,50%_100%,0_68%,0_18%)]"
                          />
                        )}
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/70 px-5 py-4">
                        <span className="block text-[15px] font-medium text-ink">{item.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-steel">{item.detail}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                {generating ? "Le moteur dessine…" : "Choisis ton logo."}
              </h1>
              {!generating && proposals.length ? (
                <p className="mt-3 text-sm text-steel">
                  Trois interprétations du même brief, orthographe vérifiée. Celle que tu valides
                  devient le master 4K du projet.
                </p>
              ) : null}

              {generating ? (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-white/50"
                    >
                      <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,transparent_30%,rgba(164,139,232,0.14)_50%,transparent_70%)]" />
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={22} className="animate-spin text-mist" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {proposals.map((url, index) => {
                    const selected = chosen === url;
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setChosen(url)}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                          selected
                            ? "border-[rgba(164,139,232,0.75)] shadow-[0_0_0_2px_rgba(164,139,232,0.45),0_18px_44px_rgba(96,84,140,0.25)]"
                            : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.45)]"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Proposition ${index + 1}`} className="h-full w-full object-contain p-4" />
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-[0_2px_10px_rgba(43,36,80,0.45)]">
                            <Check size={14} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {!generating && proposals.length ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => launchProposals(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] px-4 text-[13px] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                  >
                    <RefreshCw size={13} />
                    3 autres propositions
                    <span className="font-mono text-[10px] text-dusk">— 1 retouche ({retouchesUsed}/5 utilisées)</span>
                  </button>
                  <button
                    type="button"
                    disabled={!chosen || finalizing}
                    onClick={validateChoice}
                    className={cn(
                      "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
                      chosen && !finalizing
                        ? "bg-ink text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] hover:bg-[#35305E]"
                        : "cursor-not-allowed bg-ink/10 text-mist"
                    )}
                  >
                    {finalizing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    {finalizing ? "Master 4K + détourage…" : "Valider ce logo — master 4K"}
                  </button>
                </div>
              ) : null}
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {error ? (
        <p className="mt-6 rounded-xl border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-4 py-3 text-[13px] text-[#B4443C]">
          {error}
        </p>
      ) : null}

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-[color:var(--hairline)] pt-6">
        <button
          type="button"
          onClick={() => {
            if (step === 0) router.push(`/dashboard/projects/${projectId}`);
            else if (!generating) {
              setDirection(-1);
              setStep(0);
            }
          }}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ArrowLeft size={15} />
          {step === 0 ? "Le projet" : "Retour"}
        </button>

        {step === 0 ? (
          <button
            type="button"
            disabled={!type || generating}
            onClick={() => launchProposals(false)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
              type && !generating
                ? "bg-ink text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] hover:bg-[#35305E]"
                : "cursor-not-allowed bg-ink/10 text-mist"
            )}
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Générer 3 propositions
            <ArrowRight size={15} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
