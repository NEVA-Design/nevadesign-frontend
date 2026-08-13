import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${siteUrl}/brand/og.png`],
    },
    {
      url: `${siteUrl}/neva-design`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
      images: [`${siteUrl}/brand/og.png`],
    },
    {
      url: `${siteUrl}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
