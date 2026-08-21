"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
  Eraser,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Plus,
  Redo2,
  RefreshCw,
  Sparkles,
  Trash2,
  Undo2,
  Wand2,
  X,
} from "lucide-react";
import LayerCanvas from "@/components/editor/LayerCanvas";
import { BACKEND_URL } from "@/lib/api/backend-client";
import { exportAsset, instructLayer, saveLayerMask } from "@/lib/api/engine";
import { saveAsset } from "@/lib/api/projects";
import {
  CATEGORY_LABELS,
  stripLegacyTextLayers,
  type AssetCategory,
  type BlendMode,
  type Layer,
} from "@/lib/projects-shared";
import { backendFetch } from "@/lib/api/backend-client";
import { cn } from "@/lib/utils";

/*
 * L'éditeur par calques v2 (run 5.2) — réduit à sa mission :
 * afficher/masquer, supprimer, réordonner, opacité ; GOMME NON DESTRUCTIVE
 * par masque de calque (taille 10-200 px, dureté 0-100, undo/redo 30 pas) ;
 * replacer/scaler le logo ; RÉGÉNÉRER LE HÉRO PAR INSTRUCTION COURTE
 * (« passe le titre en chrome ») = 1 retouche ; export à la résolution du
 * plan (= 1 création). Le texte n'existe plus comme calque : le lettrage
 * est généré dans le héro — le code d'édition de texte a été supprimé.
 */

type ProjectInfo = {
  id: string;
  name: string;
  logo_master: { url: string; whiteUrl: string | null; blackUrl: string | null } | null;
};

type AssetInfo = {
  id: string;
  project_id: string;
  category: string;
  title: string | null;
  status: string;
  width: number;
  height: number;
  layers: Layer[];
  retouches_used: number;
  exports: Array<{ url: string; resolution: string; at: string }>;
};

type EffectInfo = { id: string; label: string; blend: string; opacity: number; url: string };

const HISTORY_LIMIT = 30;
const MASK_LONG_EDGE = 1024;

function makeId() {
  return `layer-${Math.random().toString(36).slice(2, 10)}`;
}

type Gesture = {
  mode: "move" | "scale";
  layerId: string;
  startClientX: number;
  startClientY: number;
  origin: Layer;
  centerPx: { x: number; y: number };
  startDistance: number;
};

