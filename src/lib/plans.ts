// Client-safe monetization constants.
// The database column is still named `credits`, but the product language is "creations".

export const PLANS = {
  free: {
    id: 'free',
    name: 'Découverte',
    price: 0,
    credits: 5,
    priceId: null,
    description: 'Un aperçu complet de l’atelier, sans carte bancaire',
    features: [
      '5 créations mensuelles',
      'Prévisualisations basse résolution',
      'Filigrane Neva',
      'Historique limité',
      'Usage non commercial',
    ],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 19,
    credits: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY ?? '',
    description: 'Pour les fondateurs et créateurs qui publient chaque semaine',
    features: [
      '100 créations mensuelles',
      'Exports HD sans filigrane',
      'Bibliothèque et historique',
      'Usage commercial inclus',
      'Personnages sauvegardés',
    ],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 49,
    credits: 350,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY ?? '',
    description: 'Pour les serveurs actifs, les équipes et les petits studios',
    features: [
      '350 créations mensuelles',
      'Générations premium',
      'Exports 2K et 4K',
      'Collections et projets',
      'Priorité de génération',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Agence',
    price: 99,
    credits: 900,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
    description: 'Pour les agences, studios et gros volumes',
    features: [
      '900 créations mensuelles',
      'Neva Studio prioritaire',
      'Exports haute définition',
      'Imports volumineux et multi-références',
      'Support prioritaire',
    ],
  },
} as const

export const TOPUPS = [
  { id: 'topup_25', credits: 25, price: 6, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_500 ?? '' },
  { id: 'topup_75', credits: 75, price: 15, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_1500 ?? '' },
  { id: 'topup_200', credits: 200, price: 35, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_TOPUP_3000 ?? '' },
]

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
