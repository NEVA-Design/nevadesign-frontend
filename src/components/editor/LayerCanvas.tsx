"use client";

import { forwardRef } from "react";
import type { Layer } from "@/lib/projects-shared";
import { fontFamilyFor } from "./editorFonts";

/*
 * Rendu pur des calques — le cœur visuel de l'éditeur ET du viewer.
 * Compositing 100 % local (DOM/CSS, transforms GPU) : déplacer un texte ne
 * déclenche aucun aller-retour serveur. Les tailles de texte utilisent les
 * unités de container query (cqh) : le rendu est identique quelle que soit
 * la taille d'affichage du canvas.
 */

export function layerTransformStyle(layer: Layer): React.CSSProperties {
  return {
    position: "absolute",
    left: `${layer.x * 100}%`,
    top: `${layer.y * 100}%`,
    transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
    opacity: layer.opacity,
    mixBlendMode: layer.blend === "normal" ? undefined : layer.blend,
  };
}

export function textLayerStyle(layer: Layer): React.CSSProperties {
  const gradient = layer.gradient
    ? {
        backgroundImage: `linear-gradient(${layer.gradient.angle}deg, ${layer.gradient.from}, ${layer.gradient.to})`,
        WebkitBackgroundClip: "text" as const,
        backgroundClip: "text" as const,
        color: "transparent",
      }
    : { color: layer.color ?? "#FFFFFF" };

  return {
    ...layerTransformStyle(layer),
    fontFamily: fontFamilyFor(layer.font),
    fontWeight: layer.weight ?? 700,
    fontSize: `calc(${(layer.sizeRel ?? 0.1) * 100} * 1cqh)`,
    lineHeight: 1.04,
    letterSpacing: `${layer.letterSpacing ?? 0}em`,
    textAlign: layer.align ?? "center",
    whiteSpace: "pre",
    textTransform: layer.uppercase ? "uppercase" : undefined,
    WebkitTextStroke:
      layer.strokeWidth && layer.strokeColor
        ? `calc(${(layer.sizeRel ?? 0.1) * 100 * (layer.strokeWidth ?? 0)} * 1cqh) ${layer.strokeColor}`
        : undefined,
    textShadow: layer.shadow
      ? `${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color}`
      : undefined,
    userSelect: "none",
    ...gradient,
  };
}

type LayerCanvasProps = {
  width: number;
  height: number;
  layers: Layer[];
  logoUrls?: { color: string; white?: string | null; black?: string | null } | null;
  selectedId?: string | null;
  onSelect?: (layerId: string | null) => void;
  onPointerDownLayer?: (event: React.PointerEvent, layer: Layer) => void;
  className?: string;
  children?: React.ReactNode;
};

export function logoUrlForVariant(
  layer: Layer,
  logoUrls?: LayerCanvasProps["logoUrls"]
): string | undefined {
  if (layer.type !== "logo") return layer.url;
  if (!logoUrls) return layer.url;
  if (layer.variant === "white" && logoUrls.white) return logoUrls.white;
  if (layer.variant === "black" && logoUrls.black) return logoUrls.black;
  return logoUrls.color || layer.url;
}

const LayerCanvas = forwardRef<HTMLDivElement, LayerCanvasProps>(function LayerCanvas(
  { width, height, layers, logoUrls, selectedId, onSelect, onPointerDownLayer, className, children },
  ref
) {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        aspectRatio: `${width} / ${height}`,
        containerType: "size",
        overflow: "hidden",
        background: "#0B0B10",
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onSelect?.(null);
      }}
    >
      {layers.map((layer) => {
        if (layer.hidden) return null;
        const selected = selectedId === layer.id;
        const outline = selected
          ? { outline: "1.5px solid rgba(164,139,232,0.95)", outlineOffset: "2px" }
          : undefined;

        if (layer.type === "text") {
          return (
            <div
              key={layer.id}
              data-layer-id={layer.id}
              style={{ ...textLayerStyle(layer), ...outline, cursor: onPointerDownLayer ? "grab" : undefined }}
              onPointerDown={(e) => {
                onSelect?.(layer.id);
                onPointerDownLayer?.(e, layer);
              }}
            >
              {layer.text ?? ""}
            </div>
          );
        }

        const url = logoUrlForVariant(layer, logoUrls);
        if (!url) return null;
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={layer.id}
            data-layer-id={layer.id}
            src={url}
            alt=""
            draggable={false}
            style={{
              ...layerTransformStyle(layer),
              width: `${layer.scale * 100}%`,
              cursor: onPointerDownLayer ? "grab" : undefined,
              ...outline,
            }}
            onPointerDown={(e) => {
              onSelect?.(layer.id);
              onPointerDownLayer?.(e, layer);
            }}
          />
        );
      })}
      {children}
    </div>
  );
});

export default LayerCanvas;
