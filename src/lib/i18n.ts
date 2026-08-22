export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];

export const DEFAULT_LOCALE: Locale = "fr";

export const LANGUAGE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

/*
 * Textes des surfaces publiques. Le français est la référence ;
 * l'anglais est tenu au même niveau d'exigence.
 * Positionnement (purge 20/08) : studio de graphisme FiveM —
 * packs serveur, bannières Discord & réseaux, affiches & loading
 * screens, scènes GTA génératives. Plus AUCUNE offre miniatures
 * YouTube / branding généraliste / chartes / flyers.
 */
export const TRANSLATIONS_FR: Record<string, string> = {
  "common.login": "Connexion",
  "common.getStarted": "Commencer",
  "common.startFree": "Commencer gratuitement",

  "nav.modules": "Modules",
  "nav.creations": "Créations",
  "nav.pricing": "Tarifs",
  "nav.resources": "Packs",
  "nav.faq": "FAQ",
  "nav.studio": "Le studio",
  /* Pivot 20/08 — navigation vitrine studio + Neva Generative */
  "nav.studio2": "Le studio",
  "nav.reviews": "Avis",
  "nav.generative": "Neva Generative",
  "nav.portfolio": "Portfolio",

  "hero.eyebrow": "Studio de graphisme FiveM — Packs serveur · Bannières · Affiches · IA générative",
  "hero.line1": "Des visuels",
  "hero.line2.pre": "qui font",
  "hero.line2.beam": "cliquer",
  "hero.line2.post": ".",
  "hero.subtitle":
    "Des graphistes pour vos packs FiveM, bannières Discord, affiches et loading screens — et Neva Generative, l’IA qui compose des scènes GTA photoréalistes. Brief sur Discord, suivi en direct, livraison rapide.",
  "hero.cta.primary": "Découvrir le studio",
  "hero.cta.secondary": "Neva Generative",
  "hero.proof": "Avis clients vérifiés",
  "hero.marquee": "Produites par le studio — publiées par 2 400+ créateurs",

  "demo.label": "Design Studio — en direct",
  "demo.window": "Design Studio — Neva",
  "demo.brief": "Brief",
  "demo.direction": "Direction",
  "demo.render": "Rendu",
  "demo.compose": "Composer",
  "demo.composing": "Le studio compose…",
  "demo.ready": "Prêt à publier",
  "demo.cost": "1 création",
  "demo.palette": "Palette",
  "demo.typo": "Typographie",
  "demo.format": "Format",
  "demo.b1.text":
    "Miniature YouTube pour une vidéo GTA RP — personnage au premier plan, titre massif, jaune électrique.",
  "demo.b1.chip": "Miniature · 16:9",
  "demo.b1.typo": "Archivo Black italique",
  "demo.b1.format": "1280 × 720",
  "demo.b1.meta": "Rendu 01 · 2560 × 1440",
  "demo.b2.text":
    "Logo pour Kova, banque mobile — monogramme géométrique, vert lime, déclinaison carte et app.",
  "demo.b2.chip": "Logo · vectoriel",
  "demo.b2.typo": "Space Grotesk",
  "demo.b2.format": "SVG + PNG",
  "demo.b2.meta": "Rendu 02 · vectoriel",
  "demo.b3.text":
    "Affiche d’ouverture pour un serveur GTA RP — rue de nuit, néons violets, typographie chrome.",
  "demo.b3.chip": "Affiche · 9:16",
  "demo.b3.typo": "Chrome Extended",
  "demo.b3.format": "2304 × 4096",
  "demo.b3.meta": "Rendu 03 · 2304 × 4096",

  "enhance.label": "Enhance",
  "enhance.title": "La même création. Deux niveaux de finition.",
  "enhance.subtitle":
    "Saisissez la poignée et faites-la glisser : netteté, lumière, étalonnage — vos anciens visuels repassent au studio, jusqu’au 8K.",
  "enhance.alt": "Rendu plage retravaillé par le module Enhance",
  "enhance.before": "Avant",
  "enhance.after": "Après · 8K",
  "enhance.handle": "Comparer avant et après",
  "enhance.meta": "Rendu 5504 × 3072 · Netteté +64 % · Étalonnage froid Neva",

  "typemoment.word": "Recrutez",
  "typemoment.caption":
    "Affiches de recrutement pensées pour l’impact — personnage, titre massif, contraste. Lisibles en un scroll.",

  "fields.label": "Terrains",
  "fields.title": "Un studio, quatre terrains de jeu.",
  "fields.subtitle":
    "Le même directeur artistique, quatre métiers. Chaque pièce ci-dessous est un livrable du studio, dans son format de travail.",
  "fields.packs.kicker": "( 01 ) Packs FiveM",
  "fields.packs.title": "L’identité complète du serveur.",
  "fields.packs.desc":
    "Logo, bannière, affiches, loading screen : un pack cohérent, prêt à poser sur Discord et en jeu.",
  "fields.packs.meta": "pack complet · toutes déclinaisons",
  "fields.banners.kicker": "( 02 ) Bannières Discord & réseaux",
  "fields.banners.title": "La première image de votre serveur.",
  "fields.banners.desc":
    "Bannières, avatars et boutiques aux formats exacts de Discord et des réseaux — nets à chaque taille d’affichage.",
  "fields.banners.meta": "960 × 540 · Discord & réseaux",
  "fields.posters.kicker": "( 03 ) Affiches & loading screens",
  "fields.posters.title": "L’événement, en grand format.",
  "fields.posters.desc":
    "Recrutements, ouvertures, soirées : des compositions qui tiennent l’écran de chargement comme l’impression.",
  "fields.posters.meta": "4K · écran & impression",
  "fields.ia.kicker": "( 04 ) IA générative",
  "fields.ia.title": "Des scènes GTA photoréalistes.",
  "fields.ia.desc":
    "Neva Generative compose vos mises en scène — personnages, lumière, ambiance — dans l’univers de votre serveur.",
  "fields.ia.meta": "photoréaliste · jusqu’au 8K",

  "bento.label": "Modules",
  "bento.title": "Six modules. Une seule direction artistique.",
  "bento.subtitle":
    "Chaque module travaille la même matière : votre serveur. De la bannière au pack complet, sans jamais perdre la ligne.",
  "bento.design.title": "Design Studio",
  "bento.design.desc":
    "Affiches, bannières, loading screens : un brief, des rendus prêts à publier.",
  "bento.design.brief": "Brief",
  "bento.design.prompt":
    "« Affiche de recrutement pour mon serveur — personnage au premier plan, néons violets, titre massif. »",
  "bento.design.action": "Composer",
  "bento.design.meta": "3 rendus · 12 s",
  "bento.design.render": "Rendu",
  "bento.design.campaign": "Affiche livrée · 2304 × 4096",
  "bento.brand.title": "Brand",
  "bento.brand.desc":
    "L’identité de votre serveur : palette, typographies, déclinaisons.",
  "bento.brand.wordmark": "Wordmark",
  "bento.brand.palette": "Palette",
  "bento.brand.usage": "Déclinaisons",
  "bento.brand.meta": "Identité serveur · vectoriel",
  "bento.enhance.title": "Enhance",
  "bento.enhance.desc":
    "Vos visuels existants repassent au studio — netteté, lumière, 8K.",
  "bento.enhance.source": "Source",
  "bento.enhance.zoom": "Détail ×4 · 8K",
  "bento.enhance.note": "Upscale 8K — le grain devient de la matière",
  "bento.director.title": "Creative Director",
  "bento.director.desc":
    "Le directeur artistique qui répond, propose et lance la génération.",
  "bento.director.user": "Il me faut une identité pour mon serveur RP.",
  "bento.director.answer":
    "Trois pistes, moodboards à l’appui. Je compose la première ?",
  "bento.director.typing": "compose un moodboard…",
  "bento.character.title": "Character",
  "bento.character.desc":
    "Personnages et mascottes pour votre serveur et votre communauté.",
  "bento.character.state": "État de San Andreas",
  "bento.character.name": "Nom",
  "bento.character.job": "Profession",
  "bento.character.jobValue": "Import-export",
  "bento.character.status": "Casier",
  "bento.character.statusValue": "3 mentions",
  "bento.audit.title": "Audit",
  "bento.audit.desc":
    "Une note détaillée sur votre design — et la version corrigée.",
  "bento.audit.compo": "Composition",
  "bento.audit.typo": "Typographie",
  "bento.audit.impact": "Impact",
  "bento.audit.verdict": "Solide",
  "bento.audit.imageLabel": "Visuel audité",

  "wall.title.a": "Les créations sortent",
  "wall.title.b": "d’ici.",
  "wall.cta": "Le portfolio complet du studio",

  "stats.label": "Le studio tourne déjà",
  "stats.creators": "créateurs actifs",
  "stats.modules": "modules spécialisés",
  "stats.exports": "définition d’export max",
  "stats.speed": "du brief au rendu",

  "pricing.label": "Tarifs",
  "pricing.title.a": "Moins cher qu’un logo.",
  "pricing.title.beam": "Pour toute une identité.",
  "pricing.subtitle":
    "Passez en formule dès que vous êtes prêt à créer — sans engagement.",
  "pricing.note":
    "Sans engagement · Annulation en deux clics · Recharges de créations depuis votre espace",
  "pricing.rules.retouches": "5 retouches incluses par création — au-delà, 1 création",
  "pricing.rules.report": "Report des créations non utilisées : 1 mois",
  "pricing.perMonth": "/ mois",
  "pricing.creations": "créations / mois",
  "pricing.creationsOnce": "créations à l’inscription",
  "pricing.popular": "Le plus choisi",
  "pricing.cta.free": "Commencer gratuitement",
  "pricing.cta.paid": "Choisir",
  "pricing.plan.free.name": "Découverte",
  "pricing.plan.free.description": "Pour découvrir le studio, gratuitement.",
  "pricing.plan.free.f2": "Prévisualisations filigranées",
  "pricing.plan.free.f3": "Historique limité",
  "pricing.plan.free.f4": "Usage non commercial",
  "pricing.plan.creator.name": "Creator",
  "pricing.plan.creator.description":
    "Pour les youtubeurs, créateurs et fondateurs qui publient souvent.",
  "pricing.plan.creator.f1": "12 créations par mois",
  "pricing.plan.creator.f2": "Exports HD sans filigrane",
  "pricing.plan.creator.f3": "Usage commercial inclus",
  "pricing.plan.creator.f4": "Bibliothèque et historique",
  "pricing.plan.creator.f5": "Personnages sauvegardés",
  "pricing.plan.studio.name": "Studio",
  "pricing.plan.studio.description": "Pour les équipes qui publient chaque semaine.",
  "pricing.plan.studio.f1": "25 créations par mois",
  "pricing.plan.studio.f2": "Exports 2K et 4K",
  "pricing.plan.studio.f3": "Priorité de génération",
  "pricing.plan.studio.f4": "Collections et projets",
  "pricing.plan.studio.f5": "Générations premium",
  "pricing.plan.pro.name": "Agence",
  "pricing.plan.pro.description": "Pour les agences, marques multiples et gros volumes.",
  "pricing.plan.pro.f1": "45 créations par mois",
  "pricing.plan.pro.f2": "Exports jusqu’en 8K",
  "pricing.plan.pro.f3": "Multi-marques et sièges",
  "pricing.plan.pro.f4": "Neva Studio prioritaire",
  "pricing.plan.pro.f5": "Support prioritaire",

  "resources.label": "Packs de création",
  "resources.badge.complete": "Le plus complet",
  "resources.title.a": "Un pack, un prix,",
  "resources.title.beam": "une identité complète.",
  "resources.subtitle":
    "Logo, bannières, affiches, charte : des livrables assemblés par le studio, prêts à publier. Un paiement, des fichiers à vous.",
  "resources.oneShot": "achat unique",
  "resources.buy": "Acheter",
  "resources.redirecting": "Redirection…",
  "resources.trust":
    "Paiement sécurisé Stripe · Livraison dans votre espace · Fichiers à vous, pour toujours",
  "resources.tools.title": "Ressources du studio",
  "resources.tools.tagline": "Les outils Photoshop de l’atelier",
  "resources.pack.pack-identite.name": "Pack Identité",
  "resources.pack.pack-identite.tagline": "Identité visuelle",
  "resources.pack.pack-identite.description":
    "Le socle de votre image : un logo travaillé en trois directions, ses déclinaisons, et vos premiers supports.",
  "resources.pack.pack-identite.f1": "Logo — 3 pistes créatives",
  "resources.pack.pack-identite.f2": "Déclinaisons de la piste retenue",
  "resources.pack.pack-identite.f3": "2 bannières réseaux",
  "resources.pack.pack-identite.f4": "1 affiche",
  "resources.pack.pack-lancement.name": "Pack Lancement",
  "resources.pack.pack-lancement.tagline": "Tout pour démarrer",
  "resources.pack.pack-lancement.description":
    "L’identité complète et tous les supports du jour J : réseaux, écran d’attente, affichage.",
  "resources.pack.pack-lancement.f1": "Identité complète (logo + déclinaisons)",
  "resources.pack.pack-lancement.f2": "Kit réseaux — 6 formats",
  "resources.pack.pack-lancement.f3": "Écran d’attente",
  "resources.pack.pack-lancement.f4": "4 affiches",
  "resources.pack.pack-marque.name": "Pack Marque",
  "resources.pack.pack-marque.tagline": "La marque entière",
  "resources.pack.pack-marque.description":
    "Le système complet : tout le Pack Lancement, la charte, les déclinaisons et des templates éditables à votre nom.",
  "resources.pack.pack-marque.f1": "Tout le Pack Lancement",
  "resources.pack.pack-marque.f2": "Charte couleurs & typographies",
  "resources.pack.pack-marque.f3": "4 déclinaisons du logo",
  "resources.pack.pack-marque.f4": "8 templates éditables personnalisés",
  "resources.pack.pack-brush.tagline": "Brushes Photoshop",
  "resources.pack.neva-pack.tagline": "Pack GFX complet",
  "resources.error.checkout": "Le paiement n’a pas pu démarrer. Réessayez dans un instant.",
  "resources.error.network": "Connexion interrompue. Vérifiez votre réseau et réessayez.",

  "faq.label": "Questions",
  "faq.title.a": "Tout ce qu’on nous demande",
  "faq.title.beam": "avant de se lancer.",
  "faq.subtitle": "Une question plus précise ? Le Discord répond dans la journée.",
  "faq.q1": "Neva Design, c’est quoi exactement ?",
  "faq.a1":
    "Un studio créatif complet piloté par IA : vous décrivez une intention, il compose packs FiveM, bannières, affiches et scènes GTA prêts à publier — avec une vraie direction artistique, pas une génération au hasard.",
  "faq.q2": "Que vaut vraiment le plan gratuit ?",
  "faq.a2":
    "Le plan Découverte permet d’explorer le flux complet, brief compris, sans créditer de créations. Les formules débloquent les exports HD, l’usage commercial et la priorité de génération",
  "faq.q3": "Puis-je vendre ce que je crée ?",
  "faq.a3":
    "Oui. Dès le premier plan payant, chaque création vous appartient commercialement : serveur, boutique, réseaux, livrables clients.",
  "faq.q4": "Le Creative Director, encore un chatbot ?",
  "faq.a4":
    "Non. Il connaît vos références, votre historique et les codes de votre terrain — pack serveur, bannière Discord ou affiche GTA RP. Il propose des concepts, structure des briefs et peut lancer une génération depuis la conversation.",
  "faq.q5": "Je ne sais pas designer. C’est un problème ?",
  "faq.a5":
    "C’est exactement pour ça que Neva existe. Décrivez le résultat voulu ; la composition, la typographie et l’étalonnage sont pris en charge. Le module Audit vous dit même quoi améliorer.",
  "faq.q6": "Et si je veux arrêter ?",
  "faq.a6":
    "Deux clics depuis votre espace. Le plan reste actif jusqu’à la fin de la période en cours — rien de caché, rien de retenu.",
  "faq.cta": "Rejoindre le Discord",

  "footer.cta.title.a": "Publiez quelque chose dont votre communauté",
  "footer.cta.title.beam": "sera fière.",
  "footer.cta.subtitle": "Commandez au studio sur Discord, ou abonnez-vous à Neva Generative.",
  "footer.cta.primary": "Commander sur Discord",
  "footer.cta.secondary": "Neva Generative",
  "footer.cta.note": "Réponse rapide sur Discord",
  "footer.baseline":
    "Studio de graphisme & IA générative — packs FiveM, bannières, affiches, scènes GTA.",
  "footer.product": "Produit",
  "footer.company": "Studio",
  "footer.legal": "Légal",
  "footer.link.modules": "Modules",
  "footer.link.pricing": "Tarifs",
  "footer.link.resources": "Packs",
  "footer.link.studio": "Neva Design Studio",
  "footer.link.agency": "Maison mère",
  "footer.link.discord": "Discord",
  "footer.link.contact": "Contact",
  "footer.link.privacy": "Confidentialité",
  "footer.link.terms": "Conditions d’utilisation",
  "footer.link.cookies": "Cookies",
  "footer.rights": "Tous droits réservés.",

  "footer.solutions": "Solutions",
  "footer.link.fivemDesigner": "Graphiste FiveM",
  "footer.link.fivemLogo": "Logo FiveM",
  "footer.link.fivemPack": "Pack graphique FiveM",
  "footer.link.fivemBanner": "Bannière Discord FiveM",
  "footer.link.fivemPoster": "Affiche serveur FiveM",
  "footer.link.fivemLoading": "Loading screen FiveM",

  /* ── Pivot 20/08 — vitrine du studio ─────────────────────────── */
  "studio.eyebrow": "Le studio — des graphistes, en direct",
  "studio.title.a": "Un studio de graphisme",
  "studio.title.beam": "à votre service.",
  "studio.pitch":
    "Neva Design, c’est d’abord une équipe de graphistes. Identités, packs FiveM, bannières, affiches, loading screens, overlays — briefés sur Discord, suivis en vocal, livrés vite.",
  "studio.service.1": "Logos & identités",
  "studio.service.2": "Packs FiveM complets",
  "studio.service.3": "Bannières Discord & réseaux",
  "studio.service.4": "Affiches & posters",
  "studio.service.5": "Loading screens",
  "studio.service.6": "Overlays de stream",
  "studio.service.7": "Créations sur mesure",
  "studio.team.label": "L’équipe",
  "studio.team.g1.role": "Direction artistique",
  "studio.team.g1.mission": "La ligne, la lumière, le verdict final sur chaque pièce.",
  "studio.team.g2.role": "Logos & identités",
  "studio.team.g2.mission": "Monogrammes, wordmarks, déclinaisons — l’identité des serveurs.",
  "studio.team.g3.role": "Packs FiveM",
  "studio.team.g3.mission": "Bannières, affiches, loading screens : le pack complet, cohérent.",
  "studio.team.g4.role": "Motion & overlays",
  "studio.team.g4.mission": "Alertes, transitions, habillages de stream — l’identité en mouvement.",
  "studio.process.label": "Le process",
  "studio.process.1.title": "Brief",
  "studio.process.1.desc":
    "Vous décrivez le besoin sur Discord : références, ambiance, délais.",
  "studio.process.2.title": "Suivi en direct",
  "studio.process.2.desc":
    "Le graphiste travaille avec vous en vocal — vous voyez la création avancer.",
  "studio.process.3.title": "Révisions",
  "studio.process.3.desc":
    "Les ajustements se font dans la foulée, jusqu’à la version validée.",
  "studio.process.4.title": "Livraison rapide",
  "studio.process.4.desc":
    "Fichiers finaux livrés dans les meilleurs délais, prêts à l’emploi.",
  "studio.cta": "Commander sur Discord",
  "studio.cta.note": "Brief, suivi et livraison — tout se passe sur Discord",

  /* ── Pivot 20/08 — avis clients ──────────────────────────────── */
  "reviews.label": "Avis clients",
  "reviews.title.a": "Ils ont commandé.",
  "reviews.title.beam": "Ils reviennent.",
  "reviews.note": "5/5 — 9 avis",

  /* ── Pivot 20/08 — Neva Generative ───────────────────────────── */
  "generative.eyebrow": "Neva Generative — deux formules d’abonnement",
  "generative.title.a": "L’IA du studio,",
  "generative.title.beam": "en abonnement.",
  "generative.perMonth": "€ / mois",
  "generative.subscribe": "S’abonner",
  "generative.earlyAccess": "Accès anticipé",
  "generative.priceSoon": "Prix à l’ouverture",
  "generative.gta.num": "Formule 01",
  "generative.gta.title": "Scènes GTA",
  "generative.gta.pitch":
    "Des scènes GTA photoréalistes générées par IA — bannières, posters, visuels de serveurs et de réseaux. Pensé pour les graphistes et les serveurs FiveM : l’outil que beaucoup utiliseront pour leurs propres clients.",
  "generative.gta.f1": "Quota mensuel dévoilé à l’ouverture",
  "generative.gta.f2": "Formats bannière + poster",
  "generative.gta.f3": "Usage commercial autorisé",
  "generative.banner.num": "Formule 02",
  "generative.banner.title": "Bannières Discord IA",
  "generative.banner.pitch":
    "Une bibliothèque de modèles de bannières : saisissez le nom voulu, la bannière est générée avec. Selon le modèle, changez aussi le thème, la couleur, ou ajoutez des textes.",
  "generative.banner.f1": "Quota mensuel dévoilé à l’ouverture",
  "generative.banner.f2": "Accès à tous les modèles",
  "generative.banner.f3": "Personnalisation nom / thème / couleur",
  "generative.banner.soon.badge": "Très prochainement",
  "generative.banner.soon.text": "La bibliothèque de modèles est en préparation.",
  "generative.cap.name": "Nom personnalisé",
  "generative.cap.name.off": "Nom personnalisé : non disponible sur ce modèle",
  "generative.cap.theme": "Thème modifiable",
  "generative.cap.theme.off": "Thème : non modifiable sur ce modèle",
  "generative.cap.color": "Couleur modifiable",
  "generative.cap.color.off": "Couleur : non modifiable sur ce modèle",
  "generative.cap.extraText": "Textes additionnels",
  "generative.cap.extraText.off":
    "Textes additionnels : non disponibles sur ce modèle",

  /* ── Pivot 20/08 — outils « À venir » ────────────────────────── */
  "comingSoon.badge": "À venir",
  "comingSoon.tooltip": "Disponible prochainement",
};

export const SUPPORTED_LANGUAGES: Array<{ code: Locale; label: string }> = LOCALES.map((code) => ({
  code,
  label: LANGUAGE_NAMES[code],
}));


export function getLanguageLabel(locale: string): string {
  return LANGUAGE_NAMES[locale as Locale] ?? LANGUAGE_NAMES[DEFAULT_LOCALE];
}
