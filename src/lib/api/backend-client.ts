"use client";

// Le backend Elysia (nevadesign-backend) vit sur sa propre origine. La session
// voyage en cookies HttpOnly (`credentials: 'include'`) — le JS ne lit ni ne
// pose jamais de token (FRONT-001). Sur 401, on tente un refresh silencieux :
// le backend lit le refresh cookie et repose les cookies de session.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        return res.ok;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

function withDefaults(init: RequestInit): RequestInit {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // credentials:'include' — indispensable pour ENVOYER et STOCKER les cookies
  // de session cross-origin (front → API).
  return { ...init, headers, credentials: "include" };
}

/**
 * Drop-in replacement pour `fetch()` contre le backend : joint automatiquement
 * les cookies de session, et retente une fois après un refresh silencieux si
 * le token avait expiré (401).
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${BACKEND_URL}${path}`, withDefaults(init));

  if (res.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return fetch(`${BACKEND_URL}${path}`, withDefaults(init));
    }
  }

  return res;
}
