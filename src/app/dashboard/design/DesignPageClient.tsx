"use client";
import { useState, useRef, useEffect } from "react";
import {
  Palette, ArrowRight, Sparkles, Download, Copy, Check, Loader2,
  Upload, X, ChevronDown, ChevronRight, ChevronLeft, Maximize2, Lock, Eye, EyeOff,
  RefreshCw, Settings2, ImageIcon, BookUser, Trash2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_MODELS, RESOLUTION_OPTIONS, type ImageModel } from "@/lib/ai/models";
import { ASPECT_RATIOS as BASE_ASPECT_RATIOS } from "@/lib/ai/aspect-ratios";
import { readApiResponse } from "@/lib/api/client";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_HIERARCHY: Record<string, number> = { free: 0, creator: 1, studio: 2, pro: 3 };

function canUseModel(userPlan: string, requiredPlan: string | null): boolean {
  if (!requiredPlan) return true;
  return (PLAN_HIERARCHY[userPlan] ?? 0) >= (PLAN_HIERARCHY[requiredPlan] ?? 99);
}

function normalizeResolutionForModel(resolution: string, model: ImageModel) {
  if (resolution === "4k" && model.maxResolution !== "4K") return "hd";
  if (resolution === "2k" && model.maxResolution === "HD") return "hd";
  return resolution;
}

const ASPECT_RATIOS = BASE_ASPECT_RATIOS.map((ratio) => ({
  id: ratio.id,
  label: ratio.label,
  apiValue: ratio.id,
  w: ratio.w,
  h: ratio.h,
  dashed: false,
}));

const RATIO_COPY: Record<string, string> = {
  "1:1": "Square image",
  "4:3": "Landscape image",
  "16:9": "Widescreen image",
  "3:4": "Portrait image",
  "9:16": "TikTok image",
};

const REFERENCE_USAGE_OPTIONS = [
  { id: "auto",        label: "Auto" },
  { id: "character",   label: "Personnage" },
  { id: "pose",        label: "Pose" },
  { id: "outfit",      label: "Tenue" },
  { id: "style",       label: "Style visuel" },
  { id: "environment", label: "Décor" },
];

const ENHANCEMENT_MODES = [
  { id: "light",    label: "Léger",      description: "Correction propre — intention intacte, effets limités" },
  { id: "director", label: "Directeur",  description: "Premium sobre — caméra, lumière motivée, profondeur" },
  { id: "full",     label: "Marketing",  description: "Brief complet — hiérarchie, impact, finition FiveM" },
];

const RENDER_COUNTS = [
  { value: 1 as const,  label: "1×" },
  { value: 3 as const,  label: "3×" },
  { value: 4 as const,  label: "4×" },
];

const STYLE_PRESETS = [
  { label: "Luxury", color: "#FFD166" },
  { label: "Street", color: "#FF7B4B" },
  { label: "Cartel", color: "#FF6B7D" },
  { label: "Miami", color: "#38BDF8" },
  { label: "Corporate", color: "#BBA7FF" },
  { label: "FiveM", color: "#55D18A" },
];

const MAX_REFERENCE_IMAGES = 6;

type UploadedReferenceImage = {
  id: string;
  data: string;
  mimeType: string;
  preview: string;
  name: string;
};

const TEMPLATES = [
  { name: "Poster Recrutement", tag: "Poster", prompt: "Personnage FiveM en tenue de chef de gang, posture dominante bras croisés, skyline de Los Santos au coucher du soleil en arrière-plan flouté, ambiance cinématique sombre premium, éclairage latéral chaud, photo promotionnelle serveur sérious RP" },
  { name: "Bannière Discord", tag: "Social", prompt: "Bannière serveur FiveM, personnage en costume sombre debout face à la skyline nocturne de Downtown LS, lumière ambiante naturelle, format horizontal ultra-wide, style éditorial magazine, qualité publicité haut de gamme" },
  { name: "Staff LSPD", tag: "Recrutement", prompt: "Officier de police LSPD en tenue complète, debout au crépuscule devant la Maze Bank Arena, lumière dorée latérale, posture professionnelle et confiante, éclairage rim-light arrière, fond de ville flouté en bokeh" },
  { name: "Lifestyle Luxe", tag: "Lifestyle", prompt: "Personnage FiveM en tenue de luxe devant une Ferrari rouge à la marina de Los Santos, superyacht en arrière-plan, lumière golden hour, composition éditoriale GQ, profondeur de champ, style publicité automobile premium" },
  { name: "Loading Screen", tag: "FiveM", prompt: "Loading screen FiveM widescreen 16:9, scène cinématique de Los Santos au lever du jour, personnage de dos face à la skyline, lumière matinale brumeuse, atmosphère premium, aucun texte, rendu photoréaliste" },
  { name: "Cover Tebex", tag: "Store", prompt: "Cover boutique Tebex FiveM, personnage centré en tenue emblématique, fond urbain Los Santos légèrement flouté, éclairage studio naturel chaud, composition packshot commercial, mise en valeur du costume" },
];

