import { getBootstrapAdminEmails, verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const service = await createServiceClient()
  const { data, error } = await service
    .from('admin_users')
    .select('id, email, is_active, created_at, created_by')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/admins] list error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  const bootstrapAdmins = getBootstrapAdminEmails().map(email => ({
    id: `env:${email}`,
    email,
    is_active: true,
    source: 'env' as const,
    created_at: null,
    created_by: null,
  }))

  const databaseAdmins = (data ?? []).map(item => ({
    ...item,
    source: 'database' as const,
  }))

  return Response.json({ admins: [...bootstrapAdmins, ...databaseAdmins] })
}

export async function POST(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as { email?: unknown }
  const email = normalizeEmail(body.email)
  if (!email) return Response.json({ error: 'Email invalide' }, { status: 400 })

  if (getBootstrapAdminEmails().includes(email)) {
    return Response.json({ error: 'Cet email est deja admin via ADMIN_EMAILS' }, { status: 409 })
  }

  const service = await createServiceClient()
  const { data, error } = await service
    .from('admin_users')
    .upsert(
      {
        email,
        is_active: true,
        created_by: admin.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('id, email, is_active, created_at, created_by')
    .single()

  if (error) {
    console.error('[admin/admins] create error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ admin: { ...data, source: 'database' as const } })
}
