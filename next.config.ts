import type { NextConfig } from "next";

/* En-têtes de sécurité appliqués à TOUTES les réponses (defense in depth :
   ils existent au niveau appli, pas seulement au bord Cloudflare).
   - Les en-têtes non-CSP sont IMPOSÉS (ils ne peuvent pas casser le rendu).
   - La CSP est en Report-Only : le site injecte des <script> inline (JSON-LD,
     anti-flash de thème, loader) ; l'imposer sans nonce casserait la page.
     RO ne bloque rien et remonte les violations → base pour passer en
     enforce avec un nonce (via src/proxy.ts) après une passe de validation.
   frame-ancestors 'none' n'étant pas honoré en Report-Only, l'anti-clickjacking
   réel est assuré par X-Frame-Options: DENY (imposé) ci-dessous. */
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.supabase.co https://cdn.discordapp.com",
  "font-src 'self' data:",
  // style inline toléré (Tailwind/animations) — risque faible ; script reste strict
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' https://js.stripe.com",
  `connect-src 'self' https://api.stripe.com${BACKEND_ORIGIN ? " " + BACKEND_ORIGIN : ""}`,
  "frame-src https://js.stripe.com https://*.stripe.com",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

const nextConfig: NextConfig = {
  /* Masque l'en-tête X-Powered-By: Next.js (fingerprinting du framework). */
  poweredByHeader: false,
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
        /* En-têtes de sécurité sur TOUTES les routes (defense in depth). */
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
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
