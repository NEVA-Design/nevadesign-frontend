"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Download,
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
  Type,
  Undo2,
  X,
} from "lucide-react";
import LayerCanvas from "@/components/editor/LayerCanvas";
import { BACKEND_URL } from "@/lib/api/backend-client";
import { exportAsset, regenerateScene } from "@/lib/api/engine";
import { saveAsset } from "@/lib/api/projects";
import {
  CATEGORY_LABELS,
  TEXT_FONT_IDS,
  TEXT_FONT_LABELS,
  type AssetCategory,
  type BlendMode,
  type Layer,
} from "@/lib/projects-shared";
import { backendFetch } from "@/lib/api/backend-client";
import { cn } from "@/lib/utils";

/*
 * L'éditeur par calques — le mini-Photoshop de l'atelier.
 * Compositing 100 % local (aucun aller-retour serveur pour bouger un
 * texte), poignées 44 px, réordonnancement par glisser, édition de texte
 * inline au double-clic, undo/redo 30 pas, autosave, régénération du
 * calque scène (5 retouches incluses), export serveur au clic.
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
const BLENDS: BlendMode[] = ["normal", "screen", "multiply", "overlay"];
const BLEND_LABELS: Record<BlendMode, string> = {
  normal: "Normal",
  screen: "Screen",
  multiply: "Multiply",
  overlay: "Overlay",
};

function makeId() {
  return `layer-${Math.random().toString(36).slice(2, 10)}`;
}

type Gesture = {
  mode: "move" | "scale" | "rotate";
  layerId: string;
  startClientX: number;
  startClientY: number;
  origin: Layer;
  centerPx: { x: number; y: number };
  startDistance: number;
  startAngle: number;
};

export default function AssetEditor({ project, initialAsset }: { project: ProjectInfo; initialAsset: AssetInfo }) {
  const [layers, setLayers] = useState<Layer[]>(initialAsset.layers ?? []);
  const [title, setTitle] = useState(initialAsset.title ?? CATEGORY_LABELS[initialAsset.category as AssetCategory] ?? "Création");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [retouchesUsed, setRetouchesUsed] = useState(initialAsset.retouches_used ?? 0);

  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);

  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  const [effects, setEffects] = useState<EffectInfo[]>([]);
  const [effectsOpen, setEffectsOpen] = useState(false);

  const [regenOpen, setRegenOpen] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  const [regenKeep, setRegenKeep] = useState(true);
  const [regenNotes, setRegenNotes] = useState({ lieu: "", personnages: "", props: "" });

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
      return f.slice(0, -1);
    });
  }, []);

  // ── Autosave (1,2 s après la dernière modification) ─────────────────────
  useEffect(() => {
    if (!dirtyRef.current) return;
    const timeout = setTimeout(async () => {
      dirtyRef.current = false;
      setSaving(true);
      try {
        await saveAsset(project.id, initialAsset.id, { layers, title });
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
      if (editingId) return;
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
  }, [editingId, selectedId, layers, undo, redo, mutateLayers, updateLayer]);

  // ── Gestes canvas : déplacer / redimensionner / pivoter ─────────────────
  const beginGesture = useCallback((e: React.PointerEvent, layer: Layer, mode: Gesture["mode"]) => {
    if (layer.locked) return;
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
      startAngle: (Math.atan2(dy, dx) * 180) / Math.PI,
    };
    pushHistory(layers);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }, [layers, pushHistory]);

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
      } else if (gesture.mode === "scale") {
        const distance = Math.max(8, Math.hypot(e.clientX - gesture.centerPx.x, e.clientY - gesture.centerPx.y));
        const ratio = distance / gesture.startDistance;
        setLayers((current) =>
          current.map((l) => {
            if (l.id !== gesture.layerId) return l;
            if (l.type === "text") {
              return { ...l, sizeRel: Math.min(0.9, Math.max(0.015, (gesture.origin.sizeRel ?? 0.1) * ratio)) };
            }
            return { ...l, scale: Math.min(4, Math.max(0.02, gesture.origin.scale * ratio)) };
          })
        );
      } else {
        const angle = (Math.atan2(e.clientY - gesture.centerPx.y, e.clientX - gesture.centerPx.x) * 180) / Math.PI;
        let rotation = gesture.origin.rotation + (angle - gesture.startAngle);
        if (e.shiftKey) rotation = Math.round(rotation / 15) * 15;
        setLayers((current) =>
          current.map((l) => (l.id === gesture.layerId ? { ...l, rotation: Math.round(rotation * 10) / 10 } : l))
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

  // ── Ajouts de calques ───────────────────────────────────────────────────
  function addTextLayer() {
    const layer: Layer = {
      id: makeId(),
      type: "text",
      name: "Texte",
      text: "NOUVEAU TEXTE",
      font: "archivo-black",
      weight: 900,
      sizeRel: 0.08,
      x: 0.5,
      y: 0.3,
      scale: 1,
      rotation: 0,
      opacity: 1,
      blend: "normal",
      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 0,
      shadow: { x: 0, y: 3, blur: 14, color: "rgba(0,0,0,0.55)" },
      gradient: null,
      letterSpacing: 0.06,
      align: "center",
      uppercase: true,
    };
    mutateLayers((c) => [...c, layer], true);
    setSelectedId(layer.id);
  }

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

  // ── Régénération du calque scène ────────────────────────────────────────
  async function handleRegenerate() {
    if (regenBusy) return;
    setRegenBusy(true);
    setError(null);
    try {
      const result = await regenerateScene({
        projectId: project.id,
        assetId: initialAsset.id,
        keepComposition: regenKeep,
        answers: {
          lieu: regenNotes.lieu.trim() || undefined,
          personnages: regenNotes.personnages.trim() || undefined,
          props: regenNotes.props.trim() || undefined,
        },
      });
      setLayers(result.asset.layers as Layer[]);
      setRetouchesUsed(result.retouchesUsed);
      setPast([]);
      setFuture([]);
      setRegenOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRegenBusy(false);
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
    layer.type === "text" ? <Type size={13} /> : layer.type === "logo" ? <Sparkles size={13} /> : <ImageIcon size={13} />;

  // La liste des calques s'affiche du plus haut au plus bas
  const reversedLayers = useMemo(() => [...layers].reverse(), [layers]);

  return (
    <div className="flex h-[calc(100dvh-0px)] min-h-0 flex-1 flex-col">
      {/* ── Barre supérieure ── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[color:var(--hairline)] bg-white/55 px-3 backdrop-blur-sm sm:px-5">
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
          {saving ? "Enregistrement…" : savedAt ? `Enregistré ${savedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "—"}
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
            <button
              type="button"
              onClick={() => setRegenOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-[color:var(--hairline-strong)] px-3.5 text-[13px] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
            >
              <RefreshCw size={13} />
              <span className="hidden md:inline">Régénérer</span>
              <span className="font-mono text-[10px] text-dusk">{retouchesUsed}/5</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportBusy}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white shadow-[0_0_0_1px_rgba(164,139,232,0.4),0_4px_18px_rgba(164,139,232,0.25)] transition-colors hover:bg-[#35305E]"
          >
            {exportBusy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {exportBusy ? "Export…" : "Exporter"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="border-b border-[rgba(220,80,80,0.25)] bg-[rgba(220,80,80,0.06)] px-5 py-2 text-[12.5px] text-[#B4443C]">
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
                setSelectedId(id);
                if (editingId && editingId !== id) setEditingId(null);
              }}
              onPointerDownLayer={(e, layer) => beginGesture(e, layer, "move")}
              editingId={editingId}
              onTextInput={(layerId, text) => updateLayer(layerId, { text })}
              onEditEnd={() => setEditingId(null)}
              onDoubleClickLayer={(layer) => {
                if (layer.type === "text") setEditingId(layer.id);
              }}
              className="rounded-xl border border-[color:var(--hairline-strong)] shadow-[0_24px_64px_rgba(43,36,80,0.25)]"
            >
              {/* Poignées de sélection — 44 px de zone tactile */}
              {selected && selectionBox && !editingId && !selected.locked ? (
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
                  <div
                    style={{ position: "absolute", left: selectionBox.left + selectionBox.width / 2, top: selectionBox.top - 30, width: 44, height: 44, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab", touchAction: "none", zIndex: 30 }}
                    onPointerDown={(e) => beginGesture(e, selected, "rotate")}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/70 bg-[#2B2450] text-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                      <RefreshCw size={10} />
                    </span>
                  </div>
                </>
              ) : null}
            </LayerCanvas>
            <p className="mt-2 text-center font-mono text-[10px] tracking-[0.1em] text-dusk">
              {initialAsset.width} × {initialAsset.height} px — double-clic sur un texte pour l&apos;éditer
            </p>
          </div>
        </div>

        {/* ── Panneau latéral ── */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[color:var(--hairline)] bg-white/55 backdrop-blur-sm lg:w-[300px] lg:border-l lg:border-t-0">
          {/* Calques */}
          <div className="border-b border-[color:var(--hairline)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="pv-label">Calques</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={addTextLayer}
                  className="flex h-7 items-center gap-1 rounded-full border border-[color:var(--hairline-strong)] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                >
                  <Plus size={11} />
                  Texte
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEffectsOpen((o) => !o)}
                    className="flex h-7 items-center gap-1 rounded-full border border-[color:var(--hairline-strong)] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                  >
                    <Plus size={11} />
                    Effet
                  </button>
                  <AnimatePresence>
                    {effectsOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 top-9 z-50 w-52 rounded-xl border border-[color:var(--hairline-strong)] bg-white p-1.5 shadow-[0_18px_44px_rgba(43,36,80,0.18)]"
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
                    className="flex h-7 items-center gap-1 rounded-full border border-[color:var(--hairline-strong)] px-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-steel transition-colors hover:border-[rgba(164,139,232,0.5)] hover:text-ink"
                  >
                    <Plus size={11} />
                    Logo
                  </button>
                ) : null}
              </div>
            </div>

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
                      ? "border-[rgba(164,139,232,0.55)] bg-white shadow-[0_2px_8px_rgba(96,84,140,0.12)]"
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
                      className="shrink-0 rounded p-1 text-mist transition-colors hover:text-[#B4443C]"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : null}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          {/* Propriétés du calque sélectionné */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {!selected ? (
              <p className="mt-4 text-center text-[12px] leading-relaxed text-mist">
                Sélectionnez un calque sur le canvas
                <br />
                ou dans la liste.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="pv-label">{selected.name}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-dusk">{selected.type}</span>
                </div>

                {/* Opacité + blend — communs */}
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
                <label className="block">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">Fusion</span>
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {BLENDS.map((blend) => (
                      <button
                        key={blend}
                        type="button"
                        onClick={() => updateLayer(selected.id, { blend }, true)}
                        className={cn(
                          "rounded-lg border px-1 py-1.5 text-[10px] transition-colors",
                          selected.blend === blend
                            ? "border-[rgba(164,139,232,0.6)] bg-white text-ink"
                            : "border-[color:var(--hairline)] text-steel hover:text-ink"
                        )}
                      >
                        {BLEND_LABELS[blend]}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Logo : déclinaison */}
                {selected.type === "logo" ? (
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
                              ? "border-[rgba(164,139,232,0.6)] bg-white text-ink"
                              : "border-[color:var(--hairline)] text-steel hover:text-ink"
                          )}
                        >
                          {variant === "color" ? "Couleur" : variant === "white" ? "Blanc" : "Noir"}
                        </button>
                      ))}
                    </div>
                  </label>
                ) : null}

                {/* Texte */}
                {selected.type === "text" ? (
                  <>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">Texte</span>
                      <textarea
                        value={selected.text ?? ""}
                        rows={2}
                        onFocus={() => pushHistory(layers)}
                        onChange={(e) => updateLayer(selected.id, { text: e.target.value })}
                        className="mt-1.5 w-full resize-none rounded-lg border border-[color:var(--hairline-strong)] bg-white px-2.5 py-2 text-[13px] text-ink outline-none focus:shadow-[0_0_0_2px_rgba(164,139,232,0.3)]"
                      />
                    </label>
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">Typographie</span>
                      <select
                        value={selected.font ?? "archivo-black"}
                        onChange={(e) => updateLayer(selected.id, { font: e.target.value }, true)}
                        className="mt-1.5 w-full rounded-lg border border-[color:var(--hairline-strong)] bg-white px-2.5 py-2 text-[13px] text-ink outline-none"
                      >
                        {TEXT_FONT_IDS.map((id) => (
                          <option key={id} value={id}>
                            {TEXT_FONT_LABELS[id]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                        Taille <span>{Math.round((selected.sizeRel ?? 0.1) * 100)} %</span>
                      </span>
                      <input
                        type="range"
                        min={0.02}
                        max={0.6}
                        step={0.005}
                        value={selected.sizeRel ?? 0.1}
                        onChange={(e) => updateLayer(selected.id, { sizeRel: Number(e.target.value) })}
                        onPointerDown={() => pushHistory(layers)}
                        className="mt-1.5 w-full accent-[#7C6BD4]"
                      />
                    </label>
                    <label className="block">
                      <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                        Espacement <span>{(selected.letterSpacing ?? 0).toFixed(2)} em</span>
                      </span>
                      <input
                        type="range"
                        min={-0.05}
                        max={0.6}
                        step={0.01}
                        value={selected.letterSpacing ?? 0}
                        onChange={(e) => updateLayer(selected.id, { letterSpacing: Number(e.target.value) })}
                        onPointerDown={() => pushHistory(layers)}
                        className="mt-1.5 w-full accent-[#7C6BD4]"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">Couleur</span>
                        <input
                          type="color"
                          value={selected.gradient ? "#FFFFFF" : (selected.color ?? "#FFFFFF")}
                          disabled={Boolean(selected.gradient)}
                          onChange={(e) => updateLayer(selected.id, { color: e.target.value.toUpperCase() }, true)}
                          className="mt-1.5 h-9 w-full cursor-pointer rounded-lg border border-[color:var(--hairline-strong)] bg-white"
                        />
                      </label>
                      <label className="block">
                        <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                          Contour <span>{Math.round((selected.strokeWidth ?? 0) * 100)}</span>
                        </span>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <input
                            type="color"
                            value={selected.strokeColor ?? "#000000"}
                            onChange={(e) => updateLayer(selected.id, { strokeColor: e.target.value.toUpperCase() }, true)}
                            className="h-9 w-10 cursor-pointer rounded-lg border border-[color:var(--hairline-strong)] bg-white"
                          />
                          <input
                            type="range"
                            min={0}
                            max={0.08}
                            step={0.005}
                            value={selected.strokeWidth ?? 0}
                            onChange={(e) => updateLayer(selected.id, { strokeWidth: Number(e.target.value) })}
                            onPointerDown={() => pushHistory(layers)}
                            className="w-full accent-[#7C6BD4]"
                          />
                        </div>
                      </label>
                    </div>

                    {/* Ombre + dégradé */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateLayer(
                            selected.id,
                            { shadow: selected.shadow ? null : { x: 0, y: 3, blur: 14, color: "rgba(0,0,0,0.55)" } },
                            true
                          )
                        }
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11.5px] transition-colors",
                          selected.shadow
                            ? "border-[rgba(164,139,232,0.6)] bg-white text-ink"
                            : "border-[color:var(--hairline)] text-steel hover:text-ink"
                        )}
                      >
                        {selected.shadow ? <Check size={12} /> : null}
                        Ombre
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLayer(
                            selected.id,
                            { gradient: selected.gradient ? null : { from: "#FFD166", to: "#E63946", angle: 180 } },
                            true
                          )
                        }
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11.5px] transition-colors",
                          selected.gradient
                            ? "border-[rgba(164,139,232,0.6)] bg-white text-ink"
                            : "border-[color:var(--hairline)] text-steel hover:text-ink"
                        )}
                      >
                        {selected.gradient ? <Check size={12} /> : null}
                        Dégradé
                      </button>
                    </div>
                    {selected.gradient ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selected.gradient.from}
                          onChange={(e) => updateLayer(selected.id, { gradient: { ...selected.gradient!, from: e.target.value.toUpperCase() } })}
                          className="h-9 w-full cursor-pointer rounded-lg border border-[color:var(--hairline-strong)] bg-white"
                        />
                        <input
                          type="color"
                          value={selected.gradient.to}
                          onChange={(e) => updateLayer(selected.id, { gradient: { ...selected.gradient!, to: e.target.value.toUpperCase() } })}
                          className="h-9 w-full cursor-pointer rounded-lg border border-[color:var(--hairline-strong)] bg-white"
                        />
                      </div>
                    ) : null}
                  </>
                ) : null}

                {/* Rotation précise */}
                <label className="block">
                  <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                    Rotation <span>{Math.round(selected.rotation)}°</span>
                  </span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={selected.rotation}
                    onChange={(e) => updateLayer(selected.id, { rotation: Number(e.target.value) })}
                    onPointerDown={() => pushHistory(layers)}
                    className="mt-1.5 w-full accent-[#7C6BD4]"
                  />
                </label>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Modale régénération ── */}
      <AnimatePresence>
        {regenOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,16,40,0.45)] p-4 backdrop-blur-sm"
            onClick={() => !regenBusy && setRegenOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="w-full max-w-md rounded-2xl border border-[color:var(--hairline-strong)] bg-white p-6 shadow-[0_32px_80px_rgba(43,36,80,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="pv-label text-[color:var(--num-color)]">Régénérer la scène</p>
                  <h2 className="pv-display mt-2 text-xl text-ink">Que change-t-on&nbsp;?</h2>
                </div>
                <button type="button" onClick={() => setRegenOpen(false)} className="rounded-lg p-1.5 text-mist hover:text-ink" aria-label="Fermer">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {[
                  { key: "lieu" as const, label: "Lieu", placeholder: "Garder le même si vide" },
                  { key: "personnages" as const, label: "Personnages", placeholder: "Garder les mêmes si vide" },
                  { key: "props" as const, label: "Objets", placeholder: "Garder les mêmes si vide" },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">{field.label}</span>
                    <input
                      value={regenNotes[field.key]}
                      onChange={(e) => setRegenNotes((n) => ({ ...n, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      maxLength={200}
                      className="mt-1.5 w-full rounded-lg border border-[color:var(--hairline-strong)] px-3 py-2 text-[13px] text-ink outline-none placeholder:text-mist focus:shadow-[0_0_0_2px_rgba(164,139,232,0.3)]"
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setRegenKeep((k) => !k)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-[13px] transition-colors",
                    regenKeep ? "border-[rgba(164,139,232,0.55)] bg-[rgba(164,139,232,0.06)] text-ink" : "border-[color:var(--hairline-strong)] text-steel"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border",
                      regenKeep ? "border-transparent bg-ink text-white" : "border-[color:var(--hairline-strong)]"
                    )}
                  >
                    {regenKeep ? <Check size={12} /> : null}
                  </span>
                  Garder la composition actuelle
                </button>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-[10.5px] tracking-[0.06em] text-dusk">
                  {retouchesUsed < 5 ? `Retouche ${retouchesUsed + 1}/5 — incluse` : "Retouches épuisées — 1 création"}
                </span>
                <button
                  type="button"
                  disabled={regenBusy}
                  onClick={handleRegenerate}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#35305E]"
                >
                  {regenBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {regenBusy ? "Génération…" : "Régénérer"}
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
              className="w-full max-w-md rounded-2xl border border-[color:var(--hairline-strong)] bg-white p-6 text-center shadow-[0_32px_80px_rgba(43,36,80,0.35)]"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(61,122,88,0.4)] text-[#3D7A58]">
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
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-colors hover:bg-[#35305E]"
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