export default function AssetEditor({ project, initialAsset }: { project: ProjectInfo; initialAsset: AssetInfo }) {
  const [layers, setLayers] = useState<Layer[]>(stripLegacyTextLayers(initialAsset.layers ?? []));
  const [title, setTitle] = useState(initialAsset.title ?? CATEGORY_LABELS[initialAsset.category as AssetCategory] ?? "Création");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retouchesUsed, setRetouchesUsed] = useState(initialAsset.retouches_used ?? 0);

  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);

  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const [effects, setEffects] = useState<EffectInfo[]>([]);
  const [effectsOpen, setEffectsOpen] = useState(false);

  // gomme non destructive
  const [eraserOn, setEraserOn] = useState(false);
  const [brushSize, setBrushSize] = useState(60);
  const [brushHardness, setBrushHardness] = useState(70);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskThrottleRef = useRef(0);
  const erasingRef = useRef(false);

  const [instructOpen, setInstructOpen] = useState(false);
  const [instructBusy, setInstructBusy] = useState(false);
  const [instruction, setInstruction] = useState("");

  const [exportBusy, setExportBusy] = useState(false);
  const [exportResult, setExportResult] = useState<{ url: string; resolution: string; remaining: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const dirtyRef = useRef(false);

  const selected = useMemo(() => layers.find((l) => l.id === selectedId) ?? null, [layers, selectedId]);
  const sceneLayer = useMemo(() => layers.find((l) => l.type === "scene") ?? null, [layers]);

  // ── Historique ──────────────────────────────────────────────────────────
  const pushHistory = useCallback((snapshot: Layer[]) => {
    setPast((p) => [...p.slice(-(HISTORY_LIMIT - 1)), snapshot.map((l) => ({ ...l }))]);
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const previous = p[p.length - 1]!;
      setLayers((current) => {
        setFuture((f) => [...f, current.map((l) => ({ ...l }))]);
        return previous;
      });
      dirtyRef.current = true;
      // le canvas de gomme doit repartir du masque restauré
      maskCanvasRef.current = null;
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[f.length - 1]!;
      setLayers((current) => {
        setPast((p) => [...p, current.map((l) => ({ ...l }))]);
        return next;
      });
      dirtyRef.current = true;
      maskCanvasRef.current = null;
      return f.slice(0, -1);
    });
  }, []);

  // ── Autosave (1,2 s après la dernière modification) ─────────────────────
  // Les masques peints localement (maskDataUrl) sont d'abord stockés côté
  // serveur (POST /engine/mask) puis remplacés par leur URL — la base ne
  // porte jamais un dataURL.
  useEffect(() => {
    if (!dirtyRef.current) return;
    const timeout = setTimeout(async () => {
      dirtyRef.current = false;
      setSaving(true);
      try {
        let toSave = layers;
        const withLocalMask = layers.filter((l) => l.maskDataUrl);
        if (withLocalMask.length) {
          const uploads = await Promise.all(
            withLocalMask.map(async (layer) => {
              const { maskUrl } = await saveLayerMask({
                projectId: project.id,
                assetId: initialAsset.id,
                layerId: layer.id,
                mask: layer.maskDataUrl!,
              });
              return { layerId: layer.id, maskUrl };
            })
          );
          toSave = layers.map((layer) => {
            const upload = uploads.find((u) => u.layerId === layer.id);
            return upload ? { ...layer, maskUrl: upload.maskUrl, maskDataUrl: undefined } : layer;
          });
          setLayers(toSave);
        }
        await saveAsset(project.id, initialAsset.id, { layers: toSave, title });
        setSavedAt(new Date());
      } catch {
        dirtyRef.current = true;
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, [layers, title, project.id, initialAsset.id]);

  const mutateLayers = useCallback((mutate: (current: Layer[]) => Layer[], withHistory = false) => {
    setLayers((current) => {
      if (withHistory) pushHistory(current);
      dirtyRef.current = true;
      return mutate(current);
    });
  }, [pushHistory]);

  const updateLayer = useCallback((layerId: string, patch: Partial<Layer>, withHistory = false) => {
    mutateLayers((current) => current.map((l) => (l.id === layerId ? { ...l, ...patch } : l)), withHistory);
  }, [mutateLayers]);

  // ── Effets ──────────────────────────────────────────────────────────────
  useEffect(() => {
    backendFetch("/engine/effects")
      .then((r) => r.json())
      .then((j) => setEffects((j.effects ?? []).map((e: EffectInfo) => ({ ...e, url: `${BACKEND_URL}${e.url}` }))))
      .catch(() => setEffects([]));
  }, []);

  // ── Clavier ─────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const layer = layers.find((l) => l.id === selectedId);
        if (layer && layer.type !== "scene") {
          e.preventDefault();
          mutateLayers((c) => c.filter((l) => l.id !== selectedId), true);
          setSelectedId(null);
        }
      } else if (selectedId && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        const dx = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
        const dy = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
        const step = e.shiftKey ? 0.01 : 0.002;
        updateLayer(selectedId, {
          x: Math.min(1.2, Math.max(-0.2, (layers.find((l) => l.id === selectedId)?.x ?? 0.5) + dx * step)),
          y: Math.min(1.2, Math.max(-0.2, (layers.find((l) => l.id === selectedId)?.y ?? 0.5) + dy * step)),
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, layers, undo, redo, mutateLayers, updateLayer]);

  // ── Gestes canvas : déplacer / redimensionner ───────────────────────────
  const beginGesture = useCallback((e: React.PointerEvent, layer: Layer, mode: Gesture["mode"]) => {
    if (layer.locked || eraserOn) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const centerPx = { x: rect.left + layer.x * rect.width, y: rect.top + layer.y * rect.height };
    const dx = e.clientX - centerPx.x;
    const dy = e.clientY - centerPx.y;
    gestureRef.current = {
      mode,
      layerId: layer.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origin: { ...layer },
      centerPx,
      startDistance: Math.max(8, Math.hypot(dx, dy)),
    };
    pushHistory(layers);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }, [layers, pushHistory, eraserOn]);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const gesture = gestureRef.current;
      const canvas = canvasRef.current;
      if (!gesture || !canvas) return;
      const rect = canvas.getBoundingClientRect();

      if (gesture.mode === "move") {
        const dx = (e.clientX - gesture.startClientX) / rect.width;
        const dy = (e.clientY - gesture.startClientY) / rect.height;
        setLayers((current) =>
          current.map((l) =>
            l.id === gesture.layerId
              ? { ...l, x: Math.min(1.2, Math.max(-0.2, gesture.origin.x + dx)), y: Math.min(1.2, Math.max(-0.2, gesture.origin.y + dy)) }
              : l
          )
        );
      } else {
        const distance = Math.max(8, Math.hypot(e.clientX - gesture.centerPx.x, e.clientY - gesture.centerPx.y));
        const ratio = distance / gesture.startDistance;
        setLayers((current) =>
          current.map((l) =>
            l.id === gesture.layerId
              ? { ...l, scale: Math.min(4, Math.max(0.02, gesture.origin.scale * ratio)) }
              : l
          )
        );
      }
      dirtyRef.current = true;
    }
    function onUp() {
      gestureRef.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Boîte de sélection mesurée sur le DOM (poignées 44 px)
  const [selectionBox, setSelectionBox] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedId) {
      setSelectionBox(null);
      return;
    }
    let frame = 0;
    const measure = () => {
      const el = canvas.querySelector<HTMLElement>(`[data-layer-id="${selectedId}"]`);
      const rect = canvas.getBoundingClientRect();
      if (el) {
        const box = el.getBoundingClientRect();
        setSelectionBox({ left: box.left - rect.left, top: box.top - rect.top, width: box.width, height: box.height });
      }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [selectedId, layers]);

  // ── Gomme non destructive (masque du calque héro) ───────────────────────
  const ensureMaskCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!sceneLayer) return null;
    if (maskCanvasRef.current) return maskCanvasRef.current;

    const aspect = sceneLayer.aspect ?? initialAsset.width / initialAsset.height;
    const width = aspect >= 1 ? MASK_LONG_EDGE : Math.round(MASK_LONG_EDGE * aspect);
    const height = aspect >= 1 ? Math.round(MASK_LONG_EDGE / aspect) : MASK_LONG_EDGE;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    // repart du masque existant si le calque en porte déjà un
    const existing = sceneLayer.maskDataUrl ?? sceneLayer.maskUrl;
    if (existing) {
      await new Promise<void>((resolveLoad) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolveLoad();
        };
        img.onerror = () => resolveLoad();
        img.src = existing;
      });
    }

    maskCanvasRef.current = canvas;
    return canvas;
  }, [sceneLayer, initialAsset.width, initialAsset.height]);

  const eraseAt = useCallback((canvas: HTMLCanvasElement, clientX: number, clientY: number) => {
    const display = canvasRef.current;
    if (!display) return;
    const rect = display.getBoundingClientRect();
    const scaleFactor = canvas.width / rect.width;
    const x = (clientX - rect.left) * scaleFactor;
    const y = (clientY - rect.top) * scaleFactor;
    const radius = (brushSize / 2) * scaleFactor;

    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
    const hard = Math.max(0, Math.min(1, brushHardness / 100));
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(Math.max(0.01, hard), "rgba(0,0,0,1)");
    gradient.addColorStop(1, hard >= 0.999 ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize, brushHardness]);

  const commitMaskPreview = useCallback((canvas: HTMLCanvasElement, throttleMs: number) => {
    const now = Date.now();
    if (throttleMs > 0 && now - maskThrottleRef.current < throttleMs) return;
    maskThrottleRef.current = now;
    const dataUrl = canvas.toDataURL("image/png");
    if (!sceneLayer) return;
    // chaque commit de masque part à l'autosave — même un tap isolé plus
    // rapide que le chargement initial du canvas de masque
    dirtyRef.current = true;
    setLayers((current) =>
      current.map((l) => (l.id === sceneLayer.id ? { ...l, maskDataUrl: dataUrl } : l))
    );
  }, [sceneLayer]);

  async function handleEraserPointerDown(e: React.PointerEvent) {
    if (!eraserOn || !sceneLayer) return;
    e.preventDefault();
    const canvas = await ensureMaskCanvas();
    if (!canvas) return;
    pushHistory(layers);
    erasingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    eraseAt(canvas, e.clientX, e.clientY);
    commitMaskPreview(canvas, 0);
  }

  function handleEraserPointerMove(e: React.PointerEvent) {
    if (!erasingRef.current || !maskCanvasRef.current) return;
    eraseAt(maskCanvasRef.current, e.clientX, e.clientY);
    commitMaskPreview(maskCanvasRef.current, 80);
  }

  function handleEraserPointerUp() {
    if (!erasingRef.current || !maskCanvasRef.current) return;
    erasingRef.current = false;
    commitMaskPreview(maskCanvasRef.current, 0);
    dirtyRef.current = true;
  }

  function resetMask() {
    if (!sceneLayer) return;
    maskCanvasRef.current = null;
    updateLayer(sceneLayer.id, { maskDataUrl: undefined, maskUrl: undefined }, true);
  }

  // ── Ajouts de calques ───────────────────────────────────────────────────
  function addLogoLayer() {
    if (!project.logo_master) return;
    const layer: Layer = {
      id: makeId(),
      type: "logo",
      name: "Logo",
      x: 0.5,
      y: 0.5,
      scale: 0.16,
      rotation: 0,
      opacity: 1,
      blend: "normal",
      variant: "color",
      url: project.logo_master.url,
      aspect: 1,
    };
    mutateLayers((c) => [...c, layer], true);
    setSelectedId(layer.id);
  }

  function addEffectLayer(effect: EffectInfo) {
    const layer: Layer = {
      id: makeId(),
      type: effect.id.startsWith("grain") ? "grain" : "effect",
      name: effect.label,
      effectId: effect.id,
      url: effect.url,
      aspect: 1,
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      opacity: effect.opacity,
      blend: effect.blend as BlendMode,
    };
    mutateLayers((c) => [...c, layer], true);
    setSelectedId(layer.id);
    setEffectsOpen(false);
  }

  // ── Retouche par instruction courte ─────────────────────────────────────
  async function handleInstruct() {
    if (instructBusy || instruction.trim().length < 3) return;
    setInstructBusy(true);
    setError(null);
    try {
      const result = await instructLayer({
        projectId: project.id,
        assetId: initialAsset.id,
        instruction: instruction.trim(),
      });
      setLayers(stripLegacyTextLayers(result.asset.layers as Layer[]));
      setRetouchesUsed(result.retouchesUsed);
      setPast([]);
      setFuture([]);
      maskCanvasRef.current = null;
      setInstructOpen(false);
      setInstruction("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setInstructBusy(false);
    }
  }

  // ── Export ──────────────────────────────────────────────────────────────
  async function handleExport() {
    if (exportBusy) return;
    setExportBusy(true);
    setError(null);
    try {
      const result = await exportAsset({ projectId: project.id, assetId: initialAsset.id });
      setExportResult(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExportBusy(false);
    }
  }

  const layerIcon = (layer: Layer) =>
    layer.type === "logo" ? <Sparkles size={13} /> : <ImageIcon size={13} />;

  // La liste des calques s'affiche du plus haut au plus bas
  const reversedLayers = useMemo(() => [...layers].reverse(), [layers]);

  return (
    <div className="flex h-[calc(100dvh-0px)] min-h-0 flex-1 flex-col">
      {/* ── Barre supérieure ── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[color:var(--hairline)] bg-white/5 px-3 backdrop-blur-sm sm:px-5">
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-[13px] text-steel transition-colors hover:bg-ink/[0.04] hover:text-ink"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{project.name}</span>
        </Link>
        <span aria-hidden className="h-5 w-px bg-[color:var(--hairline-strong)]" />
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            dirtyRef.current = true;
          }}
          className="w-40 rounded-lg bg-transparent px-2 py-1 text-[14px] font-medium text-ink outline-none transition-colors focus:bg-ink/[0.04] sm:w-64"
          maxLength={80}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
          {saving ? "Enregistrement…" : savedAt ? `Enregistré ${savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "Enregistrement auto"}
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!past.length}
            className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors", past.length ? "text-steel hover:bg-ink/[0.05] hover:text-ink" : "text-mist")}
            aria-label="Annuler"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!future.length}
            className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors", future.length ? "text-steel hover:bg-ink/[0.05] hover:text-ink" : "text-mist")}
            aria-label="Rétablir"
          >
            <Redo2 size={15} />
          </button>
          <span aria-hidden className="mx-1 h-5 w-px bg-[color:var(--hairline-strong)]" />
          {sceneLayer ? (
            <>
              <button
                type="button"
                onClick={() => setEraserOn((v) => !v)}
                aria-pressed={eraserOn}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-[10px] border px-3.5 text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition-colors",
                  eraserOn
                    ? "border-[rgba(185,167,218,0.7)] bg-[rgba(185,167,218,0.12)] text-ink"
                    : "border-white/[0.12] bg-white/[0.04] text-slate hover:border-white/[0.24] hover:bg-white/[0.07] hover:text-ink"
                )}
              >
                <Eraser size={13} strokeWidth={1.5} />
                <span className="hidden md:inline">Gomme</span>
              </button>
              <button
                type="button"
                onClick={() => setInstructOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.12] bg-white/[0.04] px-3.5 text-[13px] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] transition-colors hover:border-white/[0.24] hover:bg-white/[0.07] hover:text-ink"
              >
                <Wand2 size={13} strokeWidth={1.5} />
                <span className="hidden md:inline">Retoucher</span>
                <span className="font-mono text-[10px] text-mist">{retouchesUsed}/5</span>
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportBusy}
            className="pv-btn nv-btn-sm"
          >
            {exportBusy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {exportBusy ? "Export…" : "Exporter"}
          </button>
        </div>
      </div>

      {/* ── Barre gomme ── */}
      <AnimatePresence>
        {eraserOn ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[color:var(--hairline)] bg-[rgba(185,167,218,0.05)]"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-dusk">
                Gomme — efface sur le héro, réversible
              </span>
              <label className="flex items-center gap-2.5 text-[12px] text-steel">
                Taille
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={2}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-32 accent-[#7C6BD4]"
                />
                <span className="font-mono text-[10px] text-dusk">{brushSize} px</span>
              </label>
              <label className="flex items-center gap-2.5 text-[12px] text-steel">
                Dureté
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={brushHardness}
                  onChange={(e) => setBrushHardness(Number(e.target.value))}
                  className="w-32 accent-[#7C6BD4]"
                />
                <span className="font-mono text-[10px] text-dusk">{brushHardness} %</span>
              </label>
              <button
                type="button"
                onClick={resetMask}
                className="text-[12px] text-steel underline-offset-2 transition-colors hover:text-ink hover:underline"
              >
                Tout rétablir
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? (
        <p className="border-b border-[rgba(220,80,80,0.25)] bg-[rgba(220,80,80,0.06)] px-5 py-2 text-[12.5px] text-[#E08A84]">
          {error}
        </p>
      ) : null}

      {/* ── Zone de travail ── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Canvas */}
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
          <div className="w-full" style={{ maxWidth: initialAsset.width >= initialAsset.height ? "1100px" : "460px" }}>
            <LayerCanvas
              ref={canvasRef}
              width={initialAsset.width}
              height={initialAsset.height}
              layers={layers}
              logoUrls={project.logo_master ? { color: project.logo_master.url, white: project.logo_master.whiteUrl, black: project.logo_master.blackUrl } : null}
              selectedId={selectedId}
              onSelect={(id) => {
                if (!eraserOn) setSelectedId(id);
              }}
              onPointerDownLayer={(e, layer) => beginGesture(e, layer, "move")}
              className="nv-corner-marks rounded-[10px] border border-[color:var(--hairline)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
            >
              {/* Canvas vide : le damier alpha annonce la transparence
                  — une table lumineuse, pas un rectangle mort */}
              {layers.every((l) => l.hidden) ? (
                <div aria-hidden className="nv-checker pointer-events-none absolute inset-0" />
              ) : null}
              {/* Surface de gomme — capte les traits quand le mode est actif */}
              {eraserOn && sceneLayer ? (
                <div
                  style={{ position: "absolute", inset: 0, zIndex: 40, touchAction: "none", cursor: "crosshair" }}
                  onPointerDown={handleEraserPointerDown}
                  onPointerMove={handleEraserPointerMove}
                  onPointerUp={handleEraserPointerUp}
                  onPointerLeave={handleEraserPointerUp}
                />
              ) : null}
              {/* Poignées de sélection — 44 px de zone tactile */}
              {selected && selectionBox && !eraserOn && !selected.locked ? (
                <>
                  {[
                    { corner: "nw", left: selectionBox.left, top: selectionBox.top },
                    { corner: "ne", left: selectionBox.left + selectionBox.width, top: selectionBox.top },
                    { corner: "sw", left: selectionBox.left, top: selectionBox.top + selectionBox.height },
                    { corner: "se", left: selectionBox.left + selectionBox.width, top: selectionBox.top + selectionBox.height },
                  ].map((handle) => (
                    <div
                      key={handle.corner}
                      style={{ position: "absolute", left: handle.left, top: handle.top, width: 44, height: 44, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "nwse-resize", touchAction: "none", zIndex: 30 }}
                      onPointerDown={(e) => beginGesture(e, selected, "scale")}
                    >
                      <span className="h-3 w-3 rounded-full border-2 border-white bg-[#7C6BD4] shadow-[0_1px_4px_rgba(0,0,0,0.4)]" />
                    </div>
                  ))}
                </>
              ) : null}
            </LayerCanvas>
            <p className="mt-2 text-center font-mono text-[10px] tracking-[0.1em] text-dusk">
              {initialAsset.width} × {initialAsset.height} px
              {eraserOn ? " — mode gomme : peins pour effacer, tout est réversible" : ""}
            </p>
          </div>
        </div>

        {/* ── Panneau latéral ── */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[color:var(--hairline)] bg-white/5 backdrop-blur-sm lg:w-[300px] lg:border-l lg:border-t-0">
          {/* Calques */}
          <div className="border-b border-[color:var(--hairline)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="pv-label">Calques</span>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEffectsOpen((o) => !o)}
                    className="flex h-7 items-center gap-1 rounded-[8px] border border-white/[0.12] bg-white/[0.04] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate transition-colors hover:border-white/[0.24] hover:bg-white/[0.07] hover:text-ink"
                  >
                    <Plus size={11} strokeWidth={1.5} />
                    Effet
                  </button>
                  <AnimatePresence>
                    {effectsOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-[color:var(--hairline-strong)] bg-abyss p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.48)]"
                      >
                        {effects.map((effect) => (
                          <button
                            key={effect.id}
                            type="button"
                            onClick={() => addEffectLayer(effect)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] text-ink transition-colors hover:bg-ink/[0.05]"
                          >
                            <span
                              className="h-6 w-6 shrink-0 rounded border border-[color:var(--hairline)] bg-[#14111F] bg-cover"
                              style={{ backgroundImage: `url(${effect.url})` }}
                            />
                            {effect.label}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                {project.logo_master && !layers.some((l) => l.type === "logo") ? (
                  <button
                    type="button"
                    onClick={addLogoLayer}
                    className="flex h-7 items-center gap-1 rounded-[8px] border border-white/[0.12] bg-white/[0.04] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-slate transition-colors hover:border-white/[0.24] hover:bg-white/[0.07] hover:text-ink"
                  >
                    <Plus size={11} strokeWidth={1.5} />
                    Logo
                  </button>
                ) : null}
              </div>
            </div>

            {layers.length === 0 ? (
              /* Panneau vide — une invitation, pas un trou */
              <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[color:var(--hairline)] px-4 py-6 text-center">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="text-mist"
                  aria-hidden
                >
                  {/* deux losanges empilés — le pictogramme calques */}
                  <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3Z" />
                  <path d="M4 12.5l8 4.5 8-4.5" />
                </svg>
                <p className="text-[13px] leading-relaxed text-mist">
                  Le visuel se compose ici, calque par calque.
                </p>
                {project.logo_master ? (
                  <button type="button" onClick={addLogoLayer} className="pv-btn pv-btn--ghost nv-btn-sm">
                    <Plus size={13} strokeWidth={1.5} />
                    Ajouter le logo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEffectsOpen(true)}
                    className="pv-btn pv-btn--ghost nv-btn-sm"
                  >
                    <Plus size={13} strokeWidth={1.5} />
                    Ajouter un effet
                  </button>
                )}
              </div>
            ) : null}

            <Reorder.Group
              axis="y"
              values={reversedLayers}
              onReorder={(next) => {
                mutateLayers(() => [...next].reverse(), true);
              }}
              className="flex max-h-44 flex-col gap-1 overflow-y-auto"
            >
              {reversedLayers.map((layer) => (
                <Reorder.Item
                  key={layer.id}
                  value={layer}
                  className={cn(
                    "flex cursor-grab items-center gap-2 rounded-lg border px-2 py-1.5 active:cursor-grabbing",
                    selectedId === layer.id
                      ? "border-[rgba(185,167,218,0.55)] bg-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.42)]"
                      : "border-transparent hover:bg-ink/[0.04]"
                  )}
                  onClick={() => setSelectedId(layer.id)}
                >
                  <GripVertical size={12} className="shrink-0 text-mist" />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[color:var(--hairline)] bg-ink/[0.04] text-steel">
                    {layerIcon(layer)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{layer.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, { hidden: !layer.hidden }, true);
                    }}
                    className="shrink-0 rounded p-1 text-mist transition-colors hover:text-ink"
                    aria-label={layer.hidden ? "Afficher" : "Masquer"}
                  >
                    {layer.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  {layer.type !== "scene" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        mutateLayers((c) => c.filter((l) => l.id !== layer.id), true);
                        if (selectedId === layer.id) setSelectedId(null);
                      }}
                      className="shrink-0 rounded p-1 text-mist transition-colors hover:text-[#E08A84]"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Propriétés du calque sélectionné — réduit à la mission */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {!selected ? (
              <p className="mt-4 text-center text-[12px] leading-relaxed text-mist">
                Sélectionne un calque sur le canvas
                <br />
                ou dans la liste.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="pv-label">{selected.name}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dusk">{selected.type}</span>
                </div>

                <label className="block">
                  <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                    Opacité <span>{Math.round(selected.opacity * 100)} %</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={selected.opacity}
                    onChange={(e) => updateLayer(selected.id, { opacity: Number(e.target.value) })}
                    onPointerDown={() => pushHistory(layers)}
                    className="mt-1.5 w-full accent-[#7C6BD4]"
                  />
                </label>

                {/* Logo : déclinaison + rappel replacer/scaler */}
                {selected.type === "logo" ? (
                  <>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">Déclinaison</span>
                      <div className="mt-1.5 grid grid-cols-3 gap-1">
                        {(["color", "white", "black"] as const).map((variant) => (
                          <button
                            key={variant}
                            type="button"
                            onClick={() => updateLayer(selected.id, { variant }, true)}
                            className={cn(
                              "rounded-lg border px-1 py-1.5 text-[10.5px] transition-colors",
                              (selected.variant ?? "color") === variant
                                ? "border-[rgba(185,167,218,0.6)] bg-white/5 text-ink"
                                : "border-[color:var(--hairline)] text-steel hover:text-ink"
                            )}
                          >
                            {variant === "color" ? "Couleur" : variant === "white" ? "Blanc" : "Noir"}
                          </button>
                        ))}
                      </div>
                    </label>
                    <p className="text-[11px] leading-relaxed text-mist">
                      Glisse le logo pour le replacer, tire une poignée d&apos;angle pour le redimensionner.
                    </p>
                  </>
                ) : null}

                {selected.type === "scene" ? (
                  <p className="text-[11px] leading-relaxed text-mist">
                    Le titre vit dans ce calque — pour le changer, utilise «&nbsp;Retoucher&nbsp;»
                    («&nbsp;passe le titre en chrome&nbsp;», «&nbsp;scène de nuit&nbsp;»…).
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Modale retouche par instruction ── */}
      <AnimatePresence>
        {instructOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,16,40,0.45)] p-4 backdrop-blur-sm"
            onClick={() => !instructBusy && setInstructOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-md rounded-2xl border border-[color:var(--hairline-strong)] bg-abyss p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="pv-label text-[color:var(--num-color)]">Retoucher le visuel</p>
                  <h2 className="pv-display mt-2 text-xl text-ink">Que change-t-on&nbsp;?</h2>
                </div>
                <button type="button" onClick={() => setInstructOpen(false)} className="rounded-lg p-1.5 text-mist hover:text-ink" aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <label className="mt-5 block">
                <input
                  autoFocus
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleInstruct(); }}
                  placeholder="Passe le titre en chrome, scène de nuit, retire le personnage de gauche…"
                  maxLength={240}
                  className="w-full rounded-xl border border-[color:var(--hairline-strong)] px-4 py-3 text-[14px] text-ink outline-none placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(185,167,218,0.3)]"
                />
              </label>
              <p className="mt-2 text-[11.5px] leading-relaxed text-mist">
                Le reste du visuel est conservé — composition, sujets, orthographe du titre vérifiée.
              </p>

              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-dusk">
                  {retouchesUsed < 5 ? `Retouche ${retouchesUsed + 1}/5 — incluse` : "Retouches épuisées — 1 création"}
                </span>
                <button
                  type="button"
                  disabled={instructBusy || instruction.trim().length < 3}
                  onClick={handleInstruct}
                  className="pv-btn nv-btn-sm"
                >
                  {instructBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {instructBusy ? "Génération…" : "Appliquer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── Modale export réussi ── */}
      <AnimatePresence>
        {exportResult ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,16,40,0.45)] p-4 backdrop-blur-sm"
            onClick={() => setExportResult(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-md rounded-2xl border border-[color:var(--hairline-strong)] bg-abyss p-6 text-center shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(111,191,159,0.40)] text-[#6FBF9F]">
                <Check size={20} />
              </span>
              <h2 className="pv-display mt-4 text-xl text-ink">Export livré.</h2>
              <p className="mt-2 text-sm text-steel">
                {exportResult.resolution} px — 1 création débitée, {exportResult.remaining} restante{exportResult.remaining > 1 ? "s" : ""}.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exportResult.url}
                alt="Export final"
                className="mx-auto mt-4 max-h-44 rounded-lg border border-[color:var(--hairline)]"
              />
              <div className="mt-5 flex items-center justify-center gap-3">
                <a
                  href={exportResult.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="pv-btn nv-btn-sm"
                >
                  <Download size={13} />
                  Télécharger
                </a>
                <button type="button" onClick={() => setExportResult(null)} className="pv-link text-[13px]">
                  Continuer l&apos;édition
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
