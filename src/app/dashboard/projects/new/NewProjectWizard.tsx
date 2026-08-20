"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Crown,
  Gem,
  ImagePlus,
  Loader2,
  Skull,
  Smile,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { backendFetch } from "@/lib/api/backend-client";
import { createProject, type StyleAnswers } from "@/lib/api/projects";
import { cn } from "@/lib/utils";

/*
 * Wizard de création de projet v2 (run 5.2) — une question par écran,
 * réponses en chips illustrées de PICTOS DESSINÉS (jamais une image
 * générée par IA), deux curseurs, une couleur, ≤ 60 s au total.
 * L'utilisateur parle de son serveur ; le mapping backend traduit en
 * direction artistique — il ne voit jamais « chrome » ou « graffiti ».
 */

const UNIVERSES: Array<{
  id: StyleAnswers["universe"];
  label: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  tint: string;
}> = [
  { id: "rp_urbain", label: "RP urbain", detail: "La ville, la rue, le quotidien de Los Santos", icon: Building2, tint: "#22D3EE" },
  { id: "cartel", label: "Cartel", detail: "Pouvoir, territoires, nuits sous tension", icon: Crown, tint: "#E63946" },
  { id: "luxe", label: "Luxe", detail: "Villas, montres, très haut standing", icon: Gem, tint: "#C9A227" },
  { id: "ete_plage", label: "Été / plage", detail: "Vespucci, jetski, couleurs qui claquent", icon: Sun, tint: "#FF6B4A" },
  { id: "sombre_hardcore", label: "Sombre / hardcore", detail: "RP dur, ambiance lourde, zéro pitié", icon: Skull, tint: "#94A3B8" },
  { id: "chill", label: "Chill communautaire", detail: "Détente, entre potes, bonne humeur", icon: Smile, tint: "#8B5CF6" },
];

const COLOR_SWATCHES = [
  "#E63946", "#FF6B4A", "#FFD166", "#06D6A0",
  "#118AB2", "#22D3EE", "#8B5CF6", "#C9A227",
];

const STEPS = ["Nom", "Univers", "Énergie", "Époque", "Couleur", "Références"] as const;

