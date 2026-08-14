"use client";

// Auth session storage — plain cookies written by client-side JS, no
// Supabase client involved. Readable both by the browser (to attach the
// Authorization header) and by Next.js server components (via next/headers
// cookies(), since they're sent on every request to this origin).

const ACCESS_COOKIE = "neva_access_token";
const REFRESH_COOKIE = "neva_refresh_token";
const DEFAULT_ACCESS_TTL = 3600; // seconds — Supabase's default access token lifetime
const REFRESH_TTL = 60 * 60 * 24 * 30; // 30 days

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export type SessionTokens = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
};

export function storeSession(session: SessionTokens) {
  setCookie(ACCESS_COOKIE, session.access_token, session.expires_in ?? DEFAULT_ACCESS_TTL);
  setCookie(REFRESH_COOKIE, session.refresh_token, REFRESH_TTL);
}

export function clearSession() {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}

export function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  return getCookie(ACCESS_COOKIE);
}

export function getRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  return getCookie(REFRESH_COOKIE);
}

export const SESSION_COOKIE_NAMES = { ACCESS_COOKIE, REFRESH_COOKIE };
