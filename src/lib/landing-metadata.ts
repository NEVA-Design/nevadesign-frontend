import type { Metadata } from "next";
import { getLanding } from "@/lib/landings";
import { siteUrl } from "@/lib/seo";

/* Metadata d'une landing « Solutions » : canonical absolu, paire
   hreflang quand la page existe dans l'autre langue (fr ↔ en,
   x-default = version française — le marché d'origine). */
export function landingMetadata(slug: string): Metadata {
  const landing = getLanding(slug);
  if (!landing) return {};

  const canonical = `${siteUrl}/${landing.slug}`;
  let languages: Record<string, string> | undefined;
  if (landing.altLocaleSlug) {
    const frSlug = landing.locale === "fr" ? landing.slug : landing.altLocaleSlug;
    const enSlug = landing.locale === "en" ? landing.slug : landing.altLocaleSlug;
    languages = {
      fr: `${siteUrl}/${frSlug}`,
      en: `${siteUrl}/${enSlug}`,
      "x-default": `${siteUrl}/${frSlug}`,
    };
  }

  return {
    title: landing.title,
    description: landing.description,
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: landing.title,
      description: landing.description,
      url: canonical,
      siteName: "Neva Design",
      images: [
        {
          url: "/brand/og.jpg",
          width: 1200,
          height: 630,
          alt: landing.h1,
        },
      ],
      locale: landing.locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: landing.title,
      description: landing.description,
      images: ["/brand/og.jpg"],
    },
  };
}
