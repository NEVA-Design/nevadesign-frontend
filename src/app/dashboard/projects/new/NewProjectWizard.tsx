"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, X } from "lucide-react";
import { backendFetch } from "@/lib/api/backend-client";
import { createProject } from "@/lib/api/projects";
import { cn } from "@/lib/utils";

/*
 * Wizard de création de projet — une question par écran, cartes
 * illustrées, barre de progression fine, retour toujours possible.
 * Trois écrans : nom du serveur → secteur → ambiance. Aucun champ
 * « prompt » : l'univers se décrit en une phrase, trois exemples
 * cliquables amorcent la plume.
 */

const SECTORS = [
  {
    id: "fivem",
    label: "FiveM",
    detail: "Serveurs GTA RP — logos, bannières, loading screens",
    image: "/postergrandfivem.webp",
    active: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    detail: "Miniatures et habillage de chaîne",
    image: "/ordi.webp",
    active: false,
  },
  {
    id: "marques",
    label: "Marques",
    detail: "Identités et campagnes produit",
    image: "/poser.webp",
    active: false,
  },
  {
    id: "evenementiel",
    label: "Événementiel",
    detail: "Affiches et communication d'événements",
    image: "/affiche2.webp",
    active: false,
  },
] as const;

const AMBIANCE_CHIPS = ["Luxe", "Street", "Cartel", "Été", "Sombre", "Néon", "Rétro", "Militaire"];

const UNIVERSE_EXAMPLES = [
  "Serveur whitelist exigeant, ambiance cartel et nuits chaudes de Los Santos",
  "RP français sérieux, économie réaliste, esthétique premium sombre",
  "Freeroam estival — jetski, plage de Vespucci et couleurs saturées",
];

const STEPS = ["Nom", "Secteur", "Ambiance"] as const;

export default function NewProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [name, setName] = useState("");
  const [sector, setSector] = useState<string>("fivem");
  const [universe, setUniverse] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canContinue =
    step === 0 ? name.trim().length >= 2 : step === 1 ? sector === "fivem" : universe.trim().length >= 8;

  function go(delta: number) {
    setError(null);
    setDirection(delta);
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + delta)));
  }

  function toggleChip(chip: string) {
    setChips((current) =>
      current.includes(chip)
        ? current.filter((c) => c !== chip)
        : current.length >= 3
          ? current
          : [...current, chip]
    );
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
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const project = await createProject({
        name: name.trim(),
        sector,
        ambiance: { universe: universe.trim(), chips, references },
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
          <p className="pv-label text-[color:var(--num-color)]">Nouveau projet</p>
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
                Comment s&apos;appelle votre serveur&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Ce nom signera chaque création du projet — il reste modifiable.
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && canContinue) go(1); }}
                placeholder="Horizon RP"
                maxLength={60}
                className="pv-glass mt-8 w-full rounded-2xl border border-[color:var(--hairline-strong)] px-6 py-5 text-[clamp(1.3rem,2.4vw,1.8rem)] font-medium tracking-[-0.01em] text-ink outline-none transition-shadow placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(164,139,232,0.35)]"
              />
              <p className="mt-3 font-mono text-[10px] tracking-[0.1em] text-dusk">
                {name.trim().length}/60 — 2 caractères minimum
              </p>
            </section>
          ) : null}

          {step === 1 ? (
            <section>
              <h1 className="pv-display text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-ink">
                Quel univers créez-vous&nbsp;?
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                Chaque secteur a son moteur entraîné. FiveM ouvre le bal — les autres arrivent.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {SECTORS.map((item) => {
                  const selected = sector === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!item.active}
                      onClick={() => item.active && setSector(item.id)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border text-left transition-all duration-300",
                        item.active
                          ? selected
                            ? "border-[rgba(164,139,232,0.65)] shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_18px_44px_rgba(96,84,140,0.22)]"
                            : "border-[color:var(--hairline-strong)] hover:border-[rgba(164,139,232,0.4)]"
                          : "cursor-not-allowed border-[color:var(--hairline)]"
                      )}
                    >
                      <div className="relative h-[120px] overflow-hidden">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 420px"
                          className={cn(
                            "object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            item.active ? "group-hover:scale-[1.05]" : "opacity-40 saturate-[0.3]"
                          )}
                        />
                        {!item.active ? (
                          <span className="absolute right-3 top-3 rounded-full border border-[color:var(--hairline-strong)] bg-white/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-steel backdrop-blur-sm">
                            Bientôt
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-[0_2px_8px_rgba(43,36,80,0.4)]">
                            <Check size={13} strokeWidth={2.4} />
                          </span>
                        ) : null}
                      </div>
                      <div className={cn("px-5 py-4", item.active ? "bg-white/70" : "bg-white/40")}>
                        <span className={cn("block text-[15px] font-medium", item.active ? "text-ink" : "text-mist")}>
                          {item.label}
                        </span>
                        <span className={cn("mt-1 block text-xs leading-relaxed", item.active ? "text-steel" : "text-mist")}>
                          {item.detail}
                        </span>
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
                Décrivez l&apos;ambiance en une phrase.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-steel">
                C&apos;est la boussole du moteur : chaque visuel du projet la respectera.
              </p>

              <textarea
                autoFocus
                value={universe}
                onChange={(e) => setUniverse(e.target.value)}
                placeholder="Serveur RP exigeant, ambiance cartel, nuits chaudes de Los Santos…"
                maxLength={240}
                rows={3}
                className="pv-glass mt-7 w-full resize-none rounded-2xl border border-[color:var(--hairline-strong)] px-6 py-5 text-[17px] leading-relaxed text-ink outline-none transition-shadow placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(164,139,232,0.35)]"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {UNIVERSE_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setUniverse(example)}
                    className="rounded-full border border-[color:var(--hairline-strong)] px-3.5 py-1.5 text-left text-[11px] leading-snug text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <p className="pv-label">Ambiance — 3 maximum</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AMBIANCE_CHIPS.map((chip) => {
                    const selected = chips.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200",
                          selected
                            ? "border-transparent bg-ink text-white shadow-[0_2px_10px_rgba(43,36,80,0.3)]"
                            : "border-[color:var(--hairline-strong)] text-steel hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                        )}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <p className="pv-label">Références visuelles — facultatif</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {references.map((url) => (
                    <span key={url} className="relative h-16 w-16 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setReferences((c) => c.filter((r) => r !== url))}
                        className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-white"
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
                      className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[color:var(--hairline-strong)] text-dusk transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
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
            disabled={!canContinue || submitting}
            onClick={handleSubmit}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all",
              canContinue && !submitting
                ? "bg-ink text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_24px_rgba(164,139,232,0.28)] hover:bg-[#35305E]"
                : "cursor-not-allowed bg-ink/10 text-mist"
            )}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            Créer le projet
          </button>
        )}
      </div>
    </div>
  );
}
