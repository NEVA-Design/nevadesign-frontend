# Assets Neva Design

Depose les vrais visuels dans ces dossiers, puis renseigne les chemins dans `src/components/neva-design/NevaDesignPage.tsx`.

## Palmiers animes

Recommande:
- `public/neva-design/palms/palm-left.webp`
- `public/neva-design/palms/palm-right.webp`

Format ideal:
- PNG ou WebP avec fond transparent.
- Silhouette sombre deja decoupee.
- 800 a 1200 px de haut.
- Glow leger possible, mais la page ajoute deja un glow orange/rose.

Dans le code, remplace:

```ts
const palmAssets = {
  left: "",
  right: "",
};
```

par:

```ts
const palmAssets = {
  left: "/neva-design/palms/palm-left.webp",
  right: "/neva-design/palms/palm-right.webp",
};
```

## Logos clients

Chemins prevus:
- `public/neva-design/logos/vespucci.svg`
- `public/neva-design/logos/eclipse-rp.svg`
- `public/neva-design/logos/south-bay.svg`
- `public/neva-design/logos/mirage.svg`
- `public/neva-design/logos/northline.svg`
- `public/neva-design/logos/alta-street.svg`
- `public/neva-design/logos/harbor.svg`
- `public/neva-design/logos/pulse.svg`

Format ideal:
- SVG transparent si possible.
- Sinon PNG/WebP transparent, environ 300 x 120 px.

## Portfolio

Chemins prevus:
- `public/neva-design/portfolio/vespucci-nights-logo.webp`
- `public/neva-design/portfolio/sunset-roleplay-branding.webp`
- `public/neva-design/portfolio/metro-launch-landing.webp`
- `public/neva-design/portfolio/mirror-park-ads.webp`
- `public/neva-design/portfolio/harbor-riders-gfx.webp`
- `public/neva-design/portfolio/coral-club-branding.webp`
- `public/neva-design/portfolio/luxury-drop-poster.webp`
- `public/neva-design/portfolio/neon-interface-ui.webp`

Format ideal:
- WebP ou JPG optimise.
- Minimum 1200 px de large.
- Images verticales pour les cartes tall, images horizontales pour les landing pages.

## Services et packs

Chemins prevus:
- `public/neva-design/services/logo-design.webp`
- `public/neva-design/services/branding-complet.webp`
- `public/neva-design/services/affiches-bannieres.webp`
- `public/neva-design/services/ui-landing-pages.webp`
- `public/neva-design/packs/gfx-pack-preview.webp`
- `public/neva-design/packs/gfx-pack-01.webp`

Format ideal:
- WebP transparent ou JPG/WebP sombre.
- 1000 x 700 px pour les previews.
