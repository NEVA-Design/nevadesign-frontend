import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { LANDINGS } from "@/lib/landings";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /* les landings « Solutions » (run 3) — paires hreflang déclarées
     aussi ici (les moteurs les lisent dans le sitemap comme dans
     les <link> de page) */
  const landingEntries: MetadataRoute.Sitemap = Object.values(LANDINGS).map(
    (landing) => {
      const frSlug =
        landing.locale === "fr" ? landing.slug : landing.altLocaleSlug;
      const enSlug =
        landing.locale === "en" ? landing.slug : landing.altLocaleSlug;
      return {
        url: `${siteUrl}/${landing.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: landing.slug === "graphiste-fivem" ? 0.9 : 0.7,
        ...(landing.altLocaleSlug
          ? {
              alternates: {
                languages: {
                  fr: `${siteUrl}/${frSlug}`,
                  en: `${siteUrl}/${enSlug}`,
                },
              },
            }
          : {}),
      };
    }
  );

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${siteUrl}/brand/og.jpg`],
    },
    {
      url: `${siteUrl}/neva-design`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${siteUrl}/brand/og.jpg`],
    },
    ...landingEntries,
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${siteUrl}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];
}
