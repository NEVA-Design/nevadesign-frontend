"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { backendFetch } from "@/lib/api/backend-client";

// Résout un `next` non fiable en chemin interne SÛR : on le parse contre
// l'origine courante et on n'accepte que si l'origine résultante est la même
// (bloque "//host", "/\host", "https://host", etc.).
function safeInternalPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return "/dashboard";
    return u.pathname + u.search + u.hash;
  } catch {
    return "/dashboard";
  }
}

/*
 * Retour d'authentification — atterrit ici après confirmation d'e-mail ou
 * après le flux OAuth Google. Supabase (via le backend) redirige directement
 * ici avec les tokens dans le fragment d'URL (#access_token=...) : ce n'est
 * jamais envoyé au serveur, donc cette page doit être un client component
 * qui lit window.location.hash au montage.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");
    const expiresIn = hash.get("expires_in");
    const hashError = hash.get("error_description") ?? hash.get("error");

    const search = new URLSearchParams(window.location.search);
    // Anti open-redirect : résoudre `next` contre l'origine courante et
    // n'accepter QUE si l'origine résultante est identique. Couvre les
    // contournements "//host", "/\host" (backslash normalisé par le
    // navigateur) et les URL absolues.
    const next = safeInternalPath(search.get("next"));

    if (hashError) {
      router.replace(`/login?error=auth_callback_failed&message=${encodeURIComponent(hashError)}`);
      return;
    }

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=auth_callback_failed&message=missing_tokens");
      return;
    }

    // FRONT-001 : on ne stocke plus les tokens en JS. On les remet au backend
    // qui les pose en cookies HttpOnly (et fait le contrôle de sécurité
    // signup). `expiresIn` est ignoré : le backend fixe lui-même le TTL du
    // cookie access.
    void expiresIn;
    backendFetch("/auth/oauth-complete", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    })
      .catch(() => {})
      .finally(() => {
        router.replace(next);
        router.refresh();
      });
  }, [router]);

  return (
    <main className="flex min-h-[100svh] items-center justify-center px-6 text-center text-sm text-slate">
      Connexion en cours…
    </main>
  );
}