const PROMPT_EXAMPLES = [
  {
    label: "Perso référence — Beach club luxe",
    tag: "Référence · Beach",
    accentColor: "#34D399",
    ratio: "3:4",
    prompt: `Use my uploaded character as the exact subject. Preserve the exact face, hairstyle, makeup, skin tone, body proportions, clothing style and overall identity. Do not redesign or alter the character.

The character is lying comfortably on a luxury sun lounger beside a high-end beach club in Los Santos. Relaxed pose, one arm resting naturally, enjoying the warm California sun. Premium lifestyle atmosphere.

Beautiful Los Santos beachfront environment, crystal blue water, palm trees gently moving in the background, luxury beach umbrellas, elegant outdoor lounge furniture, subtle high-end resort details. Realistic GTA V / FiveM environment.

Camera angle slightly above and to the side of the sun lounger, capturing the character as the clear focal point while showcasing the surrounding luxury beach atmosphere. Strong foreground, midground and background separation.

Bright natural daylight, warm sunlight, realistic shadows, soft reflections, premium summer mood, vibrant but realistic colors. Luxury lifestyle storytelling, relaxed vacation energy, aspirational social media campaign quality.

Professional commercial advertising quality, realistic photography, high-end FiveM marketing artwork, cinematic realism, natural skin tones, realistic materials, ultra detailed, sharp focus, depth of field, 4K quality.`,
  },
  {
    label: "Chef de gang — poster recrutement",
    tag: "Réaliste · Portrait",
    accentColor: "#FF7B4B",
    ratio: "9:16",
    prompt: `FiveM gang leader character, sharp dark designer suit, gold chain, confident dominant stance with arms crossed. Strong commanding presence, masculine authority energy. No redesign — exactly as described.

Standing at the edge of a rooftop above Downtown Los Santos, city skyline stretching behind. Urban luxury environment with premium architectural details. Realistic GTA V atmosphere, Vinewood Hills in the distance.

Camera at slight low angle looking up at the character, positioning them as dominant in frame. Character centered, skyline visible below and behind. Negative space in the upper portion for potential text overlay.

Dramatic sunset lighting, warm golden rays from the left side, cool blue rim light from behind separating subject from background. Cinematic depth of field, background softly defocused with city lights.

Premium FiveM promotional artwork, Rockstar Editor inspired cinematic realism, ultra detailed, sharp focus, no neon, no cyberpunk, no glow effects, 4K quality, high-end server recruitment poster.`,
  },
  {
    label: "Loading screen — lever du soleil panoramique",
    tag: "Loading Screen · 16:9",
    accentColor: "#FFD166",
    ratio: "16:9",
    prompt: `Lone FiveM character standing with their back to the camera, facing the breathtaking Los Santos skyline at dawn. Strong hero silhouette against the morning sky, cinematic composition, powerful and solitary.

Panoramic view of Downtown Los Santos at sunrise — golden morning light breaking over the skyscrapers, soft morning mist in the valleys, Maze Bank Tower and surrounding buildings catching the first light. Epic and atmospheric.

Ultra wide cinematic framing, character positioned in the lower third of the frame, skyline dominating the upper two thirds. Strong horizontal composition, designed for widescreen 16:9 FiveM loading screen.

Warm golden hour sunrise lighting, mist catching the light, realistic atmospheric perspective, long shadows, rays of sunlight piercing through the buildings. Premium cinematic mood, no artificial glow.

Rockstar Editor quality, photoreal GTA V environment, ultra detailed, no text, no UI, no watermark, loading screen ready, sharp focus, dramatic depth, 4K cinematic quality.`,
  },
  {
    label: "Staff LSPD — recrutement officier",
    tag: "Police · Recrutement",
    accentColor: "#60A5FA",
    ratio: "9:16",
    prompt: `Professional LSPD officer in full tactical uniform — duty belt, badge, patrol cap, dark aviator sunglasses. Upright posture, calm authority, institutional confidence. Representing the Los Santos police force with dignity and professionalism.

Standing in front of the LSPD headquarters at dusk, patrol cars visible in the background, the building's architecture framing the subject. Official, structured, authoritative environment.

Slightly low camera angle reinforcing authority and status, character centered in frame, eyes forward, strong and composed. Background elements visible but clearly secondary to the subject.

Warm amber dusk lighting from the right, cool blue fill from the opposite side, subtle rim light from behind creating clean separation from background. No artificial neon. Natural motivated lighting only.

Professional law enforcement photography quality, FiveM recruitment poster standard, high detail on uniform and badge, sharp subject, soft background bokeh, cinematic realism, 4K quality.`,
  },
  {
    label: "Lifestyle luxe — marina supercar",
    tag: "Luxe · Editorial",
    accentColor: "#FFB5C8",
    ratio: "3:4",
    prompt: `Elegant FiveM character in tailored dark suit, luxury watch visible, relaxed confident posture leaning against a matte black Lamborghini Huracán. Aspirational lifestyle energy — successful, composed, untouchable.

Los Santos Marina at golden hour — luxury yachts docked in the background, calm water reflecting the warm sky, other premium cars subtly visible. Premium Vinewood Hills lifestyle atmosphere, wealth without excess.

Camera at eye level, slightly to the side, capturing both the character and the car in a classic automotive editorial composition. Character clearly dominant in frame, the car as supporting lifestyle prop.

Rich golden hour light from the right, warm specular highlights on the car's bodywork, soft reflections on the marina water behind. Shallow depth of field, premium automobile advertising feel.

High-end automotive editorial quality, GQ magazine standard, luxury lifestyle advertising, cinematic depth of field, ultra detailed materials, natural skin tones, no neon, no glow, 4K quality, commercial ready.`,
  },
  {
    label: "Beach lifestyle — Vespucci été",
    tag: "Beach · Lifestyle",
    accentColor: "#38BDF8",
    ratio: "1:1",
    prompt: `FiveM character in stylish casual summer outfit — open linen shirt, sunglasses, relaxed natural posture, genuine expression. Authentic lifestyle energy, not stiff or overly posed.

Vespucci Beach, Los Santos — white sand, crystal clear Pacific blue water in the background, swaying palm trees, beach life in the distance. Vibrant and authentic Los Santos summer atmosphere.

Character positioned using the rule of thirds, ocean and beach stretch visible around them. Golden hour warm light illuminating the scene from a low, flattering angle. Square format, balanced composition.

Warm natural golden hour sunlight, long soft shadows across the sand, sun catching the character from a flattering angle. Vibrant saturated warm colors, joyful and aspirational summer mood.

Lifestyle photography quality, summer campaign standard, warm color grading, authentic human feel, sharp focus, natural skin tones, ultra detailed, commercial advertising quality, 4K.`,
  },
  {
    label: "Mécano — workshop Benny's",
    tag: "Mécano · Authentique",
    accentColor: "#F59E0B",
    ratio: "9:16",
    prompt: `Skilled FiveM mechanic character in authentic worn work overalls, subtle oil stains, confident no-nonsense energy. Casually resting against his work or holding a wrench. Real craftsman vibe — pride in his work.

Benny's Original Motor Works interior, Los Santos — overhead LED work lights, tools hanging on the wall, a partially disassembled muscle car in the background. Industrial workshop atmosphere, authentic car culture.

Camera at mid-level, slightly to the side. Character in clear foreground, workshop environment framing them naturally behind. Negative space at top for potential server name overlay.

Warm industrial overhead lighting with practical work lights, strong directional shadows on the floor. Realistic mixed color temperature — warm yellows from incandescent bulbs, cool fill from the open garage door. No neon, no cyberpunk.

Authentic automotive editorial quality, FiveM workshop marketing, ultra detailed, sharp focus on character and immediate foreground, natural color grading, no artificial effects, 4K quality.`,
  },
  {
    label: "Cartoon — personnage stylisé illustré",
    tag: "Cartoon · Artwork",
    accentColor: "#A78BFA",
    ratio: "1:1",
    prompt: `FiveM character rendered in a professional cartoon / anime illustration style. Clean bold outlines, cel-shading technique, vibrant flat color fills. Dynamic energetic pose full of personality. The character feels like they belong in a premium animated series or game splash screen.

Stylized Los Santos urban environment as background — simplified skyscrapers, bold graphic shapes, iconic city silhouette rendered in a consistent illustration style that matches the character aesthetic perfectly.

Dynamic diagonal composition, character positioned with motion energy and visual impact. Foreground and background clearly separated with style-consistent visual depth. Strong readability at any size.

Illustration-style lighting — strong directional cel-shade light source from above, bold clean shadow areas, stylized colored rim light. No photorealistic lighting or textures. Colors are bold, clean, and intentionally saturated.

Professional digital illustration quality, clean precise linework, no noise, no texture grain, no photorealism. Premium artwork standard, not generic AI art, sharp and crisp at any resolution, brand and merchandise ready.`,
  },
]

