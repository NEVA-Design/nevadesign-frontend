"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  Download,
  Eye,
  Layers3,
  Loader2,
  Maximize2,
  Paintbrush,
  ScanFace,
  Sparkles,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";

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

const MODES: Array<{
  id: EnhanceMode;
  label: string;
  icon: typeof Sparkles;
  color: string;
  description: string;
}> = [
  {
    id: "polish",
    label: "Neva Polish",
    icon: Sparkles,
    color: "#FF7B4B",
    description: "Faithful upscale with subtle clarity and clean light correction.",
  },
  {
    id: "luxury",
    label: "Neva Luxury",
    icon: Crown,
    color: "#FFD166",
    description: "Darker premium contrast, restrained warm grade, no heavy effects.",
  },
  {
    id: "marketing",
    label: "Neva Marketing",
    icon: BadgeCheck,
    color: "#4ADE80",
    description: "Cleaner hierarchy and promo contrast without changing the image.",
  },
  {
    id: "character_restore",
    label: "Neva Character Restore",
    icon: ScanFace,
    color: "#FF6B7D",
    description: "Soft face/detail recovery with tattoos and accessories preserved.",
  },
  {
    id: "studio_finish",
    label: "Neva Studio Finish",
    icon: WandSparkles,
    color: "#A78BFA",
    description: "Senior Photoshop finish with subtle depth, light and color cleanup.",
  },
];

const UPSCALES: Array<{ id: UpscaleTarget; label: string; detail: string }> = [
  { id: "2k", label: "2K", detail: "clean upscale" },
  { id: "4k", label: "4K", detail: "poster detail" },
  { id: "8k", label: "8K", detail: "master finish" },
];

