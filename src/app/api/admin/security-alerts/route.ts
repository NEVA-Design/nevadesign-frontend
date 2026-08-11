import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const service = await createServiceClient()

  let query = service
    .from('signup_security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query

  if (error) {
    console.error('[admin/security-alerts] list error:', error)
    return Response.json({ error: 'Erreur chargement alertes' }, { status: 500 })
  }

  return Response.json({ alerts: data ?? [] })
}
