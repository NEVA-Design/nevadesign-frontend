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

export type LayerType = "scene" | "effect" | "logo" | "text" | "grain";
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
  text?: string;
  font?: string;
  weight?: number;
  sizeRel?: number;
  color?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadow?: { x: number; y: number; blur: number; color: string } | null;
  gradient?: { from: string; to: string; angle: number } | null;
  letterSpacing?: number;
  align?: "left" | "center" | "right";
  uppercase?: boolean;
};

export const TEXT_FONT_IDS = ["archivo-black", "bebas-neue", "anton", "oswald", "montserrat"] as const;
export type TextFontId = (typeof TEXT_FONT_IDS)[number];

export const TEXT_FONT_LABELS: Record<TextFontId, string> = {
  "archivo-black": "Archivo Black",
  "bebas-neue": "Bebas Neue",
  anton: "Anton",
  oswald: "Oswald",
  montserrat: "Montserrat",
};

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
