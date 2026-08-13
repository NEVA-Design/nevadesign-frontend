"use client";
import { useState, useRef, useEffect } from "react";
import {
  Palette, ArrowRight, ArrowUpRight, Download, Copy, Check, Loader2,
  Upload, X, ChevronDown, ChevronRight, ChevronLeft, Maximize2, Lock, Eye, EyeOff,
  RefreshCw, Settings2, ImageIcon, BookUser, Trash2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import Link from "next/link";
import { IMAGE_MODELS, RESOLUTION_OPTIONS, type ImageModel } from "@/lib/ai/models";
import { ASPECT_RATIOS as BASE_ASPECT_RATIOS } from "@/lib/ai/aspect-ratios";
import { readApiResponse } from "@/lib/api/client";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

// ─── Constantes ───────────────────────────────────────────────────────────────

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
  "1:1": "Carré",
  "4:3": "Paysage classique",
  "16:9": "Panoramique large",
  "3:4": "Portrait",
  "9:16": "Vertical story",
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
  { label: "Luxury" },
  { label: "Street" },
  { label: "Cartel" },
  { label: "Miami" },
  { label: "Corporate" },
  { label: "FiveM" },
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

const PROMPT_STRUCTURE = [
  { label: "Sujet & identité", desc: "Qui est le personnage — tenue, posture, énergie. Si référence : instruction de préservation exacte." },
  { label: "Scène & activité", desc: "Ce que fait le personnage — pose, action, interaction avec le décor." },
  { label: "Environnement", desc: "Lieu précis, éléments du décor, props, ambiance générale du lieu." },
  { label: "Angle de caméra", desc: "Position, hauteur, cadrage, séparation des plans avant / milieu / fond." },
  { label: "Lumière & ambiance", desc: "Source lumineuse, heure, température, humeur — motivée, jamais artificielle." },
  { label: "Qualité technique", desc: "Standard de sortie : réaliste, ultra détaillé, FiveM marketing, 4K, pas de texte." },
];

const QUICK_TIPS = [
  { label: "16:9", tip: "Bannière · Loading screen · Twitter" },
  { label: "9:16", tip: "Poster portrait · Story · Recrutement" },
  { label: "Léger", tip: "Conserve votre intention, corrections minimales" },
  { label: "Directeur", tip: "Ajoute caméra, lumière, profondeur" },
];

const BETTER_RESULT_TIPS = [
  "Ajoutez une référence claire : personnage, logo, décor ou style souhaité.",
  "Décrivez le sujet principal et ce qu'il doit absolument conserver.",
  "Décrivez la scène : lieu, action, ambiance, heure de la journée.",
  "Précisez le style : FiveM réaliste, GTA V, lumière cinématique.",
  "Indiquez ce qu'il ne faut pas changer : visage, tatouages, coiffure, tenue.",
  "Ajoutez un prompt négatif : pas de texte, visage déformé ou autre personnage.",
];

// ─── Notifications ────────────────────────────────────────────────────────────

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
    // Web Audio indisponible
  }
}

