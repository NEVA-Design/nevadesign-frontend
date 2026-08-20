/* Le domaine de la marque (run 3) : tous les canaux publics vivent
   sur nevadesign.fr (mails nevapro@nevadesign.fr, discord.gg/
   nevadesign, x.com/nevadesign) — l'ancien défaut neva-ai.com
   faisait pointer canonical/OG/sitemap/JSON-LD vers un domaine
   tiers. NEXT_PUBLIC_SITE_URL reste la vérité au déploiement. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nevadesign.fr").replace(/\/$/, "");

export const siteName = "Neva Design";

/* Purge 20/08 (passe whaou P5.6) : le studio ne vend plus que le
   terrain FiveM — miniatures YouTube, branding généraliste,
   chartes et flyers sortent des méta. */
export const defaultSeo = {
  title: "Neva Design — Studio graphique FiveM : packs, bannières, affiches",
  description:
    "Neva Design compose les visuels de votre serveur FiveM avec une vraie direction artistique : packs complets, bannières Discord, affiches, loading screens et scènes GTA génératives. Brief sur Discord, rendus prêts à publier, exports jusqu'en 8K.",
  keywords: [
    "Neva Design",
    "Neva AI",
    "studio créatif FiveM",
    "graphiste FiveM",
    "pack graphique FiveM",
    "bannière Discord FiveM",
    "affiche FiveM",
    "loading screen FiveM",
    "overlay stream",
    "scène GTA IA",
    "FiveM IA",
    "GTA RP design",
    "design gaming",
    "direction artistique IA",
  ],
};
