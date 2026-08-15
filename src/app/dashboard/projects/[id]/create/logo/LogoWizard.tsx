"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Citrus,
  Crown,
  Flame,
  Gem,
  Loader2,
  PawPrint,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Type,
  Waves,
  X,
  Zap,
} from "lucide-react";
import {
  finalizeLogoMaster,
  generateLogoProposals,
  type LogoProposition,
  type LogoWizardAnswers,
} from "@/lib/api/engine";
import { cn } from "@/lib/utils";

/*
 * Wizard logo v3 (run 5.3, LOT 2) — les bonnes questions, une par écran,
 * illustrées en CSS pur (jamais une génération dans le wizard) :
 *   1. « Ton logo, il raconte quoi ? » — LE sujet/thème qui manquait
 *   2. La forme (lettre / nom / emblème) — conservée
 *   3. L'ambiance du logo (distincte de l'univers serveur)
 *   4. Les couleurs libres : palette projet, picker complet, ou constructeur
 *      de dégradé (2-3 couleurs + angle, aperçu live sur le nom du serveur)
 *   5. Le fond : transparent / plein / dégradé + motifs (façon ALYA)
 *   6. À éviter (optionnel)
 *   7. Récap éditable « On part sur ça ? » — le brief EXACT transmis au
 *      directeur artistique, chaque ligne cliquable pour revenir
 * Puis : 3 concepts pensés par le DA → 3 propositions dessinées par le pro,
 * chacune affichée avec son intention écrite.
 */

type Props = {
  projectId: string;
  projectName: string;
};

const STEPS = [
  "Le sujet",
  "La forme",
  "L'ambiance",
  "Les couleurs",
  "Le fond",
  "À éviter",
  "On part sur ça ?",
  "Propositions",
] as const;

const RECAP_STEP = 6;
const PROPOSALS_STEP = 7;

const SUJET_CHIPS = [
  { label: "fruit", icon: Citrus },
  { label: "éclair", icon: Zap },
  { label: "animal", icon: PawPrint },
  { label: "couronne", icon: Crown },
  { label: "ville", icon: Building2 },
  { label: "vague", icon: Waves },
  { label: "diamant", icon: Gem },
  { label: "flamme", icon: Flame },
] as const;

const TYPES = [
  { id: "lettre" as const, label: "Une lettre", detail: "Un monogramme fort, lisible en petit" },
  { id: "nom" as const, label: "Le nom entier", detail: "Le nom du serveur en lettrage dessiné" },
  { id: "embleme" as const, label: "Un emblème", detail: "Un symbole pur, sans aucune lettre" },
];

const AMBIANCES = [
  { id: "ete" as const, label: "Été", swatch: "linear-gradient(135deg,#FFD166,#FF6B4A)" },
  { id: "sombre" as const, label: "Sombre", swatch: "linear-gradient(135deg,#2B2438,#0F0D16)" },
  { id: "luxe" as const, label: "Luxe", swatch: "linear-gradient(135deg,#C9A227,#3D2B1F)" },
  { id: "neon" as const, label: "Néon", swatch: "linear-gradient(135deg,#22D3EE,#8B5CF6)" },
  { id: "retro" as const, label: "Rétro", swatch: "linear-gradient(135deg,#E8C9A0,#B4443C)" },
  { id: "propre" as const, label: "Propre", swatch: "linear-gradient(135deg,#F3F1F8,#C9C4D8)" },
];

