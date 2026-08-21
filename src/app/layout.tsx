import type { Metadata } from "next";
import "./globals.css";
import { archivo, geistMono } from "./fonts";
import LanguageProvider from "@/components/LanguageProvider";
import PageVeil from "@/components/prisme/PageVeil";
import SoieNoire from "@/components/prisme/SoieNoire";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { defaultSeo, siteName, siteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultSeo.title,
    template: `%s | ${siteName}`,
  },
  description: defaultSeo.description,
  keywords: defaultSeo.keywords,
  authors: [{ name: "Neva Design", url: siteUrl }],
  creator: "Neva Design",
  publisher: "Neva Design",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: defaultSeo.title,
    description: defaultSeo.description,
    url: siteUrl,
    siteName,
    images: [
      {
        url: "/brand/og.jpg",
        width: 1200,
        height: 630,
        alt: "Neva Design — studio graphique FiveM : packs, bannières, affiches, scènes GTA",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeo.title,
    description: defaultSeo.description,
    images: ["/brand/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${geistMono.variable} dark`}
      style={{ colorScheme: "dark" }}
      /* data-prism-seen est posé sur <html> par un script inline
         AVANT l'hydratation (anti-flash du micro-rideau) — même
         pattern qu'un attribut de thème, mismatch d'attribut voulu */
      suppressHydrationWarning
    >
      <body className="bg-frost text-ink min-h-screen antialiased">
        {/* Le satin noir temps réel (porté de Neva Agency) — fixe
            derrière tout le site ; les fonds de section sont des
            voiles translucides au-dessus. */}
        <SoieNoire />
        {/* Passe whaou P1 — l'atmosphère site-wide : vignette douce
            (8-10 % aux bords) puis grain film statique 1,8 % (tuile
            128 px) qui tue le banding des dégradés sombres. */}
        <div className="pv-vignette-fixed" aria-hidden />
        <div className="pv-grain-fixed" aria-hidden />
        <LanguageProvider>
          <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
        </LanguageProvider>
        {/* Transition de pages marketing — balayage + monogramme */}
        <PageVeil />
      </body>
    </html>
  );
}
