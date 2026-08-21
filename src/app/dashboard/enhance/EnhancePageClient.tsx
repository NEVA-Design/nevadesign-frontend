"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, Maximize2, Upload, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage, Label, Textarea } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Enhance — laboratoire de finition : panneau de réglages numéroté à
 * gauche, table lumineuse avant/après à droite. Une seule lumière :
 * violet.
 */

type EnhanceMode = "polish" | "luxury" | "marketing" | "character_restore" | "studio_finish";
type UpscaleTarget = "2k" | "4k" | "8k";

interface UploadedImage {
  data: string;
  mimeType: string;
  preview: string;
}

interface EnhanceResult {
  image: string;
  enhancedPrompt: string;
  mode: EnhanceMode;
  upscale: UpscaleTarget;
  creditsUsed: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

/* Les descriptions sont affichées à l'écran uniquement — seul l'id part vers l'API. */
const MODES: Array<{ id: EnhanceMode; label: string; description: string }> = [
  {
    id: "polish",
    label: "Neva Polish",
    description: "Agrandissement fidèle, clarté subtile et lumière proprement corrigée.",
  },
  {
    id: "luxury",
    label: "Neva Luxury",
    description: "Contraste premium plus sombre, étalonnage chaud retenu, sans effets lourds.",
  },
  {
    id: "marketing",
    label: "Neva Marketing",
    description: "Hiérarchie plus lisible et contraste promotionnel, sans altérer l'image.",
  },
  {
    id: "character_restore",
    label: "Neva Character Restore",
    description: "Récupération douce du visage et des détails, tatouages et accessoires préservés.",
  },
  {
    id: "studio_finish",
    label: "Neva Studio Finish",
    description: "Finition Photoshop senior : profondeur, lumière et couleurs nettoyées en subtilité.",
  },
];

const UPSCALES: Array<{ id: UpscaleTarget; label: string; detail: string }> = [
  { id: "2k", label: "2K", detail: "Agrandissement propre" },
  { id: "4k", label: "4K", detail: "Détail affiche" },
  { id: "8k", label: "8K", detail: "Finition master" },
];

/* Les libellés sont affichés à l'écran uniquement — seuls les ids partent vers l'API. */
const OPTIONS = [
  { id: "upscaling", label: "Agrandissement de l'image" },
  { id: "face_restoration", label: "Restauration du visage" },
  { id: "character_preservation", label: "Préservation du personnage" },
  { id: "lighting", label: "Amélioration de la lumière" },
  { id: "shadows", label: "Affinage des ombres" },
  { id: "color_grading", label: "Étalonnage des couleurs" },
  { id: "depth", label: "Renforcement de la profondeur" },
  { id: "marketing_polish", label: "Finition marketing FiveM" },
  { id: "luxury_branding", label: "Finition identité luxe" },
];

export function EnhancePageClient({ userPlan }: { userPlan: string }) {
  const [sourceImage, setSourceImage] = useState<UploadedImage | null>(null);
  const [mode, setMode] = useState<EnhanceMode>("polish");
  const [upscale, setUpscale] = useState<UpscaleTarget>("2k");
  const [options, setOptions] = useState<string[]>(OPTIONS.map(option => option.id));
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<EnhanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<"source" | "result" | null>(null);
  const [comparePosition, setComparePosition] = useState(52);
  const [showBetterResultGuide, setShowBetterResultGuide] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeMode = MODES.find(item => item.id === mode) ?? MODES[0];
  const activeStep = result ? 2 : sourceImage ? 1 : 0;

  function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Format non pris en charge. Utilisez PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Votre image est trop lourde. Compressez-la ou utilisez un fichier plus léger.");
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const preview = event.target?.result as string;
      const data = preview.split(",")[1];
      setSourceImage({ data, mimeType: file.type, preview });
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function toggleOption(id: string) {
    setOptions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  async function enhance() {
    if (!sourceImage || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await backendFetch("/enhance-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage: { data: sourceImage.data, mimeType: sourceImage.mimeType },
          mode,
          upscale,
          options,
          notes,
        }),
      });

      const data = await readApiResponse<EnhanceResult>(res);

      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function downloadImage() {
    if (!result?.image) return;
    const link = document.createElement("a");
    link.href = result.image;
    link.download = `neva-enhance-${result.mode}-${result.upscale}-${result.width}x${result.height}.webp`;
    link.click();
  }

  function improveEnhanceNotes() {
    setNotes(`${notes.trim() || "Préserve la composition source."} Garde le visage, les logos, les textes et les proportions. Nettoie la netteté, les ombres et les couleurs sans changer le style original. Aucun recadrage agressif, aucun nouveau personnage, aucun effet excessif.`);
    setShowBetterResultGuide(false);
  }

  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Halo — la profondeur de la scène */}
      <div
        aria-hidden
        className="pv-halo--violet pv-halo left-1/2 top-[-160px] h-[440px] w-[680px] -translate-x-1/2"
        style={{ opacity: 0.6 }}
      />

