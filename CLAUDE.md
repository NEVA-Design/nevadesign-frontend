@AGENTS.md

# Captures du site — obligatoire à chaque passe visuelle

Après TOUTE modification qui touche à l'affichage (styles, composants, pages, textes visibles), refaire le jeu complet de captures de tout le site et l'archiver dans `../captures/site/` (racine « Neva AI project », hors repo git). Sans ce jeu de captures à jour, une passe visuelle n'est pas terminée.

## Convention

- Un fichier par écran et par largeur : `<écran>-1440.png` et `<écran>-390.png`.
- Viewports : 1440×900 (desktop) et 390×844 (mobile). Capture **pleine page** (`fullPage: true`).
- On écrase les fichiers précédents (noms stables → diff visuel facile entre deux passes).

## Protocole (Playwright MCP)

1. Serveur dev en marche (`npm run dev` — souvent déjà lancé, port indiqué par le message « Another next dev server is already running », ex. :3007).
2. Pour chaque écran : naviguer → attendre ~2,5 s (timelines GSAP au chargement) → auto-scroller jusqu'en bas par paliers (déclenche les reveals `once: true` et les images lazy) → remonter en haut → masquer l'overlay dev (`document.querySelector('nextjs-portal').style.display='none'`) → `browser_take_screenshot` avec `fullPage: true`.
3. Refaire la même liste après `browser_resize` en 390×844.

## Liste des écrans

Pages publiques (URL directes) :

| Écran | URL |
|---|---|
| `home` | `/` |
| `home-en` | `/` puis clic sur le bouton EN du sélecteur de langue (1440 seulement suffit) |
| `vitrine` | `/neva-design` |
| `login` | `/login` |
| `signup` | `/signup` |
| `maintenance` | `/maintenance` |

Produit et admin **sans base de données** via `/dev-preview?screen=<nom>` (mocks intégrés, `NODE_ENV=development` uniquement) :

- Dashboard : `design`, `chat`, `enhance`, `character`, `audit`, `downloads`, `settings`, `billing`, `brand`, `code`, `landing-module`, `prompt`
- Admin : `admin-users`, `admin-admins`, `admin-announcements`, `admin-maintenance`, `admin-newsletter`, `admin-portfolio`, `admin-security`

**Depuis le run 5, le vrai produit se capture en entier** : lancer le backend
avec `DEV_LOCAL_MODE=1` (voir `nevadesign-backend/.env`), se connecter sur
`/login` avec n'importe quels identifiants, et TOUTES les pages à données
réelles fonctionnent (Supabase émulé sur `data/dev-store.json`). Écrans du
moteur projets à couvrir : `projets-vue` et `projets-vide` (`/dashboard`),
`projet-page` (`/dashboard/projects/[id]`), `projet-hub-creation`
(`…/create`), `wizard-projet-*` (`/dashboard/projects/new`, 3 écrans),
`wizard-logo-*` (`…/create/logo`, 4 écrans), `wizard-scene-*`
(`…/create/banniere_discord`, 3 écrans), `editeur` (+ `editeur-selection`,
`editeur-effets`, `editeur-export`) sur `…/assets/[assetId]`.

## Auto-critique

Avant de livrer, comparer les captures aux images de référence du dossier `ref/` (la matière Givre : verre dépoli, rubans chromés, lumière glacée) et à la charte `docs/GIVRE.md`. Références de calibrage complémentaires : `../captures/calibrage/` (Linear, Stripe, Vercel, Raycast, Framer). Si un écran fait pâle figure, on corrige avant de montrer.
