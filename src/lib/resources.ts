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

/* ── Les 3 packs de création (section 08, run 2) ─────────────────
   Des prestations assemblées par le studio — langage générique,
   aucun nom de plateforme dans les titres. Un paiement unique,
   le même flux Stripe que les ressources (401 → connexion). */
export const CREATION_PACKS: Record<string, ResourcePack> = {
  'pack-identite': {
    id: 'pack-identite',
    name: 'Pack Identité',
    price: 39,
    tagline: 'Identité visuelle',
    badge: null,
    description:
      'Le socle de votre image : un logo travaillé en trois directions, ses déclinaisons, et vos premiers supports.',
    features: [
      'Logo — 3 pistes créatives',
      'Déclinaisons de la piste retenue',
      '2 bannières réseaux',
      '1 affiche',
    ],
    // → Crée un produit Stripe (one-time 39 €) et mets le price_xxx ici
    priceId: process.env.STRIPE_PRICE_PACK_IDENTITE ?? '',
    downloadUrl: process.env.PACK_IDENTITE_DOWNLOAD_URL ?? '',
  },

  'pack-lancement': {
    id: 'pack-lancement',
    name: 'Pack Lancement',
    price: 89,
    tagline: 'Tout pour démarrer',
    badge: 'LE PLUS COMPLET',
    description:
      'L’identité complète et tous les supports du jour J : réseaux, écran d’attente, affichage.',
    features: [
      'Identité complète (logo + déclinaisons)',
      'Kit réseaux — 6 formats',
      'Écran d’attente',
      '4 affiches',
    ],
    // → Crée un produit Stripe (one-time 89 €) et mets le price_xxx ici
    priceId: process.env.STRIPE_PRICE_PACK_LANCEMENT ?? '',
    downloadUrl: process.env.PACK_LANCEMENT_DOWNLOAD_URL ?? '',
  },

  'pack-marque': {
    id: 'pack-marque',
    name: 'Pack Marque',
    price: 149,
    tagline: 'La marque entière',
    badge: null,
    description:
      'Le système complet : tout le Pack Lancement, la charte, les déclinaisons et des templates éditables à votre nom.',
    features: [
      'Tout le Pack Lancement',
      'Charte couleurs & typographies',
      '4 déclinaisons du logo',
      '8 templates éditables personnalisés',
    ],
    // → Crée un produit Stripe (one-time 149 €) et mets le price_xxx ici
    priceId: process.env.STRIPE_PRICE_PACK_MARQUE ?? '',
    downloadUrl: process.env.PACK_MARQUE_DOWNLOAD_URL ?? '',
  },
}

/* ── Ressources du studio — les outils Photoshop (prix inchangés,
   carte secondaire de la section 08) ───────────────────────────── */
export const RESOURCE_PACKS: Record<string, ResourcePack> = {
  'pack-brush': {
    id: 'pack-brush',
    name: 'Pack Brush',
    price: 30,
    tagline: 'Brushes Photoshop',
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
    badge: null,
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

/* Tous les achats one-shot passent par le même checkout */
export const ONE_SHOT_PACKS: Record<string, ResourcePack> = {
  ...CREATION_PACKS,
  ...RESOURCE_PACKS,
}

// Client-safe pack info (no priceId / downloadUrl)
export type ResourcePackPublic = Omit<ResourcePack, 'priceId' | 'downloadUrl'>

const toPublic = (packs: Record<string, ResourcePack>): Record<string, ResourcePackPublic> =>
  Object.fromEntries(
    Object.entries(packs).map(([k, { priceId: _p, downloadUrl: _d, ...rest }]) => [k, rest])
  )

export const CREATION_PACKS_PUBLIC: Record<string, ResourcePackPublic> = toPublic(CREATION_PACKS)
export const RESOURCE_PACKS_PUBLIC: Record<string, ResourcePackPublic> = toPublic(RESOURCE_PACKS)