function showBrowserNotification() {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('Neva Design', {
      body: "Votre image est prête à télécharger.",
      icon: '/favicon.ico',
      tag: 'neva-generation',
    })
  } catch {
    // Notifications non prises en charge dans ce contexte
  }
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function DesignPageClient({ userPlan }: { userPlan: string }) {
  // État principal
  const [prompt, setPrompt] = useState("");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("16:9");
  const [selectedResolution, setSelectedResolution] = useState("hd");
  const [selectedImageModel, setSelectedImageModel] = useState<ImageModel>(
    IMAGE_MODELS["neva-standard"] ?? Object.values(IMAGE_MODELS)[0]
  );
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  // Mode d'amélioration
  const [enhancementMode, setEnhancementMode] = useState<"light" | "director" | "full">("director");

  // Nombre de rendus
  const [renderCount, setRenderCount] = useState<1 | 3 | 4>(1);

  // Références téléversées
  const [referenceImages, setReferenceImages] = useState<UploadedReferenceImage[]>([]);
  const [referenceUsageHint, setReferenceUsageHint] = useState<string>("auto");
  const [isDraggingReference, setIsDraggingReference] = useState(false);

  // Personnages mémorisés
  type SavedChar = { id: string; name: string; image_preview?: string | null; role?: string | null; server?: string | null; style?: string | null };
  const [savedCharacters, setSavedCharacters] = useState<SavedChar[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<{ id: string; name: string; description: string } | null>(null);
  const [showCharPicker, setShowCharPicker] = useState(false);
  const [saveCharName, setSaveCharName] = useState("");
  const [showSaveChar, setShowSaveChar] = useState(false);
  const [charSaving, setCharSaving] = useState(false);
  const [charSaveStatus, setCharSaveStatus] = useState<"idle" | "ok" | "err">("idle");
  const [showBetterResultGuide, setShowBetterResultGuide] = useState(false);

  // Réglages avancés
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState<string>("");

  // État de génération
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

  // État d'interface
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

  // Animation des étapes de chargement
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

  // Chargement des personnages mémorisés au montage
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

  const pillClass = (active: boolean, disabled = false) =>
    `inline-flex h-10 items-center rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors duration-[var(--dur-base)] ${
      disabled
        ? "cursor-not-allowed border-[color:var(--hairline)] text-ink/15"
        : active
          ? "border-[rgba(109,91,232,0.5)] bg-[rgba(124,106,255,0.08)] text-[color:var(--num-color)]"
          : "border-[color:var(--hairline-strong)] bg-white/70 text-steel hover:border-[#C9C9C0] hover:text-ink"
    }`;

  const settingRowClass = "flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[color:var(--hairline)] py-4";
  const settingLabelClass = "pv-label w-full sm:w-28 shrink-0";

  return (
    <div className="relative min-h-full" onClick={() => setModelPickerOpen(false)}>
      <div aria-hidden className="pv-halo--violet pv-halo -top-24 left-[14%] h-72 w-72" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
        <ModuleHeader
          icon={Palette}
          eyebrow="Neva Design"
          title="Design Studio"
          description="Décrivez le rendu voulu, ajoutez vos références, puis lancez une génération prête à publier."
          accent="#7C6AFF"
          meta={renderCount > 1 ? `${selectedImageModel.creditCost} × ${renderCount} = ${totalCreditCost} créations` : `${totalCreditCost} création / image`}
          activeStep={activeStep}
          steps={[
            { label: "Décrire", detail: "Idée + références" },
            { label: "Régler", detail: `${selectedAspectRatio} · ${selectedResolution.toUpperCase()}` },
            { label: "Télécharger", detail: result ? `${result.images.length} rendu(s)` : "Résultat final" },
          ]}
        />

        {/* ══ Plan de travail — brief + réglages | résultat ══ */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">

          {/* ── Zone brief + réglages ─────────────────────────── */}
          <section className="min-w-0 lg:col-span-7">

            {/* Brief — l'objet de verre premium posé sur la soie */}
            <div
              className={`pv-glass overflow-hidden !rounded-2xl transition-colors duration-300 ${
                isDraggingReference
                  ? "!border-[rgba(109,91,232,0.5)] !bg-[rgba(124,106,255,0.06)]"
                  : ""
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
              <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--hairline)] px-5 py-4">
                <span className="flex items-baseline gap-3">
                  <span className="pv-num">01</span>
                  <span className="pv-label">Brief de création</span>
                </span>
                <span className="pv-meta hidden sm:inline">Ctrl + Entrée pour lancer</span>
              </div>

              <div className="px-5 pt-4">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onPaste={handlePasteReference}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
                  placeholder="Décrivez le visuel à produire. Collez une image avec Ctrl+V ou glissez une référence dans cette zone."
                  className="min-h-36 w-full resize-none bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink/25"
                />
              </div>

              {/* Ambiances rapides */}
              <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                <span className="pv-meta mr-1">Ambiances</span>
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.label}
                    type="button"
                    onClick={() => setPrompt((current) => current ? `${current}, ${style.label} style` : `${style.label} FiveM premium visual`)}
                    className="inline-flex h-10 items-center rounded-full border border-[color:var(--hairline-strong)] bg-white/70 px-4 font-mono text-[11px] uppercase tracking-[0.08em] text-steel transition-colors duration-[var(--dur-base)] hover:border-[rgba(109,91,232,0.35)] hover:text-[color:var(--num-color)]"
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              {/* Références */}
              <div className="border-t border-[color:var(--hairline)] px-5 py-4">
                {hasReferenceImages && (
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {referenceImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[color:var(--hairline-strong)]"
                          title={image.name}
                        >
                          <Image src={image.preview} alt={`Référence ${index + 1}`} fill sizes="44px" className="object-cover" />
                          {index === 0 && (
                            <span className="absolute left-0.5 top-0.5 rounded-full bg-ink/60 px-1 font-mono text-[8px] text-[color:var(--num-color)]">
                              1
                            </span>
                          )}
                          <button
                            onClick={() => removeReferenceImage(image.id)}
                            aria-label={`Retirer la référence ${index + 1}`}
                            className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <X size={12} className="text-ink" />
                          </button>
                        </div>
                      ))}
                      {referenceImages.length < MAX_REFERENCE_IMAGES && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Ajouter une référence"
                          className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-[color:var(--hairline-strong)] text-dusk transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-[color:var(--num-color)]"
                        >
                          <Upload size={13} />
                        </button>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="pv-meta mb-2">
                        {referenceImages.length} / {MAX_REFERENCE_IMAGES} référence{referenceImages.length > 1 ? "s" : ""} — utilisée{referenceImages.length > 1 ? "s" : ""} comme :
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {REFERENCE_USAGE_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setReferenceUsageHint(opt.id)}
                            className={pillClass(referenceUsageHint === opt.id)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedCharacter && !hasReferenceImages && (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-[rgba(109,91,232,0.3)] bg-[rgba(124,106,255,0.08)] px-3 py-2 text-[13px] text-[color:var(--num-color)]">
                      <BookUser size={13} />
                      {selectedCharacter.name}
                    </span>
                    <button
                      onClick={() => { setSelectedCharacter(null); setReferenceUsageHint("auto"); }}
                      aria-label="Retirer le personnage sélectionné"
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-dusk transition-colors hover:bg-ink/5 hover:text-ink"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {!hasReferenceImages && !selectedCharacter && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-dashed border-[color:var(--hairline-strong)] px-4 text-[13px] text-steel transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-[color:var(--num-color)]"
                    >
                      <Upload size={13} />
                      Téléverser une référence
                    </button>

                    {savedCharacters.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setShowCharPicker(v => !v)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[rgba(109,91,232,0.28)] bg-[rgba(124,106,255,0.06)] px-4 text-[13px] text-[color:var(--num-color)] transition-colors duration-300 hover:border-[rgba(109,91,232,0.5)]"
                        >
                          <BookUser size={13} />
                          Mes personnages ({savedCharacters.length})
                        </button>

                        {showCharPicker && (
                          <div className="pv-scale-in absolute left-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] bg-white shadow-[var(--shadow-float)]">
                            <div className="border-b border-[color:var(--hairline)] px-3.5 py-2.5">
                              <span className="pv-label">Personnages mémorisés</span>
                            </div>
                            {savedCharacters.map(c => (
                              <div key={c.id} className="group flex items-center gap-2 px-3.5 py-2 transition-colors hover:bg-ink/[0.04]">
                                <button
                                  onClick={() => selectSavedCharacter(c)}
                                  className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
                                >
                                  <BookUser size={12} className="shrink-0 text-[color:var(--num-color)]" />
                                  <span className="truncate text-[13px] text-ink/80">{c.name}</span>
                                </button>
                                <button
                                  onClick={() => deleteCharacter(c.id)}
                                  aria-label={`Supprimer ${c.name}`}
                                  className="shrink-0 p-2 text-ink/25 opacity-0 transition-all hover:text-err group-hover:opacity-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <span className="pv-meta hidden sm:inline">personnage, pose, tenue, décor ou logo</span>
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
              </div>
            </div>

            {/* Réglages */}
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-baseline gap-3">
                  <span className="pv-num">02</span>
                  <span className="pv-label">Réglages du rendu</span>
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    isFreePlan
                      ? "border-[#EAD9A8] bg-[#FBF6E9] text-[#8A6D1F]"
                      : "border-[#C4E3D2] bg-[#EFF7F2] text-[#3E7A5C]"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isFreePlan ? "bg-warn" : "bg-ok"}`} />
                  {isFreePlan ? "Filigrane actif" : "Sans filigrane"}
                </span>
              </div>

              {/* Modèle */}
              <div className={settingRowClass}>
                <span className={settingLabelClass}>Modèle</span>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setModelPickerOpen(v => !v)}
                    className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-[color:var(--hairline-strong)] px-3.5 text-[13px] text-ink transition-colors duration-300 hover:border-[#C9C9C0]"
                  >
                    <span className="rounded-full border border-[rgba(109,91,232,0.3)] bg-[rgba(124,106,255,0.08)] px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[color:var(--num-color)]">
                      {selectedImageModel.badge}
                    </span>
                    {selectedImageModel.name}
                    <ChevronDown size={12} className="text-dusk" />
                  </button>

                  {modelPickerOpen && (
                    <div className="pv-scale-in absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[color:var(--hairline-strong)] bg-white shadow-[var(--shadow-float)]">
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
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                              selectedImageModel.id === m.id ? "bg-white" : "hover:bg-ink/[0.03]"
                            }`}
                          >
                            <span className={`shrink-0 rounded-full border border-[rgba(109,91,232,0.3)] bg-[rgba(124,106,255,0.08)] px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[color:var(--num-color)] ${locked ? "opacity-35" : ""}`}>
                              {m.badge}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`flex items-center gap-1.5 text-[13px] font-medium ${locked ? "text-dusk" : "text-ink"}`}>
                                {m.name}
                                {locked && <Lock size={10} className="text-ink/25" />}
                              </span>
                              <span className="mt-0.5 block truncate text-[11px] text-dusk">{m.description}</span>
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-steel">
                              {m.creditCost} cr
                            </span>
                            {locked && m.requiredPlan && (
                              <span className="shrink-0 rounded-full border border-warn/30 bg-warn/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-warn">
                                {m.requiredPlan}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Résolution */}
              <div className={settingRowClass}>
                <span className={settingLabelClass}>Résolution</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {RESOLUTION_OPTIONS.map(r => {
                    const max = selectedImageModel.maxResolution;
                    const available = !(r.id === "4k" && max !== "4K") && !(r.id === "2k" && max === "HD");
                    return (
                      <button
                        key={r.id}
                        onClick={() => available && setSelectedResolution(r.id)}
                        disabled={!available}
                        className={pillClass(selectedResolution === r.id, !available)}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amélioration */}
              <div className={settingRowClass}>
                <span className={settingLabelClass}>Amélioration</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ENHANCEMENT_MODES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setEnhancementMode(m.id as "light" | "director" | "full")}
                        title={m.description}
                        className={pillClass(enhancementMode === m.id)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <p className="pv-meta mt-2">
                    {ENHANCEMENT_MODES.find(m => m.id === enhancementMode)?.description}
                  </p>
                </div>
              </div>

              {/* Rendus simultanés */}
              <div className={settingRowClass}>
                <span className={settingLabelClass}>Rendus</span>
                <div className="flex flex-wrap items-center gap-1.5" title="Nombre de rendus simultanés">
                  <Layers size={12} className="mr-1 text-ink/25" />
                  {RENDER_COUNTS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => setRenderCount(r.value)}
                      className={pillClass(renderCount === r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className={`${settingRowClass} border-b border-b-[color:var(--hairline)]`}>
                <span className={settingLabelClass}>Format</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ASPECT_RATIOS.map(r => {
                      const active = selectedAspectRatio === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => setSelectedAspectRatio(r.id)}
                          title={r.label}
                          aria-label={`Format ${r.label}`}
                          className={`flex h-10 w-11 items-center justify-center rounded-lg border transition-colors duration-300 ${
                            active
                              ? "border-[rgba(109,91,232,0.5)] bg-[rgba(124,106,255,0.08)]"
                              : "border-[color:var(--hairline-strong)] hover:border-[#C9C9C0]"
                          }`}
                        >
                          <span
                            style={{ width: r.w * 0.7, height: r.h * 0.7, minWidth: r.w * 0.7 }}
                            className={`block rounded-[1px] border transition-colors ${active ? "border-violet" : "border-ink/30"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="pv-meta mt-2">
                    <span className="text-[color:var(--num-color)]">{activeAspectRatio.label}</span>
                    {" — "}
                    {RATIO_COPY[activeAspectRatio.label]}
                  </p>
                </div>
              </div>

              {/* Réglages précis */}
              <div>
                <button
                  onClick={() => setAdvancedOpen(v => !v)}
                  className="flex min-h-10 w-full items-center gap-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-dusk transition-colors hover:text-ink/70"
                >
                  <Settings2 size={11} />
                  Réglages précis
                  <ChevronRight size={11} className={`ml-auto transition-transform duration-300 ${advancedOpen ? "rotate-90" : ""}`} />
                </button>

                {advancedOpen && (
                  <div className="pv-scale-in grid grid-cols-1 gap-4 pb-4 pt-2 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="negative-prompt">Prompt négatif</Label>
                      <Input
                        id="negative-prompt"
                        type="text"
                        value={negativePrompt}
                        onChange={e => setNegativePrompt(e.target.value)}
                        placeholder="ex : floue, cartoon, surexposé…"
                      />
                    </div>
                    <div>
                      <Label htmlFor="seed">Seed (optionnel)</Label>
                      <Input
                        id="seed"
                        type="number"
                        value={seed}
                        onChange={e => setSeed(e.target.value)}
                        placeholder="ex : 42"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lancement */}
            <div className="mt-6 flex flex-col gap-4 border-t border-[color:var(--hairline)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="pv-meta">
                {totalCreditCost} création{totalCreditCost > 1 ? "s" : ""} utilisée{totalCreditCost > 1 ? "s" : ""} après un rendu réussi
              </p>
              <Button
                variant="gradient"
                size="md"
                onClick={() => generate()}
                disabled={!prompt.trim() || loading}
                className="w-full sm:w-auto sm:min-w-[180px]"
              >
                {loading ? (
                  <><Loader2 size={13} className="animate-spin" /> Génération…</>
                ) : (
                  <>Créer le rendu {renderCount > 1 ? `× ${renderCount}` : ""} <ArrowRight size={13} /></>
                )}
              </Button>
            </div>

            {error && (
              <FormMessage tone="error" className="mt-5">
                {error}
              </FormMessage>
            )}
          </section>

          {/* ── Zone résultat ─────────────────────────────────── */}
          <section className="min-w-0 lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-3">
                  <span className="pv-num">03</span>
                  <span className="pv-label">Résultat</span>
                </span>
                <span className="pv-meta">
                  {selectedResolution.toUpperCase()} · {selectedAspectRatio}
                </span>
              </div>

              {/* Attente */}
              {!loading && !result && (
                <div
                  className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[color:var(--hairline-strong)] px-6 py-10 text-center"
                  style={previewAspectStyle}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,106,255,0.09),transparent_70%)]"
                  />
                  <ImageIcon size={22} className="mb-4 text-[color:var(--num-color)]/40" />
                  <p className="pv-display max-w-xs text-lg text-ink/85">Votre rendu apparaîtra ici.</p>
                  <p className="pv-meta mt-3">Décrivez, réglez, lancez.</p>
                </div>
              )}

              {/* Chargement */}
              {loading && (
                <div
                  className="flex flex-col items-center justify-center gap-6 rounded-xl border border-[color:var(--hairline)] bg-abyss px-6 py-10"
                  style={previewAspectStyle}
                >
                  <span aria-hidden className="pv-spinner h-8 w-8" />

                  {renderCount > 1 && (
                    <p className="pv-meta">{renderCount} rendus en parallèle…</p>
                  )}

                  <div className="space-y-2.5 text-center">
                    {activeLoadingSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-center gap-2.5 text-[13px] transition-colors duration-300 ${
                          i === loadingStep ? "text-ink" : i < loadingStep ? "text-dusk line-through" : "text-ink/20"
                        }`}
                      >
                        {i < loadingStep ? (
                          <Check size={11} className="shrink-0 text-ok" />
                        ) : i === loadingStep ? (
                          <Loader2 size={11} className="shrink-0 animate-spin text-[color:var(--num-color)]" />
                        ) : (
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-[color:var(--hairline-strong)]" />
                        )}
                        {step.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultat — l'œuvre exposée dans son passe-partout */}
              {result && !loading && (
                <div className="overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-white shadow-[var(--shadow-print)]">

                  {/* Image unique */}
                  {result.images.length === 1 && (
                    <div className="bg-linen p-5">
                      <div
                        className="group relative cursor-zoom-in bg-white p-4 shadow-[var(--shadow-print)]"
                        onClick={() => { setFullscreenIdx(0); setFullscreen(true); }}
                      >
                        <div className="relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={result.images[0]} alt="Rendu généré" className="block h-auto w-full" />
                          <div className="absolute inset-0 bg-void/0 transition-colors duration-300 group-hover:bg-void/15" />
                          <button
                            onClick={e => { e.stopPropagation(); setFullscreenIdx(0); setFullscreen(true); }}
                            aria-label="Afficher en plein écran"
                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(7,7,13,0.55)] text-white/85 opacity-0 backdrop-blur-sm transition-all duration-300 hover:text-white group-hover:opacity-100"
                          >
                            <Maximize2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendus multiples */}
                  {result.images.length > 1 && (
                    <div className="grid grid-cols-2 gap-4 bg-linen p-5">
                      {result.images.map((img, i) => (
                        <div
                          key={i}
                          className="group relative cursor-zoom-in bg-white p-2 shadow-[var(--shadow-print)]"
                          onClick={() => { setFullscreenIdx(i); setFullscreen(true); }}
                        >
                          <div className="relative overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt={`Rendu ${i + 1}`} className="block h-auto w-full" />
                            <div className="absolute inset-0 bg-void/0 transition-colors duration-300 group-hover:bg-void/20" />
                            <span className="absolute left-2 top-2 font-mono text-[9px] text-white/85 [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">
                              {i + 1}
                            </span>
                            <button
                              onClick={e => { e.stopPropagation(); downloadSingleImage(img, i); }}
                              aria-label={`Télécharger le rendu ${i + 1}`}
                              className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[rgba(7,7,13,0.55)] text-white/85 opacity-0 backdrop-blur-sm transition-all duration-300 hover:text-white group-hover:opacity-100"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Métadonnées + actions */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[color:var(--hairline)] px-4 pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel">{result.resolution}</span>
                    <span className="text-ink/20">·</span>
                    <span className="font-mono text-[10px] tracking-[0.1em] text-steel">{result.aspectRatio}</span>
                    <span className="text-ink/20">·</span>
                    <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${result.watermarkEnabled ? "text-warn" : "text-ok"}`}>
                      {result.watermarkEnabled ? "Filigrane" : "Sans filigrane"}
                    </span>
                    <span className="text-ink/20">·</span>
                    <span className="max-w-[140px] truncate font-mono text-[10px] tracking-[0.1em] text-steel">{result.model}</span>
                    {result.images.length > 1 && (
                      <>
                        <span className="text-ink/20">·</span>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-[color:var(--num-color)]">{result.images.length} images</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                    <button
                      onClick={() => copyText(result.enhancedPrompt)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[color:var(--hairline-strong)] px-3 text-[12px] text-steel transition-colors duration-300 hover:border-[#C9C9C0] hover:text-ink"
                    >
                      {copied ? <Check size={11} className="text-ok" /> : <Copy size={11} />}
                      {copied ? "Copié" : "Copier"}
                    </button>
                    <button
                      onClick={() => generate()}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[color:var(--hairline-strong)] px-3 text-[12px] text-steel transition-colors duration-300 hover:border-[#C9C9C0] hover:text-ink"
                    >
                      <RefreshCw size={11} />
                      Regénérer
                    </button>
                    <button
                      onClick={() => setShowBetterResultGuide(v => !v)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[color:var(--hairline-strong)] px-3 text-[12px] text-steel transition-colors duration-300 hover:border-[#C9C9C0] hover:text-ink"
                    >
                      <Settings2 size={11} />
                      Je ne suis pas satisfait
                    </button>
                    <button
                      onClick={downloadAll}
                      className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(29,35,64,0.12),0_8px_22px_rgba(29,35,64,0.16)] transition-colors duration-300 hover:bg-[#272E52]"
                    >
                      <Download size={11} />
                      {result.images.length > 1 ? "Tout télécharger" : "Télécharger"}
                    </button>
                  </div>

                  {/* Prompt amélioré */}
                  <div className="border-t border-[color:var(--hairline)]">
                    <button
                      onClick={() => setShowEnhancedPrompt(v => !v)}
                      className="flex min-h-10 w-full items-center gap-2 px-4 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.12em] text-dusk transition-colors hover:text-ink/70"
                    >
                      {showEnhancedPrompt ? <EyeOff size={11} /> : <Eye size={11} />}
                      {showEnhancedPrompt ? "Masquer le prompt amélioré" : "Voir le prompt amélioré"}
                      <ChevronRight size={10} className={`ml-auto transition-transform duration-300 ${showEnhancedPrompt ? "rotate-90" : ""}`} />
                    </button>
                    {showEnhancedPrompt && (
                      <div className="px-4 pb-4">
                        <p className="rounded-lg border border-[color:var(--hairline)] bg-abyss p-3.5 font-mono text-[11px] leading-relaxed text-steel">
                          {result.enhancedPrompt}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mémoriser ce personnage — uniquement avec référence utilisée */}
                  {hasReferenceImages && (referenceUsageHint === "auto" || referenceUsageHint === "character") && (
                    <div className="border-t border-[color:var(--hairline)] px-4 py-3.5">
                      {!showSaveChar ? (
                        <button
                          onClick={() => setShowSaveChar(true)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[rgba(109,91,232,0.28)] bg-[rgba(124,106,255,0.06)] px-3.5 text-[12px] text-[color:var(--num-color)] transition-colors duration-300 hover:border-[rgba(109,91,232,0.5)]"
                        >
                          <BookUser size={12} />
                          Mémoriser ce personnage
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            autoFocus
                            value={saveCharName}
                            onChange={e => setSaveCharName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") saveCharacter(); if (e.key === "Escape") { setShowSaveChar(false); setCharSaveStatus("idle"); } }}
                            placeholder="Nom du personnage…"
                            maxLength={80}
                            className="pv-field h-10 min-w-0 flex-1 py-0 text-[13px]"
                          />
                          <button
                            onClick={saveCharacter}
                            disabled={charSaving || !saveCharName.trim()}
                            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[rgba(109,91,232,0.3)] bg-[rgba(124,106,255,0.08)] px-3.5 text-[12px] text-[color:var(--num-color)] transition-colors duration-300 hover:bg-violet/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {charSaving ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : charSaveStatus === "ok" ? (
                              <Check size={11} />
                            ) : (
                              <BookUser size={11} />
                            )}
                            {charSaving ? "Analyse…" : charSaveStatus === "ok" ? "Enregistré" : "Enregistrer"}
                          </button>
                          <button
                            onClick={() => { setShowSaveChar(false); setCharSaveStatus("idle"); }}
                            aria-label="Annuler la mémorisation"
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-dusk transition-colors hover:bg-ink/5 hover:text-ink"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )}
                      {charSaveStatus === "err" && (
                        <p className="mt-2 text-[12px] text-err">
                          L’enregistrement a échoué. Réessayez dans un instant.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Guide de reprise */}
                  {showBetterResultGuide && (
                    <div className="border-t border-[color:var(--hairline)] px-4 py-4">
                      <p className="pv-display mb-3 text-base text-ink">Comment obtenir un meilleur résultat</p>
                      <ol className="space-y-2">
                        {BETTER_RESULT_TIPS.map((item, index) => (
                          <li key={item} className="flex gap-3 text-[12px] leading-relaxed text-steel">
                            <span className="pv-num shrink-0">0{index + 1}</span>
                            {item}
                          </li>
                        ))}
                      </ol>
                      <button
                        type="button"
                        onClick={improveCurrentPrompt}
                        className="mt-4 inline-flex h-10 items-center rounded-lg border border-[rgba(109,91,232,0.3)] bg-[rgba(124,106,255,0.08)] px-4 text-[12px] font-medium text-[color:var(--num-color)] transition-colors duration-300 hover:bg-violet/20"
                      >
                        Améliorer mon prompt automatiquement
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ══ Structure d'un prompt premium ══ */}
        <section className="mt-16">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="pv-display text-xl text-ink">Structure d’un prompt premium</h2>
            <span className="pv-label">Six couches, un rendu maîtrisé</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROMPT_STRUCTURE.map((block, index) => (
              <div key={block.label} className="pv-glass pv-edge rounded-xl p-5">
                <p className="flex items-baseline gap-2.5">
                  <span className="pv-num">0{index + 1}</span>
                  <span className="text-[14px] font-medium text-ink">{block.label}</span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-steel">{block.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-dashed border-[color:var(--hairline-strong)] px-5 py-4">
            <span className="text-[13px] font-medium text-ink/70">Prompt négatif</span>
            <span className="text-[13px] leading-relaxed text-steel">
              Dans le champ dédié (Réglages précis) : éléments à exclure, erreurs à éviter.
            </span>
          </p>

          {/* Repères rapides */}
          <div className="mt-8 grid border-y border-[color:var(--hairline)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[color:var(--hairline)]">
            {QUICK_TIPS.map((t) => (
              <div key={t.label} className="border-b border-[color:var(--hairline)] px-1 py-5 last:border-b-0 sm:px-4 lg:border-b-0">
                <p className="font-mono text-[12px] tracking-[0.12em] text-[color:var(--num-color)]">{t.label}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-steel">{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ Exemples de génération ══ */}
        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="pv-display text-xl text-ink">Exemples de génération</h2>
            <span className="pv-label">Un clic remplit le brief</span>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {PROMPT_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setPrompt(ex.prompt); if (ex.ratio) setSelectedAspectRatio(ex.ratio); }}
                disabled={loading}
                className="pv-glass pv-edge pv-ignite group flex cursor-pointer flex-col gap-2.5 rounded-xl p-5 text-left disabled:opacity-40"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[14px] font-medium text-ink">{ex.label}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">{ex.tag}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {ex.ratio && (
                      <span className="rounded-full border border-[color:var(--hairline-strong)] px-1.5 py-0.5 font-mono text-[9px] text-steel">
                        {ex.ratio}
                      </span>
                    )}
                    <ArrowUpRight
                      size={14}
                      className="translate-y-0.5 text-ink/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyan"
                    />
                  </span>
                </span>
                <span className="line-clamp-2 font-mono text-[11px] leading-relaxed text-dusk">
                  {ex.prompt}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ══ Formats prêts à lancer ══ */}
        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="pv-display text-xl text-ink">Formats prêts à lancer</h2>
            <span className="pv-label">La génération démarre aussitôt</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => { setPrompt(t.prompt); generate(t.prompt); }}
                disabled={loading}
                className="pv-glass pv-edge pv-ignite group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-5 py-4 text-left disabled:opacity-40"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">{t.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                    {t.tag}
                  </span>
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-ink/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyan"
                />
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ══ Modale — modèle réservé ══ */}
      {upgradeModal && (
        <Modal
          open
          onClose={() => setUpgradeModal(null)}
          eyebrow="Modèle réservé"
          title={upgradeModal.modelName}
          widthClassName="max-w-sm"
        >
          <p className="text-sm leading-relaxed text-steel">
            Ce modèle est disponible uniquement avec le plan{" "}
            <span className="font-medium capitalize text-[color:var(--num-color)]">{upgradeModal.requiredPlan}</span>.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setUpgradeModal(null)}>
              Annuler
            </Button>
            <Link href="/dashboard/billing" className="flex-1">
              <Button variant="gradient" size="md" className="w-full">
                Passer au plan supérieur
              </Button>
            </Link>
          </div>
        </Modal>
      )}

      {/* ══ Visionneuse plein écran ══ */}
      {fullscreen && result && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[rgba(5,5,10,0.95)] p-4"
          onClick={() => setFullscreen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.images[fullscreenIdx]}
            alt="Rendu en plein écran"
            className="max-h-full max-w-full object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Navigation entre rendus */}
          {result.images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setFullscreenIdx(i => (i - 1 + result.images.length) % result.images.length); }}
                aria-label="Image précédente"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] bg-white/80 text-ink transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-[color:var(--num-color)]"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setFullscreenIdx(i => (i + 1) % result.images.length); }}
                aria-label="Image suivante"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] bg-white/80 text-ink transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-[color:var(--num-color)]"
              >
                <ChevronRight size={18} />
              </button>
              <span className="absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.12em] text-steel">
                {fullscreenIdx + 1} / {result.images.length}
              </span>
            </>
          )}

          <button
            onClick={() => setFullscreen(false)}
            aria-label="Fermer la visionneuse"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--hairline-strong)] bg-white/80 text-ink transition-colors duration-300 hover:border-[rgba(109,91,232,0.45)] hover:text-[color:var(--num-color)]"
          >
            <X size={16} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); downloadSingleImage(result.images[fullscreenIdx], fullscreenIdx); }}
            className="absolute bottom-4 right-4 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(29,35,64,0.12),0_8px_22px_rgba(29,35,64,0.16)] transition-colors duration-300 hover:bg-[#272E52]"
          >
            <Download size={14} />
            Télécharger
          </button>
        </div>
      )}
    </div>
  );
}
