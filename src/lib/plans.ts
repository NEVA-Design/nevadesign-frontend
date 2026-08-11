// Client-safe monetization constants.
// The database column is still named `credits`, but the product language is "creations".

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 5,
    priceId: null,
    description: 'Preview limitee pour tester le workflow',
    features: [
      '5 credits mensuels',
      'Previews basse resolution',
      'Watermark Neva',
      'Historique limite',
      'Usage non commercial',
    ],
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 19,
    credits: 100,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY ?? '',
    description: 'Pour owners et createurs qui publient chaque semaine',
    features: [
      '100 credits mensuels',
      'Exports HD sans watermark',
      'Bibliotheque et historique',
      'Usage commercial inclus',
      'Personnages sauvegardes',
    ],
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: 49,
    credits: 350,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY ?? '',
    description: 'Pour serveurs actifs, equipes et petits studios',
    features: [
      '350 credits mensuels',
      'Generations premium',
      'Exports 2K/4K',
      'Collections et projets',
      'Priorite de generation',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    credits: 900,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? '',
    description: 'Pour agences, studios et gros volumes',
    features: [
      '900 credits mensuels',
      'Neva Studio prioritaire',
      'Exports haute definition',
      'Gros uploads et multi-references',
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
  design_standard: '1 creation',
  design_premium: '3 creations',
  audit: '1 creation',
  audit_correction: '3 creations',
  enhance: '2 creations',
  character: '2 creations',
} as const
