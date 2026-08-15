"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  fetchSceneTemplates,
  generateScene,
  type SceneTemplateInfo,
} from "@/lib/api/engine";
import { CATEGORY_LABELS, CATEGORY_SPECS, type AssetCategory } from "@/lib/projects-shared";
import { cn } from "@/lib/utils";

/*
 * Wizard de création (bannières, affiches, wallpapers…) — une question
 * par écran : la scène (archétypes illustrés dérivés du .txt client, ou
 * sur mesure), la lumière, les détails facultatifs. Aucun prompt visible,
 * aucun champ obligatoire. La génération débouche dans l'éditeur.
 */

type Props = {
  projectId: string;
  projectName: string;
  category: AssetCategory;
};

const STEPS = ["Scène", "Lumière", "Détails"] as const;

const MOMENTS = [
  {
    id: "auto",
    label: "Ambiance du projet",
    detail: "Le moteur suit la DA",
    gradient: "linear-gradient(150deg,#4C4370,#8B7DC2 55%,#C9B8F5)",
  },
  {
    id: "golden hour, warm low sun, long soft shadows",
    label: "Aube dorée",
    detail: "Soleil bas, ombres longues",
    gradient: "linear-gradient(160deg,#2A1E3F,#C96F3B 55%,#F5C97B)",
  },
  {
    id: "bright midday sun, vivid colors, crisp light",
    label: "Plein jour",
    detail: "Couleurs vives, net",
    gradient: "linear-gradient(160deg,#1E6FB2,#5AB6E8 55%,#F2EFE4)",
  },
  {
    id: "blue hour dusk, city lights igniting",
    label: "Heure bleue",
    detail: "Crépuscule, lumières urbaines",
    gradient: "linear-gradient(160deg,#141B3C,#31498F 55%,#E08A4F)",
  },
  {
    id: "night, neon spill and warm practicals",
    label: "Nuit néon",
    detail: "Pratiques chaudes, néons",
    gradient: "linear-gradient(160deg,#0B0B14,#3D1C55 55%,#C24B6E)",
  },
];

const LOADING_LINES = [
  "Compilation du brief avec la DA du projet…",
  "Génération de la scène (aucun texte, jamais)…",
  "Placement du logo et des blocs de texte…",
  "Ouverture de l'éditeur…",
];

