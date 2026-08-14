import type { Metadata } from "next";
import "./globals.css";
import { geist, geistMono, outfit } from "./fonts";
import LanguageProvider from "@/components/LanguageProvider";
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
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "Neva Design — studio créatif IA : miniatures, logos, identités, gaming",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultSeo.title,
    description: defaultSeo.description,
    images: ["/brand/og.png"],
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
      className={`${geist.variable} ${geistMono.variable} ${outfit.variable} dark`}
      style={{ colorScheme: "dark" }}
      /* data-prism-seen est posé sur <html> par un script inline
         AVANT l'hydratation (anti-flash du micro-rideau) — même
         pattern qu'un attribut de thème, mismatch d'attribut voulu */
      suppressHydrationWarning
    >
      <body className="bg-void text-white min-h-screen antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