const LOADING_STEPS_ALL = [
  { label: "Analyse de la référence…",  show: (hasRef: boolean) => hasRef },
  { label: "Amélioration rapide…",      show: (hasRef: boolean, mode: string) => mode === "light" },
  { label: "Direction artistique…",     show: (hasRef: boolean, mode: string) => mode !== "light" },
  { label: "Construction du prompt…",   show: (hasRef: boolean, mode: string) => mode !== "light" },
  { label: "Génération en cours…",      show: () => true },
];

// ─── Notification helpers ─────────────────────────────────────────────────────

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const play = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset)
      gain.gain.setValueAtTime(0, ctx.currentTime + startOffset)
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + startOffset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration)
      osc.start(ctx.currentTime + startOffset)
      osc.stop(ctx.currentTime + startOffset + duration)
    }
    play(880, 0, 0.22)
    play(1318.5, 0.22, 0.28)
    setTimeout(() => ctx.close(), 700)
  } catch {
    // Web Audio not available
  }
}

function showBrowserNotification() {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('Neva Design ✦', {
      body: "Ton image est prête à télécharger !",
      icon: '/favicon.ico',
      tag: 'neva-generation',
    })
  } catch {
    // Notification not supported in this context
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DesignPageClient({ userPlan }: { userPlan: string }) {
  // Core state
  const [prompt, setPrompt] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [selectedResolution, setSelectedResolution] = useState("hd");
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(
    IMAGE_MODELS["neva-standard"] ?? Object.values(IMAGE_MODELS)[0]
  );
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  // Enhancement mode
  const [enhancementMode, setEnhancementMode] = useState<"light" | "director" | "full">("director");

  // Render count
  const [renderCount, setRenderCount] = useState<1 | 3 | 4>(1);

  // Character references (uploaded images)
  const [referenceImages, setReferenceImages] = useState<UploadedReferenceImage[]>([]);
  const [referenceUsageHint, setReferenceUsageHint] = useState<string>("auto");
  const [isDraggingReference, setIsDraggingReference] = useState(false);

  // Saved character memory
  type SavedChar = { id: string; name: string; image_preview?: string | null; role?: string | null; server?: string | null; style?: string | null };
  const [savedCharacters, setSavedCharacters] = useState<SavedChar[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<{ id: string; name: string; description: string } | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [saveCharName, setSaveCharName] = useState("");
  const [showSaveChar, setShowSaveChar] = useState(false);
  const [charSaving, setCharSaving] = useState(false);
  const [charSaveStatus, setCharSaveStatus] = useState<"idle" | "ok" | "err">("idle");
  const [showBetterResultGuide, setShowBetterResultGuide] = useState(false);

  // Advanced settings
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<string>("");

  // Generation state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<{
    images: string[];
    originalPrompt: string;
    enhancedPrompt: string;
    characterDescription: string | null;
    model: string;
    resolution: string;
    aspectRatio: string;
    creditsUsed: number;
    remainingCredits?: number;
    watermarkEnabled?: boolean;
    watermarkText?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [copied, setCopied] = useState(false);
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenIdx, setFullscreenIdx] = useState(0);
  const [upgradeModal, setUpgradeModal] = useState<{ modelName: string; requiredPlan: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasReferenceImages = referenceImages.length > 0;
  const primaryReferenceImage = referenceImages[0] ?? null;
  const activeAspectRatio = ASPECT_RATIOS.find(r => r.id === selectedAspectRatio) ?? ASPECT_RATIOS[0];
  const previewAspectStyle = { aspectRatio: `${activeAspectRatio.w} / ${activeAspectRatio.h}` };
  const isFreePlan = userPlan === "free";

  // Loading step animation
  useEffect(() => {
    if (!loading) return;
    const steps = LOADING_STEPS_ALL.filter(s => s.show(hasReferenceImages, enhancementMode));
    let i = 0;
    const delays = enhancementMode === "light"
      ? [2000, 8000, 20000]
      : [2000, 2500, 3500, 15000];
    const advance = () => {
      i++;
      if (i < steps.length) {
        setLoadingStep(i);
        setTimeout(advance, delays[i] ?? 4000);
      }
    };
    setTimeout(advance, hasReferenceImages ? 2000 : 2500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Load saved characters on mount
  useEffect(() => {
    fetch("/api/characters")
      .then(r => readApiResponse<{ characters: SavedChar[] }>(r))
      .then(d => { if (d.characters) setSavedCharacters(d.characters); })
      .catch(() => {});
  }, []);

  const saveCharacter = async () => {
    if (!primaryReferenceImage || !saveCharName.trim() || charSaving) return;
    setCharSaving(true);
    setCharSaveStatus("idle");
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveCharName.trim(),
          imageBase64: primaryReferenceImage.data,
          imageMimeType: primaryReferenceImage.mimeType,
          imagePreview: primaryReferenceImage.preview,
          metadata: {
            style: referenceUsageHint,
            role: "Design reference",
            server: "",
          },
        }),
      });
      const data = await readApiResponse<{ character: SavedChar }>(res);
      setSavedCharacters(prev => [data.character, ...prev]);
      setCharSaveStatus("ok");
      setSaveCharName("");
      setTimeout(() => { setShowSaveChar(false); setCharSaveStatus("idle"); }, 1500);
    } catch {
      setCharSaveStatus("err");
    } finally {
      setCharSaving(false);
    }
  };

  const deleteCharacter = async (id: string) => {
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    setSavedCharacters(prev => prev.filter(c => c.id !== id));
    if (selectedCharacter?.id === id) setSelectedCharacter(null);
  };

  const selectSavedCharacter = async (char: SavedChar) => {
    setShowCharPicker(false);
    const res = await fetch(`/api/characters/${char.id}`);
    const data = await readApiResponse<{ character?: { id: string; name: string; description: string } }>(res);
    if (data.character) {
      setSelectedCharacter(data.character);
      setReferenceImages([]);
      setReferenceUsageHint("character");
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_REFERENCE_IMAGES - referenceImages.length;
    if (remainingSlots <= 0) return;

    const imageFiles = Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        if (!base64) return;

        setSelectedCharacter(null);
        setReferenceImages(prev => [
          ...prev,
          {
            id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
            data: base64,
            mimeType: file.type,
            preview: dataUrl,
            name: file.name,
          },
        ].slice(0, MAX_REFERENCE_IMAGES));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePasteReference = (event: React.ClipboardEvent) => {
    const files = event.clipboardData?.files;
    if (!files || files.length === 0) return;
    const hasImage = Array.from(files).some(file => file.type.startsWith("image/"));
    if (!hasImage) return;
    event.preventDefault();
    handleFileUpload(files);
  };

  const handleDropReference = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingReference(false);
    handleFileUpload(event.dataTransfer.files);
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages(prev => {
      const next = prev.filter(image => image.id !== id);
      if (next.length === 0) {
        setReferenceUsageHint("auto");
        setShowSaveChar(false);
      }
      return next;
    });
  };

  const generate = async (customPrompt?: string) => {
    const p = customPrompt ?? prompt;
    if (!p.trim() || loading) return;

    if (!canUseModel(userPlan, selectedImageModel.requiredPlan)) {
      setUpgradeModal({ modelName: selectedImageModel.name, requiredPlan: selectedImageModel.requiredPlan! });
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    setError(null);
    setResult(null);

    try {
      const body: Record<string, unknown> = {
        prompt: p,
        aspectRatio: activeAspectRatio.apiValue,
        resolution: selectedResolution,
        imageModelId: selectedImageModel.id,
        negativePrompt: negativePrompt.trim(),
        enhancementMode,
        renderCount,
        referenceUsageHint: referenceUsageHint !== "auto" ? referenceUsageHint : undefined,
      };
      if (seed.trim()) body.seed = parseInt(seed.trim(), 10);
      if (referenceImages.length > 0) {
        body.referenceImages = referenceImages.map(image => ({ data: image.data, mimeType: image.mimeType }));
      }
      if (selectedCharacter) body.savedCharacterDescription = selectedCharacter.description;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await readApiResponse<{
        images?: string[];
        image?: string;
        error?: string;
        enhancedPrompt: string;
        originalPrompt: string;
        model: string;
        resolution: string;
        aspectRatio: string;
        creditsUsed: number;
        remainingCredits?: number;
        watermarkEnabled?: boolean;
        watermarkText?: string | null;
        characterDescription?: string | null;
      }>(res);
      const images: string[] = data.images ?? (data.image ? [data.image] : []);
      setResult({ ...data, images, characterDescription: data.characterDescription ?? null });
      setFullscreenIdx(0);
      if (typeof data.remainingCredits === "number") {
        window.dispatchEvent(new CustomEvent("neva:credits-updated", { detail: { credits: data.remainingCredits } }));
      }

      if (localStorage.getItem('neva_notif_sound') === 'true') playNotificationSound();
      if (localStorage.getItem('neva_notif_browser') === 'true') showBrowserNotification();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const improveCurrentPrompt = () => {
    const base = (prompt || result?.originalPrompt || "").trim();
    if (!base) return;
    const identity = hasReferenceImages || selectedCharacter
      ? "Use the uploaded character as the exact identity reference. Preserve the same face, hairstyle, skin tone, tattoos, body proportions, outfit identity and recognizable features. Do not redesign the character. "
      : "";
    setPrompt(`${identity}${base}. Create a realistic GTA V FiveM scene with a clear main subject, readable composition, cinematic but natural lighting, realistic shadows, premium roleplay atmosphere, and clean marketing-ready detail. Do not add text, watermarks, distorted faces, extra fingers, or a different character identity.`);
    setShowBetterResultGuide(false);
  };

  const downloadSingleImage = (src: string, idx: number = 0) => {
    const a = document.createElement("a");
    a.href = src;
    a.download = `neva-${result?.resolution ?? "hd"}-${(result?.aspectRatio ?? "1:1").replace(":", "x")}-${idx + 1}.webp`;
    a.click();
  };

  const downloadAll = () => {
    result?.images.forEach((img, i) => {
      setTimeout(() => downloadSingleImage(img, i), i * 300);
    });
  };

  const activeLoadingSteps = LOADING_STEPS_ALL.filter(s => s.show(hasReferenceImages, enhancementMode));
  const imageModelList = Object.values(IMAGE_MODELS);
  const totalCreditCost = selectedImageModel.creditCost * renderCount;
  const activeStep = result ? 2 : prompt.trim() || hasReferenceImages || selectedCharacter ? 1 : 0;

  return (
    <div className="min-h-full" onClick={() => setModelPickerOpen(false)}>
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        <ModuleHeader
          icon={Palette}
          eyebrow="Neva Design"
          title="Design Studio"
          description="Décrivez le rendu voulu, ajoutez vos références, puis lancez une génération prête à publier."
          accent="#FF7B4B"
          meta={renderCount > 1 ? `${selectedImageModel.creditCost} × ${renderCount} = ${totalCreditCost} créations` : `${totalCreditCost} création / image`}
          activeStep={activeStep}
          steps={[
            { label: "Décrire", detail: "Idée + références" },
            { label: "Régler", detail: `${selectedAspectRatio} · ${selectedResolution.toUpperCase()}` },
            { label: "Télécharger", detail: result ? `${result.images.length} rendu(s)` : "Résultat final" },
          ]}
        />

        {/* ── Header ── */}
        <div className="hidden">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF7B4B] to-[#FFD166] flex items-center justify-center">
                <Palette size={13} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-[#F5F0E8] tracking-tight">Neva Design</h1>
            </div>
            <p className="text-sm text-[#555] ml-8">Studio créatif adaptatif — 15 styles, 3 modes</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#555] bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5">
            <Sparkles size={9} className="text-[#FFD166]" />
            {renderCount > 1
              ? <><span className="text-[#888]">{selectedImageModel.creditCost} × {renderCount}</span> = <span className="text-[#F5F0E8] font-semibold">{totalCreditCost}</span> <span>créations</span></>
              : <><span className="text-[#F5F0E8] font-semibold">{totalCreditCost}</span> <span>création / image</span></>
            }
          </div>
        </div>

        {/* ── Studio Card ── */}
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[16px] border border-[#FF7B4B]/18 bg-[linear-gradient(135deg,rgba(255,123,75,0.12),rgba(255,255,255,0.025))] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#FF7B4B]">Brief de création</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-[#F5F0E8]">Créez un visuel qui donne envie de rejoindre votre serveur.</div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#A9A39B]">Un prompt clair, une référence propre, un format adapté. Le reste doit servir le rendu final.</p>
          </div>
          <div className="rounded-[16px] border border-white/[0.075] bg-white/[0.035] p-4">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#555]">Presets</div>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => (
                <button
                  key={style.label}
                  type="button"
                  onClick={() => setPrompt((current) => current ? `${current}, ${style.label} style` : `${style.label} FiveM premium visual`)}
                  className="rounded-2xl border border-white/[0.07] bg-black/20 px-3 py-2 text-left text-sm font-medium text-[#D8D1C8] transition-all hover:border-white/[0.14] hover:bg-white/[0.055]"
                >
                  <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: style.color }} />
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`mb-5 overflow-hidden rounded-[16px] border bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] shadow-[0_24px_70px_rgba(0,0,0,0.25)] transition-all ${
            isDraggingReference ? "border-[#FF7B4B]/55 ring-2 ring-[#FF7B4B]/20" : "border-white/[0.08]"
          }`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingReference(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) return;
            setIsDraggingReference(false);
          }}
          onDrop={handleDropReference}
        >

          {/* Top bar: model + resolution + mode + render count + aspect */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-0 flex-wrap">
            {/* Model picker */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setModelPickerOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[#CCCCC0] hover:border-white/[0.14] transition-all"
              >
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFD166]/15 text-[#FFD166] border border-[#FFD166]/25 font-mono">
                  {selectedImageModel.badge}
                </span>
                {selectedImageModel.name}
                <ChevronDown size={10} className="text-[#444]" />
              </button>

              {modelPickerOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
                  {imageModelList.map(m => {
                    const locked = !canUseModel(userPlan, m.requiredPlan);
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedImageModel(m);
                          setSelectedResolution(current => normalizeResolutionForModel(current, m));
                          setModelPickerOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${selectedImageModel.id === m.id ? "bg-white/[0.05]" : "hover:bg-white/[0.04]"}`}
                      >
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border font-mono flex-shrink-0 ${locked ? "opacity-30" : ""} bg-[#FFD166]/15 text-[#FFD166] border-[#FFD166]/25`}>
                          {m.badge}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-medium flex items-center gap-1 ${locked ? "text-[#444]" : "text-[#F5F0E8]"}`}>
                            {m.name}
                            {locked && <Lock size={9} className="text-[#333]" />}
                          </div>
                          <div className="text-[10px] text-[#444] mt-0.5 truncate">{m.description}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-[#777] border border-white/[0.07] flex-shrink-0">
                          {m.creditCost} création{m.creditCost > 1 ? "s" : ""}
                        </span>
                        {locked && m.requiredPlan && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF7B4B]/10 text-[#FF7B4B] border border-[#FF7B4B]/20 flex-shrink-0 capitalize">
                            {m.requiredPlan}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Resolution */}
            <div className="flex items-center gap-1">
              {RESOLUTION_OPTIONS.map(r => {
                const max = selectedImageModel.maxResolution;
                const available = !(r.id === "4k" && max !== "4K") && !(r.id === "2k" && max === "HD");
                return available ? (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResolution(r.id)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                      selectedResolution === r.id
                        ? "bg-[#FF7B4B]/20 border-[#FF7B4B]/35 text-[#FF7B4B]"
                        : "bg-white/[0.03] border-white/[0.06] text-[#444] hover:text-[#888]"
                    }`}
                  >
                    {r.label}
                  </button>
                ) : (
                  <button key={r.id} disabled className="text-[10px] font-semibold px-2 py-1 rounded-md border border-white/[0.03] text-[#2a2a2a] cursor-not-allowed">
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Enhancement mode */}
            <div className="flex items-center gap-1">
              {ENHANCEMENT_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setEnhancementMode(m.id as "light" | "director" | "full")}
                  title={m.description}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                    enhancementMode === m.id
                      ? "bg-[#A78BFA]/20 border-[#A78BFA]/35 text-[#A78BFA]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#444] hover:text-[#888]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Render count */}
            <div className="flex items-center gap-1" title="Nombre de rendus simultanés">
              <Layers size={9} className="text-[#333]" />
              {RENDER_COUNTS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setRenderCount(r.value)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                    renderCount === r.value
                      ? "bg-[#FFD166]/20 border-[#FFD166]/35 text-[#FFD166]"
                      : "bg-white/[0.03] border-white/[0.06] text-[#444] hover:text-[#888]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${
              isFreePlan
                ? "border-[#FFD166]/25 bg-[#FFD166]/10 text-[#FFD166]"
                : "border-[#55D18A]/25 bg-[#55D18A]/10 text-[#55D18A]"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isFreePlan ? "bg-[#FFD166]" : "bg-[#55D18A]"}`} />
              {isFreePlan ? "Watermark Enabled" : "Watermark Disabled"}
            </div>

            {/* Aspect ratios */}
            <div className="flex items-center gap-1 ml-auto">
              {ASPECT_RATIOS.map(r => {
                const active = selectedAspectRatio === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedAspectRatio(r.id)}
                    title={r.label}
                    className={`flex items-center justify-center w-8 h-7 rounded-md border transition-all ${
                      active ? "bg-white/[0.06] border-white/[0.16]" : "border-transparent hover:border-white/[0.07]"
                    }`}
                  >
                    <div
                      style={{ width: r.w * 0.7, height: r.h * 0.7, minWidth: r.w * 0.7 }}
                      className={`rounded-[1px] border transition-colors ${active ? "border-[#F5F0E8]" : "border-[#333]"}`}
                    />
                  </button>
                );
              })}
              <span className="ml-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] text-[#CCCCC0]">
                Output Ratio: <span className="font-mono">{activeAspectRatio.label}</span>
                <span className="ml-1 text-[#777]">{RATIO_COPY[activeAspectRatio.label]}</span>
              </span>
            </div>
          </div>

          {/* Prompt textarea */}
          <div className="px-4 pt-3">
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onPaste={handlePasteReference}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
              placeholder="Decrivez le visuel a produire. Collez une image avec Ctrl+V ou glissez une reference dans cette zone."
              className="min-h-36 w-full resize-none bg-transparent text-base leading-relaxed text-[#E8E3DB] outline-none placeholder-[#4E4A45]"
            />
          </div>

          {/* Character reference strip */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3 flex-wrap">

              {hasReferenceImages && (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {referenceImages.map((image, index) => (
                      <div key={image.id} className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/[0.1] flex-shrink-0 group" title={image.name}>
                        <Image src={image.preview} alt={`ref ${index + 1}`} fill sizes="40px" className="object-cover" />
                        {index === 0 && (
                          <div className="absolute left-0.5 top-0.5 px-1 rounded bg-black/60 text-[8px] text-white/70">
                            1
                          </div>
                        )}
                        <button
                          onClick={() => removeReferenceImage(image.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {referenceImages.length < MAX_REFERENCE_IMAGES && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-10 h-10 rounded-lg border border-dashed border-white/[0.1] flex items-center justify-center text-[#444] hover:text-[#FF7B4B] hover:border-[#FF7B4B]/40 transition-all"
                        aria-label="Ajouter une rÃ©fÃ©rence"
                      >
                        <Upload size={13} />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] text-[#666] mb-1">
                      {referenceImages.length} / {MAX_REFERENCE_IMAGES} rÃ©fÃ©rence{referenceImages.length > 1 ? "s" : ""} comme :
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {REFERENCE_USAGE_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setReferenceUsageHint(opt.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                            referenceUsageHint === opt.id
                              ? "bg-[#FF7B4B]/20 border-[#FF7B4B]/35 text-[#FF7B4B]"
                              : "bg-white/[0.03] border-white/[0.06] text-[#444] hover:text-[#888]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCharacter && !hasReferenceImages && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/25 text-[#A78BFA]">
                    <BookUser size={11} />
                    <span className="text-[11px] font-medium">{selectedCharacter.name}</span>
                  </div>
                  <button
                    onClick={() => { setSelectedCharacter(null); setReferenceUsageHint("auto"); }}
                    className="text-[#333] hover:text-[#888] transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {!hasReferenceImages && !selectedCharacter && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.03] border border-dashed border-white/[0.1] text-[#555] hover:text-[#FF7B4B] hover:border-[#FF7B4B]/40 transition-all"
                  >
                    <Upload size={11} />
                    Upload une référence
                  </button>

                  {savedCharacters.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowCharPicker(v => !v)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#A78BFA]/8 border border-[#A78BFA]/20 text-[#A78BFA] hover:border-[#A78BFA]/40 transition-all"
                      >
                        <BookUser size={11} />
                        Mes persos ({savedCharacters.length})
                      </button>

                      {showCharPicker && (
                        <div className="absolute left-0 top-full mt-1.5 w-56 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl z-40 overflow-hidden">
                          <div className="px-3 py-2 text-[9px] font-semibold text-[#444] uppercase tracking-wider border-b border-white/[0.05]">
                            Personnages mémorisés
                          </div>
                          {savedCharacters.map(c => (
                            <div key={c.id} className="flex items-center gap-2 px-3 py-2 hover:bg-white/[0.04] group">
                              <button
                                onClick={() => selectSavedCharacter(c)}
                                className="flex-1 text-left flex items-center gap-2"
                              >
                                <BookUser size={11} className="text-[#A78BFA] flex-shrink-0" />
                                <span className="text-xs text-[#CCCCC0] truncate">{c.name}</span>
                              </button>
                              <button
                                onClick={() => deleteCharacter(c.id)}
                                className="text-[#333] hover:text-[#FF6B7D] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                  handleFileUpload(e.target.files);
                  e.currentTarget.value = "";
                }}
              />
              {!hasReferenceImages && !selectedCharacter && (
                <span className="text-[10px] text-[#2e2e2e] hidden sm:inline">
                  personnage, pose, tenue, décor ou logo
                </span>
              )}
            </div>
          </div>

          {/* Advanced settings */}
          <div className="border-t border-white/[0.04]">
            <button
              onClick={() => setAdvancedOpen(v => !v)}
              className="flex items-center gap-1.5 w-full px-4 py-2 text-[10px] text-[#333] hover:text-[#666] transition-colors"
            >
              <Settings2 size={10} />
              Réglages précis
              <ChevronRight size={9} className={`ml-auto transition-transform ${advancedOpen ? "rotate-90" : ""}`} />
            </button>

            {advancedOpen && (
              <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#444] mb-1.5">Prompt négatif</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={e => setNegativePrompt(e.target.value)}
                    placeholder="ex: floue, cartoon, surexposé..."
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-[#CCCCC0] placeholder-[#333] outline-none focus:border-white/[0.12] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#444] mb-1.5">Seed (optionnel)</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={e => setSeed(e.target.value)}
                    placeholder="ex: 42"
                    className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-[#CCCCC0] placeholder-[#333] outline-none focus:border-white/[0.12] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate button row */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <div className="text-[10px] text-[#555]">{totalCreditCost} création{totalCreditCost > 1 ? "s" : ""} utilisée{totalCreditCost > 1 ? "s" : ""} après un rendu réussi</div>
            <Button
              variant="gradient"
              size="sm"
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <><Loader2 size={12} className="animate-spin" /> Génération…</>
              ) : (
                <>Créer le rendu {renderCount > 1 ? `× ${renderCount}` : ""} <ArrowRight size={12} /></>
              )}
            </Button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/8 border border-red-500/15 rounded-xl text-sm text-red-400 leading-relaxed">
            {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="mb-4 rounded-2xl border border-white/[0.06] bg-[#0c0c0c] px-6 py-8 flex flex-col items-center justify-center gap-5" style={previewAspectStyle}>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B7D]/20 to-[#FFD166]/20 border border-white/[0.07] flex items-center justify-center">
                <ImageIcon size={22} className="text-[#FF7B4B] opacity-70" />
              </div>
              <div className="absolute inset-0 rounded-2xl border border-[#FF7B4B]/20 animate-ping" />
            </div>

            {renderCount > 1 && (
              <div className="text-[11px] text-[#555]">{renderCount} rendus en parallèle…</div>
            )}

            <div className="space-y-2 text-center">
              {activeLoadingSteps.map((step, i) => (
                <div key={i} className={`flex items-center justify-center gap-2 text-xs transition-all ${
                  i === loadingStep ? "text-[#F5F0E8]" : i < loadingStep ? "text-[#333] line-through" : "text-[#2a2a2a]"
                }`}>
                  {i < loadingStep ? (
                    <Check size={10} className="text-[#4ADE80] flex-shrink-0" />
                  ) : i === loadingStep ? (
                    <Loader2 size={10} className="animate-spin text-[#FF7B4B] flex-shrink-0" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border border-[#2a2a2a] flex-shrink-0" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {[0,1,2,3,4].map(d => (
                <div key={d} className="w-1 h-1 rounded-full bg-[#FF7B4B]/40 animate-bounce" style={{ animationDelay: `${d * 0.12}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Result ── */}
        {result && !loading && (
          <div className="mb-8 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[#0c0c0c] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">

            {/* Single image */}
            {result.images.length === 1 && (
              <div className="relative bg-[#080808] cursor-zoom-in group" onClick={() => { setFullscreenIdx(0); setFullscreen(true); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.images[0]} alt="Generated" className="w-full h-auto block" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                <button
                  onClick={e => { e.stopPropagation(); setFullscreenIdx(0); setFullscreen(true); }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            )}

            {/* Multi-image grid */}
            {result.images.length > 1 && (
              <div className={`columns-1 gap-3 bg-[#080808] p-3 sm:columns-2 ${result.images.length >= 3 ? "lg:columns-3" : ""}`}>
                {result.images.map((img, i) => (
                  <div
                    key={i}
                    className="group relative mb-3 break-inside-avoid cursor-zoom-in overflow-hidden rounded-[16px] border border-white/[0.06]"
                    onClick={() => { setFullscreenIdx(i); setFullscreen(true); }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Generated ${i + 1}`} className="w-full h-auto block" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <div className="absolute top-1.5 left-1.5 text-[9px] font-mono text-white/40 group-hover:text-white/70 transition-colors">
                      {i + 1}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); downloadSingleImage(img, i); }}
                      className="absolute bottom-1.5 right-1.5 p-1.5 rounded-md bg-black/50 backdrop-blur-sm text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Download size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Enhanced prompt reveal */}
            <div className="border-t border-white/[0.04]">
              <button
                onClick={() => setShowEnhancedPrompt(v => !v)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-[#444] hover:text-[#888] transition-colors"
              >
                {showEnhancedPrompt ? <EyeOff size={11} /> : <Eye size={11} />}
                {showEnhancedPrompt ? "Masquer le prompt amélioré" : "Voir le prompt amélioré par l'IA"}
                <ChevronRight size={9} className={`ml-auto transition-transform ${showEnhancedPrompt ? "rotate-90" : ""}`} />
              </button>
              {showEnhancedPrompt && (
                <div className="px-4 pb-3">
                  <p className="text-[11px] text-[#555] leading-relaxed font-mono bg-white/[0.02] rounded-lg p-3 border border-white/[0.05]">
                    {result.enhancedPrompt}
                  </p>
                </div>
              )}
            </div>

            {/* Mémoriser ce personnage — only when a reference image was used */}
            {hasReferenceImages && (referenceUsageHint === "auto" || referenceUsageHint === "character") && (
              <div className="px-4 py-3 border-t border-white/[0.04]">
                {!showSaveChar ? (
                  <button
                    onClick={() => setShowSaveChar(true)}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] hover:bg-[#A78BFA]/18 transition-all"
                  >
                    <BookUser size={11} />
                    Mémoriser ce personnage
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      autoFocus
                      value={saveCharName}
                      onChange={e => setSaveCharName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveCharacter(); if (e.key === "Escape") { setShowSaveChar(false); setCharSaveStatus("idle"); } }}
                      placeholder="Nom du personnage…"
                      maxLength={80}
                      className="flex-1 min-w-0 bg-white/[0.04] border border-[#A78BFA]/25 rounded-lg px-3 py-1.5 text-xs text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#A78BFA]/50 transition-colors"
                    />
                    <button
                      onClick={saveCharacter}
                      disabled={charSaving || !saveCharName.trim()}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/30 text-[#A78BFA] hover:bg-[#A78BFA]/30 disabled:opacity-40 transition-all flex-shrink-0"
                    >
                      {charSaving ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : charSaveStatus === "ok" ? (
                        <Check size={10} />
                      ) : (
                        <BookUser size={10} />
                      )}
                      {charSaving ? "Analyse…" : charSaveStatus === "ok" ? "Sauvegardé !" : "Sauvegarder"}
                    </button>
                    <button onClick={() => { setShowSaveChar(false); setCharSaveStatus("idle"); }} className="text-[#333] hover:text-[#888]">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-[10px] text-[#333] mr-auto">
                <span className="font-mono uppercase">{result.resolution}</span>
                <span>·</span>
                <span>{result.aspectRatio}</span>
                <span>·</span>
                <span className={result.watermarkEnabled ? "text-[#FFD166]" : "text-[#55D18A]"}>
                  {result.watermarkEnabled ? "Watermark" : "Clean"}
                </span>
                <span className="text-[#333]">-</span>
                <span className="truncate max-w-[120px]">{result.model}</span>
                {result.images.length > 1 && (
                  <><span>·</span><span className="text-[#FFD166]">{result.images.length} images</span></>
                )}
              </div>

              <button
                onClick={() => copyText(result.enhancedPrompt)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[#666] hover:text-[#CCCCC0] transition-all"
              >
                {copied ? <Check size={10} className="text-[#4ADE80]" /> : <Copy size={10} />}
                {copied ? "Copié" : "Copier"}
              </button>
              <button
                onClick={() => generate()}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[#666] hover:text-[#CCCCC0] transition-all"
              >
                <RefreshCw size={10} />
                Regénérer
              </button>
              <button
                onClick={() => setShowBetterResultGuide(v => !v)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-[#666] hover:text-[#CCCCC0] transition-all"
              >
                <Settings2 size={10} />
                Je ne suis pas satisfait
              </button>
              <button
                onClick={downloadAll}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-[#FF7B4B]/10 border border-[#FF7B4B]/20 text-[#FF7B4B] hover:bg-[#FF7B4B]/20 transition-all"
              >
                <Download size={10} />
                {result.images.length > 1 ? "Tout télécharger" : "Télécharger"}
              </button>
            </div>
            {showBetterResultGuide && (
              <div className="border-t border-white/[0.04] px-4 py-4">
                <div className="mb-3 text-sm font-semibold text-[#F5F0E8]">Comment obtenir un meilleur résultat</div>
                <div className="grid gap-2 text-xs leading-relaxed text-[#777] sm:grid-cols-2">
                  {[
                    "Ajoute une référence claire : personnage, logo, décor ou style souhaité.",
                    "Décris le sujet principal et ce qu’il doit absolument conserver.",
                    "Décris la scène : lieu, action, ambiance, heure de la journée.",
                    "Précise le style : FiveM réaliste, GTA V, lumière cinématique.",
                    "Indique ce qu’il ne faut pas changer : visage, tatouages, coiffure, tenue.",
                    "Ajoute un prompt négatif : pas de texte, visage déformé ou autre personnage.",
                  ].map((item, index) => (
                    <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
                      <span className="mr-2 text-[#FF7B4B]">{index + 1}.</span>{item}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={improveCurrentPrompt}
                  className="mt-3 rounded-lg border border-[#FF7B4B]/25 bg-[#FF7B4B]/10 px-3 py-2 text-xs font-medium text-[#FF7B4B] transition-all hover:bg-[#FF7B4B]/20"
                >
                  Améliorer mon prompt automatiquement
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Prompt Guide ── */}
        <div className="mb-8">
          <h2 className="text-[10px] font-semibold text-[#2e2e2e] uppercase tracking-widest mb-3">Prompts recommandés</h2>

          <div className="rounded-xl p-4 border border-white/[0.06] bg-white/[0.01] mb-3">
            <div className="text-[10px] font-semibold text-[#FFD166] uppercase tracking-wider mb-3">Structure d&apos;un prompt premium</div>
            <div className="flex flex-col gap-1.5">
              {[
                { num: "1", label: "Sujet & identité", desc: "Qui est le personnage — tenue, posture, énergie. Si référence : instruction de préservation exacte.", color: "#FF7B4B" },
                { num: "2", label: "Scène & activité", desc: "Ce que fait le personnage — pose, action, interaction avec le décor.", color: "#FFD166" },
                { num: "3", label: "Environnement", desc: "Lieu précis, éléments du décor, props, ambiance générale du lieu.", color: "#4ADE80" },
                { num: "4", label: "Angle de caméra", desc: "Position, hauteur, cadrage, séparation des plans avant / milieu / fond.", color: "#60A5FA" },
                { num: "5", label: "Lumière & ambiance", desc: "Source lumineuse, heure, température, humeur — motivée, jamais artificielle.", color: "#A78BFA" },
                { num: "6", label: "Qualité technique", desc: "Standard de sortie : réaliste, ultra détaillé, FiveM marketing, 4K, pas de texte.", color: "#FF6B7D" },
              ].map(b => (
                <div key={b.num} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}30` }}>{b.num}</div>
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
                    <span className="text-[11px] text-[#444]"> — {b.desc}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-2.5 mt-1 pt-2 border-t border-white/[0.04]">
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold bg-white/[0.04] text-[#555] border border-white/[0.06]">−</div>
                <div>
                  <span className="text-[11px] font-semibold text-[#555]">Prompt négatif</span>
                  <span className="text-[11px] text-[#333]"> — Dans le champ dédié (Paramètres avancés) : éléments à exclure, erreurs à éviter.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[
              { label: "16:9", tip: "Bannière · Loading screen · Twitter", color: "#4ADE80" },
              { label: "9:16", tip: "Poster portrait · Story · Recrutement", color: "#FF7B4B" },
              { label: "Léger", tip: "Garde ton intent, corrections minimales", color: "#A78BFA" },
              { label: "Directeur", tip: "Ajoute caméra, lumière, profondeur", color: "#FFD166" },
            ].map(t => (
              <div key={t.label} className="rounded-lg p-2.5 border border-white/[0.04] bg-white/[0.01]">
                <div className="text-[10px] font-bold mb-0.5" style={{ color: t.color }}>{t.label}</div>
                <div className="text-[10px] text-[#333] leading-relaxed">{t.tip}</div>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-semibold text-[#2e2e2e] uppercase tracking-widest mb-2.5">Exemples de génération</div>
          <div className="flex flex-col gap-2">
            {PROMPT_EXAMPLES.map(ex => (
              <button
                key={ex.label}
                onClick={() => { setPrompt(ex.prompt); if (ex.ratio) setSelectedAspectRatio(ex.ratio); }}
                disabled={loading}
                className="group text-left rounded-xl p-3.5 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.09] disabled:opacity-40 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border" style={{ color: ex.accentColor, borderColor: `${ex.accentColor}30`, background: `${ex.accentColor}10` }}>{ex.tag}</span>
                    <span className="text-xs font-medium text-[#CCCCC0]">{ex.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {ex.ratio && <span className="text-[9px] font-mono text-[#333] border border-white/[0.05] rounded px-1 py-0.5">{ex.ratio}</span>}
                    <ArrowRight size={10} className="text-[#2a2a2a] group-hover:text-[#FF7B4B] transition-colors" />
                  </div>
                </div>
                <div className="text-[11px] text-[#444] leading-relaxed font-mono line-clamp-2">{ex.prompt}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Templates ── */}
        <div>
          <h2 className="text-[10px] font-semibold text-[#2e2e2e] uppercase tracking-widest mb-3">Formats prêts à lancer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {TEMPLATES.map(t => (
              <button
                key={t.name}
                onClick={() => { setPrompt(t.prompt); generate(t.prompt); }}
                disabled={loading}
                className="group text-left rounded-xl px-4 py-3.5 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/[0.09] disabled:opacity-40 transition-all"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#555]">{t.tag}</span>
                  <ArrowRight size={10} className="text-[#2a2a2a] group-hover:text-[#FF7B4B] transition-colors mt-0.5 flex-shrink-0" />
                </div>
                <div className="text-xs font-medium text-[#CCCCC0]">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ── Upgrade modal ── */}
      {upgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setUpgradeModal(null)}>
          <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF7B4B]/10 border border-[#FF7B4B]/25 flex items-center justify-center">
                <Lock size={16} className="text-[#FF7B4B]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#F5F0E8]">{upgradeModal.modelName}</div>
                <div className="text-xs text-[#444]">Modèle réservé</div>
              </div>
            </div>
            <p className="text-sm text-[#666] mb-5 leading-relaxed">
              Ce modèle est disponible uniquement avec le plan{" "}
              <span className="text-[#FF7B4B] font-semibold capitalize">{upgradeModal.requiredPlan}</span>.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setUpgradeModal(null)} className="flex-1 py-2 rounded-xl border border-white/[0.07] text-sm text-[#555] hover:text-[#CCCCC0] transition-colors">
                Annuler
              </button>
              <Link href="/dashboard/billing" className="flex-1">
                <Button variant="gradient" size="sm" className="w-full">
                  Upgrade →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen viewer ── */}
      {fullscreen && result && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.images[fullscreenIdx]}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Navigation arrows for multi-image */}
          {result.images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setFullscreenIdx(i => (i - 1 + result.images.length) % result.images.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setFullscreenIdx(i => (i + 1) % result.images.length); }}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs">
                {fullscreenIdx + 1} / {result.images.length}
              </div>
            </>
          )}

          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <X size={16} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); downloadSingleImage(result.images[fullscreenIdx], fullscreenIdx); }}
            className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF7B4B] text-white text-sm font-medium hover:bg-[#FF6B3D] transition-all"
          >
            <Download size={13} />
            Télécharger
          </button>
        </div>
      )}
    </div>
  );
}
