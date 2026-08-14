import { cookies } from "next/headers";

// Server-side counterpart of backend-client.ts — for server components and
// route handlers, which read the session from the request's cookies
// instead of the browser. No Supabase client involved on either side.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("neva_access_token")?.value ?? null;
}

export async function backendFetchServer(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getServerToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${BACKEND_URL}${path}`, { ...init, headers, cache: "no-store" });
}

/** Convenience: fetch + parse JSON, or null on any non-OK response. */
export async function backendGetJson<T>(path: string): Promise<T | null> {
  try {
    const res = await backendFetchServer(path);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
