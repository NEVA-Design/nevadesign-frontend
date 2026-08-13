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
export const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  fr: {
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
      "Miniatures YouTube, logos, identités de marque, assets gaming. Décrivez ce que vous voulez — le studio IA compose des rendus prêts à publier, jusqu'en 8K.",
    "hero.cta.primary": "Créer mon premier visuel",
    "hero.cta.secondary": "Voir les créations",
    "hero.proof": "5 créations offertes · Sans carte bancaire",
    "hero.marquee": "Produites par le studio — publiées par 2 400+ créateurs",

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
      "Affiche d'ouverture pour un serveur GTA RP — rue de nuit, néons violets, typographie chrome.",
    "demo.b3.chip": "Affiche · 9:16",
    "demo.b3.typo": "Chrome Extended",
    "demo.b3.format": "2304 × 4096",
    "demo.b3.meta": "Rendu 03 · 2304 × 4096",

    "enhance.label": "Enhance",
    "enhance.title": "La même création. Deux niveaux de finition.",
    "enhance.subtitle":
      "Saisissez la poignée et faites-la glisser : netteté, lumière, étalonnage — vos anciens visuels repassent au studio, jusqu'au 8K.",
    "enhance.alt": "Rendu plage retravaillé par le module Enhance",
    "enhance.before": "Avant",
    "enhance.after": "Après · 8K",
    "enhance.handle": "Comparer avant et après",
    "enhance.meta": "Rendu 5504 × 3072 · Netteté +64 % · Étalonnage froid Neva",

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
      "Compositions pensées pour la vignette : expression, hiérarchie, lisibilité — même à 120 pixels de large.",
    "fields.thumbs.meta": "1280 × 720 · pensées CTR",
    "fields.logos.kicker": "( 02 ) Logos & branding",
    "fields.logos.title": "Des marques qui tiennent debout.",
    "fields.logos.desc":
      "Monogrammes, wordmarks et symboles livrés en vectoriel — du favicon à l'enseigne.",
    "fields.logos.meta": "SVG · toutes déclinaisons",
    "fields.charts.kicker": "( 03 ) Chartes graphiques",
    "fields.charts.title": "La cohérence, documentée.",
    "fields.charts.desc":
      "Palette, typographies, usages : la planche qui aligne tous vos supports, réseaux compris.",
    "fields.charts.meta": "palette · typos · déclinaisons",
    "fields.gaming.kicker": "( 04 ) Gaming & FiveM",
    "fields.gaming.title": "Le terrain d'origine.",
    "fields.gaming.desc":
      "Affiches, packs serveur et identités d'équipe — l'univers où le studio a fait ses armes.",
    "fields.gaming.meta": "8K · campagnes complètes",

    "bento.label": "Modules",
    "bento.title": "Six modules. Une seule direction artistique.",
    "bento.subtitle":
      "Chaque module travaille la même matière : votre image. De la miniature à la charte complète, sans jamais perdre la ligne.",
    "bento.design.title": "Design Studio",
    "bento.design.desc":
      "Miniatures, affiches, bannières : un brief, des rendus prêts à publier.",
    "bento.design.brief": "Brief",
    "bento.design.prompt":
      "« Miniature pour un test PC — visage choqué, prix énorme en rouge, fond sombre. »",
    "bento.design.action": "Composer",
    "bento.design.meta": "3 rendus · 12 s",
    "bento.design.render": "Rendu",
    "bento.design.campaign": "Miniature livrée · 2560 × 1440",
    "bento.brand.title": "Brand",
    "bento.brand.desc":
      "Logos et chartes complètes : palette, typographies, déclinaisons.",
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
      "Trois pistes, moodboards à l'appui. Je compose la première ?",
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
    "wall.title.b": "d'ici.",
    "wall.cta": "Le portfolio complet du studio",

    "stats.label": "Le studio tourne déjà",
    "stats.creators": "créateurs actifs",
    "stats.modules": "modules spécialisés",
    "stats.exports": "définition d'export max",
    "stats.speed": "du brief au rendu",

    "pricing.label": "Tarifs",
    "pricing.title.a": "Moins cher qu'un logo.",
    "pricing.title.beam": "Pour toute une identité.",
    "pricing.subtitle":
      "Commencez avec 5 créations offertes. Montez en volume quand vos publications s'enchaînent — sans engagement.",
    "pricing.note":
      "Sans engagement · Annulation en deux clics · Packs de créations additionnels depuis votre espace",
    "pricing.perMonth": "/ mois",
    "pricing.creations": "créations / mois",
    "pricing.popular": "Le plus choisi",
    "pricing.cta.free": "Commencer gratuitement",
    "pricing.cta.paid": "Choisir",
    "pricing.plan.free.name": "Découverte",
    "pricing.plan.free.description": "Pour tester le studio, sans carte bancaire.",
    "pricing.plan.free.f1": "5 créations mensuelles",
    "pricing.plan.free.f2": "Prévisualisations basse résolution",
    "pricing.plan.free.f3": "Filigrane Neva",
    "pricing.plan.free.f4": "Historique limité",
    "pricing.plan.free.f5": "Usage non commercial",
    "pricing.plan.creator.name": "Creator",
    "pricing.plan.creator.description":
      "Pour les youtubeurs, créateurs et fondateurs qui publient souvent.",
    "pricing.plan.creator.f1": "100 créations mensuelles",
    "pricing.plan.creator.f2": "Exports HD sans filigrane",
    "pricing.plan.creator.f3": "Bibliothèque et historique",
    "pricing.plan.creator.f4": "Usage commercial inclus",
    "pricing.plan.creator.f5": "Personnages sauvegardés",
    "pricing.plan.studio.name": "Studio",
    "pricing.plan.studio.description": "Pour les équipes qui publient chaque semaine.",
    "pricing.plan.studio.f1": "350 créations mensuelles",
    "pricing.plan.studio.f2": "Générations premium",
    "pricing.plan.studio.f3": "Exports 2K et 4K",
    "pricing.plan.studio.f4": "Collections et projets",
    "pricing.plan.studio.f5": "Priorité de génération",
    "pricing.plan.pro.name": "Agence",
    "pricing.plan.pro.description": "Pour les studios et agences à gros volume.",
    "pricing.plan.pro.f1": "900 créations mensuelles",
    "pricing.plan.pro.f2": "Neva Studio prioritaire",
    "pricing.plan.pro.f3": "Exports haute définition",
    "pricing.plan.pro.f4": "Imports volumineux et multi-références",
    "pricing.plan.pro.f5": "Support prioritaire",

    "resources.label": "Packs du studio",
    "resources.title.a": "Les outils du studio,",
    "resources.title.beam": "dans vos mains.",
    "resources.subtitle":
      "Les ressources que le studio utilise en production gaming : brushes, templates, systèmes graphiques. Un paiement, un téléchargement, aucune limite.",
    "resources.oneShot": "achat unique",
    "resources.buy": "Acheter",
    "resources.redirecting": "Redirection…",
    "resources.trust":
      "Paiement sécurisé Stripe · Téléchargement immédiat · Accès à vie depuis votre espace",
    "resources.included": "Tout est inclus dans le Neva Pack",
    "resources.error.checkout": "Le paiement n'a pas pu démarrer. Réessayez dans un instant.",
    "resources.error.network": "Connexion interrompue. Vérifiez votre réseau et réessayez.",

    "faq.label": "Questions",
    "faq.title.a": "Tout ce qu'on nous demande",
    "faq.title.beam": "avant de se lancer.",
    "faq.subtitle": "Une question plus précise ? Le Discord répond dans la journée.",
    "faq.q1": "Neva Design, c'est quoi exactement ?",
    "faq.a1":
      "Un studio créatif complet piloté par IA : vous décrivez une intention, il compose miniatures YouTube, logos, chartes graphiques et visuels gaming prêts à publier — avec une vraie direction artistique, pas une génération au hasard.",
    "faq.q2": "Que vaut vraiment le plan gratuit ?",
    "faq.a2":
      "5 créations pour tester le flux complet, brief compris. Les rendus sortent en prévisualisation filigranée ; les plans payants débloquent les exports HD, l'usage commercial et la priorité de génération.",
    "faq.q3": "Puis-je vendre ce que je crée ?",
    "faq.a3":
      "Oui. Dès le premier plan payant, chaque création vous appartient commercialement : chaîne, boutique, réseaux, serveur, livrables clients.",
    "faq.q4": "Le Creative Director, encore un chatbot ?",
    "faq.a4":
      "Non. Il connaît vos références, votre historique et les codes de votre terrain — miniature YouTube, identité de marque ou serveur GTA RP. Il propose des concepts, structure des briefs et peut lancer une génération depuis la conversation.",
    "faq.q5": "Je ne sais pas designer. C'est un problème ?",
    "faq.a5":
      "C'est exactement pour ça que Neva existe. Décrivez le résultat voulu ; la composition, la typographie et l'étalonnage sont pris en charge. Le module Audit vous dit même quoi améliorer.",
    "faq.q6": "Et si je veux arrêter ?",
    "faq.a6":
      "Deux clics depuis votre espace. Le plan reste actif jusqu'à la fin de la période en cours — rien de caché, rien de retenu.",
    "faq.cta": "Rejoindre le Discord",

    "footer.cta.title.a": "Publiez quelque chose dont votre communauté",
    "footer.cta.title.beam": "sera fière.",
    "footer.cta.subtitle": "Décrivez votre univers. Le premier visuel est prêt dans la minute.",
    "footer.cta.primary": "Commencer gratuitement",
    "footer.cta.secondary": "Parler au studio",
    "footer.cta.note": "5 créations offertes · Aucune carte demandée",
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
    "footer.link.terms": "Conditions d'utilisation",
    "footer.link.cookies": "Cookies",
    "footer.rights": "Tous droits réservés.",
  },
  en: {
    "common.login": "Log in",
    "common.getStarted": "Get started",
    "common.startFree": "Start for free",

    "nav.modules": "Modules",
    "nav.creations": "Work",
    "nav.pricing": "Pricing",
    "nav.resources": "Packs",
    "nav.faq": "FAQ",
    "nav.studio": "The studio",

    "hero.eyebrow": "AI creative studio — Thumbnails · Logos · Identities · Gaming",
    "hero.line1": "Visuals that",
    "hero.line2.pre": "earn the",
    "hero.line2.beam": "click",
    "hero.line2.post": ".",
    "hero.subtitle":
      "YouTube thumbnails, logos, brand identities, gaming assets. Describe what you want — the AI studio composes renders ready to publish, up to 8K.",
    "hero.cta.primary": "Create my first visual",
    "hero.cta.secondary": "See the work",
    "hero.proof": "5 free creations · No credit card",
    "hero.marquee": "Produced by the studio — published by 2,400+ creators",

    "demo.label": "Design Studio — live",
    "demo.window": "Design Studio — Neva",
    "demo.brief": "Brief",
    "demo.direction": "Direction",
    "demo.render": "Render",
    "demo.compose": "Compose",
    "demo.composing": "The studio is composing…",
    "demo.ready": "Ready to publish",
    "demo.cost": "1 creation",
    "demo.palette": "Palette",
    "demo.typo": "Typography",
    "demo.format": "Format",
    "demo.b1.text":
      "YouTube thumbnail for a GTA RP video — character up front, massive title, electric yellow.",
    "demo.b1.chip": "Thumbnail · 16:9",
    "demo.b1.typo": "Archivo Black italic",
    "demo.b1.format": "1280 × 720",
    "demo.b1.meta": "Render 01 · 2560 × 1440",
    "demo.b2.text":
      "Logo for Kova, a mobile bank — geometric monogram, lime green, card and app variants.",
    "demo.b2.chip": "Logo · vector",
    "demo.b2.typo": "Space Grotesk",
    "demo.b2.format": "SVG + PNG",
    "demo.b2.meta": "Render 02 · vector",
    "demo.b3.text":
      "Opening poster for a GTA RP server — night street, violet neon, chrome typography.",
    "demo.b3.chip": "Poster · 9:16",
    "demo.b3.typo": "Chrome Extended",
    "demo.b3.format": "2304 × 4096",
    "demo.b3.meta": "Render 03 · 2304 × 4096",

    "enhance.label": "Enhance",
    "enhance.title": "The same creation. Two levels of finish.",
    "enhance.subtitle":
      "Grab the handle and drag it: sharpness, light, grading — your old visuals go back through the studio, up to 8K.",
    "enhance.alt": "Beach render reworked by the Enhance module",
    "enhance.before": "Before",
    "enhance.after": "After · 8K",
    "enhance.handle": "Compare before and after",
    "enhance.meta": "Render 5504 × 3072 · Sharpness +64% · Neva cold grading",

    "typemoment.word": "Click",
    "typemoment.caption":
      "Thumbnails built for the click — face, massive title, contrast. Readable at 120 pixels.",

    "fields.label": "Playing fields",
    "fields.title": "One studio, four playing fields.",
    "fields.subtitle":
      "The same art director, four crafts. Every piece below is a studio deliverable, shown in its working format.",
    "fields.thumbs.kicker": "( 01 ) YouTube thumbnails",
    "fields.thumbs.title": "The face, the title, the click.",
    "fields.thumbs.desc":
      "Compositions built for the tile: expression, hierarchy, readability — even at 120 pixels wide.",
    "fields.thumbs.meta": "1280 × 720 · CTR-first",
    "fields.logos.kicker": "( 02 ) Logos & branding",
    "fields.logos.title": "Brands that stand on their own.",
    "fields.logos.desc":
      "Monograms, wordmarks and symbols delivered as vectors — from favicon to storefront.",
    "fields.logos.meta": "SVG · every variant",
    "fields.charts.kicker": "( 03 ) Brand guidelines",
    "fields.charts.title": "Consistency, documented.",
    "fields.charts.desc":
      "Palette, typography, usage rules: the board that aligns every surface, socials included.",
    "fields.charts.meta": "palette · type · variants",
    "fields.gaming.kicker": "( 04 ) Gaming & FiveM",
    "fields.gaming.title": "Home turf.",
    "fields.gaming.desc":
      "Posters, server packs and team identities — the world where the studio earned its stripes.",
    "fields.gaming.meta": "8K · full campaigns",

    "bento.label": "Modules",
    "bento.title": "Six modules. One art direction.",
    "bento.subtitle":
      "Every module shapes the same material: your image. From thumbnail to full brand book, without ever losing the line.",
    "bento.design.title": "Design Studio",
    "bento.design.desc":
      "Thumbnails, posters, banners: one brief, renders ready to publish.",
    "bento.design.brief": "Brief",
    "bento.design.prompt":
      "“Thumbnail for a PC review — shocked face, huge price in red, dark background.”",
    "bento.design.action": "Compose",
    "bento.design.meta": "3 renders · 12 s",
    "bento.design.render": "Render",
    "bento.design.campaign": "Thumbnail delivered · 2560 × 1440",
    "bento.brand.title": "Brand",
    "bento.brand.desc":
      "Logos and full brand guidelines: palette, typography, variants.",
    "bento.brand.wordmark": "Wordmark",
    "bento.brand.palette": "Palette",
    "bento.brand.usage": "Variants",
    "bento.brand.meta": "Kova identity · vector",
    "bento.enhance.title": "Enhance",
    "bento.enhance.desc":
      "Your existing visuals go back through the studio — sharpness, light, 8K.",
    "bento.enhance.source": "Source",
    "bento.enhance.zoom": "Detail ×4 · 8K",
    "bento.enhance.note": "8K upscale — grain becomes material",
    "bento.director.title": "Creative Director",
    "bento.director.desc":
      "The art director that talks back, pitches and launches the generation.",
    "bento.director.user": "I need an identity for my tech channel.",
    "bento.director.answer":
      "Three directions, moodboards attached. Compose the first?",
    "bento.director.typing": "composing a moodboard…",
    "bento.character.title": "Character",
    "bento.character.desc":
      "Characters and mascots for your servers and your channels.",
    "bento.character.state": "State of San Andreas",
    "bento.character.name": "Name",
    "bento.character.job": "Occupation",
    "bento.character.jobValue": "Import-export",
    "bento.character.status": "Record",
    "bento.character.statusValue": "3 entries",
    "bento.audit.title": "Audit",
    "bento.audit.desc":
      "A detailed score on your design — and the corrected version.",
    "bento.audit.compo": "Composition",
    "bento.audit.typo": "Typography",
    "bento.audit.impact": "Impact",
    "bento.audit.verdict": "Solid",
    "bento.audit.imageLabel": "Audited visual",

    "wall.title.a": "The work ships",
    "wall.title.b": "from here.",
    "wall.cta": "The studio's full portfolio",

    "stats.label": "The studio is already running",
    "stats.creators": "active creators",
    "stats.modules": "specialized modules",
    "stats.exports": "max export definition",
    "stats.speed": "from brief to render",

    "pricing.label": "Pricing",
    "pricing.title.a": "Cheaper than a logo.",
    "pricing.title.beam": "For a whole identity.",
    "pricing.subtitle":
      "Start with 5 free creations. Scale up when your publishing pace does — no commitment.",
    "pricing.note":
      "No commitment · Cancel in two clicks · Additional creation packs from your workspace",
    "pricing.perMonth": "/ month",
    "pricing.creations": "creations / month",
    "pricing.popular": "Most chosen",
    "pricing.cta.free": "Start for free",
    "pricing.cta.paid": "Choose",
    "pricing.plan.free.name": "Discovery",
    "pricing.plan.free.description": "To try the studio, no credit card required.",
    "pricing.plan.free.f1": "5 monthly creations",
    "pricing.plan.free.f2": "Low-resolution previews",
    "pricing.plan.free.f3": "Neva watermark",
    "pricing.plan.free.f4": "Limited history",
    "pricing.plan.free.f5": "Non-commercial use",
    "pricing.plan.creator.name": "Creator",
    "pricing.plan.creator.description":
      "For YouTubers, creators and founders who publish often.",
    "pricing.plan.creator.f1": "100 monthly creations",
    "pricing.plan.creator.f2": "HD exports, no watermark",
    "pricing.plan.creator.f3": "Library and history",
    "pricing.plan.creator.f4": "Commercial use included",
    "pricing.plan.creator.f5": "Saved characters",
    "pricing.plan.studio.name": "Studio",
    "pricing.plan.studio.description": "For teams that publish every week.",
    "pricing.plan.studio.f1": "350 monthly creations",
    "pricing.plan.studio.f2": "Premium generations",
    "pricing.plan.studio.f3": "2K and 4K exports",
    "pricing.plan.studio.f4": "Collections and projects",
    "pricing.plan.studio.f5": "Generation priority",
    "pricing.plan.pro.name": "Agency",
    "pricing.plan.pro.description": "For high-volume studios and agencies.",
    "pricing.plan.pro.f1": "900 monthly creations",
    "pricing.plan.pro.f2": "Neva Studio priority",
    "pricing.plan.pro.f3": "High-definition exports",
    "pricing.plan.pro.f4": "Large imports and multi-reference",
    "pricing.plan.pro.f5": "Priority support",

    "resources.label": "Studio packs",
    "resources.title.a": "The studio's tools,",
    "resources.title.beam": "in your hands.",
    "resources.subtitle":
      "The resources the studio uses in gaming production: brushes, templates, graphic systems. One payment, one download, no limits.",
    "resources.oneShot": "one-time purchase",
    "resources.buy": "Buy",
    "resources.redirecting": "Redirecting…",
    "resources.trust": "Secure Stripe payment · Instant download · Lifetime access from your workspace",
    "resources.included": "Everything is included in the Neva Pack",
    "resources.error.checkout": "Checkout could not start. Please try again in a moment.",
    "resources.error.network": "Connection lost. Check your network and try again.",

    "faq.label": "Questions",
    "faq.title.a": "Everything people ask",
    "faq.title.beam": "before diving in.",
    "faq.subtitle": "Something more specific? The Discord answers within the day.",
    "faq.q1": "What exactly is Neva Design?",
    "faq.a1":
      "A full AI-driven creative studio: you describe an intent, it composes YouTube thumbnails, logos, brand guidelines and gaming visuals ready to publish — with real art direction, not random generation.",
    "faq.q2": "How good is the free plan, really?",
    "faq.a2":
      "5 creations to try the full flow, brief included. Renders come out watermarked in preview resolution; paid plans unlock HD exports, commercial use and generation priority.",
    "faq.q3": "Can I sell what I create?",
    "faq.a3":
      "Yes. From the first paid plan, every creation is commercially yours: channel, store, socials, server, client deliverables.",
    "faq.q4": "The Creative Director — another chatbot?",
    "faq.a4":
      "No. It knows your references, your history and the codes of your field — YouTube thumbnails, brand identity or GTA RP servers. It pitches concepts, structures briefs and can launch a generation right from the conversation.",
    "faq.q5": "I can't design. Is that a problem?",
    "faq.a5":
      "That's exactly why Neva exists. Describe the result you want; composition, typography and grading are handled. The Audit module even tells you what to improve.",
    "faq.q6": "What if I want to stop?",
    "faq.a6":
      "Two clicks from your workspace. The plan stays active until the end of the current period — nothing hidden, nothing held back.",
    "faq.cta": "Join the Discord",

    "footer.cta.title.a": "Publish something your audience",
    "footer.cta.title.beam": "will be proud of.",
    "footer.cta.subtitle": "Describe your universe. The first visual is ready within a minute.",
    "footer.cta.primary": "Start for free",
    "footer.cta.secondary": "Talk to the studio",
    "footer.cta.note": "5 free creations · No card required",
    "footer.baseline":
      "The AI creative studio — thumbnails, logos, identities, gaming. Art direction included.",
    "footer.product": "Product",
    "footer.company": "Studio",
    "footer.legal": "Legal",
    "footer.link.modules": "Modules",
    "footer.link.pricing": "Pricing",
    "footer.link.resources": "Packs",
    "footer.link.studio": "Neva Design Studio",
    "footer.link.agency": "Parent company",
    "footer.link.discord": "Discord",
    "footer.link.contact": "Contact",
    "footer.link.privacy": "Privacy",
    "footer.link.terms": "Terms of use",
    "footer.link.cookies": "Cookies",
    "footer.rights": "All rights reserved.",
  },
};

export const SUPPORTED_LANGUAGES: Array<{ code: Locale; label: string }> = LOCALES.map((code) => ({
  code,
  label: LANGUAGE_NAMES[code],
}));

export function getTranslations(locale: string): Record<string, string> {
  return TRANSLATIONS[locale as Locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
}

export function getLanguageLabel(locale: string): string {
  return LANGUAGE_NAMES[locale as Locale] ?? LANGUAGE_NAMES[DEFAULT_LOCALE];
}
