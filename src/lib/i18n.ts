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
 * Positionnement (08/2026) : studio créatif IA généraliste —
 * miniatures YouTube, logos, identités, chartes graphiques,
 * gaming/FiveM en verticale d'origine.
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

  "hero.eyebrow": "Studio créatif IA — Miniatures · Logos · Identités · Gaming",
  "hero.line1": "Des visuels",
  "hero.line2.pre": "qui font",
  "hero.line2.beam": "cliquer",
  "hero.line2.post": ".",
  "hero.subtitle":
    "Miniatures YouTube, logos, identités de marque, assets gaming. Décrivez ce que vous voulez — le studio IA compose des rendus prêts à publier, jusqu’en 8K.",
  "hero.cta.primary": "Créer mon premier visuel",
  "hero.cta.secondary": "Voir les créations",
  "hero.proof": "3 créations offertes · Sans carte bancaire",
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

  "typemoment.word": "Cliquez",
  "typemoment.caption":
    "Miniatures pensées pour le clic — visage, titre massif, contraste. Lisibles à 120 pixels.",

  "fields.label": "Terrains",
  "fields.title": "Un studio, quatre terrains de jeu.",
  "fields.subtitle":
    "Le même directeur artistique, quatre métiers. Chaque pièce ci-dessous est un livrable du studio, dans son format de travail.",
  "fields.thumbs.kicker": "( 01 ) Miniatures YouTube",
  "fields.thumbs.title": "Le visage, le titre, le clic.",
  "fields.thumbs.desc":
    "Compositions pensées pour la vignette : expression, hiérarchie, lisibilité — même à 120 pixels de large.",
  "fields.thumbs.meta": "1280 × 720 · pensées CTR",
  "fields.logos.kicker": "( 02 ) Logos & branding",
  "fields.logos.title": "Des marques qui tiennent debout.",
  "fields.logos.desc":
    "Monogrammes, wordmarks et symboles livrés en vectoriel — du favicon à l’enseigne.",
  "fields.logos.meta": "SVG · toutes déclinaisons",
  "fields.charts.kicker": "( 03 ) Chartes graphiques",
  "fields.charts.title": "La cohérence, documentée.",
  "fields.charts.desc":
    "Palette, typographies, usages : la planche qui aligne tous vos supports, réseaux compris.",
  "fields.charts.meta": "palette · typos · déclinaisons",
  "fields.gaming.kicker": "( 04 ) Gaming & FiveM",
  "fields.gaming.title": "Le terrain d’origine.",
  "fields.gaming.desc":
    "Affiches, packs serveur et identités d'équipe — l’univers où le studio a fait ses armes.",
  "fields.gaming.meta": "8K · campagnes complètes",

  "bento.label": "Modules",
  "bento.title": "Six modules. Une seule direction artistique.",
  "bento.subtitle":
    "Chaque module travaille la même matière : votre image. De la miniature à la charte complète, sans jamais perdre la ligne.",
  "bento.design.title": "Design Studio",
  "bento.design.desc":
    "Miniatures, affiches, bannières : un brief, des rendus prêts à publier.",
  "bento.design.brief": "Brief",
  "bento.design.prompt":
    "« Miniature pour un test PC — visage choqué, prix énorme en rouge, fond sombre. »",
  "bento.design.action": "Composer",
  "bento.design.meta": "3 rendus · 12 s",
  "bento.design.render": "Rendu",
  "bento.design.campaign": "Miniature livrée · 2560 × 1440",
  "bento.brand.title": "Brand",
  "bento.brand.desc":
    "Logos et chartes complètes : palette, typographies, déclinaisons.",
  "bento.brand.wordmark": "Wordmark",
  "bento.brand.palette": "Palette",
  "bento.brand.usage": "Déclinaisons",
  "bento.brand.meta": "Identité Kova · vectoriel",
  "bento.enhance.title": "Enhance",
  "bento.enhance.desc":
    "Vos visuels existants repassent au studio — netteté, lumière, 8K.",
  "bento.enhance.source": "Source",
  "bento.enhance.zoom": "Détail ×4 · 8K",
  "bento.enhance.note": "Upscale 8K — le grain devient de la matière",
  "bento.director.title": "Creative Director",
  "bento.director.desc":
    "Le directeur artistique qui répond, propose et lance la génération.",
  "bento.director.user": "Il me faut une identité pour ma chaîne tech.",
  "bento.director.answer":
    "Trois pistes, moodboards à l’appui. Je compose la première ?",
  "bento.director.typing": "compose un moodboard…",
  "bento.character.title": "Character",
  "bento.character.desc":
    "Personnages et mascottes pour vos serveurs et vos chaînes.",
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
    "Commencez avec 3 créations offertes à l’inscription. Passez en formule quand vos publications s’enchaînent — sans engagement.",
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
  "pricing.plan.free.description": "Pour tester le studio, sans carte bancaire.",
  "pricing.plan.free.f1": "3 créations à l’inscription",
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
    "Un studio créatif complet piloté par IA : vous décrivez une intention, il compose miniatures YouTube, logos, chartes graphiques et visuels gaming prêts à publier — avec une vraie direction artistique, pas une génération au hasard.",
  "faq.q2": "Que vaut vraiment le plan gratuit ?",
  "faq.a2":
    "3 créations offertes à l’inscription pour tester le flux complet, brief compris. Les rendus sortent en prévisualisation filigranée ; les formules débloquent les exports HD, l’usage commercial et la priorité de génération",
  "faq.q3": "Puis-je vendre ce que je crée ?",
  "faq.a3":
    "Oui. Dès le premier plan payant, chaque création vous appartient commercialement : chaîne, boutique, réseaux, serveur, livrables clients.",
  "faq.q4": "Le Creative Director, encore un chatbot ?",
  "faq.a4":
    "Non. Il connaît vos références, votre historique et les codes de votre terrain — miniature YouTube, identité de marque ou serveur GTA RP. Il propose des concepts, structure des briefs et peut lancer une génération depuis la conversation.",
  "faq.q5": "Je ne sais pas designer. C’est un problème ?",
  "faq.a5":
    "C’est exactement pour ça que Neva existe. Décrivez le résultat voulu ; la composition, la typographie et l'étalonnage sont pris en charge. Le module Audit vous dit même quoi améliorer.",
  "faq.q6": "Et si je veux arrêter ?",
  "faq.a6":
    "Deux clics depuis votre espace. Le plan reste actif jusqu'à la fin de la période en cours — rien de caché, rien de retenu.",
  "faq.cta": "Rejoindre le Discord",

  "footer.cta.title.a": "Publiez quelque chose dont votre communauté",
  "footer.cta.title.beam": "sera fière.",
  "footer.cta.subtitle": "Décrivez votre univers. Le premier visuel est prêt dans la minute.",
  "footer.cta.primary": "Commencer gratuitement",
  "footer.cta.secondary": "Parler au studio",
  "footer.cta.note": "3 créations offertes · Aucune carte demandée",
  "footer.baseline":
    "Le studio créatif IA — miniatures, logos, identités, gaming. La direction artistique en plus.",
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
};

export const SUPPORTED_LANGUAGES: Array<{ code: Locale; label: string }> = LOCALES.map((code) => ({
  code,
  label: LANGUAGE_NAMES[code],
}));


export function getLanguageLabel(locale: string): string {
  return LANGUAGE_NAMES[locale as Locale] ?? LANGUAGE_NAMES[DEFAULT_LOCALE];
}
