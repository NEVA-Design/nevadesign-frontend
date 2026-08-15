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
      "Trouver un graphiste FiveM disponible, fiable et abordable relève souvent du parcours du combattant : les bons profils affichent complet, les devis grimpent vite et l’ouverture de votre serveur n’attend pas. Neva Design prend le relais. Vous décrivez le visuel dont votre serveur RP a besoin — logo, loading screen, bannière Discord, affiche d’événement — et l’IA compose une image prête à publier, exportable jusqu’en 8K. Pas de logiciel à installer, pas de brief de dix pages : une description honnête de votre univers suffit. Le studio a déjà habillé des serveurs GTA RP, des équipes esport et des chaînes YouTube ; le portfolio public sur /neva-design montre des packs serveur réels, pas des maquettes théoriques. L’inscription est gratuite, sans carte bancaire : de quoi tester le studio avant de choisir une formule.",
    ],
    examples: [
      { src: "/postergrandfivem2.webp", alt: "Affiche grand format pour serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique complet de serveur RP", ratio: "video" },
      { src: "/affiche3.webp", alt: "Identité visuelle de serveur GTA RP", ratio: "portrait" },
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
    ],
    sections: [
      {
        heading: "Du brief au fichier final, en quatre étapes",
        paragraphs: [
          "Tout part d’une description : le nom de votre ville, l’ambiance recherchée, deux ou trois couleurs, éventuellement une référence que vous aimez. L’IA génère une première proposition en quelques minutes. Vous itérez ensuite en langage naturel — « plus sombre », « typo plus fine », « enlève le contour doré » — via le Creative Director conversationnel, qui joue le rôle d’un directeur artistique disponible à 3 h du matin. Quand le résultat vous convient, vous exportez en haute résolution, jusqu’en 8K : assez défini pour un loading screen, un panneau imprimé ou un trailer.",
        ],
      },
      {
        heading: "Tout l’habillage d’un serveur RP, au même endroit",
        paragraphs: [
          "Concrètement, les serveurs qui passent par Neva produisent : un logo de ville décliné en icône Discord, un loading screen 1920 × 1080 qui pose l’ambiance pendant le téléchargement des ressources, la bannière et le splash d’invitation Discord, des affiches d’événements RP (inauguration du casino, recrutement du staff, ouverture de la whitelist) et les miniatures du trailer YouTube. Le module d’amélioration d’image remet à niveau vos anciens visuels trop compressés, et l’audit d’image pointe ce qui dessert votre serveur dans l’existant. Une charte graphique générée en amont garantit que tout reste cohérent.",
        ],
      },
      {
        heading: "Trois conseils avant de lancer vos visuels",
        paragraphs: [
          "Premier réflexe : testez votre logo en 128 pixels. S’il devient illisible en icône Discord, simplifiez-le avant de décliner quoi que ce soit. Deuxième : gardez une seule palette sur tous les supports ; les serveurs qui changent de couleurs à chaque affiche paraissent improvisés, même avec de belles images. Troisième : prévoyez les déclinaisons dès le départ — fond clair, fond sombre, format carré, bannière large — plutôt que de bricoler des recadrages après coup. L’erreur la plus fréquente reste le blason surchargé : nom complet, slogan, année de fondation et étoiles ne tiennent pas dans 128 pixels.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
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
      "Un logo FiveM se joue en une fraction de seconde : c’est lui qu’un joueur voit dans la liste des serveurs, sur l’icône Discord et en haut du loading screen, avant même de lire votre présentation. Neva Design vous permet d’en créer un sans toucher Photoshop : vous décrivez votre ville, son époque et son ambiance, l’IA compose un emblème original, et vous l’ajustez jusqu’à ce qu’il vous ressemble. Export final jusqu’en 8K, utilisable sur Discord, votre site, vos overlays de stream et vos impressions. Le portfolio /neva-design montre des logos esport et serveur réellement livrés, pour vous faire une idée du niveau de finition. L’inscription est gratuite et sans carte bancaire ; les formules démarrent dès 24 €/mois pour comparer deux directions et trancher.",
    ],
    examples: [
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
      { src: "/neva-design/logos/krlogo.webp", alt: "Monogramme chrome KR", ratio: "video" },
      { src: "/neva-design/logos/vulcainlogo.webp", alt: "Logo Vulcain, V ailé", ratio: "video" },
      { src: "/neva-design/logos/Xlogo.webp", alt: "Monogramme chrome X", ratio: "video" },
    ],
    sections: [
      {
        heading: "Décrivez votre ville, l’IA dessine l’emblème",
        paragraphs: [
          "La qualité du logo dépend surtout de la précision de votre description. « Logo pour serveur RP » donnera un résultat générique ; « blason de ville côtière années 90, palmier et néon turquoise, typographie chromée » donnera un emblème qui raconte quelque chose. Vous générez une première piste, puis vous itérez : changer la typographie, resserrer la palette, retirer un élément, tester une version de nuit. Chaque ajustement prend moins de temps qu’un e-mail de brief, et vous restez dans votre quota mensuel sans surcoût par retouche.",
        ],
      },
      {
        heading: "Blason, mascotte ou lettrage : quel style pour quel serveur",
        paragraphs: [
          "Le blason municipal — écusson, devise, symboles de la ville — convient aux serveurs whitelist exigeants qui veulent inspirer le sérieux dès la candidature. La mascotte (animal, personnage stylisé) colle aux communautés détendues et aux serveurs orientés événements. Le lettrage néon ou chromé évoque immédiatement les nuits de Los Santos et fonctionne très bien pour les serveurs à ambiance urbaine. Le monogramme, enfin, sert de base élégante quand vos factions et services internes (EMS, mécano, taxi) auront chacun leur déclinaison. Si vous hésitez entre deux directions, générez un blason et un lettrage du même univers, affichez-les côte à côte en taille icône, et laissez votre staff trancher.",
        ],
      },
      {
        heading: "Un bon logo de serveur se juge en 128 pixels",
        paragraphs: [
          "Discord recadre votre logo dans un rond de 128 pixels : gardez l’élément fort au centre et sacrifiez le reste. Évitez les dégradés subtils et les contours de 1 pixel, qui disparaissent à la réduction ; limitez-vous à deux ou trois couleurs franches. Prévoyez trois versions dès le départ : icône seule, logo horizontal avec le nom du serveur, version monochrome pour les fonds difficiles. L’erreur classique du logo de serveur RP : un texte courbé minuscule autour du blason, illisible partout sauf en plein écran.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
    ctaText: "Deux directions artistiques comparées et un logo final : lancez la première maintenant.",
    ctaLabel: "Générer mon logo",
    related: ["graphiste-fivem", "pack-graphique-fivem", "generateur-de-logo"],
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
      "Le Discord est la porte d’entrée de votre serveur : c’est là que passent les candidatures whitelist, les annonces et les nouveaux joueurs venus « juste regarder ». Une bannière Discord FiveM soignée change la première impression du tout au tout — et c’est précisément le genre de visuel que Neva Design produit bien : vous décrivez l’ambiance de votre ville, l’IA compose une image aux bonnes dimensions, cohérente avec votre logo et votre loading screen. Vous itérez jusqu’au rendu voulu, puis vous exportez en haute résolution, jusqu’en 8K si besoin. Pas de gabarit Canva vu mille fois, pas d’attente de trois jours pour un fichier de 960 × 540. L’inscription est gratuite et sans carte bancaire ; une formule active vous laisse générer la bannière, le splash d’invitation et l’icône assortie.",
    ],
    examples: [
      { src: "/postergrandfivem.webp", alt: "Bannière grand format serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Kit graphique serveur RP", ratio: "video" },
      { src: "/vice.webp", alt: "Visuel d’ambiance Vice", ratio: "wide" },
      { src: "/affiche2.webp", alt: "Affiche de communication serveur", ratio: "portrait" },
    ],
    sections: [
      {
        heading: "Les dimensions Discord à connaître avant de générer",
        paragraphs: [
          "Discord impose des formats précis, et une image mal taillée finit rognée. Retenez quatre gabarits : la bannière de serveur en 960 × 540 minimum (ratio 16:9, réservée aux serveurs boostés niveau 2), le splash d’invitation en 1920 × 1080 (dès le niveau 1), l’icône en 512 × 512 recadrée en rond, et la couverture d’événement en 800 × 320. Décrivez le format visé dans votre demande — « bannière de serveur, ambiance nuit pluvieuse, néons violets, logo centré » — et générez directement à la bonne proportion plutôt que de recadrer après coup une image pensée autrement.",
        ],
      },
      {
        heading: "Une bannière ne vit jamais seule : pensez déclinaisons",
        paragraphs: [
          "La bannière s’affiche au-dessus de la liste des salons, le splash accueille chaque personne qui clique sur une invitation, l’icône apparaît dans la barre latérale de tous vos membres. Ces trois surfaces doivent raconter la même ville : même palette, même typographie, même logo. Avec la charte graphique Neva générée en amont, chaque déclinaison repart des mêmes fondations. Cas concret : un serveur RP qui ouvre son allowlist Discord génère en une soirée la bannière « candidatures ouvertes », le splash d’invitation et une couverture d’événement pour la soirée de lancement — trois visuels, un seul univers.",
        ],
      },
      {
        heading: "Les pièges classiques du format bannière",
        paragraphs: [
          "Le nom du serveur et les boutons Discord se superposent à la partie haute de la bannière : gardez cette zone visuellement calme et placez votre texte au centre ou en bas. Sur mobile, la bannière est affichée plus courte : vérifiez que l’élément essentiel survit au recadrage. Évitez le texte de moins de 28 pixels de haut, illisible sur téléphone, et les visuels surchargés qui se battent avec l’interface. Enfin, n’écrivez pas l’IP du serveur sur la bannière : elle change, votre image non.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
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
      "Le loading screen FiveM est un moment étrange : le joueur n’a rien d’autre à regarder pendant que les ressources se téléchargent, parfois plusieurs minutes lors de la première connexion. C’est votre meilleure fenêtre d’ambiance — et souvent la plus négligée, remplie d’une capture d’écran floue prise à la va-vite. Neva Design génère des visuels d’écran de chargement composés pour ce format : une scène qui pose votre univers, votre logo bien placé, des zones calmes pour l’interface. Vous décrivez l’ambiance (« ruelle sous la pluie, enseignes néon, voiture de police au loin »), vous itérez, vous exportez en 1920 × 1080 ou plus, jusqu’en 8K pour les écrans 4K. L’inscription est gratuite et sans carte bancaire ; une formule active permet de produire une petite série rotative dès ce soir.",
    ],
    examples: [
      { src: "/bglanding.webp", alt: "Écran d’attente de serveur FiveM", ratio: "wide" },
      { src: "/plage.webp", alt: "Décor plage Los Santos retravaillé", ratio: "wide" },
      { src: "/postergrandfivem2.webp", alt: "Visuel vertical de serveur RP", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack visuel de serveur", ratio: "video" },
    ],
    sections: [
      {
        heading: "Résolution, poids, format : les bons réglages",
        paragraphs: [
          "La base reste le 16:9 en 1920 × 1080, ce qu’affichent la majorité des joueurs. Si votre communauté compte des écrans 1440p ou 4K, exportez plus grand — la génération jusqu’en 8K évite l’effet flou d’une image étirée. Côté poids, restez raisonnable : le loading screen est chargé par une ressource du serveur, et une image de 8 Mo ralentit précisément l’écran censé faire patienter. Un JPG de qualité 80-85 autour de 500 Ko à 1,5 Mo est un bon compromis entre netteté et affichage instantané. Gardez le PNG pour les éléments d’interface, pas pour le fond.",
        ],
      },
      {
        heading: "Une scène qui raconte votre serveur, pas une capture d’écran",
        paragraphs: [
          "Les meilleurs écrans de chargement fonctionnent comme des affiches de film : une scène forte, une lumière travaillée, le logo lisible. Exemples concrets générés pour des serveurs RP : un commissariat de nuit sous la pluie pour un serveur orienté forces de l’ordre, une avenue de bord de mer au coucher du soleil pour une ville détendue, un parking souterrain aux néons froids pour une ambiance streetlife. C’est plus fort que trois captures de MLO retouchées, et surtout c’est à vous. En complément, l’upscale Neva peut aussi remettre à niveau un visuel existant que vous aimez mais qui date.",
        ],
      },
      {
        heading: "Composer pour l’interface qui viendra par-dessus",
        paragraphs: [
          "Un loading screen n’est jamais affiché nu : barre de progression, pourcentage, parfois lecteur musical ou règles du serveur viennent se superposer. Laissez le tiers inférieur visuellement calme et évitez d’y placer un visage ou du texte important. Limitez le texte incrusté au strict minimum — nom du serveur, éventuellement le Discord — car personne ne lit dix règles pendant un chargement, et une règle qui change rend l’image obsolète. Enfin, générez une série de deux ou trois scènes cohérentes en rotation : la répétition lasse vite les habitués qui se connectent chaque jour.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
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
      "Commander ses visuels un par un, à des moments différents, parfois à des personnes différentes : voilà comment un serveur se retrouve avec un logo bleu, un loading screen orange et des affiches qui semblent venir d’une autre ville. Un pack graphique FiveM règle le problème à la racine : tous les supports partent de la même charte et sortent ensemble. Avec Neva Design, vous décrivez une seule fois votre univers — époque, ambiance, couleurs — puis vous déclinez logo, écran de chargement, bannières Discord et affiches dans la foulée, avec des itérations illimitées dans votre quota et des exports jusqu’en 8K. Les packs one-shot démarrent à 19 €, et l’inscription reste gratuite et sans carte bancaire pour découvrir le studio avant d’engager quoi que ce soit.",
    ],
    examples: [
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique serveur, vue d’ensemble", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Déclinaisons d’un pack serveur", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack GFX complet", ratio: "video" },
      { src: "/Prime_-_preview_serveur_pack_15.webp", alt: "Supports de communication d’un pack", ratio: "video" },
    ],
    sections: [
      {
        heading: "La charte d’abord, les supports ensuite",
        paragraphs: [
          "La bonne méthode ne commence pas par le logo : elle commence par la charte graphique. Deux ou trois couleurs, une typographie forte, une ambiance lumineuse — c’est ce socle que Neva génère en premier et auquel chaque visuel se réfère ensuite. Résultat : la bannière Discord et le loading screen se répondent naturellement au lieu de cohabiter. C’est exactement la différence entre les serveurs dont on reconnaît les affiches en une seconde et ceux dont chaque événement semble repartir de zéro.",
        ],
      },
      {
        heading: "Ce qu’un pack serveur contient concrètement",
        paragraphs: [
          "Un habillage complet de serveur RP couvre en général : le logo et ses déclinaisons (icône Discord, version horizontale, monochrome), un ou deux loading screens, la bannière et le splash d’invitation Discord, deux affiches d’événement (ouverture de la whitelist, soirée de lancement) et un visuel de recrutement staff. Côté tarifs, trois packs one-shot selon l’étendue : Pack identité à 19 € pour poser les bases, Pack lancement à 49 € pensé pour une ouverture de serveur, Pack marque à 79 € pour une identité déclinée en profondeur. L’abonnement Créateur (24 €/mois, 12 créations) reste l’option souple si vos besoins s’étalent.",
        ],
      },
      {
        heading: "Garder la cohérence dans la durée",
        paragraphs: [
          "Un pack réussi se juge trois mois plus tard. Trois habitudes à prendre : conserver la description de votre charte et la réutiliser mot pour mot à chaque nouveau visuel ; garder le logo au même emplacement et à la même taille relative sur toutes les affiches ; résister à l’envie de changer de style à chaque événement — on varie la scène, jamais les fondations. Nommez aussi vos fichiers proprement (support, format, version) : quand le staff cherche « la bannière de Noël » dans six mois, tout le monde gagne du temps.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
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
      "Un événement RP sans affiche, c’est un salon Discord qui s’emballe deux heures puis retombe. Une affiche serveur FiveM bien faite transforme une annonce texte en rendez-vous : elle circule sur le Discord, se partage sur X et TikTok, et donne à votre soirée casino ou à votre salon de l’auto l’allure d’un vrai événement de ville. Neva Design en génère en quelques minutes : vous décrivez la scène, l’IA compose l’affiche dans le style de votre serveur, vous ajustez le texte et l’ambiance, puis vous exportez aux formats de chaque réseau — jusqu’en 8K pour l’impression éventuelle. Les affiches GTA RP du portfolio /neva-design donnent une idée du rendu. L’inscription est gratuite et sans carte bancaire : votre prochain événement peut être affiché dès ce soir.",
    ],
    examples: [
      { src: "/affiche1.webp", alt: "Affiche de lancement de serveur", ratio: "portrait" },
      { src: "/affiche2.webp", alt: "Affiche d’événement RP", ratio: "portrait" },
      { src: "/affiche3.webp", alt: "Affiche d’identité de serveur", ratio: "portrait" },
      { src: "/posterlarya.webp", alt: "Campagne d’affichage Larya", ratio: "portrait" },
    ],
    sections: [
      {
        heading: "Une affiche par événement, un format par réseau",
        paragraphs: [
          "Le réflexe gagnant : générer l’affiche principale en 4:5 (1080 × 1350), le format le plus confortable dans les fils Instagram et X, puis décliner en 9:16 (1080 × 1920) pour les stories et TikTok, et en 16:9 pour la bannière d’événement Discord. Décrire le format dès la demande évite les recadrages qui coupent un personnage ou une date. Pour un événement hebdomadaire, gardez la même base et changez la scène : votre communauté reconnaît l’affiche avant même de lire le titre.",
        ],
      },
      {
        heading: "Des exemples qui parlent à toutes les villes",
        paragraphs: [
          "Ce que les serveurs annoncent le plus : ouverture ou réouverture de la whitelist, soirée d’inauguration d’un lieu (casino, boîte de nuit, restaurant tenu par des joueurs), course automobile scénarisée, salon de l’auto, élections municipales, recrutement des forces de l’ordre ou des EMS, marché de Noël. Chaque cas a ses codes : une affiche d’élection joue le sérieux institutionnel, une soirée néon assume la saturation. L’IA suit votre direction : « affiche d’élection municipale, style officiel années 2000, drapeau de la ville, palette bleu et or » produit tout autre chose qu’« affiche de course nocturne, néons, fumée, chrome ».",
        ],
      },
      {
        heading: "La hiérarchie qui fait venir du monde",
        paragraphs: [
          "Une affiche efficace répond en trois niveaux de lecture : quoi (le nom de l’événement, énorme), quand (date et heure, avec le fuseau si votre communauté est internationale), où (le nom du serveur et le Discord). Tout le reste est décoratif. Les erreurs qui coûtent des joueurs : une date en petit dans un coin, un paragraphe de lore que personne ne lit dans un fil, et l’oubli du rappel de publication — une affiche postée trois heures avant l’événement ne remplit pas une soirée. Publiez à J-3, rappelez à J-1 et le jour même.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
    ctaText: "Votre prochaine soirée mérite une vraie affiche, pas un message épinglé : composez-la maintenant et publiez à J-3.",
    ctaLabel: "Créer mon affiche",
    related: ["graphiste-fivem", "banniere-discord-fivem", "flyer-en-ligne"],
  },
  "miniature-youtube": {
    slug: "miniature-youtube",
    locale: "fr",
    title: "Miniature YouTube : des vignettes qui font cliquer",
    description: "Créez des miniatures YouTube lisibles sur mobile et cohérentes avec votre chaîne, en minutes. Export net 1280×720.",
    h1: "Miniature YouTube",
    kicker: "Solutions — Créateurs & marques",
    intro: [
      "À sujet égal, la miniature YouTube fait souvent la différence entre 2 % et 8 % de taux de clic — c’est elle qui vend la vidéo dans un fil saturé. Le problème : en produire une bonne par vidéo demande soit des heures de Photoshop, soit 30 à 80 € par vignette chez un graphiste. Neva Design propose une troisième voie : vous décrivez la scène (« réaction choquée devant un écran, texte ÉNORME ERREUR, fond rouge sombre »), l’IA compose une miniature au format 1280 × 720, et vous itérez jusqu’à la version qui claque. Vous gardez un style constant d’une vidéo à l’autre, vous produisez des variantes pour tester, et vous exportez en pleine netteté. L’inscription est gratuite et sans carte bancaire : de quoi découvrir l’outil avant de refaire les vignettes de vos prochaines vidéos.",
    ],
    examples: [
      { src: "/showcase/thumb-gtarp.webp", alt: "Miniature YouTube GTA RP", ratio: "video" },
      { src: "/showcase/thumb-esport.webp", alt: "Miniature YouTube esport", ratio: "video" },
      { src: "/showcase/thumb-invest.webp", alt: "Miniature YouTube finance", ratio: "video" },
      { src: "/showcase/thumb-pc.webp", alt: "Miniature YouTube test PC", ratio: "video" },
    ],
    sections: [
      {
        heading: "Décrire, générer, comparer : la boucle qui améliore le CTR",
        paragraphs: [
          "Le flux de travail tient en quatre temps : décrivez la miniature comme vous la voyez, générez une première version en quelques minutes, itérez sur ce qui cloche (texte trop discret, fond trop chargé, expression à changer), puis exportez en 1280 × 720 — le format recommandé par YouTube, en 16:9 et sous 2 Mo. La vitesse change la méthode : au lieu d’une seule vignette par vidéo, vous en produisez deux ou trois variantes et vous les départagez avec l’outil de test de miniatures de YouTube, qui mesure quelle version génère le plus de vues.",
        ],
      },
      {
        heading: "Pensez d’abord au téléphone, pas à votre écran",
        paragraphs: [
          "Plus de 70 % des vues YouTube se font sur mobile, où votre miniature mesure environ 160 pixels de large. Les règles qui en découlent : cinq mots de texte maximum, en gros et très contrasté ; un seul sujet par image — un visage expressif ou un objet fort, pas les deux plus un logo ; des couleurs qui tranchent avec le blanc et le noir de l’interface YouTube. Faites le test impitoyable : réduisez la vignette à la taille d’un timbre. Si le message survit, elle est bonne. Si vous devez plisser les yeux, simplifiez.",
        ],
      },
      {
        heading: "Un style de chaîne, pas des vignettes orphelines",
        paragraphs: [
          "Les chaînes qui grandissent se reconnaissent en un coup d’œil dans les suggestions : même palette, même typographie, même façon de cadrer. Définissez ce socle une fois — trois couleurs, une police, une position de texte — et réutilisez cette description à chaque génération. Pour les youtubeurs GTA RP et gaming, ce style peut s’aligner sur l’identité du serveur ou de l’équipe : mêmes néons, même ambiance que le loading screen et la bannière. La cohérence rassure l’abonné qui hésite entre trois vidéos, et c’est souvent lui qui fait votre huitième pour cent de CTR.",
        ],
      },
    ],
    comparison: [
      {
        criteria: "Prix d’une miniature",
        traditional: "30 à 80 €",
        neva: "environ 2 € en formule Créateur",
      },
      {
        criteria: "Délai",
        traditional: "1 à 3 jours",
        neva: "quelques minutes",
      },
      {
        criteria: "Variantes pour test A/B",
        traditional: "facturées à l’unité",
        neva: "deux ou trois versions dans le quota",
      },
      {
        criteria: "Vidéo publiée en urgence le soir même",
        traditional: "rarement possible",
        neva: "vignette prête avant la mise en ligne",
      },
      {
        criteria: "Photomontage complexe de votre visage exact",
        traditional: "un retoucheur humain reste plus précis",
        neva: "fournissez de bonnes photos ou passez par un pro",
      },
    ],
    comparisonNote: "Photomontage complexe de votre visage exact — un retoucheur humain reste plus précis — fournissez de bonnes photos ou passez par un pro",
    faq: [
      {
        q: "Combien de miniatures puis-je produire par mois ?",
        a: "La formule Créateur (24 €/mois) couvre 12 créations, soit une chaîne à trois vidéos par semaine si vous générez une vignette par vidéo — ou six vidéos avec deux variantes chacune. Au-delà, la formule Studio (25 créations à 59 €/mois) ou les recharges à 2,90 € prennent le relais.",
      },
      {
        q: "Mes miniatures respecteront-elles les règles de YouTube ?",
        a: "Les règles YouTube interdisent nudité, violence choquante et contenu trompeur. Le vrai piège est ailleurs : une vignette mensongère fait cliquer puis fait quitter, et cette rétention en chute ruine votre référencement. Promettez fort, mais promettez ce que la vidéo tient réellement.",
      },
      {
        q: "Le texte de la miniature est-il généré aussi ?",
        a: "Oui : vous indiquez les mots exacts dans votre description et l’IA les compose dans l’image, taille et placement inclus. Restez sous cinq mots, vérifiez l’orthographe avant export, et gardez le coin inférieur droit dégagé — c’est là que YouTube affiche la durée de la vidéo.",
      },
    ],
    ctaText: "Vos trois prochaines vidéos méritent des vignettes testées, pas devinées : générez-les et laissez les clics trancher.",
    ctaLabel: "Créer mes miniatures",
    related: ["generateur-de-logo", "flyer-en-ligne"],
    altLocaleSlug: "en/youtube-thumbnail-maker",
  },
  "generateur-de-logo": {
    slug: "generateur-de-logo",
    locale: "fr",
    title: "Générateur de logo : unique, décrit par vous, prêt vite",
    description: "Décrivez votre marque, l’IA compose un logo original et ses déclinaisons, exportés jusqu’en 8K.",
    h1: "Générateur de logo",
    kicker: "Solutions — Créateurs & marques",
    intro: [
      "La plupart des générateurs de logo font tous la même chose : un catalogue d’icônes génériques, votre nom posé à côté, et le sentiment tenace d’avoir déjà vu ce logo ailleurs — parce que c’est le cas. Neva Design prend le chemin inverse : pas de bibliothèque de gabarits, mais un générateur de logo piloté par votre description. Vous racontez votre marque — activité, ton, couleurs, références —, l’IA compose une proposition originale, et vous itérez en discutant avec le Creative Director jusqu’au bon résultat. Export final jusqu’en 8K, assez défini pour la carte de visite comme pour l’enseigne. Entrepreneurs, équipes esport, chaînes YouTube, boutiques en ligne : les logos livrés sont visibles sur /neva-design. L’inscription reste gratuite et sans carte bancaire.",
    ],
    examples: [
      { src: "/showcase/logo-kova.webp", alt: "Logo Kova, banque mobile", ratio: "video" },
      { src: "/showcase/logo-volt.webp", alt: "Logo Volt Esports", ratio: "video" },
      { src: "/showcase/logo-meridien.webp", alt: "Logo Méridien café", ratio: "video" },
      { src: "/neva-design/logos/ocen.webp", alt: "Emblème floral Ocen", ratio: "video" },
    ],
    sections: [
      {
        heading: "Décrire une marque plutôt que choisir dans un catalogue",
        paragraphs: [
          "La différence fondamentale tient au point de départ. Un configurateur à templates vous fait choisir parmi l’existant ; ici, vous partez d’une page blanche que votre description remplit : « torréfacteur artisanal, ton chaleureux mais moderne, brun et orange brûlé, clin d’œil au levant » ne ressemble à aucun gabarit. Première proposition en quelques minutes, puis itérations en langage naturel : alléger la typographie, tester une version emblème seul, passer la palette en sombre. Vous vous arrêtez quand c’est juste, pas quand le forfait de retours est épuisé.",
        ],
      },
      {
        heading: "De l’équipe esport au food-truck : cas concrets",
        paragraphs: [
          "Le même outil sert des besoins très différents. Une équipe esport génère un emblème agressif décliné en logo maillot et en badge réseaux. Une créatrice de bijoux compose un monogramme fin avec sa version tampon pour les emballages. Un food-truck part sur une mascotte et la retrouve sur le flyer et la devanture. Une chaîne YouTube cherche un lettrage qui reste lisible en avatar de 48 pixels. Dans chaque cas, les déclinaisons se génèrent dans la foulée : icône seule, version horizontale, monochrome pour les fonds difficiles — le Pack identité à 19 € couvre exactement ce périmètre.",
        ],
      },
      {
        heading: "Les règles d’un logo qui vieillit bien",
        paragraphs: [
          "Un bon logo est d’abord un logo simple : deux couleurs, une forme identifiable, zéro effet superflu. Testez-le en 32 pixels — la taille d’un favicon : s’il devient une tache, retirez des détails. Exigez une version monochrome convaincante ; c’est elle qui révèle si la forme tient sans ses couleurs. Méfiez-vous des effets à la mode (dégradés criards, chrome systématique) qui datent un logo en deux ans. Et vérifiez le contraste sur fond clair comme sur fond sombre : votre logo vivra sur des supports que vous ne contrôlez pas.",
        ],
      },
    ],
    comparison: [
      {
        criteria: "Prix d’un logo",
        traditional: "150 à 600 €",
        neva: "Pack identité 19 €, essai gratuit avant",
      },
      {
        criteria: "Délai",
        traditional: "5 à 10 jours",
        neva: "quelques minutes par piste",
      },
      {
        criteria: "Nombre de directions explorées",
        traditional: "2 à 3 concepts",
        neva: "autant que votre quota le permet",
      },
      {
        criteria: "Déclinaisons (icône, monochrome, fonds)",
        traditional: "souvent en option payante",
        neva: "générées dans la foulée",
      },
      {
        criteria: "Stratégie de marque complète, positionnement",
        traditional: "le designer humain apporte le conseil",
        neva: "l’outil exécute, il ne conseille pas votre marché",
      },
    ],
    comparisonNote: "Stratégie de marque complète, positionnement — le designer humain apporte le conseil — l’outil exécute, il ne conseille pas votre marché",
    faq: [
      {
        q: "Qu’est-ce qui distingue Neva d’un générateur à templates ?",
        a: "Les générateurs classiques assemblent des icônes de banque avec votre nom : rapide, mais partagé avec des milliers d’autres marques. Neva compose depuis votre description, sans catalogue sous-jacent. Le résultat dépend de votre brief, pas d’un stock — c’est plus proche d’un studio que d’un configurateur.",
      },
      {
        q: "Puis-je déposer le logo comme marque ?",
        a: "L’usage commercial du logo est inclus. Pour un dépôt (INPI, EUIPO), la démarche vous appartient : faites d’abord une recherche d’antériorité sur le signe et le nom, idéalement avec un conseil en propriété industrielle. C’est la même précaution qu’avec un logo dessiné par un graphiste.",
      },
      {
        q: "Dans quels formats est livré le logo ?",
        a: "En images haute résolution jusqu’en 8K, avec les déclinaisons que vous générez (icône, horizontale, monochrome). Cette définition couvre le web, les réseaux et l’impression grand format. Il ne s’agit pas de fichiers vectoriels : si votre imprimeur exige un tracé, un graphiste peut vectoriser l’export en une heure.",
      },
    ],
    ctaText: "Votre marque se décrit en trois phrases ; son logo peut exister dans dix minutes : commencez par les trois phrases.",
    ctaLabel: "Décrire mon logo",
    related: ["miniature-youtube", "logo-fivem", "flyer-en-ligne"],
  },
  "flyer-en-ligne": {
    slug: "flyer-en-ligne",
    locale: "fr",
    title: "Flyer en ligne : créez et imprimez sans logiciel",
    description: "Créez un flyer prêt à imprimer (A5, A4, 300 DPI) et ses versions réseaux en quelques minutes. Export jusqu’en 8K.",
    h1: "Flyer en ligne",
    kicker: "Solutions — Créateurs & marques",
    intro: [
      "Créer un flyer en ligne se termine trop souvent de deux façons : un gabarit vu partout, ou trois heures perdues dans un logiciel qu’on ne maîtrise pas — pour un résultat qui sent le modèle rempli. Neva Design fonctionne autrement : vous décrivez votre événement ou votre offre (« soirée d’ouverture d’un salon de thé, ambiance douce, vert sauge et crème, jeudi 12 mars »), l’IA compose un flyer original, et vous ajustez texte, couleurs et ambiance en itérant. L’export monte jusqu’en 8K : largement la définition nécessaire pour une impression nette en A5 ou A4 à 300 DPI, et de quoi décliner la version réseaux dans la foulée. Commerçants, associations, organisateurs de soirées : l’inscription est gratuite et sans carte bancaire pour découvrir l’outil avant de choisir une formule.",
    ],
    examples: [
      { src: "/affiche1.webp", alt: "Flyer événementiel grand format", ratio: "portrait" },
      { src: "/affiche3.webp", alt: "Affiche promotionnelle", ratio: "portrait" },
      { src: "/posterlarya.webp", alt: "Campagne d’affichage", ratio: "portrait" },
      { src: "/postergrandfivem.webp", alt: "Visuel de communication vertical", ratio: "portrait" },
    ],
    sections: [
      {
        heading: "Du brief à l’imprimeur : le circuit complet",
        paragraphs: [
          "Le parcours tient en une session : décrivez le flyer, générez, itérez jusqu’au bon équilibre, puis exportez en haute résolution. Pour l’impression, visez 300 DPI à la taille finale : un A5 demande environ 1750 × 2480 pixels, un A4 le double — l’export 8K couvre les deux avec de la marge. Prévoyez le fond perdu demandé par votre imprimeur (2 à 3 mm de visuel au-delà du format coupé) et gardez textes et logos à 5 mm minimum du bord. Un recto-verso compte simplement deux créations : le recto qui accroche, le verso qui informe.",
        ],
      },
      {
        heading: "Un flyer pour chaque usage, et sa version réseaux",
        paragraphs: [
          "Les cas les plus fréquents : soirée étudiante ou concert, ouverture de commerce, promotion saisonnière d’un salon ou d’un restaurant, vide-grenier associatif, tournoi gaming local. Chacun a son ton, et la description le pilote : un flyer de brocante ne partage rien avec une affichette de soirée techno. Pensez au double usage dès le départ : le même visuel se décline en 4:5 ou 9:16 pour Instagram et les stories, car un flyer distribué à 500 exemplaires touche moins de monde qu’un bon post partagé. Générer les deux versions dans la même session garantit qu’elles racontent la même chose.",
        ],
      },
      {
        heading: "Ce qui sépare un flyer lu d’un flyer jeté",
        paragraphs: [
          "Un passant accorde deux secondes à un flyer : l’offre doit se comprendre dans ce délai. Hiérarchisez sans pitié — le bénéfice en énorme, la date et le lieu lisibles à bout de bras, les détails en petit pour ceux qui sont déjà convaincus. Trois erreurs reviennent constamment : le pavé de texte qui noie l’information, les huit polices différentes, et l’absence d’action claire (venir, réserver, scanner). Laissez un emplacement propre pour un QR code si vous en ajoutez un, et relisez le texte à voix haute avant export : les coquilles s’impriment aussi bien que le reste.",
        ],
      },
    ],
    comparison: [
      {
        criteria: "Prix d’un flyer recto",
        traditional: "90 à 250 €",
        neva: "dès l’essai gratuit, puis 2,90 €/création",
      },
      {
        criteria: "Délai",
        traditional: "3 à 7 jours",
        neva: "quelques minutes, versions réseaux comprises",
      },
      {
        criteria: "Correction après relecture",
        traditional: "retour parfois facturé",
        neva: "régénération immédiate",
      },
      {
        criteria: "Déclinaison story et post",
        traditional: "souvent en supplément",
        neva: "dans la même session, même style",
      },
      {
        criteria: "Mise en page éditoriale dense (programme, menu complet)",
        traditional: "le maquettiste humain reste plus fin",
        neva: "privilégiez un pro pour les documents chargés",
      },
    ],
    comparisonNote: "Mise en page éditoriale dense (programme, menu complet) — le maquettiste humain reste plus fin — privilégiez un pro pour les documents chargés",
    faq: [
      {
        q: "Puis-je faire imprimer le fichier chez n’importe quel imprimeur ?",
        a: "Oui : exportez en haute résolution (300 DPI à la taille finale, fond perdu inclus) et transmettez le fichier. Les imprimeurs en ligne acceptent les images RVB et convertissent pour l’impression ; pour une couleur critique — un rouge de marque précis —, demandez un bon à tirer avant le tirage complet.",
      },
      {
        q: "Quels formats papier choisir ?",
        a: "L’A5 (148 × 210 mm) reste le standard de la distribution en main propre et des présentoirs. L’A6 réduit les coûts pour les gros volumes, l’A4 sert d’affichette vitrine. Générez au ratio du format final dès le départ : un visuel pensé en carré se recadre toujours mal en A5 vertical.",
      },
      {
        q: "Comment faire un recto-verso cohérent ?",
        a: "Générez le recto d’abord, puis demandez le verso en reprenant la même description de style : mêmes couleurs, même typographie, densité de texte plus élevée. Le recto attire, le verso détaille (programme, tarifs, plan d’accès). Deux créations suffisent, itérations comprises dans votre quota.",
      },
    ],
    ctaText: "Votre événement approche et l’imprimeur n’attend pas : composez le flyer maintenant, la version Instagram suivra dans la minute.",
    ctaLabel: "Créer mon flyer",
    related: ["miniature-youtube", "generateur-de-logo", "affiche-serveur-fivem"],
  },
  "en/fivem-graphic-designer": {
    slug: "en/fivem-graphic-designer",
    locale: "en",
    title: "FiveM Graphic Designer: Server Art in Minutes",
    description: "Get logos, loading screens and Discord banners for your FiveM server in minutes, not weeks. No credit card required to sign up.",
    h1: "FiveM Graphic Designer",
    kicker: "Solutions",
    intro: [
      "Every serious RP server eventually hits the same wall: you need a FiveM graphic designer, and the good ones are booked, the cheap ones disappear mid-project, and your launch date will not move. Neva Design works like an art department that answers instantly. You describe what your city needs — a crest for city hall, a loading screen that sets the mood, a Discord banner for allowlist applications — and the AI composes a publish-ready visual you can refine until it fits, then export at up to 8K. No design software, no back-and-forth emails spread over two weeks. The public portfolio at /neva-design shows real server packs, esports logos and GTA RP posters, so you can judge the output before spending anything. Signing up is free with no credit card, so you can explore the studio before choosing a plan.",
    ],
    examples: [
      { src: "/postergrandfivem2.webp", alt: "Affiche grand format pour serveur FiveM", ratio: "portrait" },
      { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Pack graphique complet de serveur RP", ratio: "video" },
      { src: "/affiche3.webp", alt: "Identité visuelle de serveur GTA RP", ratio: "portrait" },
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
    ],
    sections: [
      {
        heading: "How the workflow actually feels",
        paragraphs: [
          "You write a plain-language brief: the city’s era, the mood, two or three colors, anything you want echoed from servers you admire. A first proposal lands in minutes. Then you iterate by talking — \"darker sky\", \"thinner typeface\", \"drop the gold trim\" — through the conversational Creative Director, which behaves like an art director who never sleeps and never bills per revision. Iterations are unlimited within your plan’s quota, so exploring a second direction costs nothing but a sentence. When a visual is right, you export it at full resolution, up to 8K, ready for Discord, your community site or a trailer.",
        ],
      },
      {
        heading: "What RP communities actually ship with it",
        paragraphs: [
          "The typical launch list: a city crest or emblem scaled down to a Discord icon, one or two 1920 × 1080 loading screens that hold up while resources download, the server banner and invite splash, posters for the opening event and whitelist announcements, staff recruitment visuals, and thumbnails for the YouTube trailer. Established servers come back for seasonal art — a winter version of the loading screen, an election poster, a PD recruitment drive. Because everything derives from one brand kit, week twelve still looks like week one.",
        ],
      },
      {
        heading: "Getting results that read as professional",
        paragraphs: [
          "Three habits separate polished servers from improvised ones. First, test every logo at 128 pixels; if it dies as a Discord icon, simplify before you build anything on top of it. Second, lock one palette and reuse the exact brief wording for every new piece — drift happens one visual at a time. Third, keep live data out of the art: connect info, player counts and rule lists change weekly, and baked-in text ages your visuals fast. Put the mood in the image and the facts in your channels.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
    ctaText: "Your city has a story; its visuals should tell it before the first spawn. Describe it and see the first draft in minutes.",
    ctaLabel: "Sign up for free",
    related: ["en/fivem-logo-maker", "en/youtube-thumbnail-maker"],
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
      "Most logo tools give FiveM owners the same dead end: generic gaming templates that have nothing to do with roleplay, or a wolf-head mascot already used by forty other communities. Neva Design is a FiveM logo maker built around description instead of templates. You explain your city — its era, its energy, the story your server tells — and the AI composes an emblem that belongs to it: a municipal crest, a chrome wordmark, a mascot with actual character. You refine by chatting, not by re-opening a ticket, and export at up to 8K for anything from a Discord icon to printed merch. Real delivered logos sit in the portfolio at /neva-design if you want proof before starting. Signing up costs nothing and needs no credit card, so you can compare two directions before picking a plan.",
    ],
    examples: [
      { src: "/neva-design/logos/EFINAL.webp", alt: "Emblème esport E Final", ratio: "video" },
      { src: "/neva-design/logos/krlogo.webp", alt: "Monogramme chrome KR", ratio: "video" },
      { src: "/neva-design/logos/vulcainlogo.webp", alt: "Logo Vulcain, V ailé", ratio: "video" },
      { src: "/neva-design/logos/Xlogo.webp", alt: "Monogramme chrome X", ratio: "video" },
    ],
    sections: [
      {
        heading: "From server name to emblem in one session",
        paragraphs: [
          "Start with the sentence you would give a human designer: \"coastal city RP, 1990s mood, teal neon and chrome, palm silhouette, serious but not grim.\" The first proposal arrives in minutes. From there you iterate in plain words — swap the typeface, mute the palette, try a badge shape instead of a wordmark — until the emblem feels inevitable. Because revisions draw from your quota rather than an invoice, exploring a wrong turn costs nothing. Most owners land a final logo in a single evening, declensions included.",
        ],
      },
      {
        heading: "One city, a whole family of badges",
        paragraphs: [
          "A server logo rarely stays alone. Departments and factions want their own marks: police, EMS, the mechanic shop, the taxi company, player-run businesses. Generate the main crest first, then derive each sub-badge from the same brief so the whole city feels governed by one visual law. It is the difference between a roleplay world and a collage. The €19 identity pack covers a main logo with its declensions; larger faction families fit comfortably in the Creator plan’s 12 monthly creations.",
        ],
      },
      {
        heading: "What survives the server list",
        paragraphs: [
          "Your logo will mostly live small and on dark interfaces: the Discord sidebar, the server browser, a phone screen. Design for that reality. Favor a strong silhouette over fine detail; strokes thinner than 2 pixels vanish at icon size. Check the emblem on near-black backgrounds first, since that is where players meet it. Keep the name short in the mark itself — long city names belong next to the logo, not inside it. And always generate a light-background variant before you need one; partner announcements and documents will ask for it.",
        ],
      },
    ],
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
      },
    ],
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
      },
    ],
    ctaText: "Two directions, one evening, zero invoices — your city’s emblem is a description away.",
    ctaLabel: "Make my server logo",
    related: ["en/fivem-graphic-designer", "en/youtube-thumbnail-maker"],
    altLocaleSlug: "logo-fivem",
  },
  "en/youtube-thumbnail-maker": {
    slug: "en/youtube-thumbnail-maker",
    locale: "en",
    title: "YouTube Thumbnail Maker: Click-Worthy in Minutes",
    description: "Turn a one-line description into a sharp 1280x720 YouTube thumbnail. Iterate fast, keep a consistent style. No card needed to sign up.",
    h1: "YouTube Thumbnail Maker",
    kicker: "Solutions",
    intro: [
      "Thumbnails decide clicks before titles get a chance, yet most creators still choose between an hour in an editor per video and a template that looks like everyone else’s. A YouTube thumbnail maker should close that gap without flattening your style — that is the job Neva Design does. Describe the frame you imagine (\"stunned face lit by a monitor, bold text I WAS WRONG, deep red background\") and the AI composes a 1280 × 720 thumbnail you can push through variations in minutes. Gaming channels, GTA RP creators, tutorial makers and vloggers use it to ship a thumbnail per upload without burning editing time. Registration is free with no credit card required, so you can try the tool before picking a plan.",
    ],
    examples: [
      { src: "/showcase/thumb-gtarp.webp", alt: "Miniature YouTube GTA RP", ratio: "video" },
      { src: "/showcase/thumb-esport.webp", alt: "Miniature YouTube esport", ratio: "video" },
      { src: "/showcase/thumb-invest.webp", alt: "Miniature YouTube finance", ratio: "video" },
      { src: "/showcase/thumb-pc.webp", alt: "Miniature YouTube test PC", ratio: "video" },
    ],
    sections: [
      {
        heading: "Type the scene, then argue with it",
        paragraphs: [
          "The workflow is a conversation. Your first description produces a draft; then you push back — bigger text, calmer background, angrier expression, different color for the arrow — and each round takes under a minute. This speed changes strategy: instead of betting one thumbnail per video, generate two or three genuinely different takes and run them through YouTube’s Test & Compare, which serves each version to real viewers and keeps the winner. Export lands at 1280 × 720, the 16:9 size YouTube recommends, comfortably under the 2 MB upload limit.",
        ],
      },
      {
        heading: "Design for the browse feed, not your monitor",
        paragraphs: [
          "On a phone in the Home feed, your thumbnail is smaller than a postage stamp and competes with twenty others. The rules that follow are unforgiving: one subject, not a scene; four words of text at most, thick and high-contrast; colors that separate from both YouTube’s white and dark themes — teal, orange and yellow outperform muddy tones. Faces still carry clicks when the emotion is readable at a glance. Before publishing, zoom your draft out to 10%: if you cannot tell what it promises, neither can a viewer scrolling at speed.",
        ],
      },
      {
        heading: "Make the channel recognizable, not just the video",
        paragraphs: [
          "Channels grow when returning viewers spot them in Suggested without reading. Decide your constants once — a palette, one typeface, where your face or logo sits — and repeat that wording in every generation, changing only the subject. An RP creator can mirror their server’s neon identity; a finance channel might hold to two sober colors and huge numerals. Consistency compounds: each video teaches viewers what your next one looks like, and that recognition is worth more clicks over a year than any single masterpiece thumbnail.",
        ],
      },
    ],
    comparison: [
      {
        criteria: "Price per thumbnail",
        traditional: "€30–80",
        neva: "roughly €2 each on the Creator plan",
      },
      {
        criteria: "Turnaround",
        traditional: "1–3 days",
        neva: "minutes, including variants",
      },
      {
        criteria: "A/B variants for testing",
        traditional: "each billed",
        neva: "two or three takes within your quota",
      },
      {
        criteria: "Same-day upload emergencies",
        traditional: "rarely bookable",
        neva: "thumbnail ready before the render finishes",
      },
      {
        criteria: "Precise photo compositing of your exact face",
        traditional: "a human retoucher is still sharper",
        neva: "supply strong photos or hire a pro for those",
      },
    ],
    comparisonNote: "Precise photo compositing of your exact face — a human retoucher is still sharper — supply strong photos or hire a pro for those",
    faq: [
      {
        q: "How is this different from template thumbnail tools?",
        a: "Templates start from someone else’s layout; you swap text and hope. Neva starts from your sentence and composes an original image, so two channels never ship the same bones. The trade-off is honest: you must describe what you want — creators with a clear picture get the most out of it.",
      },
      {
        q: "Does it work for YouTube Shorts?",
        a: "Shorts mostly pull their preview from a video frame, so custom thumbnails matter far less there. Spend your creations on regular uploads, where thumbnails drive browse traffic. Vertical 9:16 art is still worth generating for community posts, channel banners or cross-posting announcements.",
      },
      {
        q: "What settings should my upload have?",
        a: "Stick to 1280 × 720 pixels, 16:9, JPG or PNG under 2 MB — exactly what the export gives you. Higher resolutions are fine but bring no ranking benefit; sharpness at small sizes comes from bold composition, not extra pixels. Keep the bottom-right corner clear for the duration stamp.",
      },
    ],
    ctaText: "Your next upload deserves three thumbnail candidates, not one guess made at 2 a.m. Describe the first now.",
    ctaLabel: "Make my thumbnail",
    related: ["en/fivem-graphic-designer", "en/fivem-logo-maker"],
    altLocaleSlug: "miniature-youtube",
  },
};

export const LANDING_SLUGS = Object.keys(LANDINGS);

export function getLanding(slug: string): Landing | undefined {
  return LANDINGS[slug];
}
