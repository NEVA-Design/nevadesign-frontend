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

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!isAlwaysMaintenanceBypassed(pathname)) {
    const { data: maintenance } = await supabase
      .from('site_maintenance')
      .select('enabled, starts_at, ends_at, allow_admin_access')
      .eq('id', 'global')
      .maybeSingle()

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
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml)$).*)'],
}
