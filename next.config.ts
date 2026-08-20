import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* QA : QA_DIST=1 isole le build dans .next-qa — on peut builder et
     mesurer (Lighthouse) sans toucher au .next que sert la prod. */
  distDir: process.env.QA_DIST ? ".next-qa" : ".next",
  transpilePackages: ["three"],
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [62, 75, 90],
    /* les dérivés optimisés sont recalculés à chaque déploiement au
       pire — 31 jours de cache navigateur/CDN */
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
  /* Purge 20/08 (passe whaou P5.5) : les landings des offres
     supprimées partent en 301 vers la landing FiveM la plus
     proche — jamais de 404, le jus SEO est transféré. */
  async redirects() {
    return [
      { source: "/miniature-youtube", destination: "/graphiste-fivem", permanent: true },
      { source: "/generateur-de-logo", destination: "/logo-fivem", permanent: true },
      { source: "/flyer-en-ligne", destination: "/affiche-serveur-fivem", permanent: true },
      { source: "/en/youtube-thumbnail-maker", destination: "/en/fivem-graphic-designer", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        /* assets de public/ : pas de hash dans le nom → un jour de
           cache + une semaine servie périmée pendant revalidation
           (les remplacements d'assets restent visibles sous 24 h) */
        source:
          "/:path*.(webp|avif|png|jpg|jpeg|gif|svg|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
