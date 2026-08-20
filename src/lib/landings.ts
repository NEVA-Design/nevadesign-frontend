import type { Landing } from "./landings-types";

/* Contenus rédigés au run 3 (LOT 5) — 600-900 mots par page,
   apostrophes typographiques, zéro duplication entre pages. */

export const LANDINGS: Record<string, Landing> = {
  "graphiste-fivem": {
    slug: "graphiste-fivem",
    locale: "fr",
    title: "Graphiste FiveM : vos visuels de serveur en minutes",
    description: "Logo, loading screen, bannières : créez l’habillage complet de votre serveur RP en minutes avec Neva Design.",
    h1: "Graphiste FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Trouver un graphiste FiveM disponible, fiable et abordable relève souvent du parcours du combattant : les bons profils affichent complet, les devis grimpent vite et l’ouverture de votre serveur n’attend pas. Neva Design prend le relais. Vous décrivez le visuel dont votre serveur RP a besoin — logo, loading screen, bannière Discord, affiche d’événement — et l’IA compose une image prête à publier, exportable jusqu’en 8K. Pas de logiciel à installer, pas de brief de dix pages : une description honnête de votre univers suffit. Le studio a déjà habillé des serveurs GTA RP, des équipes esport et des chaînes YouTube ; le portfolio public sur /neva-design montre des packs serveur réels, pas des maquettes théoriques. L’inscription est gratuite, sans carte bancaire : de quoi tester le studio avant de choisir une formule."],
    examples: [
      { src: "/postergrandfivem2.webp", alt: "Affiche grand format pour serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique complet de serveur RP", ratio: "video" },
      { src: "/affiche3.webp", alt: "Identité visuelle de serveur GTA RP", ratio: "portrait" },
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" }],
    sections: [
      {
        heading: "Du brief au fichier final, en quatre étapes",
        paragraphs: [
          "Tout part d’une description : le nom de votre ville, l’ambiance recherchée, deux ou trois couleurs, éventuellement une référence que vous aimez. L’IA génère une première proposition en quelques minutes. Vous itérez ensuite en langage naturel — « plus sombre », « typo plus fine », « enlève le contour doré » — via le Creative Director conversationnel, qui joue le rôle d’un directeur artistique disponible à 3 h du matin. Quand le résultat vous convient, vous exportez en haute résolution, jusqu’en 8K : assez défini pour un loading screen, un panneau imprimé ou un trailer."],
      },
      {
        heading: "Tout l’habillage d’un serveur RP, au même endroit",
        paragraphs: [
          "Concrètement, les serveurs qui passent par Neva produisent : un logo de ville décliné en icône Discord, un loading screen 1920 × 1080 qui pose l’ambiance pendant le téléchargement des ressources, la bannière et le splash d’invitation Discord, des affiches d’événements RP (inauguration du casino, recrutement du staff, ouverture de la whitelist) et les miniatures du trailer YouTube. Le module d’amélioration d’image remet à niveau vos anciens visuels trop compressés, et l’audit d’image pointe ce qui dessert votre serveur dans l’existant. Une charte graphique générée en amont garantit que tout reste cohérent."],
      },
      {
        heading: "Trois conseils avant de lancer vos visuels",
        paragraphs: [
          "Premier réflexe : testez votre logo en 128 pixels. S’il devient illisible en icône Discord, simplifiez-le avant de décliner quoi que ce soit. Deuxième : gardez une seule palette sur tous les supports ; les serveurs qui changent de couleurs à chaque affiche paraissent improvisés, même avec de belles images. Troisième : prévoyez les déclinaisons dès le départ — fond clair, fond sombre, format carré, bannière large — plutôt que de bricoler des recadrages après coup. L’erreur la plus fréquente reste le blason surchargé : nom complet, slogan, année de fondation et étoiles ne tiennent pas dans 128 pixels."],
      }],
    comparison: [
      {
        criteria: "Pack complet (logo + habillage)",
        traditional: "300 à 900 € selon le profil",
        neva: "Pack lancement 49 €, ou 24 €/mois",
      },
      {
        criteria: "Délai de livraison",
        traditional: "3 à 10 jours ouvrés",
        neva: "quelques minutes par visuel",
      },
      {
        criteria: "Itérations",
        traditional: "2 à 3 retours inclus, puis facturés",
        neva: "illimitées dans le quota",
      },
      {
        criteria: "Disponibilité",
        traditional: "selon agenda et fuseau horaire",
        neva: "24 h/24, depuis le navigateur",
      },
      {
        criteria: "Direction artistique sur mesure, brief très complexe",
        traditional: "l’humain garde clairement l’avantage",
        neva: "mieux vaut un graphiste confirmé",
      }],
    comparisonNote: "Direction artistique sur mesure, brief très complexe — l’humain garde clairement l’avantage — mieux vaut un graphiste confirmé",
    faq: [
      {
        q: "Neva remplace-t-il complètement un graphiste ?",
        a: "Pour l’habillage courant d’un serveur — logo, loading screen, bannières, affiches —, oui, avec un résultat livré en minutes. Pour une direction artistique très spécifique ou un brief à forte contrainte technique, un graphiste humain reste supérieur. Beaucoup combinent les deux : générer la base sur Neva, puis faire affiner les détails par un professionnel.",
      },
      {
        q: "Puis-je utiliser les visuels sur un serveur monétisé ?",
        a: "Oui. Les créations sont utilisables commercialement : boutique de dons, pages de packs VIP, publicités pour votre serveur, vidéos monétisées. Vous exportez les fichiers en haute résolution et les intégrez où vous voulez, sans watermark ni licence à racheter plus tard.",
      },
      {
        q: "Combien de créations prévoir pour habiller un serveur complet ?",
        a: "Comptez 5 à 6 créations : logo, loading screen, bannière Discord, splash d’invitation et deux affiches. La formule Créateur (24 €/mois, 12 créations) couvre un lancement confortablement ; le Pack lancement à 49 € est pensé exactement pour ce scénario, itérations comprises.",
      }],
    ctaText: "Votre serveur mérite mieux qu’un logo bricolé en cinq minutes sur un téléphone : décrivez-le, et jugez sur pièce.",
    ctaLabel: "Créer mes 3 visuels offerts",
    related: ["logo-fivem", "pack-graphique-fivem", "affiche-serveur-fivem", "banniere-discord-fivem", "loading-screen-fivem"],
    altLocaleSlug: "en/fivem-graphic-designer",
  },
  "logo-fivem": {
    slug: "logo-fivem",
    locale: "fr",
    title: "Logo FiveM : créez l’emblème unique de votre serveur",
    description: "Générez un logo FiveM lisible jusqu’en icône Discord : blason, mascotte ou néon, export 8K.",
    h1: "Logo FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Un logo FiveM se joue en une fraction de seconde : c’est lui qu’un joueur voit dans la liste des serveurs, sur l’icône Discord et en haut du loading screen, avant même de lire votre présentation. Neva Design vous permet d’en créer un sans toucher Photoshop : vous décrivez votre ville, son époque et son ambiance, l’IA compose un emblème original, et vous l’ajustez jusqu’à ce qu’il vous ressemble. Export final jusqu’en 8K, utilisable sur Discord, votre site, vos overlays de stream et vos impressions. Le portfolio /neva-design montre des logos esport et serveur réellement livrés, pour vous faire une idée du niveau de finition. L’inscription est gratuite et sans carte bancaire ; les formules démarrent dès 24 €/mois pour comparer deux directions et trancher."],
    examples: [
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
      { src: "/neva-design/logos/krlogo.webp", alt: "Monogramme chrome KR", ratio: "video" },
      { src: "/neva-design/logos/vulcainlogo.webp", alt: "Logo Vulcain, V ailé", ratio: "video" },
      { src: "/neva-design/logos/Xlogo.webp", alt: "Monogramme chrome X", ratio: "video" }],
    sections: [
      {
        heading: "Décrivez votre ville, l’IA dessine l’emblème",
        paragraphs: [
          "La qualité du logo dépend surtout de la précision de votre description. « Logo pour serveur RP » donnera un résultat générique ; « blason de ville côtière années 90, palmier et néon turquoise, typographie chromée » donnera un emblème qui raconte quelque chose. Vous générez une première piste, puis vous itérez : changer la typographie, resserrer la palette, retirer un élément, tester une version de nuit. Chaque ajustement prend moins de temps qu’un e-mail de brief, et vous restez dans votre quota mensuel sans surcoût par retouche."],
      },
      {
        heading: "Blason, mascotte ou lettrage : quel style pour quel serveur",
        paragraphs: [
          "Le blason municipal — écusson, devise, symboles de la ville — convient aux serveurs whitelist exigeants qui veulent inspirer le sérieux dès la candidature. La mascotte (animal, personnage stylisé) colle aux communautés détendues et aux serveurs orientés événements. Le lettrage néon ou chromé évoque immédiatement les nuits de Los Santos et fonctionne très bien pour les serveurs à ambiance urbaine. Le monogramme, enfin, sert de base élégante quand vos factions et services internes (EMS, mécano, taxi) auront chacun leur déclinaison. Si vous hésitez entre deux directions, générez un blason et un lettrage du même univers, affichez-les côte à côte en taille icône, et laissez votre staff trancher."],
      },
      {
        heading: "Un bon logo de serveur se juge en 128 pixels",
        paragraphs: [
          "Discord recadre votre logo dans un rond de 128 pixels : gardez l’élément fort au centre et sacrifiez le reste. Évitez les dégradés subtils et les contours de 1 pixel, qui disparaissent à la réduction ; limitez-vous à deux ou trois couleurs franches. Prévoyez trois versions dès le départ : icône seule, logo horizontal avec le nom du serveur, version monochrome pour les fonds difficiles. L’erreur classique du logo de serveur RP : un texte courbé minuscule autour du blason, illisible partout sauf en plein écran."],
      }],
    comparison: [
      {
        criteria: "Prix d’un logo",
        traditional: "150 à 600 €",
        neva: "dès l’essai gratuit, puis 2,90 €/création",
      },
      {
        criteria: "Pistes proposées",
        traditional: "2 à 3 concepts au devis",
        neva: "autant de pistes que votre quota le permet",
      },
      {
        criteria: "Délai",
        traditional: "5 à 10 jours",
        neva: "quelques minutes par proposition",
      },
      {
        criteria: "Retouches après livraison",
        traditional: "souvent facturées en sus",
        neva: "régénération immédiate, incluse",
      },
      {
        criteria: "Identité de marque déposée, brief juridique précis",
        traditional: "avantage net au professionnel",
        neva: "préférez un graphiste accompagné d’un conseil",
      }],
    comparisonNote: "Identité de marque déposée, brief juridique précis — avantage net au professionnel — préférez un graphiste accompagné d’un conseil",
    faq: [
      {
        q: "Puis-je moderniser mon logo actuel plutôt que repartir de zéro ?",
        a: "Oui. Importez votre logo existant, décrivez ce que vous voulez garder — le blason, la palette, le nom — et ce qui doit changer. Le module d’amélioration d’image sert aussi à upscaler proprement un ancien fichier basse résolution que vous n’avez plus en version source.",
      },
      {
        q: "Quels fichiers vais-je récupérer ?",
        a: "Des images haute résolution exportables jusqu’en 8K, avec vos déclinaisons (icône, version horizontale, fonds clair et sombre si vous les générez). C’est suffisant pour Discord, un site, des overlays de stream et de l’impression grand format sans pixellisation visible.",
      },
      {
        q: "Mon logo sera-t-il vraiment unique ?",
        a: "Il est composé à partir de votre description, pas pioché dans une bibliothèque de gabarits revendus à d’autres serveurs. Deux briefs différents produisent deux emblèmes différents. La vraie clé d’unicité reste la précision de votre demande : plus votre univers est décrit, moins le résultat ressemble à autre chose.",
      }],
    ctaText: "Deux directions artistiques comparées et un logo final : lancez la première maintenant.",
    ctaLabel: "Générer mon logo",
    related: ["graphiste-fivem", "pack-graphique-fivem"],
    altLocaleSlug: "en/fivem-logo-maker",
  },
  "banniere-discord-fivem": {
    slug: "banniere-discord-fivem",
    locale: "fr",
    title: "Bannière Discord FiveM : formats exacts et rendu pro",
    description: "Créez bannière, splash d’invitation et icône Discord assortis pour votre serveur FiveM, aux bonnes dimensions.",
    h1: "Bannière Discord FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Le Discord est la porte d’entrée de votre serveur : c’est là que passent les candidatures whitelist, les annonces et les nouveaux joueurs venus « juste regarder ». Une bannière Discord FiveM soignée change la première impression du tout au tout — et c’est précisément le genre de visuel que Neva Design produit bien : vous décrivez l’ambiance de votre ville, l’IA compose une image aux bonnes dimensions, cohérente avec votre logo et votre loading screen. Vous itérez jusqu’au rendu voulu, puis vous exportez en haute résolution, jusqu’en 8K si besoin. Pas de gabarit Canva vu mille fois, pas d’attente de trois jours pour un fichier de 960 × 540. L’inscription est gratuite et sans carte bancaire ; une formule active vous laisse générer la bannière, le splash d’invitation et l’icône assortie."],
    examples: [
      { src: "/postergrandfivem.webp", alt: "Bannière grand format serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Kit graphique serveur RP", ratio: "video" },
      { src: "/vice.webp", alt: "Visuel d’ambiance Vice", ratio: "wide" },
      { src: "/affiche2.webp", alt: "Affiche de communication serveur", ratio: "portrait" }],
    sections: [
      {
        heading: "Les dimensions Discord à connaître avant de générer",
        paragraphs: [
          "Discord impose des formats précis, et une image mal taillée finit rognée. Retenez quatre gabarits : la bannière de serveur en 960 × 540 minimum (ratio 16:9, réservée aux serveurs boostés niveau 2), le splash d’invitation en 1920 × 1080 (dès le niveau 1), l’icône en 512 × 512 recadrée en rond, et la couverture d’événement en 800 × 320. Décrivez le format visé dans votre demande — « bannière de serveur, ambiance nuit pluvieuse, néons violets, logo centré » — et générez directement à la bonne proportion plutôt que de recadrer après coup une image pensée autrement."],
      },
      {
        heading: "Une bannière ne vit jamais seule : pensez déclinaisons",
        paragraphs: [
          "La bannière s’affiche au-dessus de la liste des salons, le splash accueille chaque personne qui clique sur une invitation, l’icône apparaît dans la barre latérale de tous vos membres. Ces trois surfaces doivent raconter la même ville : même palette, même typographie, même logo. Avec la charte graphique Neva générée en amont, chaque déclinaison repart des mêmes fondations. Cas concret : un serveur RP qui ouvre son allowlist Discord génère en une soirée la bannière « candidatures ouvertes », le splash d’invitation et une couverture d’événement pour la soirée de lancement — trois visuels, un seul univers."],
      },
      {
        heading: "Les pièges classiques du format bannière",
        paragraphs: [
          "Le nom du serveur et les boutons Discord se superposent à la partie haute de la bannière : gardez cette zone visuellement calme et placez votre texte au centre ou en bas. Sur mobile, la bannière est affichée plus courte : vérifiez que l’élément essentiel survit au recadrage. Évitez le texte de moins de 28 pixels de haut, illisible sur téléphone, et les visuels surchargés qui se battent avec l’interface. Enfin, n’écrivez pas l’IP du serveur sur la bannière : elle change, votre image non."],
      }],
    comparison: [
      {
        criteria: "Prix d’une bannière + déclinaisons",
        traditional: "40 à 120 €",
        neva: "dès l’essai gratuit, puis 2,90 €/création",
      },
      {
        criteria: "Délai",
        traditional: "2 à 5 jours",
        neva: "quelques minutes par format",
      },
      {
        criteria: "Ajustement aux formats Discord",
        traditional: "à préciser au brief, retours en sus",
        neva: "généré directement aux bonnes proportions",
      },
      {
        criteria: "Refonte quand Discord change ses formats",
        traditional: "nouvelle prestation",
        neva: "régénération dans votre quota",
      },
      {
        criteria: "Illustration dessinée à la main, style signature",
        traditional: "l’illustrateur humain l’emporte",
        neva: "choisissez un artiste si c’est le cœur du projet",
      }],
    comparisonNote: "Illustration dessinée à la main, style signature — l’illustrateur humain l’emporte — choisissez un artiste si c’est le cœur du projet",
    faq: [
      {
        q: "Quelles tailles dois-je demander exactement ?",
        a: "Bannière de serveur : 960 × 540 minimum, en 16:9 — générez plus grand, Discord redimensionne proprement. Splash d’invitation : 1920 × 1080. Icône : 512 × 512, avec l’élément principal centré pour survivre au recadrage rond. Couverture d’événement : 800 × 320, un format très horizontal à anticiper dès la composition.",
      },
      {
        q: "Puis-je obtenir une bannière animée ?",
        a: "Non, Neva génère des images fixes. Une bannière animée (GIF, réservée au niveau de boost 3) devra passer par un motion designer. En pratique, une image fixe contrastée et bien composée fait déjà l’essentiel du travail d’attractivité pour un serveur RP.",
      },
      {
        q: "Comment garder icône, bannière et splash cohérents entre eux ?",
        a: "Générez d’abord votre charte graphique (couleurs, typographies, ambiance), puis demandez chaque format en vous y référant dans la description. Les trois visuels partagent alors la même base au lieu d’être trois images indépendantes. C’est la méthode utilisée pour les packs serveur visibles sur /neva-design.",
      }],
    ctaText: "Votre Discord recrute pour vous à condition d’en avoir l’air : générez la bannière, le splash et l’icône ce soir.",
    ctaLabel: "Habiller mon Discord",
    related: ["graphiste-fivem", "affiche-serveur-fivem", "pack-graphique-fivem"],
  },
  "loading-screen-fivem": {
    slug: "loading-screen-fivem",
    locale: "fr",
    title: "Loading screen FiveM : des visuels 16:9 qui marquent",
    description: "Générez un loading screen FiveM net en 1920×1080, léger et lisible, décliné en série. Export jusqu’en 8K. Essai gratuit, sans carte bancaire.",
    h1: "Loading screen FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Le loading screen FiveM est un moment étrange : le joueur n’a rien d’autre à regarder pendant que les ressources se téléchargent, parfois plusieurs minutes lors de la première connexion. C’est votre meilleure fenêtre d’ambiance — et souvent la plus négligée, remplie d’une capture d’écran floue prise à la va-vite. Neva Design génère des visuels d’écran de chargement composés pour ce format : une scène qui pose votre univers, votre logo bien placé, des zones calmes pour l’interface. Vous décrivez l’ambiance (« ruelle sous la pluie, enseignes néon, voiture de police au loin »), vous itérez, vous exportez en 1920 × 1080 ou plus, jusqu’en 8K pour les écrans 4K. L’inscription est gratuite et sans carte bancaire ; une formule active permet de produire une petite série rotative dès ce soir."],
    examples: [
      { src: "/bglanding.webp", alt: "Écran d’attente de serveur FiveM", ratio: "wide" },
      { src: "/plage.webp", alt: "Décor plage Los Santos retravaillé", ratio: "wide" },
      { src: "/postergrandfivem2.webp", alt: "Visuel vertical de serveur RP", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack visuel de serveur", ratio: "video" }],
    sections: [
      {
        heading: "Résolution, poids, format : les bons réglages",
        paragraphs: [
          "La base reste le 16:9 en 1920 × 1080, ce qu’affichent la majorité des joueurs. Si votre communauté compte des écrans 1440p ou 4K, exportez plus grand — la génération jusqu’en 8K évite l’effet flou d’une image étirée. Côté poids, restez raisonnable : le loading screen est chargé par une ressource du serveur, et une image de 8 Mo ralentit précisément l’écran censé faire patienter. Un JPG de qualité 80-85 autour de 500 Ko à 1,5 Mo est un bon compromis entre netteté et affichage instantané. Gardez le PNG pour les éléments d’interface, pas pour le fond."],
      },
      {
        heading: "Une scène qui raconte votre serveur, pas une capture d’écran",
        paragraphs: [
          "Les meilleurs écrans de chargement fonctionnent comme des affiches de film : une scène forte, une lumière travaillée, le logo lisible. Exemples concrets générés pour des serveurs RP : un commissariat de nuit sous la pluie pour un serveur orienté forces de l’ordre, une avenue de bord de mer au coucher du soleil pour une ville détendue, un parking souterrain aux néons froids pour une ambiance streetlife. C’est plus fort que trois captures de MLO retouchées, et surtout c’est à vous. En complément, l’upscale Neva peut aussi remettre à niveau un visuel existant que vous aimez mais qui date."],
      },
      {
        heading: "Composer pour l’interface qui viendra par-dessus",
        paragraphs: [
          "Un loading screen n’est jamais affiché nu : barre de progression, pourcentage, parfois lecteur musical ou règles du serveur viennent se superposer. Laissez le tiers inférieur visuellement calme et évitez d’y placer un visage ou du texte important. Limitez le texte incrusté au strict minimum — nom du serveur, éventuellement le Discord — car personne ne lit dix règles pendant un chargement, et une règle qui change rend l’image obsolète. Enfin, générez une série de deux ou trois scènes cohérentes en rotation : la répétition lasse vite les habitués qui se connectent chaque jour."],
      }],
    comparison: [
      {
        criteria: "Prix d’un loading screen",
        traditional: "50 à 150 € l’écran",
        neva: "dès l’essai gratuit, série via l’abonnement",
      },
      {
        criteria: "Délai",
        traditional: "3 à 7 jours",
        neva: "quelques minutes par scène",
      },
      {
        criteria: "Série de 3 scènes cohérentes",
        traditional: "devis multiplié",
        neva: "même charte, trois générations",
      },
      {
        criteria: "Ajustements d’ambiance (nuit, pluie, saison)",
        traditional: "nouvelle commande",
        neva: "itération dans le quota",
      },
      {
        criteria: "Scène 3D sur mesure de votre map exacte",
        traditional: "un artiste maîtrisant vos décors gagne",
        neva: "l’IA compose une ambiance, pas votre MLO précis",
      }],
    comparisonNote: "Scène 3D sur mesure de votre map exacte — un artiste maîtrisant vos décors gagne — l’IA compose une ambiance, pas votre MLO précis",
    faq: [
      {
        q: "Quelle résolution et quel format de fichier utiliser ?",
        a: "Générez en 1920 × 1080 minimum, exportez plus grand si votre communauté joue en 1440p ou 4K. Enregistrez le fond en JPG bien compressé (500 Ko à 1,5 Mo) pour un affichage immédiat, et réservez le PNG aux éléments avec transparence comme le logo posé par-dessus.",
      },
      {
        q: "Puis-je intégrer les règles du serveur dans l’image ?",
        a: "Techniquement oui, mais évitez : les règles évoluent, et chaque changement rendrait le visuel périmé. Mieux vaut un loading screen d’ambiance avec le nom du serveur et le lien Discord, et des règles affichées dans un salon dédié où elles restent modifiables à tout moment.",
      },
      {
        q: "Combien de visuels prévoir pour une rotation ?",
        a: "Deux ou trois scènes suffisent à casser la répétition sans diluer votre identité. Générez-les dans la même session en gardant palette et logo identiques : seule l’ambiance change (jour, nuit, pluie). La formule Créateur à 24 €/mois couvre la série et ses itérations sans compter.",
      }],
    ctaText: "Le prochain joueur qui se connecte devrait comprendre votre univers avant même d’apparaître en ville : composez votre écran maintenant.",
    ctaLabel: "Créer mon loading screen",
    related: ["graphiste-fivem", "pack-graphique-fivem", "affiche-serveur-fivem"],
  },
  "pack-graphique-fivem": {
    slug: "pack-graphique-fivem",
    locale: "fr",
    title: "Pack graphique FiveM : l’identité complète du serveur",
    description: "Logo, loading screen, bannières et affiches cohérents, en pack dès 19 €, rendus en une soirée. Itérations incluses.",
    h1: "Pack graphique FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Commander ses visuels un par un, à des moments différents, parfois à des personnes différentes : voilà comment un serveur se retrouve avec un logo bleu, un loading screen orange et des affiches qui semblent venir d’une autre ville. Un pack graphique FiveM règle le problème à la racine : tous les supports partent de la même charte et sortent ensemble. Avec Neva Design, vous décrivez une seule fois votre univers — époque, ambiance, couleurs — puis vous déclinez logo, écran de chargement, bannières Discord et affiches dans la foulée, avec des itérations illimitées dans votre quota et des exports jusqu’en 8K. Les packs one-shot démarrent à 19 €, et l’inscription reste gratuite et sans carte bancaire pour découvrir le studio avant d’engager quoi que ce soit."],
    examples: [
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique serveur, vue d’ensemble", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Déclinaisons d’un pack serveur", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack GFX complet", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_15.webp", alt: "Supports de communication d’un pack", ratio: "video" }],
    sections: [
      {
        heading: "La charte d’abord, les supports ensuite",
        paragraphs: [
          "La bonne méthode ne commence pas par le logo : elle commence par la charte graphique. Deux ou trois couleurs, une typographie forte, une ambiance lumineuse — c’est ce socle que Neva génère en premier et auquel chaque visuel se réfère ensuite. Résultat : la bannière Discord et le loading screen se répondent naturellement au lieu de cohabiter. C’est exactement la différence entre les serveurs dont on reconnaît les affiches en une seconde et ceux dont chaque événement semble repartir de zéro."],
      },
      {
        heading: "Ce qu’un pack serveur contient concrètement",
        paragraphs: [
          "Un habillage complet de serveur RP couvre en général : le logo et ses déclinaisons (icône Discord, version horizontale, monochrome), un ou deux loading screens, la bannière et le splash d’invitation Discord, deux affiches d’événement (ouverture de la whitelist, soirée de lancement) et un visuel de recrutement staff. Côté tarifs, trois packs one-shot selon l’étendue : Pack identité à 19 € pour poser les bases, Pack lancement à 49 € pensé pour une ouverture de serveur, Pack marque à 79 € pour une identité déclinée en profondeur. L’abonnement Créateur (24 €/mois, 12 créations) reste l’option souple si vos besoins s’étalent."],
      },
      {
        heading: "Garder la cohérence dans la durée",
        paragraphs: [
          "Un pack réussi se juge trois mois plus tard. Trois habitudes à prendre : conserver la description de votre charte et la réutiliser mot pour mot à chaque nouveau visuel ; garder le logo au même emplacement et à la même taille relative sur toutes les affiches ; résister à l’envie de changer de style à chaque événement — on varie la scène, jamais les fondations. Nommez aussi vos fichiers proprement (support, format, version) : quand le staff cherche « la bannière de Noël » dans six mois, tout le monde gagne du temps."],
      }],
    comparison: [
      {
        criteria: "Pack identité complet",
        traditional: "300 à 900 €",
        neva: "packs de 19 à 79 €, ou 24 €/mois",
      },
      {
        criteria: "Délai pour l’ensemble",
        traditional: "1 à 3 semaines",
        neva: "une soirée, itérations comprises",
      },
      {
        criteria: "Cohérence entre supports",
        traditional: "dépend du suivi du brief",
        neva: "garantie par la charte générée en amont",
      },
      {
        criteria: "Ajout d’un support six mois plus tard",
        traditional: "re-devis, style à retrouver",
        neva: "recharge 2,90 €, même charte",
      },
      {
        criteria: "Refonte de marque stratégique haut de gamme",
        traditional: "l’accompagnement humain l’emporte",
        neva: "un studio ou un directeur artistique reste indiqué",
      }],
    comparisonNote: "Refonte de marque stratégique haut de gamme — l’accompagnement humain l’emporte — un studio ou un directeur artistique reste indiqué",
    faq: [
      {
        q: "Pack one-shot ou abonnement : comment choisir ?",
        a: "Le pack convient à un besoin ponctuel et délimité — ouvrir le serveur avec tout l’habillage. L’abonnement (24, 59 ou 129 €/mois selon le volume) s’adresse aux serveurs actifs qui publient des affiches d’événements chaque semaine. Beaucoup démarrent au pack puis passent à l’abonnement quand la communauté grandit.",
      },
      {
        q: "En combien de temps puis-je habiller tout mon serveur ?",
        a: "Une soirée sérieuse suffit : charte en début de session, puis logo, loading screen, bannières et affiches dans la foulée, chaque visuel demandant quelques minutes plus vos itérations. Comparez avec les deux à trois semaines habituelles d’un pack commandé à un indépendant déjà occupé.",
      },
      {
        q: "Puis-je compléter mon pack plus tard sans casser le style ?",
        a: "Oui : c’est l’intérêt de la charte. Un événement de Noël, un partenariat, une nouvelle faction — vous régénérez à partir des mêmes fondations, à l’unité via les recharges à 2,90 € ou dans votre quota mensuel. Le style tient parce qu’il est documenté, pas mémorisé.",
      }],
    ctaText: "Un serveur cohérent inspire confiance avant même la première connexion : posez votre charte et déclinez tout le reste dans la soirée.",
    ctaLabel: "Composer mon pack",
    related: ["graphiste-fivem", "logo-fivem", "loading-screen-fivem"],
  },
  "affiche-serveur-fivem": {
    slug: "affiche-serveur-fivem",
    locale: "fr",
    title: "Affiche serveur FiveM : annoncez vos événements RP",
    description: "Créez des affiches d’événements RP percutantes aux formats réseaux (4:5, 9:16, 16:9), déclinées en série.",
    h1: "Affiche serveur FiveM",
    kicker: "Solutions — FiveM & GTA RP",
    intro: [
      "Un événement RP sans affiche, c’est un salon Discord qui s’emballe deux heures puis retombe. Une affiche serveur FiveM bien faite transforme une annonce texte en rendez-vous : elle circule sur le Discord, se partage sur X et TikTok, et donne à votre soirée casino ou à votre salon de l’auto l’allure d’un vrai événement de ville. Neva Design en génère en quelques minutes : vous décrivez la scène, l’IA compose l’affiche dans le style de votre serveur, vous ajustez le texte et l’ambiance, puis vous exportez aux formats de chaque réseau — jusqu’en 8K pour l’impression éventuelle. Les affiches GTA RP du portfolio /neva-design donnent une idée du rendu. L’inscription est gratuite et sans carte bancaire : votre prochain événement peut être affiché dès ce soir."],
    examples: [
      { src: "/affiche1.webp", alt: "Affiche de lancement de serveur", ratio: "portrait" },
      { src: "/affiche2.webp", alt: "Affiche d’événement RP", ratio: "portrait" },
      { src: "/affiche3.webp", alt: "Affiche d’identité de serveur", ratio: "portrait" },
      { src: "/posterlarya.webp", alt: "Campagne d’affichage Larya", ratio: "portrait" }],
    sections: [
      {
        heading: "Une affiche par événement, un format par réseau",
        paragraphs: [
          "Le réflexe gagnant : générer l’affiche principale en 4:5 (1080 × 1350), le format le plus confortable dans les fils Instagram et X, puis décliner en 9:16 (1080 × 1920) pour les stories et TikTok, et en 16:9 pour la bannière d’événement Discord. Décrire le format dès la demande évite les recadrages qui coupent un personnage ou une date. Pour un événement hebdomadaire, gardez la même base et changez la scène : votre communauté reconnaît l’affiche avant même de lire le titre."],
      },
      {
        heading: "Des exemples qui parlent à toutes les villes",
        paragraphs: [
          "Ce que les serveurs annoncent le plus : ouverture ou réouverture de la whitelist, soirée d’inauguration d’un lieu (casino, boîte de nuit, restaurant tenu par des joueurs), course automobile scénarisée, salon de l’auto, élections municipales, recrutement des forces de l’ordre ou des EMS, marché de Noël. Chaque cas a ses codes : une affiche d’élection joue le sérieux institutionnel, une soirée néon assume la saturation. L’IA suit votre direction : « affiche d’élection municipale, style officiel années 2000, drapeau de la ville, palette bleu et or » produit tout autre chose qu’« affiche de course nocturne, néons, fumée, chrome »."],
      },
      {
        heading: "La hiérarchie qui fait venir du monde",
        paragraphs: [
          "Une affiche efficace répond en trois niveaux de lecture : quoi (le nom de l’événement, énorme), quand (date et heure, avec le fuseau si votre communauté est internationale), où (le nom du serveur et le Discord). Tout le reste est décoratif. Les erreurs qui coûtent des joueurs : une date en petit dans un coin, un paragraphe de lore que personne ne lit dans un fil, et l’oubli du rappel de publication — une affiche postée trois heures avant l’événement ne remplit pas une soirée. Publiez à J-3, rappelez à J-1 et le jour même."],
      }],
    comparison: [
      {
        criteria: "Prix d’une affiche",
        traditional: "50 à 150 €",
        neva: "dès l’essai gratuit, puis 2,90 €/création",
      },
      {
        criteria: "Délai",
        traditional: "2 à 7 jours",
        neva: "quelques minutes, déclinaisons comprises",
      },
      {
        criteria: "Événement improvisé du week-end",
        traditional: "rarement faisable à temps",
        neva: "affiche prête le soir même",
      },
      {
        criteria: "Changement de date de dernière minute",
        traditional: "retour facturé ou bricolage",
        neva: "régénération immédiate",
      },
      {
        criteria: "Illustration d’événement dessinée, pièce de collection",
        traditional: "un illustrateur humain fait mieux",
        neva: "à réserver aux très grands moments",
      }],
    comparisonNote: "Illustration d’événement dessinée, pièce de collection — un illustrateur humain fait mieux — à réserver aux très grands moments",
    faq: [
      {
        q: "Quels formats pour Discord, TikTok et X ?",
        a: "Partez du 4:5 (1080 × 1350) pour les fils, déclinez en 9:16 (1080 × 1920) pour stories et TikTok, et en 16:9 pour la couverture d’événement Discord (800 × 320, très horizontale : anticipez la composition). Trois générations dans la même session gardent la scène cohérente d’un format à l’autre.",
      },
      {
        q: "La date et l’heure sont-elles intégrées dans l’image ?",
        a: "Oui, vous précisez le texte exact dans votre description et l’IA le compose dans l’affiche. Relisez-le avant export — comme chez un graphiste humain, une coquille dans le brief se retrouve sur l’affiche. En cas de report, vous régénérez la version corrigée en quelques minutes.",
      },
      {
        q: "Comment gérer un événement récurrent chaque semaine ?",
        a: "Créez une affiche « mère » qui fixe le style, puis régénérez chaque semaine en ne changeant que la scène et la date. Avec la formule Créateur (12 créations à 24 €/mois), un événement hebdomadaire décliné en deux formats tient dans le quota sans y penser.",
      }],
    ctaText: "Votre prochaine soirée mérite une vraie affiche, pas un message épinglé : composez-la maintenant et publiez à J-3.",
    ctaLabel: "Créer mon affiche",
    related: ["graphiste-fivem", "banniere-discord-fivem"],
  },
  "en/fivem-graphic-designer": {
    slug: "en/fivem-graphic-designer",
    locale: "en",
    title: "FiveM Graphic Designer: Server Art in Minutes",
    description: "Get logos, loading screens and Discord banners for your FiveM server in minutes, not weeks. No credit card required to sign up.",
    h1: "FiveM Graphic Designer",
    kicker: "Solutions",
    intro: [
      "Every serious RP server eventually hits the same wall: you need a FiveM graphic designer, and the good ones are booked, the cheap ones disappear mid-project, and your launch date will not move. Neva Design works like an art department that answers instantly. You describe what your city needs — a crest for city hall, a loading screen that sets the mood, a Discord banner for allowlist applications — and the AI composes a publish-ready visual you can refine until it fits, then export at up to 8K. No design software, no back-and-forth emails spread over two weeks. The public portfolio at /neva-design shows real server packs, esports logos and GTA RP posters, so you can judge the output before spending anything. Signing up is free with no credit card, so you can explore the studio before choosing a plan."],
    examples: [
      { src: "/postergrandfivem2.webp", alt: "Affiche grand format pour serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique complet de serveur RP", ratio: "video" },
      { src: "/affiche3.webp", alt: "Identité visuelle de serveur GTA RP", ratio: "portrait" },
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" }],
    sections: [
      {
        heading: "How the workflow actually feels",
        paragraphs: [
          "You write a plain-language brief: the city’s era, the mood, two or three colors, anything you want echoed from servers you admire. A first proposal lands in minutes. Then you iterate by talking — \"darker sky\", \"thinner typeface\", \"drop the gold trim\" — through the conversational Creative Director, which behaves like an art director who never sleeps and never bills per revision. Iterations are unlimited within your plan’s quota, so exploring a second direction costs nothing but a sentence. When a visual is right, you export it at full resolution, up to 8K, ready for Discord, your community site or a trailer."],
      },
      {
        heading: "What RP communities actually ship with it",
        paragraphs: [
          "The typical launch list: a city crest or emblem scaled down to a Discord icon, one or two 1920 × 1080 loading screens that hold up while resources download, the server banner and invite splash, posters for the opening event and whitelist announcements, staff recruitment visuals, and thumbnails for the YouTube trailer. Established servers come back for seasonal art — a winter version of the loading screen, an election poster, a PD recruitment drive. Because everything derives from one brand kit, week twelve still looks like week one."],
      },
      {
        heading: "Getting results that read as professional",
        paragraphs: [
          "Three habits separate polished servers from improvised ones. First, test every logo at 128 pixels; if it dies as a Discord icon, simplify before you build anything on top of it. Second, lock one palette and reuse the exact brief wording for every new piece — drift happens one visual at a time. Third, keep live data out of the art: connect info, player counts and rule lists change weekly, and baked-in text ages your visuals fast. Put the mood in the image and the facts in your channels."],
      }],
    comparison: [
      {
        criteria: "Full server pack",
        traditional: "€300–900 depending on the freelancer",
        neva: "packs from €19, or €24/month",
      },
      {
        criteria: "Turnaround",
        traditional: "3–10 business days",
        neva: "minutes per visual",
      },
      {
        criteria: "Revisions",
        traditional: "2–3 rounds, then billed",
        neva: "unlimited within your quota",
      },
      {
        criteria: "Availability",
        traditional: "time zones and waitlists",
        neva: "24/7, in the browser",
      },
      {
        criteria: "Bespoke art direction on a complex brief",
        traditional: "a senior human designer still wins",
        neva: "bring in a professional for signature work",
      }],
    comparisonNote: "Bespoke art direction on a complex brief — a senior human designer still wins — bring in a professional for signature work",
    faq: [
      {
        q: "Will the style match what RP players expect?",
        a: "Yes, if you steer it there. The generator follows your brief, and RP communities respond to specific codes — municipal crests for strict whitelist cities, neon and chrome for street-focused servers. Browse the FiveM packs on the portfolio first, then borrow the vocabulary that fits your city in your own description.",
      },
      {
        q: "How many creations does a full rebrand take?",
        a: "Rebranding an existing server typically takes 6–8 creations: new emblem, loading screen pair, banner, invite splash and two announcement posters explaining the change. The Creator plan (12 creations, €24/month) covers it in one cycle, and the €49 launch pack is sized for exactly this scope.",
      },
      {
        q: "We already have a designer on staff — is this still useful?",
        a: "Very. Teams use Neva for volume work — weekly event posters, seasonal variants, quick concepts — and keep their designer for signature pieces and final polish. Generating three directions in ten minutes also makes briefs sharper: your designer reacts to something concrete instead of a paragraph.",
      }],
    ctaText: "Your city has a story; its visuals should tell it before the first spawn. Describe it and see the first draft in minutes.",
    ctaLabel: "Sign up for free",
    related: ["en/fivem-logo-maker"],
    altLocaleSlug: "graphiste-fivem",
  },
  "en/fivem-logo-maker": {
    slug: "en/fivem-logo-maker",
    locale: "en",
    title: "FiveM Logo Maker: Custom Server Emblems Fast",
    description: "Design a custom FiveM server logo from a text description. Crest, mascot or neon styles, 8K export. No credit card required.",
    h1: "FiveM Logo Maker",
    kicker: "Solutions",
    intro: [
      "Most logo tools give FiveM owners the same dead end: generic gaming templates that have nothing to do with roleplay, or a wolf-head mascot already used by forty other communities. Neva Design is a FiveM logo maker built around description instead of templates. You explain your city — its era, its energy, the story your server tells — and the AI composes an emblem that belongs to it: a municipal crest, a chrome wordmark, a mascot with actual character. You refine by chatting, not by re-opening a ticket, and export at up to 8K for anything from a Discord icon to printed merch. Real delivered logos sit in the portfolio at /neva-design if you want proof before starting. Signing up costs nothing and needs no credit card, so you can compare two directions before picking a plan."],
    examples: [
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
      { src: "/neva-design/logos/krlogo.webp", alt: "Monogramme chrome KR", ratio: "video" },
      { src: "/neva-design/logos/vulcainlogo.webp", alt: "Logo Vulcain, V ailé", ratio: "video" },
      { src: "/neva-design/logos/Xlogo.webp", alt: "Monogramme chrome X", ratio: "video" }],
    sections: [
      {
        heading: "From server name to emblem in one session",
        paragraphs: [
          "Start with the sentence you would give a human designer: \"coastal city RP, 1990s mood, teal neon and chrome, palm silhouette, serious but not grim.\" The first proposal arrives in minutes. From there you iterate in plain words — swap the typeface, mute the palette, try a badge shape instead of a wordmark — until the emblem feels inevitable. Because revisions draw from your quota rather than an invoice, exploring a wrong turn costs nothing. Most owners land a final logo in a single evening, declensions included."],
      },
      {
        heading: "One city, a whole family of badges",
        paragraphs: [
          "A server logo rarely stays alone. Departments and factions want their own marks: police, EMS, the mechanic shop, the taxi company, player-run businesses. Generate the main crest first, then derive each sub-badge from the same brief so the whole city feels governed by one visual law. It is the difference between a roleplay world and a collage. The €19 identity pack covers a main logo with its declensions; larger faction families fit comfortably in the Creator plan’s 12 monthly creations."],
      },
      {
        heading: "What survives the server list",
        paragraphs: [
          "Your logo will mostly live small and on dark interfaces: the Discord sidebar, the server browser, a phone screen. Design for that reality. Favor a strong silhouette over fine detail; strokes thinner than 2 pixels vanish at icon size. Check the emblem on near-black backgrounds first, since that is where players meet it. Keep the name short in the mark itself — long city names belong next to the logo, not inside it. And always generate a light-background variant before you need one; partner announcements and documents will ask for it."],
      }],
    comparison: [
      {
        criteria: "Logo price",
        traditional: "€150–600",
        neva: "free trial, then €2.90 per creation",
      },
      {
        criteria: "Concepts offered",
        traditional: "2–3 in the quote",
        neva: "as many directions as your quota allows",
      },
      {
        criteria: "Turnaround",
        traditional: "5–10 days",
        neva: "minutes per proposal",
      },
      {
        criteria: "Matching faction badges",
        traditional: "each one quoted separately",
        neva: "derived from the same brief in minutes",
      },
      {
        criteria: "Trademark-grade identity with legal vetting",
        traditional: "a human designer plus counsel wins",
        neva: "use professionals when the stakes are legal",
      }],
    comparisonNote: "Trademark-grade identity with legal vetting — a human designer plus counsel wins — use professionals when the stakes are legal",
    faq: [
      {
        q: "What makes a logo work in the FiveM server browser?",
        a: "Contrast and silhouette. Players scroll a dense, dark list where your mark renders tiny; a bold shape with two or three strong colors survives, while thin lines and subtle gradients turn to mush. Test every candidate at thumbnail size on a dark background before committing — thirty seconds that save a rebrand.",
      },
      {
        q: "Can it produce matching logos for our factions?",
        a: "Yes, and that is where description-based generation shines. Reuse the city brief and change only the subject: same palette and construction for PD, EMS or a gang crest with its own attitude. The family resemblance reads as an organized city, which whitelist applicants notice.",
      },
      {
        q: "Is there a free trial?",
        a: "You choose: the €19 identity pack if you only came for the logo, a subscription from €24/month if the server needs regular art, or one-off €2.90 top-ups. Nothing renews silently, and pricing sits on /#pricing. Your finished exports remain yours either way.",
      }],
    ctaText: "Two directions, one evening, zero invoices — your city’s emblem is a description away.",
    ctaLabel: "Make my server logo",
    related: ["en/fivem-graphic-designer"],
    altLocaleSlug: "logo-fivem",
  },
};

export const LANDING_SLUGS = Object.keys(LANDINGS);

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS[slug];
}