const FONDS = [
  {
    id: "transparent" as const,
    label: "Transparent",
    detail: "PNG détouré — se pose partout",
  },
  {
    id: "plein" as const,
    label: "Fond plein",
    detail: "Un aplat qui fait partie du logo",
  },
  {
    id: "degrade_motifs" as const,
    label: "Dégradé + motifs",
    detail: "Fond dégradé et petits motifs de ton sujet",
  },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default function LogoWizard({ projectId, projectName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // ── Les réponses du brief v3 ─────────────────────────────────────────────
  const [sujet, setSujet] = useState("");
  const [lettrageSeul, setLettrageSeul] = useState(false);
  const [type, setType] = useState<LogoWizardAnswers["type"] | null>(null);
  const [ambiance, setAmbiance] = useState<LogoWizardAnswers["ambiance"]>(null);
  const [couleurMode, setCouleurMode] = useState<"palette" | "unie" | "degrade">("palette");
  const [couleurUnie, setCouleurUnie] = useState("#7C6BD4");
  const [degradeCouleurs, setDegradeCouleurs] = useState<string[]>(["#FF6B4A", "#FFC4A3"]);
  const [degradeAngle, setDegradeAngle] = useState(45);
  const [fond, setFond] = useState<LogoWizardAnswers["fond"]>("transparent");
  const [interdits, setInterdits] = useState("");

  // ── Génération ───────────────────────────────────────────────────────────
  const [generating, setGenerating] = useState(false);
  const [assetId, setAssetId] = useState<string | undefined>();
  const [propositions, setPropositions] = useState<LogoProposition[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [retouchesUsed, setRetouchesUsed] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [master, setMaster] = useState<{ url: string; whiteUrl: string; blackUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const degradeCss = useMemo(
    () => `linear-gradient(${degradeAngle}deg, ${degradeCouleurs.join(", ")})`,
    [degradeAngle, degradeCouleurs]
  );

  const answers: LogoWizardAnswers | null = useMemo(() => {
    if (!type) return null;
    return {
      type,
      sujet: lettrageSeul ? "" : sujet.trim(),
      ambiance,
      couleurs:
        couleurMode === "unie"
          ? { mode: "unie", couleur: couleurUnie }
          : couleurMode === "degrade"
            ? { mode: "degrade", couleurs: degradeCouleurs, angle: degradeAngle }
            : { mode: "palette" },
      fond,
      interdits: interdits.trim(),
    };
  }, [type, lettrageSeul, sujet, ambiance, couleurMode, couleurUnie, degradeCouleurs, degradeAngle, fond, interdits]);

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function toggleChip(label: string) {
    setLettrageSeul(false);
    const parts = sujet.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.includes(label)) {
      setSujet(parts.filter((p) => p !== label).join(", "));
    } else {
      setSujet([...parts, label].join(", "));
    }
  }

  async function launchProposals(again = false) {
    if (!answers || generating) return;
    setGenerating(true);
    setError(null);
    setChosen(null);
    if (step !== PROPOSALS_STEP) goTo(PROPOSALS_STEP);
    try {
      const result = await generateLogoProposals({
        projectId,
        assetId: again ? assetId : undefined,
        answers,
      });
      setAssetId(result.assetId);
      setPropositions(result.propositions ?? []);
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

  const canContinue =
    step === 0
      ? lettrageSeul || sujet.trim().length > 0
      : step === 1
        ? Boolean(type)
        : step === 3 && couleurMode === "unie"
          ? HEX_RE.test(couleurUnie)
          : step === 3 && couleurMode === "degrade"
            ? degradeCouleurs.every((c) => HEX_RE.test(c))
            : true;

  // ── Écran final : master en place ────────────────────────────────────────
  if (master) {
    return (
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
        <p className="pv-label text-[color:var(--num-color)]">Logo master</p>
        <h1 className="pv-display mt-3 text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
          {projectName} a sa signature.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
          Master 4K + déclinaisons blanc et noir. Chaque création du projet
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

  // ── Lignes du récap — chaque ligne renvoie à son écran ───────────────────
  const recapLines = [
    {
      step: 0,
      label: "Il raconte",
      value: lettrageSeul ? "Juste le lettrage" : sujet.trim() || "—",
    },
    {
      step: 1,
      label: "La forme",
      value: TYPES.find((t) => t.id === type)?.label ?? "—",
    },
    {
      step: 2,
      label: "L'ambiance",
      value: AMBIANCES.find((a) => a.id === ambiance)?.label ?? "Libre",
    },
    {
      step: 3,
      label: "Les couleurs",
      value:
        couleurMode === "unie"
          ? couleurUnie.toUpperCase()
          : couleurMode === "degrade"
            ? `Dégradé ${degradeCouleurs.map((c) => c.toUpperCase()).join(" → ")} · ${degradeAngle}°`
            : "Palette du projet",
      swatches: couleurMode === "unie" ? [couleurUnie] : couleurMode === "degrade" ? degradeCouleurs : [],
      gradient: couleurMode === "degrade" ? degradeCss : null,
    },
    {
      step: 4,
      label: "Le fond",
      value: FONDS.find((f) => f.id === fond)?.label ?? "—",
    },
    {
      step: 5,
      label: "À éviter",
      value: interdits.trim() || "Rien de précisé",
    },
  ];

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
          {/* ── 1. Le sujet ─────────────────────────────────────────────── */}
          {step === 0 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Ton logo, il raconte quoi&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Le thème au cœur du dessin — en 3 à 8 mots. C&apos;est lui qui empêche
                les logos passe-partout.
              </p>
              <input
                type="text"
                value={sujet}
                onChange={(e) => {
                  setSujet(e.target.value);
                  if (e.target.value.trim()) setLettrageSeul(false);
                }}
                placeholder="ex. fruit, été, juteux"
                maxLength={80}
                className="mt-8 h-14 w-full rounded-2xl border border-[color:var(--hairline-strong)] bg-white/70 px-5 text-[15px] text-ink outline-none transition-colors placeholder:text-mist focus:border-[rgba(164,139,232,0.65)]"
              />
              <div className="mt-5 flex flex-wrap gap-2">
                {SUJET_CHIPS.map((chip) => {
                  const active = sujet.split(",").map((p) => p.trim()).includes(chip.label);
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => toggleChip(chip.label)}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors",
                        active
                          ? "border-[rgba(164,139,232,0.65)] bg-[rgba(164,139,232,0.12)] text-ink"
                          : "border-[color:var(--hairline-strong)] text-steel hover:border-[rgba(164,139,232,0.4)] hover:text-ink"
                      )}
                    >
                      <Icon size={14} />
                      {chip.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    setLettrageSeul((v) => !v);
                    setSujet("");
                  }}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] transition-colors",
                    lettrageSeul
                      ? "border-[rgba(164,139,232,0.65)] bg-[rgba(164,139,232,0.12)] text-ink"
                      : "border-[color:var(--hairline-strong)] text-steel hover:border-[rgba(164,139,232,0.4)] hover:text-ink"
                  )}
                >
                  <Type size={14} />
                  Juste le lettrage
                </button>
              </div>
            </section>
          ) : null}

          {/* ── 2. La forme ─────────────────────────────────────────────── */}
          {step === 1 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Ton logo idéal&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                La forme de la marque — le reste du brief vient de tes réponses.
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

          {/* ── 3. L'ambiance ───────────────────────────────────────────── */}
          {step === 2 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                L&apos;ambiance du logo&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Indépendante de l&apos;univers du serveur — un logo d&apos;été sur un serveur
                urbain, ça se fait. Optionnel&nbsp;: passe si tu hésites.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {AMBIANCES.map((item) => {
                  const selected = ambiance === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAmbiance(selected ? null : item.id)}
                      className={cn(
                        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_18px_44px_rgba(96,84,140,0.22)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                      )}
                    >
                      <div className="relative h-[72px]" style={{ background: item.swatch }}>
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/70 px-4 py-3">
                        <span className="block text-[14px] font-medium text-ink">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ── 4. Les couleurs ─────────────────────────────────────────── */}
          {step === 3 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Tes couleurs, tes règles.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Ce que tu choisis ici part tel quel dans le brief — hex exacts.
              </p>

              <div className="mt-6 flex gap-2">
                {[
                  { id: "palette" as const, label: "Palette du projet" },
                  { id: "unie" as const, label: "Une couleur" },
                  { id: "degrade" as const, label: "Un dégradé" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setCouleurMode(mode.id)}
                    className={cn(
                      "h-10 rounded-full border px-4 text-[13px] transition-colors",
                      couleurMode === mode.id
                        ? "border-[rgba(164,139,232,0.65)] bg-[rgba(164,139,232,0.12)] text-ink"
                        : "border-[color:var(--hairline-strong)] text-steel hover:text-ink"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {couleurMode === "palette" ? (
                <p className="mt-6 max-w-md rounded-2xl border border-[color:var(--hairline)] bg-white/60 px-5 py-4 text-[13px] leading-relaxed text-steel">
                  Le moteur garde la palette dérivée de ton projet (univers, énergie,
                  couleur dominante) — le comportement d&apos;origine.
                </p>
              ) : null}

              {couleurMode === "unie" ? (
                <div className="mt-6 flex items-center gap-4">
                  <input
                    type="color"
                    value={HEX_RE.test(couleurUnie) ? couleurUnie : "#7C6BD4"}
                    onChange={(e) => setCouleurUnie(e.target.value.toUpperCase())}
                    aria-label="Choisir la couleur"
                    className="h-14 w-14 cursor-pointer rounded-2xl border border-[color:var(--hairline-strong)] bg-white/70 p-1"
                  />
                  <input
                    type="text"
                    value={couleurUnie}
                    onChange={(e) => setCouleurUnie(e.target.value.toUpperCase())}
                    maxLength={7}
                    className={cn(
                      "h-12 w-36 rounded-xl border bg-white/70 px-4 font-mono text-[14px] text-ink outline-none transition-colors",
                      HEX_RE.test(couleurUnie)
                        ? "border-[color:var(--hairline-strong)] focus:border-[rgba(164,139,232,0.65)]"
                        : "border-[rgba(220,80,80,0.5)]"
                    )}
                  />
                  <span
                    className="pv-display truncate text-[28px] leading-none"
                    style={{ color: HEX_RE.test(couleurUnie) ? couleurUnie : "#7C6BD4" }}
                  >
                    {projectName.toUpperCase()}
                  </span>
                </div>
              ) : null}

              {couleurMode === "degrade" ? (
                <div className="mt-6">
                  {/* Aperçu live du dégradé sur le nom du serveur */}
                  <div className="flex h-[110px] items-center justify-center rounded-2xl border border-[color:var(--hairline-strong)] bg-[#14111F] px-6">
                    <span
                      className="pv-display max-w-full truncate bg-clip-text text-[clamp(28px,6vw,52px)] leading-none text-transparent"
                      style={{ backgroundImage: degradeCss }}
                    >
                      {projectName.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {degradeCouleurs.map((couleur, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={HEX_RE.test(couleur) ? couleur : "#7C6BD4"}
                          onChange={(e) =>
                            setDegradeCouleurs((prev) => prev.map((c, i) => (i === index ? e.target.value.toUpperCase() : c)))
                          }
                          aria-label={`Couleur ${index + 1} du dégradé`}
                          className="h-11 w-11 cursor-pointer rounded-xl border border-[color:var(--hairline-strong)] bg-white/70 p-1"
                        />
                        <input
                          type="text"
                          value={couleur}
                          onChange={(e) =>
                            setDegradeCouleurs((prev) => prev.map((c, i) => (i === index ? e.target.value.toUpperCase() : c)))
                          }
                          maxLength={7}
                          className={cn(
                            "h-10 w-28 rounded-lg border bg-white/70 px-3 font-mono text-[13px] text-ink outline-none",
                            HEX_RE.test(couleur) ? "border-[color:var(--hairline-strong)]" : "border-[rgba(220,80,80,0.5)]"
                          )}
                        />
                        {degradeCouleurs.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => setDegradeCouleurs((prev) => prev.filter((_, i) => i !== index))}
                            aria-label="Retirer cette couleur"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-mist transition-colors hover:bg-ink/[0.05] hover:text-ink"
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {degradeCouleurs.length < 3 ? (
                      <button
                        type="button"
                        onClick={() => setDegradeCouleurs((prev) => [...prev, "#FFD166"])}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-dashed border-[color:var(--hairline-strong)] px-4 text-[13px] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                      >
                        <Plus size={14} />
                        3e couleur
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-5 flex max-w-md items-center gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-dusk">Angle</span>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={5}
                      value={degradeAngle}
                      onChange={(e) => setDegradeAngle(Number(e.target.value))}
                      className="flex-1 accent-[#7C6BD4]"
                    />
                    <span className="w-12 text-right font-mono text-[13px] text-ink">{degradeAngle}°</span>
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* ── 5. Le fond ──────────────────────────────────────────────── */}
          {step === 4 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Et derrière le logo&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Transparent pour tout habiller, ou un fond qui fait partie de la marque.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {FONDS.map((item) => {
                  const selected = fond === item.id;
                  const dominante =
                    couleurMode === "degrade" ? degradeCouleurs[0] : couleurMode === "unie" ? couleurUnie : "#7C6BD4";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFond(item.id)}
                      className={cn(
                        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_18px_44px_rgba(96,84,140,0.22)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                      )}
                    >
                      {/* Trois vignettes 100 % CSS */}
                      <div
                        className={cn(
                          "relative flex h-[104px] items-center justify-center",
                          item.id === "transparent" &&
                            "bg-[conic-gradient(#EFECF4_90deg,#FFFFFF_90deg_180deg,#EFECF4_180deg_270deg,#FFFFFF_270deg)] bg-[length:18px_18px]"
                        )}
                        style={
                          item.id === "plein"
                            ? { background: dominante }
                            : item.id === "degrade_motifs"
                              ? { background: couleurMode === "degrade" ? degradeCss : `linear-gradient(135deg, ${dominante}, #C9B8F5)` }
                              : undefined
                        }
                      >
                        {item.id === "degrade_motifs" ? (
                          <span aria-hidden className="absolute inset-0 opacity-35">
                            {["12%|18%", "78%|22%", "30%|70%", "62%|64%", "88%|78%", "8%|82%"].map((pos, i) => {
                              const [left, top] = pos.split("|");
                              return (
                                <span
                                  key={i}
                                  className={cn(
                                    "absolute block border-2 border-white",
                                    i % 3 === 0 ? "h-3 w-3 rounded-full" : i % 3 === 1 ? "h-3 w-3 rotate-45" : "h-[3px] w-4 rounded-full"
                                  )}
                                  style={{ left, top }}
                                />
                              );
                            })}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "pv-display relative text-[30px] leading-none",
                            item.id === "transparent" ? "text-ink" : "text-white"
                          )}
                        >
                          {projectName.trim()[0]?.toUpperCase() ?? "N"}
                        </span>
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/70 px-4 py-3">
                        <span className="block text-[14px] font-medium text-ink">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-steel">{item.detail}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* ── 6. À éviter ─────────────────────────────────────────────── */}
          {step === 5 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Un truc à éviter&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Optionnel — tes interdits sont repris mot pour mot dans le brief.
              </p>
              <input
                type="text"
                value={interdits}
                onChange={(e) => setInterdits(e.target.value)}
                placeholder="ex. pas de noir, pas de blason"
                maxLength={160}
                className="mt-8 h-14 w-full rounded-2xl border border-[color:var(--hairline-strong)] bg-white/70 px-5 text-[15px] text-ink outline-none transition-colors placeholder:text-mist focus:border-[rgba(164,139,232,0.65)]"
              />
            </section>
          ) : null}

          {/* ── 7. Récap éditable ───────────────────────────────────────── */}
          {step === RECAP_STEP ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                On part sur ça&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                C&apos;est le brief exact transmis au directeur artistique. Clique une
                ligne pour la corriger.
              </p>
              <div className="mt-8 overflow-hidden rounded-2xl border border-[color:var(--hairline-strong)] bg-white/70">
                {recapLines.map((line, index) => (
                  <button
                    key={line.label}
                    type="button"
                    onClick={() => goTo(line.step)}
                    className={cn(
                      "group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[rgba(164,139,232,0.07)]",
                      index > 0 && "border-t border-[color:var(--hairline)]"
                    )}
                  >
                    <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                      {line.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{line.value}</span>
                    {line.gradient ? (
                      <span aria-hidden className="h-5 w-14 shrink-0 rounded-full" style={{ background: line.gradient }} />
                    ) : line.swatches?.length ? (
                      <span className="flex shrink-0 gap-1.5">
                        {line.swatches.map((c) => (
                          <span key={c} aria-hidden className="h-5 w-5 rounded-full border border-black/10" style={{ background: c }} />
                        ))}
                      </span>
                    ) : null}
                    <Pencil size={13} className="shrink-0 text-mist transition-colors group-hover:text-ink" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {/* ── 8. Propositions ─────────────────────────────────────────── */}
          {step === PROPOSALS_STEP ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                {generating ? "Le directeur artistique réfléchit…" : "Choisis ton logo."}
              </h1>
              {!generating && propositions.length ? (
                <p className="mt-3 max-w-lg text-sm text-steel">
                  Trois concepts pensés séparément, dessinés en 2K, orthographe et
                  brief vérifiés. Celui que tu valides devient le master 4K du projet.
                </p>
              ) : null}
              {generating ? (
                <p className="mt-3 max-w-lg text-sm text-steel">
                  Trois concepts s&apos;écrivent, puis se dessinent et se relisent —
                  une à deux minutes.
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
                  {propositions.map((prop, index) => {
                    const selected = chosen === prop.url;
                    return (
                      <div key={prop.url}>
                        <button
                          type="button"
                          onClick={() => setChosen(prop.url)}
                          className={cn(
                            "group relative block aspect-square w-full overflow-hidden rounded-2xl border bg-white transition-all duration-300",
                            selected
                              ? "border-[rgba(164,139,232,0.75)] shadow-[0_0_0_2px_rgba(164,139,232,0.45),0_18px_44px_rgba(96,84,140,0.25)]"
                              : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.45)]"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prop.url} alt={`Proposition ${index + 1} — ${prop.concept.nom}`} className="h-full w-full object-contain p-4" />
                          {selected ? (
                            <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-[0_2px_10px_rgba(43,36,80,0.45)]">
                              <Check size={14} strokeWidth={2.6} />
                            </span>
                          ) : null}
                        </button>
                        {/* L'intention écrite AVANT le dessin — la transparence v3 */}
                        <p className="mt-2 px-1 text-[13px] font-medium text-ink">{prop.concept.nom}</p>
                        <p className="mt-0.5 px-1 text-xs leading-relaxed text-steel">{prop.concept.justification}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {!generating && propositions.length ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => launchProposals(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] px-4 text-[13px] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                  >
                    <RefreshCw size={13} />
                    3 autres concepts
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
                    {finalizing ? "Master 4K…" : "Valider ce logo — master 4K"}
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
            else if (!generating) goTo(step === PROPOSALS_STEP ? RECAP_STEP : step - 1);
          }}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ArrowLeft size={15} />
          {step === 0 ? "Le projet" : "Retour"}
        </button>

        {step < RECAP_STEP ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => goTo(step + 1)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
              canContinue
                ? "bg-ink text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] hover:bg-[#35305E]"
                : "cursor-not-allowed bg-ink/10 text-mist"
            )}
          >
            Continuer
            <ChevronRight size={15} />
          </button>
        ) : null}

        {step === RECAP_STEP ? (
          <button
            type="button"
            disabled={!answers || generating}
            onClick={() => launchProposals(false)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
              answers && !generating
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
