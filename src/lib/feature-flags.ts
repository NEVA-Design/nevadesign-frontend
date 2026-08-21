// Interrupteurs de la grande MAJ « pivot studio + Neva Generative » (20/08).
// Aucun code des features désactivées n'est supprimé : tout reste derrière ces flags.

// Les outils de création (wizards projets, modules Design/Chat/Enhance/Character/Audit)
// sont visibles mais inactifs (« À venir ») tant que ce flag est vrai. Leurs routes
// directes redirigent vers la section Neva Generative de la home (src/proxy.ts).
export const COMING_SOON = true;

// L'ancienne grille (Découverte/Creator/Studio/Agence + packs one-time) reste dans le
// code (GivrePricing, GivrePacks, billing, JSON-LD) mais n'est plus affichée : elle est
// remplacée par les 2 formules Neva Generative. Repasser à true pour la restaurer.
export const LEGACY_PRICING = false;

// Décision opérateur 21/08 : la catégorie « Bannières IA » est masquée et
// affichée « Très prochainement » — Formule 02 de la home (bibliothèque de
// modèles + carte tarifaire), formats bannière/affiche du hub projet, et
// route directe du wizard scène. Rien n'est supprimé : repasser à false
// pour tout rouvrir.
export const BANNIERES_IA_SOON = true;
