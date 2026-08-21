import { Archivo, Geist_Mono } from "next/font/google";

/*
 * Refonte 50k — deux familles, trois voix.
 * Archivo variable (wght 100-900 × wdth 62-125) porte le display
 * ET le body : les titres jouent le contraste condensé-light /
 * expanded-bold (jamais de couleur pour accentuer — la largeur et
 * la graisse suffisent), le corps parle en 400 largeur naturelle.
 * Un seul fichier de fonte pour tout le texte : cohérence totale,
 * budget preload minimal.
 * Geist Mono reste la voix technique : étiquettes, index, folios,
 * métadonnées — l'ADN précieux du site.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
  variable: "--font-archivo",
});

/* budget run 3 : 2 preloads max — la mono n'habille que badges et
   étiquettes, elle peut arriver en swap sans préchargement */
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
  preload: false,
});
