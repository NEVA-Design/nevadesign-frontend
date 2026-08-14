"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storeSession } from "@/lib/session";
import { backendFetch } from "@/lib/api/backend-client";

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
    const next = search.get("next") ?? "/dashboard";

    if (hashError) {
      router.replace(`/login?error=auth_callback_failed&message=${encodeURIComponent(hashError)}`);
      return;
    }

    if (!accessToken || !refreshToken) {
      router.replace("/login?error=auth_callback_failed&message=missing_tokens");
      return;
    }

    storeSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn ? Number(expiresIn) : undefined,
    });

    backendFetch("/auth/oauth-complete", { method: "POST" })
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
