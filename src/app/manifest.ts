import type { MetadataRoute } from "next";
import { siteName, defaultSeo } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: siteName,
    description: defaultSeo.description,
    start_url: "/",
    display: "browser",
    background_color: "#060606",
    theme_color: "#060606",
    icons: [
      {
        src: "/brand/favicon.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/brand/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
