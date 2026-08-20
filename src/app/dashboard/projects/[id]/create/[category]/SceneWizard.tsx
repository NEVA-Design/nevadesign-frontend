"use client";

import { useEffect, useMemo, useState } from "react";
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
 * Wizard de création (bannières, affiches, wallpapers…) v2 (run 5.2) —
 * une question par écran : la scène (archétypes du .txt client illustrés
 * de GLYPHES DESSINÉS — plus aucune vignette générée par IA), la lumière,
 * les détails + slogan facultatif. Le titre du serveur est GÉNÉRÉ DANS
 * l'image par le moteur (épellation forcée + OCR) — plus aucun calque
 * texte système. Aucun prompt visible, aucun champ obligatoire.
 */

type Props = {
  projectId: string;
  projectName: string;
  category: AssetCategory;
};

const STEPS = ["Scène", "Lumière", "Détails"] as const;

// ── Glyphes de scène — SVG dessinés à la main, un par archétype ─────────────
// Compositions schématiques (silhouettes, blocs, horizon) : on lit la
// structure de la scène d'un coup d'œil, sans jamais montrer une génération.
// Trois gammes par archétype : la variation se choisit par hash de l'id du
// template — deux cartes voisines du même type ne se ressemblent pas.
const GLYPH_TINTS: Record<string, Array<{ from: string; to: string; stroke: string }>> = {
  lifestyle: [
    { from: "#2A1E3F", to: "#C96F3B", stroke: "#F5C97B" },
    { from: "#14323C", to: "#1E6FB2", stroke: "#9EDCF2" },
    { from: "#3C1E33", to: "#B2477A", stroke: "#F5B8D9" },
  ],
  action: [
    { from: "#0B0B14", to: "#3D1C55", stroke: "#C24B6E" },
    { from: "#140B0B", to: "#55261C", stroke: "#E08A4F" },
  ],
  vehicle: [
    { from: "#141B3C", to: "#31498F", stroke: "#7FB4E0" },
    { from: "#101018", to: "#4C4370", stroke: "#C9B8F5" },
  ],
  portrait: [
    { from: "#241F45", to: "#4C4370", stroke: "#C9B8F5" },
    { from: "#1E2C24", to: "#3D7A58", stroke: "#B8E6CB" },
  ],
  group: [{ from: "#1E4638", to: "#118AB2", stroke: "#9EE6C9" }],
};