      <div className="relative">
        <ModuleHeader
          icon={Wand2}
          eyebrow="Neva Enhance"
          title="Récupérez une qualité professionnelle sans refaire votre visuel"
          description="Importez l'image, choisissez le rendu, comparez avant/après, puis exportez."
          accent="violet"
          meta={`2 créations · ${userPlan}`}
          activeStep={activeStep}
          steps={[
            { label: "Importer", detail: "Visuel source" },
            { label: "Choisir", detail: activeMode.label },
            { label: "Exporter", detail: "Avant / après" },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
          {/* ── Panneau de réglages ─────────────────────────────── */}
          <section className="pv-glass pv-edge rounded-2xl self-start overflow-hidden">
            <div className="flex items-baseline justify-between border-b border-[color:var(--hairline)] px-5 py-4">
              <h2 className="pv-label text-[color:var(--num-color)]">Réglages</h2>
              <span className="pv-meta">{activeMode.label}</span>
            </div>

            {/* 01 — Importer */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">01</span>
                Importer
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex min-h-[72px] w-full items-center gap-4 rounded-lg border border-dashed border-[rgba(246,243,238,0.22)] bg-abyss p-3 text-left transition-colors duration-300 hover:border-[rgba(185,167,218,0.45)]"
              >
                {sourceImage ? (
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                    <Image src={sourceImage.preview} alt="Visuel source" fill sizes="56px" className="object-cover" />
                  </span>
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[color:var(--hairline)] text-dusk transition-colors duration-300 group-hover:text-[color:var(--num-color)]">
                    <Upload size={17} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {sourceImage ? "Visuel chargé" : "Téléverser un visuel"}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-steel">
                    Affiche, bannière, capture ou personnage. La composition reste intacte.
                  </span>
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => handleUpload(event.target.files)}
              />
            </div>

            {/* 02 — Rendu */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">02</span>
                Rendu
              </p>
              <div className="grid gap-2">
                {MODES.map(item => {
                  const isActive = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      aria-pressed={isActive}
                      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors duration-300 ${
                        isActive
                          ? "border-[color:var(--color-ink)] bg-[rgba(185,167,218,0.12)]"
                          : "border-[color:var(--hairline)] hover:border-[#4A4A4A]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span
                          className={`text-[13px] font-medium ${
                            isActive ? "text-[color:var(--num-color)]" : "text-ink/80"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span
                          aria-hidden
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300 ${
                            isActive ? "bg-violet" : "bg-white/15"
                          }`}
                        />
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-steel">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 03 — Définition */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">03</span>
                Définition
              </p>
              <div className="grid grid-cols-3 gap-2">
                {UPSCALES.map(item => {
                  const isActive = upscale === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUpscale(item.id)}
                      aria-pressed={isActive}
                      className={`min-h-[56px] rounded-lg border px-3 py-2.5 text-left transition-colors duration-300 ${
                        isActive
                          ? "border-[color:var(--color-ink)] bg-[rgba(185,167,218,0.12)] text-ink"
                          : "border-[color:var(--hairline)] text-steel hover:text-ink"
                      }`}
                    >
                      <span className="block font-mono text-sm font-medium tracking-[0.06em]">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-tight opacity-70">
                        {item.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 04 — Corrections */}
            <div className="border-b border-[color:var(--hairline)] p-5">
              <p className="pv-label mb-3">
                <span className="pv-num mr-2">04</span>
                Corrections
              </p>
              <div className="flex flex-wrap gap-2">
                {OPTIONS.map(item => {
                  const isActive = options.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleOption(item.id)}
                      aria-pressed={isActive}
                      className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs transition-colors duration-300 ${
                        isActive
                          ? "border-[color:var(--color-ink)] bg-[rgba(185,167,218,0.12)] text-ink"
                          : "border-[color:var(--hairline)] text-steel hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 05 — Notes */}
            <div className="p-5">
              <Label htmlFor="enhance-notes">
                <span className="pv-num mr-2">05</span>
                Notes
              </Label>
              <Textarea
                id="enhance-notes"
                value={notes}
                onChange={event => setNotes(event.target.value)}
                rows={3}
                placeholder="Ex : garder l'ambiance sombre, préserver la voiture rouge, rendu recrutement LSPD..."
              />

              {error ? (
                <FormMessage tone="error" className="mt-4">
                  {error}
                </FormMessage>
              ) : null}

              <Button
                variant="gradient"
                size="lg"
                className="mt-4 w-full"
                onClick={enhance}
                disabled={!sourceImage || loading}
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Amélioration en cours…
                  </>
                ) : (
                  "Améliorer le visuel"
                )}
              </Button>
            </div>
          </section>

          {/* ── Table lumineuse — avant / après ─────────────────── */}
          <section className="pv-glass pv-edge rounded-2xl min-h-[620px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--hairline)] px-5 py-4">
              <h2 className="pv-label text-[color:var(--num-color)]">Aperçu avant / après</h2>
              {result ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="min-h-[40px]"
                    onClick={() => setShowBetterResultGuide(value => !value)}
                  >
                    Je ne suis pas satisfait
                  </Button>
                  <Button size="sm" className="min-h-[40px]" onClick={downloadImage}>
                    <Download size={12} />
                    Télécharger
                  </Button>
                </div>
              ) : null}
            </div>

            {showBetterResultGuide ? (
              <div className="border-b border-[color:var(--hairline)] px-5 py-5">
                <p className="pv-display mb-4 text-lg text-ink">Comment obtenir un meilleur résultat</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Utilisez une image nette et évitez les captures déjà compressées.",
                    "Précisez ce qui doit rester intact : visage, logo, texte, composition.",
                    "Choisissez un rendu léger pour simplement récupérer de la qualité.",
                    "Évitez les notes contradictoires avec le style de l'image source.",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="rounded-lg border border-[color:var(--hairline)] bg-abyss p-3 text-xs leading-relaxed text-steel"
                    >
                      <span className="pv-num mr-2">0{index + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
                <Button variant="secondary" size="sm" className="mt-4 min-h-[40px]" onClick={improveEnhanceNotes}>
                  Améliorer mon prompt automatiquement
                </Button>
              </div>
            ) : null}

            {sourceImage && result ? (
              <div className="border-b border-[color:var(--hairline)] p-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceImage.preview}
                    alt="Image d'origine"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.image}
                      alt="Image améliorée"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-violet"
                    style={{ left: `${comparePosition}%` }}
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-[color:var(--hairline-strong)] bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/80">
                    Avant
                  </span>
                  <span className="absolute right-4 top-4 rounded-full border border-[rgba(185,167,218,0.35)] bg-ink/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--num-color)]">
                    Après
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={92}
                  value={comparePosition}
                  onChange={event => setComparePosition(Number(event.target.value))}
                  className="mt-4 h-6 w-full cursor-ew-resize accent-violet"
                  aria-label="Comparer l'avant et l'après"
                />
              </div>
            ) : null}

            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div>
                <p className="pv-label mb-3">Source</p>
                <PreviewPanel
                  image={sourceImage?.preview ?? null}
                  label="Téléversez une image pour commencer"
                  onFullscreen={() => setFullscreen("source")}
                />
              </div>
              <div>
                <p className="pv-label mb-3">Résultat</p>
                <PreviewPanel
                  image={result?.image ?? null}
                  label={loading ? "Amélioration visible en cours…" : "Le rendu amélioré apparaît ici"}
                  loading={loading}
                  onFullscreen={() => setFullscreen("result")}
                />
                {result ? (
                  <dl className="mt-3 flex items-baseline justify-between gap-4 rounded-lg border border-[color:var(--hairline)] bg-abyss px-4 py-3">
                    <div>
                      <dt className="pv-label">Avant</dt>
                      <dd className="mt-1 font-mono text-[13px] text-steel">
                        {result.originalWidth} × {result.originalHeight}
                      </dd>
                    </div>
                    <span aria-hidden className="h-6 w-px bg-[color:var(--hairline-strong)]" />
                    <div className="text-right">
                      <dt className="pv-label">Après</dt>
                      <dd className="mt-1 font-mono text-[13px] text-[color:var(--num-color)]">
                        {result.width} × {result.height}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </div>
            </div>

            {/* Promesses du module — bandeau en filets */}
            <div className="grid border-t border-[color:var(--hairline)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[color:var(--hairline)]">
              {[
                ["Upscale", "Agrandissement propre jusqu'au master 8K."],
                ["Correction", "Lumière, contraste et micro-défauts stabilisés."],
                ["Netteté", "Détails lisibles sans casser l'identité source."],
                ["Couleurs", "Étalonnage chaud, premium et exploitable en campagne."],
              ].map(([title, body]) => (
                <div key={title} className="border-b border-[color:var(--hairline)] px-5 py-4 lg:border-b-0">
                  <p className="pv-label text-[color:var(--num-color)]">{title}</p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-steel">{body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Plein écran */}
      {fullscreen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,23,55,0.94)] p-4"
          onClick={() => setFullscreen(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreen === "source" ? sourceImage?.preview : result?.image}
            alt="Aperçu plein écran"
            className="pv-scale-in max-h-full max-w-full object-contain"
            onClick={event => event.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setFullscreen(null)}
            aria-label="Fermer l'aperçu plein écran"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] bg-white/5 text-ink/70 transition-colors duration-300 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PreviewPanel({
  image,
  label,
  loading,
  onFullscreen,
}: {
  image: string | null;
  label: string;
  loading?: boolean;
  onFullscreen: () => void;
}) {
  if (!image) {
    return (
      <div className="flex aspect-[4/3] min-h-[260px] items-center justify-center rounded-xl border border-dashed border-[rgba(246,243,238,0.22)] bg-abyss">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          {loading ? (
            <Spinner />
          ) : (
            <Upload size={20} className="text-ink/25" />
          )}
          <p className="max-w-[220px] text-sm text-steel">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onFullscreen}
      aria-label="Afficher en plein écran"
      className="group relative block w-full overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-abyss transition-colors duration-300 hover:border-[#4A4A4A]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={label} className="h-auto w-full object-contain" />
      <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] bg-ink/60 text-ink/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Maximize2 size={13} />
      </span>
    </button>
  );
}
