import { Geist, Geist_Mono, Outfit } from "next/font/google";

/*
 * Trois voix, pas une de plus.
 * Outfit porte le display : géométrique ronde en light/medium,
 * l'encre ardoise-violet des grands titres — jamais de graisse
 * au-dessus de medium, jamais de noir pur.
 * Geist porte l'interface en regular/medium.
 * Geist Mono parle en petites capitales espacées : étiquettes
 * techniques, badges, compteurs, pagination.
 */
export const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});