export default function NewProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState("");
  const [universe, setUniverse] = useState<StyleAnswers["universe"] | null>(null);
  // 0 = élégant, 100 = agressif — départ au centre, l'utilisateur tranche
  const [energie, setEnergie] = useState(50);
  const [energieTouched, setEnergieTouched] = useState(false);
  // 0 = classique, 100 = moderne
  const [modernite, setModernite] = useState(50);
  const [moderniteTouched, setModerniteTouched] = useState(false);
  const [couleur, setCouleur] = useState<string | null>(null);
  const [references, setReferences] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue =
    step === 0 ? name.trim().length >= 2
    : step === 1 ? universe !== null
    : step === 2 ? energieTouched
    : step === 3 ? moderniteTouched
    : step === 4 ? couleur !== null
    : true;

  function go(delta: number) {
    setError(null);
    setDirection(delta);
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + delta)));
  }

  async function handleReferenceUpload(file: File) {
    if (references.length >= 3) return;
    setUploading(true);
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",").pop() ?? "";
      const res = await backendFetch("/projects/uploads/reference", {
        method: "POST",
        body: JSON.stringify({ image: { data: base64, mimeType: file.type } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? "Upload impossible");
      setReferences((current) => [...current, json.url as string]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (submitting || !universe || !couleur) return;
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        sector: "fivem",
        ambiance: {
          universe: "",
          chips: [],
          references,
          styleAnswers: { universe, energie, modernite, couleur },
        },
        palette: [],
      });
      router.push(`/dashboard/projects/${project.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col px-4 py-8 sm:px-6 lg:py-12">
      {/* Barre de progression */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between">
          <p className="pv-label text-[color:var(--num-color)]">Nouveau projet — moteur FiveM</p>
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
                Comment s&apos;appelle ton serveur&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Ce nom sera dessiné dans chaque visuel — lettre par lettre, sans faute.
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && canContinue) go(1); }}
                placeholder="Horizon RP"
                maxLength={60}
                className="pv-glass mt-8 w-full rounded-2xl border border-[color:var(--hairline-strong)] px-6 py-5 text-[clamp(1.3rem,2.4vw,1.8rem)] font-medium tracking-[-0.01em] text-ink outline-none transition-shadow placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(184,161,232,0.35)]"
              />
              <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-dusk">
                {name.trim().length}/60 — 2 caractères minimum
              </p>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Ton serveur, c&apos;est quel univers&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Une réponse suffit — le moteur en déduit toute la direction artistique.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {UNIVERSES.map((item) => {
                  const selected = universe === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUniverse(item.id)}
                      className={cn(
                        "group flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300",
                        selected
                          ? "border-[rgba(184,161,232,0.65)] bg-white/5 shadow-[0_0_0_1px_rgba(184,161,232,0.4),0_14px_36px_rgba(0,0,0,0.48)]"
                          : "border-[color:var(--hairline-strong)] hover:border-[rgba(184,161,232,0.4)]"
                      )}
                    >
                      {/* Picto dessiné — jamais une image générée */}
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/5"
                        style={{ background: `${item.tint}1A`, color: item.tint }}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[14.5px] font-medium text-ink">{item.label}</span>
                          {selected ? <Check size={15} className="shrink-0 text-[color:var(--num-color)]" /> : null}
                        </span>
                        <span className="mt-1 block text-[11.5px] leading-relaxed text-steel">{item.detail}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                L&apos;énergie&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Glisse le curseur là où ton serveur se reconnaît.
              </p>
              <div className="pv-glass mt-10 rounded-2xl border border-[color:var(--hairline-strong)] px-6 py-8">
                <div className="flex items-baseline justify-between">
                  <span className={cn("text-[15px] font-medium transition-colors", energie < 50 ? "text-ink" : "text-mist")}>Élégant</span>
                  <span className={cn("text-[15px] font-medium transition-colors", energie >= 50 ? "text-ink" : "text-mist")}>Agressif</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={energie}
                  onChange={(e) => {
                    setEnergie(Number(e.target.value));
                    setEnergieTouched(true);
                  }}
                  className="mt-4 w-full accent-[#7C6BD4]"
                  aria-label="Curseur énergie, d'élégant à agressif"
                />
                <p className="mt-4 text-center font-mono text-[11px] tracking-[0.08em] text-dusk">
                  {!energieTouched
                    ? "Touche le curseur — même pour le laisser au centre"
                    : energie < 25 ? "Feutré, précis, sûr de lui"
                    : energie < 50 ? "Élégant, avec du caractère"
                    : energie < 75 ? "Percutant, ça avance"
                    : "Frontal, ça ne demande pas la permission"}
                </p>
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Plutôt&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                L&apos;époque de ta direction artistique.
              </p>
              <div className="pv-glass mt-10 rounded-2xl border border-[color:var(--hairline-strong)] px-6 py-8">
                <div className="flex items-baseline justify-between">
                  <span className={cn("text-[15px] font-medium transition-colors", modernite < 50 ? "text-ink" : "text-mist")}>Classique</span>
                  <span className={cn("text-[15px] font-medium transition-colors", modernite >= 50 ? "text-ink" : "text-mist")}>Moderne</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={modernite}
                  onChange={(e) => {
                    setModernite(Number(e.target.value));
                    setModerniteTouched(true);
                  }}
                  className="mt-4 w-full accent-[#7C6BD4]"
                  aria-label="Curseur époque, de classique à moderne"
                />
                <p className="mt-4 text-center font-mono text-[11px] tracking-[0.08em] text-dusk">
                  {!moderniteTouched
                    ? "Touche le curseur — même pour le laisser au centre"
                    : modernite < 25 ? "Héritage, matière, patine"
                    : modernite < 50 ? "Classique bien coupé"
                    : modernite < 75 ? "Actuel, net, affûté"
                    : "Résolument moderne"}
                </p>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Une couleur qui doit dominer&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Elle guidera l&apos;étalonnage de chaque visuel du projet.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {COLOR_SWATCHES.map((hex) => {
                  const selected = couleur === hex;
                  return (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setCouleur(hex)}
                      aria-label={`Couleur ${hex}`}
                      className={cn(
                        "relative h-14 w-14 rounded-full border-2 transition-all duration-200",
                        selected ? "scale-110 border-ink shadow-[0_6px_18px_rgba(0,0,0,0.6)]" : "border-black/10 hover:scale-105"
                      )}
                      style={{ background: hex }}
                    >
                      {selected ? (
                        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          <Check size={18} strokeWidth={2.6} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCouleur("surprise")}
                  className={cn(
                    "flex h-14 items-center gap-2 rounded-full border-2 px-5 text-[13px] font-medium transition-all duration-200",
                    couleur === "surprise"
                      ? "scale-105 border-ink bg-white/5 text-ink shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
                      : "border-[color:var(--hairline-strong)] text-steel hover:border-[rgba(184,161,232,0.5)] hover:text-ink"
                  )}
                >
                  <Sparkles size={15} className="text-[color:var(--num-color)]" />
                  Surprends-moi
                </button>
              </div>
            </section>
          ) : null}

          {step === 5 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Des références à nous montrer&nbsp;? <span className="text-mist">(facultatif)</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Un logo que tu aimes, une bannière qui t&apos;inspire — le moteur s&apos;en imprègne.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {references.map((url) => (
                  <span key={url} className="relative h-20 w-20 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setReferences((c) => c.filter((r) => r !== url))}
                      className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-[#060606]"
                      aria-label="Retirer la référence"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
                {references.length < 3 ? (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-[color:var(--hairline-strong)] text-dusk transition-colors hover:border-[rgba(184,161,232,0.5)] hover:text-ink"
                    aria-label="Ajouter une référence"
                  >
                    {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  </button>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleReferenceUpload(file);
                    e.target.value = "";
                  }}
                />
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
          onClick={() => (step === 0 ? router.push("/dashboard") : go(-1))}
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ArrowLeft size={15} />
          {step === 0 ? "Annuler" : "Retour"}
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
          <button
            type="button"
            disabled={!canContinue || submitting}
            onClick={handleSubmit}
            className="pv-btn"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Créer le projet
          </button>
        )}
      </div>
    </div>
  );
}
