import { NextResponse, type NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000'
const ACCESS_COOKIE = 'neva_access_token'

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
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  )
}

function isAdminMaintenanceBypassed(pathname: string, allowAdminAccess?: boolean | null) {
  return allowAdminAccess === true && pathname.startsWith('/admin')
}

/* Pages qui ont besoin du backend pour exister (auth, dashboard, admin) —
   tout le reste est la vitrine publique (accueil, landings marketing,
   portfolio...) qui doit continuer à s'afficher même si le backend est
   injoignable. */
function isAppRoute(pathname: string) {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password'
  )
}

/* Le TTFB de CHAQUE page passe par ici : aucun aller-retour backend
   n'est toléré sur le chemin d'un visiteur anonyme (mesuré run 3).
   La présence du cookie de session suffit ici — la vraie validation
   du token a lieu à chaque appel backend authentifié ; ce n'est
   qu'un garde-fou de navigation, pas la couche d'autorisation. */

type MaintenanceRow = {
  enabled: boolean | null
  starts_at: string | null
  ends_at: string | null
  allow_admin_access: boolean | null
} | null

type MaintenanceCheck = { row: MaintenanceRow; backendDown: boolean }

/* micro-cache par instance : la bascule maintenance tolère 20 s de
   latence, pas le TTFB de chaque visiteur */
const MAINTENANCE_TTL_MS = 20_000
const MAINTENANCE_ERROR_TTL_MS = 5_000
let maintenanceCache: { at: number; ttl: number; result: MaintenanceCheck } | null = null

/* Backend indisponible ne doit jamais retenir une page : 1,5 s
   max par appel, puis on sert (fail-open sur la vitrine, fail-vers-
   maintenance sur l'app — voir isAppRoute). */
const fetchWithTimeout: typeof fetch = (input, init) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(1500) })

async function getMaintenanceStatus(): Promise<MaintenanceCheck> {
  const now = Date.now()
  if (maintenanceCache && now - maintenanceCache.at < maintenanceCache.ttl) {
    return maintenanceCache.result
  }

  let result: MaintenanceCheck
  try {
    const resp = await fetchWithTimeout(`${BACKEND_URL}/maintenance`)
    if (!resp.ok) {
      result = { row: null, backendDown: true }
    } else {
      const body = await resp.json()
      result = { row: body?.maintenance ?? null, backendDown: false }
    }
  } catch {
    result = { row: null, backendDown: true }
  }

  maintenanceCache = { at: now, ttl: result.backendDown ? MAINTENANCE_ERROR_TTL_MS : MAINTENANCE_TTL_MS, result }
  return result
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value)

  if (!isAlwaysMaintenanceBypassed(pathname)) {
    const { row: maintenance, backendDown } = await getMaintenanceStatus()

    if (backendDown) {
      // Le backend est injoignable : la vitrine publique continue de
      // s'afficher normalement, seules les pages qui en dépendent
      // basculent en maintenance.
      if (isAppRoute(pathname)) {
        return NextResponse.redirect(new URL('/maintenance', request.url))
      }
    } else if (maintenanceIsActive(maintenance) && !isAdminMaintenanceBypassed(pathname, maintenance?.allow_admin_access)) {
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (hasSession && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect /dashboard routes
  if (!hasSession && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect /admin routes — admin guard is enforced in the layout server component
  if (!hasSession && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|mjs|map|txt|xml|woff2?)$).*)'],
}
