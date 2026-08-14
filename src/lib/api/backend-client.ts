"use client";

import { clearSession, getAccessToken, getRefreshToken, storeSession } from "@/lib/session";

// The Elysia backend (nevadesign-backend) lives on its own origin now that
// front and back are split — no more same-origin Next.js API routes, and
// the front never talks to Supabase directly: only this backend does.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) {
          clearSession();
          return false;
        }
        const data = await res.json();
        if (!data.session) {
          clearSession();
          return false;
        }
        storeSession(data.session);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

function withAuthHeaders(init: RequestInit): RequestInit {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return { ...init, headers };
}

/**
 * Drop-in replacement for `fetch()` against the backend: attaches the
 * current session as a Bearer token from cookies, and silently refreshes
 * once and retries if the token turned out to be expired (401).
 */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${BACKEND_URL}${path}`, withAuthHeaders(init));

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return fetch(`${BACKEND_URL}${path}`, withAuthHeaders(init));
    }
  }

  return res;
}