const OPTIONS = [
  { id: "upscaling", label: "Image upscaling" },
  { id: "face_restoration", label: "Face restoration" },
  { id: "character_preservation", label: "Character preservation" },
  { id: "lighting", label: "Lighting enhancement" },
  { id: "shadows", label: "Shadow refinement" },
  { id: "color_grading", label: "Color grading" },
  { id: "depth", label: "Depth enhancement" },
  { id: "marketing_polish", label: "FiveM marketing polish" },
  { id: "luxury_branding", label: "Luxury branding enhancement" },
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
      setError("Format non supporté. Utilise PNG, JPG ou WEBP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Ton image est trop lourde. Compresse-la ou utilise une image plus légère.");
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
      const res = await fetch("/api/enhance-image", {
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
    <div className="mx-auto min-h-full max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
      <ModuleHeader
        icon={WandSparkles}
        eyebrow="Neva Enhance"
        title="Récupérez une qualité professionnelle sans refaire votre visuel"
        description="Importez l'image, choisissez le rendu, comparez avant/après, puis exportez."
        accent="#FFD166"
        meta={`2 créations · ${userPlan}`}
        activeStep={activeStep}
        steps={[
          { label: "Importer", detail: "Visuel source" },
          { label: "Choisir", detail: activeMode.label },
          { label: "Exporter", detail: "Avant / après" },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <section className="rounded-[16px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <div className="border-b border-white/[0.05] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E8]">
              <Layers3 size={14} className="text-[#FF7B4B]" />
              Workflow
            </div>
          </div>

          <div className="space-y-5 p-4">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#444]">1. Importer</label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] p-3 text-left transition-all hover:border-[#FF7B4B]/40 hover:bg-white/[0.04]"
              >
                {sourceImage ? (
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/[0.08]">
                    <Image src={sourceImage.preview} alt="Source" fill sizes="56px" className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    <Upload size={18} className="text-[#555] group-hover:text-[#FF7B4B]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-[#F5F0E8]">
                    {sourceImage ? "Visuel chargé" : "Ajouter un visuel"}
                  </div>
                  <div className="mt-0.5 text-xs text-[#555]">
                    Poster, bannière, screenshot ou personnage. La composition reste intacte.
                  </div>
                </div>
                <ArrowRight size={13} className="text-[#333] group-hover:text-[#FF7B4B]" />
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={event => handleUpload(event.target.files)}
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#444]">2. Choisir le rendu</label>
              <div className="grid gap-2">
                {MODES.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      mode === item.id
                        ? "border-white/[0.16] bg-white/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                    }`}
                  >
                    <item.icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: item.color }} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#F5F0E8]">{item.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#555]">{item.description}</span>
                    </span>
                    {mode === item.id && <Check size={13} className="ml-auto mt-0.5 flex-shrink-0 text-[#4ADE80]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#444]">Upscale</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {UPSCALES.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setUpscale(item.id)}
                      className={`rounded-lg border px-3 py-2 text-left transition-all ${
                        upscale === item.id
                          ? "border-[#FF7B4B]/45 bg-[#FF7B4B]/10 text-[#FF7B4B]"
                          : "border-white/[0.06] bg-white/[0.02] text-[#666] hover:text-[#CCCCC0]"
                      }`}
                    >
                      <span className="block text-xs font-bold">{item.label}</span>
                      <span className="text-[10px] opacity-60">{item.detail}</span>
                    </button>
                  ))}
                </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#444]">Corrections</label>
              <div className="flex flex-wrap gap-1.5">
                {OPTIONS.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleOption(item.id)}
                    className={`rounded-md border px-2 py-1 text-[10px] font-medium transition-all ${
                      options.includes(item.id)
                        ? "border-[#FFD166]/30 bg-[#FFD166]/10 text-[#FFD166]"
                        : "border-white/[0.06] bg-white/[0.02] text-[#444] hover:text-[#888]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#444]">Notes rapides</label>
              <textarea
                value={notes}
                onChange={event => setNotes(event.target.value)}
                rows={3}
                placeholder="Ex : garder l'ambiance sombre, préserver la voiture rouge, rendu recrutement LSPD..."
                className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-[#E8E3DB] outline-none transition-colors placeholder:text-[#333] focus:border-white/[0.16]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              variant="gradient"
              size="md"
              className="w-full"
              onClick={enhance}
              disabled={!sourceImage || loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Paintbrush size={14} />
                  Améliorer le visuel
                </>
              )}
            </Button>
          </div>
        </section>

        <section className="min-h-[620px] rounded-[16px] border border-white/[0.08] bg-[#0c0c0c] shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F0E8]">
              <Eye size={14} className="text-[#FF7B4B]" />
              Aperçu avant / après
            </div>
            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBetterResultGuide((value) => !value)}
                  className="rounded-lg border border-white/[0.09] px-3 py-1.5 text-xs text-[#CCCCC0] transition-all hover:text-[#F5F0E8]"
                >
                  Je ne suis pas satisfait
                </button>
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-1.5 rounded-lg border border-[#FF7B4B]/25 bg-[#FF7B4B]/10 px-3 py-1.5 text-xs font-medium text-[#FF7B4B] transition-all hover:bg-[#FF7B4B]/20"
                >
                  <Download size={12} />
                  Télécharger
                </button>
              </div>
            )}
          </div>

          {showBetterResultGuide && (
            <div className="border-b border-white/[0.05] px-4 py-4">
              <div className="mb-3 text-sm font-semibold text-[#F5F0E8]">Comment obtenir un meilleur résultat</div>
              <div className="grid gap-2 text-xs leading-relaxed text-[#777] sm:grid-cols-2">
                {[
                  "Utilise une image nette et évite les captures déjà compressées.",
                  "Précise ce qui doit rester intact : visage, logo, texte, composition.",
                  "Choisis un rendu léger si tu veux seulement récupérer de la qualité.",
                  "Évite les notes contradictoires avec le style de l’image source.",
                ].map((item, index) => (
                  <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <span className="mr-2 text-[#FFD166]">{index + 1}.</span>{item}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={improveEnhanceNotes}
                className="mt-3 rounded-lg border border-[#FFD166]/25 bg-[#FFD166]/10 px-3 py-2 text-xs font-medium text-[#FFD166] transition-all hover:bg-[#FFD166]/20"
              >
                Améliorer mon prompt automatiquement
              </button>
            </div>
          )}

          {sourceImage && result && (
            <div className="p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] border border-white/[0.08] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sourceImage.preview} alt="Original" className="absolute inset-0 h-full w-full object-contain" />
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={result.image} alt="Enhanced" className="h-full w-full object-contain" />
                </div>
                <div className="absolute inset-y-0 w-px bg-[#FFD166]" style={{ left: `${comparePosition}%` }} />
                <div className="absolute left-4 top-4 rounded-full border border-white/[0.12] bg-black/45 px-3 py-1 text-xs text-[#F5F0E8] backdrop-blur">Original</div>
                <div className="absolute right-4 top-4 rounded-full border border-[#FFD166]/25 bg-black/45 px-3 py-1 text-xs text-[#FFD166] backdrop-blur">Enhanced</div>
              </div>
              <input
                type="range"
                min={8}
                max={92}
                value={comparePosition}
                onChange={(event) => setComparePosition(Number(event.target.value))}
                className="mt-4 w-full accent-[#FFD166]"
                aria-label="Comparer avant apres"
              />
            </div>
          )}

          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#444]">Original</div>
              <PreviewPanel
                image={sourceImage?.preview ?? null}
                label="Upload an image to start"
                onFullscreen={() => setFullscreen("source")}
              />
            </div>
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#444]">Enhanced</div>
              <PreviewPanel
                image={result?.image ?? null}
                label={loading ? "Amélioration visible en cours..." : "Le rendu amélioré apparaît ici"}
                loading={loading}
                onFullscreen={() => setFullscreen("result")}
              />
              {result && (
                <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3 text-[11px] text-[#777]">
                  <div className="mb-1 text-xs font-semibold text-[#CCCCC0]">Dimensions</div>
                  Avant : {result.originalWidth} × {result.originalHeight}<br />
                  Après : <span className="text-[#FFD166]">{result.width} × {result.height}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/[0.05] p-4 sm:grid-cols-4">
            {[
              ["Upscale", "Agrandissement propre jusqu'au master 8K."],
              ["Correction", "Lumiere, contraste et micro-defauts stabilises."],
              ["Nettete", "Details lisibles sans casser l'identite source."],
              ["Couleurs", "Grade chaud, premium et exploitable en marketing."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-3">
                <div className="mb-1 text-xs font-semibold text-[#CCCCC0]">{title}</div>
                <div className="text-[11px] leading-relaxed text-[#555]">{body}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setFullscreen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullscreen === "source" ? sourceImage?.preview : result?.image}
            alt="Full screen preview"
            className="max-h-full max-w-full object-contain"
            onClick={event => event.stopPropagation()}
          />
          <button
            onClick={() => setFullscreen(null)}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white transition-all hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>
      )}
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
      <div className="flex aspect-[4/3] min-h-[260px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#080808]">
        <div className="flex flex-col items-center gap-3 text-center">
          {loading ? (
            <Loader2 size={24} className="animate-spin text-[#FF7B4B]" />
          ) : (
            <Upload size={24} className="text-[#333]" />
          )}
          <div className="max-w-[220px] text-sm text-[#444]">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onFullscreen}
      className="group relative block w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#080808]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={label} className="h-auto w-full object-contain" />
      <span className="absolute right-3 top-3 rounded-lg bg-black/45 p-1.5 text-white/70 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Maximize2 size={13} />
      </span>
    </button>
  );
}
