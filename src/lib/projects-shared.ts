// Constantes du modèle Projet partagées entre Server et Client Components
// (pas de "use client" ici — importable des deux côtés).

export type AssetCategory =
  | "logo"
  | "banniere_discord"
  | "banniere_fivem"
  | "banniere_f5"
  | "affiche"
  | "wallpaper"
  | "loading_screen"
  | "icon"
  | "libre";

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  logo: "Logo",
  banniere_discord: "Bannière Discord",
  banniere_fivem: "Bannière FiveM",
  banniere_f5: "Bannière menu F5",
  affiche: "Affiche",
  wallpaper: "Wallpaper",
  loading_screen: "Loading screen",
  icon: "Icône",
  libre: "Création libre",
};

// Dimensions réelles d'export par catégorie (px) — la forme montrée à
// l'échelle dans le wizard vient d'ici.
export const CATEGORY_SPECS: Record<AssetCategory, { width: number; height: number; usage: string }> = {
  logo: { width: 4096, height: 4096, usage: "Master PNG alpha — décliné partout" },
  banniere_discord: { width: 1920, height: 1080, usage: "Bannière de serveur Discord" },
  banniere_fivem: { width: 3730, height: 216, usage: "Bandeau liste des serveurs FiveM" },
  banniere_f5: { width: 1920, height: 1080, usage: "Fond du menu F5 en jeu" },
  affiche: { width: 1080, height: 1350, usage: "Annonce, événement, règlement" },
  wallpaper: { width: 3840, height: 2160, usage: "Fond d'écran communauté" },
  loading_screen: { width: 1920, height: 1080, usage: "Écran de chargement du serveur" },
  icon: { width: 512, height: 512, usage: "Icône Discord / launcher" },
  libre: { width: 1920, height: 1080, usage: "Format libre" },
};

// ── Modèle de calques (miroir du backend engine/layers.ts) ──────────────────
// Transforms NORMALISÉS en fractions du canvas : le même calque se rend à
// l'identique en aperçu éditeur et en export serveur haute résolution.
//
// Run 5.2 : le type "text" n'existe plus — le lettrage (titre, baseline)
// est GÉNÉRÉ dans le calque héro par le moteur. Les blend modes ne sont
// plus exposés dans l'éditeur (portés par les effets maison uniquement).

export type LayerType = "scene" | "effect" | "logo" | "grain";
export type BlendMode = "normal" | "screen" | "multiply" | "overlay";

export type Layer = {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blend: BlendMode;
  locked?: boolean;
  hidden?: boolean;
  url?: string;
  aspect?: number;
  variant?: "color" | "white" | "black";
  effectId?: string;
  // gomme non destructive : masque alpha (blanc opaque = visible,
  // transparent = effacé) — URL stockée côté serveur, ou dataURL locale
  // le temps de l'édition (maskDataUrl prime à l'affichage)
  maskUrl?: string;
  maskDataUrl?: string;
};

// Migration : les assets d'avant le run 5.2 peuvent contenir des calques
// "text" en base — filtrés à l'entrée de l'éditeur et du viewer.
export function stripLegacyTextLayers(layers: unknown): Layer[] {
  if (!Array.isArray(layers)) return [];
  return (layers as Array<{ type?: string }>).filter((l) => l && l.type !== "text") as Layer[];
}

// L'ordre d'affichage des catégories dans la page projet et le hub
export const CATEGORY_ORDER: AssetCategory[] = [
  "logo",
  "banniere_discord",
  "banniere_fivem",
  "banniere_f5",
  "affiche",
  "wallpaper",
  "loading_screen",
  "icon",
  "libre",
];
