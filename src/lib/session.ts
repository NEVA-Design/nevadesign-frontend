"use client";

// Session auth — les tokens vivent désormais dans des cookies HttpOnly posés
// et lus par le backend (FRONT-001). Le JS du navigateur n'y a PLUS accès :
// un XSS ne peut plus voler la session (ni access, ni refresh). Il ne reste
// ici que le nettoyage best-effort d'éventuels cookies legacy non-httpOnly
// (versions antérieures qui écrivaient les tokens en JS) ; la vraie
// déconnexion est déclenchée côté serveur (POST /auth/logout).

const LEGACY_COOKIES = ["neva_access_token", "neva_refresh_token"];

// Efface toute trace legacy encore lisible en JS. Les cookies HttpOnly, eux,
// ne peuvent être révoqués QUE par le backend (/auth/logout).
export function clearLegacyCookies() {
  if (typeof document === "undefined") return;
  for (const name of LEGACY_COOKIES) {
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}
