import { Anton, Archivo_Black, Bebas_Neue, Montserrat, Oswald } from "next/font/google";
import type { TextFontId } from "@/lib/projects-shared";

// Typos display des calques texte — chargées une fois, utilisées par
// l'aperçu éditeur. L'export serveur rend les mêmes familles.

const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"], display: "swap" });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap" });
const oswald = Oswald({ subsets: ["latin"], display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap" });

export const FONT_FAMILIES: Record<TextFontId, string> = {
  "archivo-black": archivoBlack.style.fontFamily,
  "bebas-neue": bebasNeue.style.fontFamily,
  anton: anton.style.fontFamily,
  oswald: oswald.style.fontFamily,
  montserrat: montserrat.style.fontFamily,
};

export function fontFamilyFor(id: string | undefined): string {
  return FONT_FAMILIES[(id ?? "archivo-black") as TextFontId] ?? FONT_FAMILIES["archivo-black"];
}
