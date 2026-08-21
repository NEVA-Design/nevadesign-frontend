"use client";

import { forwardRef } from "react";
import { stripLegacyTextLayers, type Layer } from "@/lib/projects-shared";

/*
 * Rendu pur des calques — le cœur visuel de l'éditeur ET du viewer.
 * Compositing 100 % local (DOM/CSS, transforms GPU). Run 5.2 : le texte
 * n'existe plus comme calque (le lettrage est généré dans le héro) ; la
 * gomme non destructive s'affiche via CSS mask (le même masque alpha que
 * le compositing serveur applique à l'export).
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

function maskStyle(layer: Layer): React.CSSProperties {
  const mask = layer.maskDataUrl ?? layer.maskUrl;
  if (!mask) return {};
  return {
    WebkitMaskImage: `url(${mask})`,
    maskImage: `url(${mask})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
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
      {stripLegacyTextLayers(layers).map((layer) => {
        if (layer.hidden) return null;
        const selected = selectedId === layer.id;
        const outline = selected
          ? { outline: "1.5px solid rgba(185,167,218,0.95)", outlineOffset: "2px" }
          : undefined;

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
              ...maskStyle(layer),
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
