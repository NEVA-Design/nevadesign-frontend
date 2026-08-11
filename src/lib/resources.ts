// Server-safe — price IDs never exposed to client (no NEXT_PUBLIC_ prefix)

export interface ResourcePack {
  id: string
  name: string
  price: number
  tagline: string
  description: string
  badge: string | null
  features: string[]
  // Server-only: set these env vars in Vercel / .env.local
  priceId: string
  downloadUrl: string
}

export const RESOURCE_PACKS: Record<string, ResourcePack> = {
  'pack-brush': {
    id: 'pack-brush',
    name: 'Pack Brush',
    price: 30,
    tagline: 'Photoshop FiveM',
    badge: null,
    description: 'Brushes premium spécialement designés pour la création FiveM — grain cinématique, smoke, dust, rim-light, textures urbaines.',
    features: [
      '200+ brushes Photoshop premium',
      'Grain cinématique Los Santos',
      'Smoke, dust & haze atmosphérique',
      'Rim-light & séparation sujet',
      'Textures urbaines & asphalte',
      'Accès aux mises à jour',
    ],
    // → Crée un produit dans Stripe Dashboard (one-time 30€) et mets le price_xxx ici
    priceId: process.env.STRIPE_PRICE_PACK_BRUSH ?? '',
    // → Upload le fichier dans Supabase Storage ou Dropbox et mets l'URL ici
    downloadUrl: process.env.PACK_BRUSH_DOWNLOAD_URL ?? '',
  },

  'neva-pack': {
    id: 'neva-pack',
    name: 'Neva Pack',
    price: 90,
    tagline: 'Pack GFX complet',
    badge: 'BEST VALUE',
    description: 'Le pack créateur complet — brushes, templates PSD, overlays, palettes certifiées, guides et support Discord.',
    features: [
      'Tout le Pack Brush (200+ brushes)',
      '20+ templates Photoshop (.PSD)',
      'Overlays & effets FiveM prêts',
      '10 chartes couleurs certifiées',
      'Guides PDF composition & design',
      'Pack polices recommandées',
      'Support Discord créateurs',
      'Toutes les mises à jour futures',
    ],
    // → Crée un produit dans Stripe Dashboard (one-time 90€) et mets le price_xxx ici
    priceId: process.env.STRIPE_PRICE_NEVA_PACK ?? '',
    // → Upload le fichier dans Supabase Storage ou Dropbox et mets l'URL ici
    downloadUrl: process.env.NEVA_PACK_DOWNLOAD_URL ?? '',
  },
}

// Client-safe pack info (no priceId / downloadUrl)
export type ResourcePackPublic = Omit<ResourcePack, 'priceId' | 'downloadUrl'>

export const RESOURCE_PACKS_PUBLIC: Record<string, ResourcePackPublic> = Object.fromEntries(
  Object.entries(RESOURCE_PACKS).map(([k, { priceId: _p, downloadUrl: _d, ...rest }]) => [k, rest])
)
