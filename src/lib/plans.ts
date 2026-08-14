// Client-safe monetization constants.
// The database column is still named `credits`, but the product language is "creations".
// Grille run 2 (14/08/2026) — décision business client :
// Découverte 3 créations à l'inscription (one-shot), Creator 24 €/12,
// Studio 59 €/25, Agence 129 €/45 ; recharges 10/30/100 à 2,90 €/création.

export const PLANS = {
  free: {
    id: 'free',
    name: 'Découverte',
    price: 0,
    credits: 3,
    priceId: null,
    description: 'Un aperçu complet de l’atelier, sans carte bancaire',
    features: [
      '3 créations à l’inscription',
      'Prévisualisations filigranées',
      'Historique limité',
      'Usage non commercial',
    ],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 24,
    credits: 12,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY ?? '',
    description: 'Pour les fondateurs et créateurs qui publient chaque semaine',
    features: [
      '12 créations par mois',
      'Exports HD sans filigrane',
      'Usage commercial inclus',
      'Bibliothèque et historique',
      'Personnages sauvegardés',
    ],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 59,
    credits: 25,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY ?? '',
    description: 'Pour les équipes et les studios qui livrent chaque semaine',
    features: [
      '25 créations par mois',
      'Exports 2K et 4K',
      'Priorité de génération',
      'Collections et projets',
      'Générations premium',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Agence',
    price: 129,
    credits: 45,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
    description: 'Pour les agences, les marques multiples et les gros volumes',
    features: [
      '45 créations par mois',
      'Exports jusqu’en 8K',
      'Multi-marques et sièges',
      'Neva Studio prioritaire',
      'Support prioritaire',
    ],
  },
} as const

/* Recharges à 2,90 € la création — nouveaux produits Stripe :
   créer les prix one-time et renseigner les env TOPUP_10/30/100
   (les anciens TOPUP_500/1500/3000 à 6/15/35 € sont RETIRÉS — des
   noms neufs pour qu'aucun ancien price ID ne puisse être facturé
   par erreur). */
export const TOPUPS = [
  { id: 'topup_10', credits: 10, price: 29, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_10 ?? '' },
  { id: 'topup_30', credits: 30, price: 87, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_30 ?? '' },
  { id: 'topup_100', credits: 100, price: 290, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_100 ?? '' },
]

/* Règles affichées avec chaque grille tarifaire (home + billing) */
export const CREATION_RULES = {
  retouches: '5 retouches incluses par création — au-delà, 1 création',
  report: 'Report des créations non utilisées : 1 mois',
} as const

export const CREDIT_COSTS = {
  chat: 0,
  image_generation: 1,
} as const

export const CREATION_COST_LABELS = {
  design_standard: '1 création',
  design_premium: '3 créations',
  audit: '1 création',
  audit_correction: '3 créations',
  enhance: '2 créations',
  character: '2 créations',
} as const
