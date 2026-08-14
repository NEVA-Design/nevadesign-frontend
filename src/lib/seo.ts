/* Le domaine de la marque (run 3) : tous les canaux publics vivent
   sur nevadesign.fr (mails nevapro@nevadesign.fr, discord.gg/
   nevadesign, x.com/nevadesign) — l'ancien défaut neva-ai.com
   faisait pointer canonical/OG/sitemap/JSON-LD vers un domaine
   tiers. NEXT_PUBLIC_SITE_URL reste la vérité au déploiement. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nevadesign.fr").replace(/\/$/, "");

export const siteName = "Neva Design";

export const defaultSeo = {
  title: "Neva Design — Studio créatif IA : miniatures, logos, identités",
  description:
    "Neva Design compose vos visuels avec une vraie direction artistique : miniatures YouTube, logos, chartes graphiques, assets gaming et FiveM. Brief en français, rendus prêts à publier, exports jusqu'en 8K.",
  keywords: [
    "Neva Design",
    "Neva AI",
    "studio créatif IA",
    "miniature YouTube IA",
    "générateur miniature YouTube",
    "logo IA",
    "création logo en ligne",
    "charte graphique IA",
    "identité visuelle IA",
    "branding IA",
    "design gaming",
    "studio créatif FiveM",
    "FiveM IA",
    "affiche FiveM",
    "GTA RP design",
    "direction artistique IA",
  ],
};