function hashSeed(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function SceneGlyph({ id, sceneType, personnages }: { id: string; sceneType: string; personnages: number }) {
  const tints = GLYPH_TINTS[sceneType] ?? GLYPH_TINTS.portrait!;
  const seed = hashSeed(id);
  const tint = tints[seed % tints.length]!;
  const sunX = 40 + (seed % 90);
  const gradientId = `glyph-${id}`;
  return (
    <svg viewBox="0 0 160 90" role="img" aria-hidden className="h-full w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint.from} />
          <stop offset="100%" stopColor={tint.to} />
        </linearGradient>
      </defs>
      <rect width="160" height="90" fill={`url(#${gradientId})`} />
      {/* horizon */}
      <line x1="0" y1="62" x2="160" y2="62" stroke={tint.stroke} strokeOpacity="0.35" strokeWidth="1" />
      {sceneType === "vehicle" ? (
        // silhouette voiture de profil
        <g fill={tint.stroke} fillOpacity="0.9">
          <path d="M30 58 q6 -10 24 -11 l14 -8 q20 -4 34 2 l10 6 q14 2 16 8 l1 5 l-99 0 z" />
          <circle cx="55" cy="61" r="6" fill={tint.from} stroke={tint.stroke} strokeWidth="2.5" />
          <circle cx="108" cy="61" r="6" fill={tint.from} stroke={tint.stroke} strokeWidth="2.5" />
        </g>
      ) : sceneType === "action" ? (
        // deux silhouettes en mouvement + traînées de vitesse
        <g fill={tint.stroke} fillOpacity="0.9">
          <circle cx="66" cy="30" r="6" />
          <path d="M60 38 l12 0 l6 16 l-8 8 l-6 -12 l-8 10 l-6 -6 z" />
          <circle cx="102" cy="34" r="5" />
          <path d="M97 41 l10 0 l5 13 l-7 7 l-5 -10 l-7 8 l-5 -5 z" />
          <g stroke={tint.stroke} strokeOpacity="0.5" strokeWidth="2">
            <line x1="24" y1="34" x2="44" y2="34" />
            <line x1="18" y1="44" x2="40" y2="44" />
            <line x1="28" y1="54" x2="46" y2="54" />
          </g>
        </g>
      ) : sceneType === "portrait" ? (
        // buste central plein cadre
        <g fill={tint.stroke} fillOpacity="0.9">
          <circle cx="80" cy="30" r="11" />
          <path d="M58 78 q2 -24 22 -26 q20 2 22 26 z" />
        </g>
      ) : sceneType === "group" ? (
        // rangée de silhouettes
        <g fill={tint.stroke} fillOpacity="0.9">
          <circle cx="52" cy="34" r="7" />
          <path d="M42 70 q1 -18 10 -20 q9 2 10 20 z" />
          <circle cx="80" cy="30" r="8" />
          <path d="M69 70 q1 -20 11 -22 q10 2 11 22 z" />
          <circle cx="108" cy="34" r="7" />
          <path d="M98 70 q1 -18 10 -20 q9 2 10 20 z" />
        </g>
      ) : (
        // lifestyle : silhouette posée + soleil bas (position seedée)
        <g fill={tint.stroke} fillOpacity="0.9">
          <circle cx={sunX} cy="22" r="9" fillOpacity="0.6" />
          <circle cx="64" cy="34" r="7" />
          <path d="M50 66 q2 -18 14 -20 q12 2 14 20 l14 0 l0 4 l-46 0 z" />
        </g>
      )}
      {personnages > 0 ? (
        <text x="8" y="14" fill={tint.stroke} fillOpacity="0.8" fontSize="9" fontFamily="monospace">
          {personnages}p
        </text>
      ) : null}
    </svg>
  );
}

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
  "Génération du visuel — titre dessiné dans l'image…",
  "Vérification de l'orthographe (OCR)…",
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
  const [baseline, setBaseline] = useState("");
  const [logoInScene, setLogoInScene] = useState(false);

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
          baseline: baseline.trim() || undefined,
          logoInScene: logoInScene || undefined,
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
          <span className="absolute inset-0 animate-ping rounded-full bg-[rgba(184,161,232,0.25)]" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(184,161,232,0.5)] bg-white/5">
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
            className="h-full w-1/3 rounded-full bg-[linear-gradient(90deg,#7C6BD4,#B8A1E8,#C9B8F5)]"
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
            className="h-full rounded-full bg-[linear-gradient(90deg,#7C6BD4,#B8A1E8,#C9B8F5)]"
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
                Des archétypes éprouvés, dérivés des références d&apos;entraînement — ou ta scène sur mesure.
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
                          ? "border-[rgba(184,161,232,0.65)] shadow-[0_0_0_1px_rgba(184,161,232,0.4),0_18px_44px_rgba(0,0,0,0.52)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(184,161,232,0.4)]"
                      )}
                    >
                      {/* Glyphe dessiné (SVG) — plus aucune vignette générée par IA */}
                      <div className="relative aspect-video overflow-hidden">
                        <SceneGlyph id={template.id} sceneType={template.scene_type} personnages={template.personnages} />
                        {selected ? (
                          <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[#060606] shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/5 px-4 py-3">
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
                      ? "border-[rgba(184,161,232,0.65)] bg-white/5 shadow-[0_0_0_1px_rgba(184,161,232,0.4)]"
                      : "border-dashed border-[color:var(--hairline-strong)] hover:border-[rgba(184,161,232,0.4)]"
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hairline-strong)] text-dusk">
                    <Sparkles size={16} />
                  </span>
                  <span className="text-[13px] font-medium text-ink">Scène sur mesure</span>
                  <span className="text-[11px] leading-relaxed text-steel">
                    Décris lieu et personnages à l&apos;écran suivant
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
                          ? "border-[rgba(184,161,232,0.65)] shadow-[0_0_0_1px_rgba(184,161,232,0.4),0_14px_36px_rgba(0,0,0,0.5)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(184,161,232,0.4)]"
                      )}
                    >
                      <div className="relative h-[86px]" style={{ background: item.gradient }}>
                        {selected ? (
                          <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#060606]">
                            <Check size={13} strokeWidth={2.6} />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-white/5 px-3.5 py-3">
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
                  ? "Décris ta scène — le moteur s'occupe du reste."
                  : "Le template porte déjà la scène ; ajuste seulement si besoin."}
              </p>
              <div className="mt-8 flex flex-col gap-4">
                {[
                  { label: "Lieu", value: lieu, set: setLieu, placeholder: "Rooftop de Vinewood, garage de La Mesa, plage de Vespucci…", max: 200 },
                  { label: "Personnages", value: personnages, set: setPersonnages, placeholder: "Une silhouette en costume vue de dos, deux motards…", max: 200 },
                  { label: "Objets clés", value: props, set: setProps, placeholder: "Supercar noire, verre de whisky, billets sur la table…", max: 200 },
                  { label: "Slogan sous le titre", value: baseline, set: setBaseline, placeholder: "SERIOUS ROLEPLAY, OUVERTURE SAISON 3… (dessiné dans l'image, sans faute)", max: 80 },
                ].map((field) => (
                  <label key={field.label} className="block">
                    <span className="pv-label">{field.label}</span>
                    <input
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.max}
                      className="pv-glass mt-2 w-full rounded-xl border border-[color:var(--hairline-strong)] px-4 py-3 text-[14px] text-ink outline-none transition-shadow placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(184,161,232,0.35)]"
                    />
                  </label>
                ))}

                {/* Option pré-câblée (run 5.2) : logo intégré à la génération */}
                <button
                  type="button"
                  onClick={() => setLogoInScene((v) => !v)}
                  className={cn(
                    "flex items-center gap-2.5 self-start rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors",
                    logoInScene
                      ? "border-[rgba(184,161,232,0.55)] bg-[rgba(184,161,232,0.06)] text-ink"
                      : "border-[color:var(--hairline-strong)] text-steel"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      logoInScene ? "border-transparent bg-ink text-[#060606]" : "border-[color:var(--hairline-strong)]"
                    )}
                  >
                    {logoInScene ? <Check size={12} /> : null}
                  </span>
                  Intégrer le logo dans la scène (enseigne, panneau…) — expérimental
                </button>
              </div>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {error ? (
        <p className="mt-6 rounded-xl border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-4 py-3 text-[13px] text-[#E08A84]">
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
            className="pv-btn"
          >
            Continuer
            <ArrowRight size={15} strokeWidth={1.5} />
          </button>
        ) : (
          <button type="button" onClick={launch} className="pv-btn">
            <Sparkles size={15} strokeWidth={1.5} />
            Générer le visuel
          </button>
        )}
      </div>
    </div>
  );
}
