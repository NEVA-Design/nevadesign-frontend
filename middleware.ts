import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function maintenanceIsActive(settings: { enabled?: boolean | null; starts_at?: string | null; ends_at?: string | null } | null) {
  if (!settings?.enabled) return false

  const now = Date.now()
  const starts = settings.starts_at ? new Date(settings.starts_at).getTime() : null
  const ends = settings.ends_at ? new Date(settings.ends_at).getTime() : null

  if (starts && starts > now) return false
  if (ends && ends < now) return false
  return true
}

function isAlwaysMaintenanceBypassed(pathname: string) {
  return (
    pathname === '/maintenance' ||
    pathname.startsWith('/admin/maintenance') ||
    pathname.startsWith('/api/admin/maintenance') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  )
}

function isAdminMaintenanceBypassed(pathname: string, allowAdminAccess?: boolean | null) {
  return allowAdminAccess === true && (pathname.startsWith('/admin') || pathname.startsWith('/api/admin'))
}

/* Le TTFB de CHAQUE page passe par ici : aucun aller-retour Supabase
   n'est toléré sur le chemin d'un visiteur anonyme (mesuré run 3 :
   getUser() + site_maintenance en séquence = tout le TTFB des pages
   publiques ; avec un Supabase injoignable, 7 s par page). */

type MaintenanceRow = {
  enabled: boolean | null
  starts_at: string | null
  ends_at: string | null
  allow_admin_access: boolean | null
} | null

/* micro-cache par instance : la bascule maintenance tolère 20 s de
   latence, pas le TTFB de chaque visiteur */
const MAINTENANCE_TTL_MS = 20_000
const MAINTENANCE_ERROR_TTL_MS = 5_000
let maintenanceCache: { at: number; ttl: number; row: MaintenanceRow } | null = null

/* Supabase indisponible ne doit jamais retenir une page : 1,5 s
   max par appel, puis on sert (fail-open — le gate maintenance et
   les redirections d'auth se rejouent à la requête suivante). */
const fetchWithTimeout: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(1500) })

function hasSupabaseSession(request: NextRequest) {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.value)
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next()
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  /* sans cookie sb-*, getUser() ferait un aller-retour réseau pour
     répondre null : on répond null nous-mêmes. Avec cookie, la
     validation est bornée à 2 s (gotrue retente en interne) : en
     mode dégradé on traite la requête en anonyme plutôt que de
     retenir la page. */
  let user: { id: string } | null = null
  if (hasSupabaseSession(request)) {
    try {
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('auth timeout')), 2000)),
      ])
      user = result.data.user
    } catch {
      user = null
    }
  }

  if (!isAlwaysMaintenanceBypassed(pathname)) {
    let maintenance: MaintenanceRow = null
    const now = Date.now()
    if (maintenanceCache && now - maintenanceCache.at < maintenanceCache.ttl) {
      maintenance = maintenanceCache.row
    } else {
      /* GET PostgREST direct : supabase-js retente en interne sur
         échec réseau (~7 s cumulés mesurés) — ici un seul essai,
         borné à 1,5 s, fail-open */
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const resp = await fetchWithTimeout(
          `${url}/rest/v1/site_maintenance?id=eq.global&select=enabled,starts_at,ends_at,allow_admin_access`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          }
        )
        const rows = resp.ok ? ((await resp.json()) as MaintenanceRow[]) : []
        maintenance = rows?.[0] ?? null
        maintenanceCache = { at: now, ttl: MAINTENANCE_TTL_MS, row: maintenance }
      } catch {
        maintenance = null
        maintenanceCache = { at: now, ttl: MAINTENANCE_ERROR_TTL_MS, row: null }
      }
    }

    if (maintenanceIsActive(maintenance) && !isAdminMaintenanceBypassed(pathname, maintenance?.allow_admin_access)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Maintenance en cours' }, { status: 503 })
      }

      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect /dashboard routes
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /admin routes — admin guard is enforced in the layout server component
  if (!user && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /api routes (except webhook which uses Stripe signature)
  if (!user && pathname.startsWith('/api/') && !pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|mjs|map|txt|xml|woff2?)$).*)'],
}