export default function SceneWizard({ projectId, projectName, category }: Props) {
  const router = useRouter();
  const spec = CATEGORY_SPECS[category];

  const [templates, setTemplates] = useState<SceneTemplateInfo[]>([]);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [templateId, setTemplateId] = useState<string | null>(null);
  const [custom, setCustom] = useState(false);
  const [moment, setMoment] = useState("auto");
  const [lieu, setLieu] = useState("");
  const [personnages, setPersonnages] = useState("");
  const [props, setProps] = useState("");

  const [generating, setGenerating] = useState(false);
  const [loadingLine, setLoadingLine] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSceneTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => setLoadingLine((l) => Math.min(l + 1, LOADING_LINES.length - 1)), 6000);
    return () => clearInterval(interval);
  }, [generating]);

  const canContinue = step === 0 ? custom || templateId !== null : true;

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId]
  );

  function go(delta: number) {
    setError(null);
    setDirection(delta);
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + delta)));
  }

  async function launch() {
    if (generating) return;
    setGenerating(true);
    setLoadingLine(0);
    setError(null);
    try {
      const result = await generateScene({
        projectId,
        category,
        title: selectedTemplate?.titre ?? undefined,
        answers: {
          templateId: custom ? undefined : templateId ?? undefined,
          moment: moment === "auto" ? undefined : moment,
          lieu: lieu.trim() || undefined,
          personnages: personnages.trim() || undefined,
          props: props.trim() || undefined,
        },
      });
      router.push(`/dashboard/projects/${projectId}/assets/${result.asset.id}`);
    } catch (e) {
      setError((e as Error).message);
      setGenerating(false);
    }
  }

  // ── Écran de génération plein cadre ─────────────────────────────────────
  if (generating) {
    return (
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(164,139,232,0.25)]" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(164,139,232,0.5)] bg-white/70">
            <Wand2 size={22} className="text-[color:var(--num-color)]" />
          </span>
        </div>
        <h1 className="pv-display mt-8 text-[clamp(1.5rem,2.8vw,2.1rem)] text-ink">
          {CATEGORY_LABELS[category]} en cours de création.
        </h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingLine}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-4 font-mono text-[12px] tracking-[0.08em] text-dusk"
          >
            {LOADING_LINES[loadingLine]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-8 h-[3px] w-64 overflow-hidden rounded-full bg-ink/[0.07]">
          <motion.div
            className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#7C6BD4,#A48BE8,#C9B8F5)]"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
      {/* Progression */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between gap-4">
          <p className="pv-label text-[color:var(--num-color)]">
            {CATEGORY_LABELS[category]} — {spec.width} × {spec.height}
          </p>
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
                Quelle scène raconte {projectName}&nbsp;?
              </h1>
              <p className="mt-3 text-sm text-steel">
                Des archétypes éprouvés, dérivés des références d&apos;entraînement — ou votre scène sur mesure.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {templates.map((template) => {
                  const selected = !custom && templateId === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setTemplateId(template.id);
                        setCustom(false);
                      }}
                      className={cn(
                        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_18px_44px_rgba(96,84,140,0.22)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                      )}
                    >
                      <div className="relative aspect-video overflow-hidden bg-abyss">
                        <Image
                          src={`/wizard/scene-${template.id}.webp`}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 45vw, 300px"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                        />
                        {selected ? (
                          <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-[0_2px_8px_rgba(43,36,80,0.4)]">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                        {template.personnages > 0 ? (
                          <span className="absolute left-2.5 top-2.5 rounded-full bg-[rgba(11,11,16,0.62)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm">
                            {template.personnages} perso{template.personnages > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/70 px-4 py-3">
                        <span className="block truncate text-[13px] font-medium text-ink">{template.titre}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Scène sur mesure */}
                <button
                  type="button"
                  onClick={() => {
                    setCustom(true);
                    setTemplateId(null);
                  }}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 text-center transition-all duration-300",
                    custom
                      ? "border-[rgba(164,139,232,0.65)] bg-white/70 shadow-[0_0_0_1px_rgba(164,139,232,0.4)]"
                      : "border-dashed border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-dusk">
                    <Sparkles size={16} />
                  </span>
                  <span className="text-[13px] font-medium text-ink">Scène sur mesure</span>
                  <span className="text-[11px] leading-relaxed text-steel">
                    Décrivez lieu et personnages à l&apos;écran suivant
                  </span>
                </button>
              </div>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Quelle lumière&nbsp;?
              </h1>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
                {MOMENTS.map((item) => {
                  const selected = moment === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMoment(item.id)}
                      className={cn(
                        "group overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_14px_36px_rgba(96,84,140,0.2)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                      )}
                    >
                      <div className="relative h-[86px]" style={{ background: item.gradient }}>
                        {selected ? (
                          <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/70 px-3.5 py-3">
                        <span className="block text-[13px] font-medium text-ink">{item.label}</span>
                        <span className="mt-0.5 block text-[10.5px] leading-snug text-steel">{item.detail}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Des précisions&nbsp;? <span className="text-mist">(facultatif)</span>
              </h1>
              <p className="mt-3 text-sm text-steel">
                {custom
                  ? "Décrivez votre scène — le moteur s'occupe du reste."
                  : "Le template porte déjà la scène ; ajustez seulement si besoin."}
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {[
                  { label: "Lieu", value: lieu, set: setLieu, placeholder: "Rooftop de Vinewood, garage de La Mesa, plage de Vespucci…" },
                  { label: "Personnages", value: personnages, set: setPersonnages, placeholder: "Une silhouette en costume vue de dos, deux motards…" },
                  { label: "Objets clés", value: props, set: setProps, placeholder: "Supercar noire, verre de whisky, billets sur la table…" },
                ].map((field) => (
                  <label key={field.label} className="block">
                    <span className="pv-label">{field.label}</span>
                    <input
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={200}
                      className="pv-glass mt-2 w-full rounded-xl border border-[color:var(--hairline-strong)] px-4 py-3 text-[14px] text-ink outline-none transition-shadow placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(164,139,232,0.35)]"
                    />
                  </label>
                ))}
              </div>
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
          onClick={() => (step === 0 ? router.push(`/dashboard/projects/${projectId}/create`) : go(-1))}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ArrowLeft size={15} />
          {step === 0 ? "Les formats" : "Retour"}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => go(1)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
              canContinue
                ? "bg-ink text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] hover:bg-[#35305E]"
                : "cursor-not-allowed bg-ink/10 text-mist"
            )}
          >
            Continuer
            <ArrowRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={launch}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] transition-colors hover:bg-[#35305E]"
          >
            <Sparkles size={15} />
            Générer la scène
          </button>
        )}
      </div>
    </div>
  );
}
