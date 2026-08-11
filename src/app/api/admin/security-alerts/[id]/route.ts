import { verifyAdmin } from '@/lib/admin'
import { approveSignupCredits } from '@/lib/signup-security'
import { createServiceClient } from '@/lib/supabase/server'

type Action = 'approve' | 'reject' | 'safe' | 'abuse'

function isAction(value: unknown): value is Action {
  return value === 'approve' || value === 'reject' || value === 'safe' || value === 'abuse'
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await context.params
  const body = await request.json().catch(() => null) as { action?: unknown } | null
  if (!isAction(body?.action)) {
    return Response.json({ error: 'Action invalide' }, { status: 400 })
  }

  const service = await createServiceClient()
  const { data: alert, error: findError } = await service
    .from('signup_security_events')
    .select('*')
    .eq('id', id)
    .single()

  if (findError || !alert) {
    return Response.json({ error: 'Alerte introuvable' }, { status: 404 })
  }

  const shouldGrant = body.action === 'approve' || body.action === 'safe'
  if (shouldGrant) {
    try {
      await approveSignupCredits(service, alert.user_id, admin.email)
    } catch (error) {
      console.error('[admin/security-alerts] grant error:', error)
      return Response.json({ error: 'Erreur attribution credits' }, { status: 500 })
    }
  }

  const nextStatus =
    body.action === 'approve'
      ? 'approved_by_admin'
      : body.action === 'safe'
      ? 'allowed'
      : 'rejected_by_admin'

  const { data, error } = await service
    .from('signup_security_events')
    .update({
      status: nextStatus,
      reviewed_by: admin.email,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    console.error('[admin/security-alerts] update error:', error)
    return Response.json({ error: 'Erreur mise a jour alerte' }, { status: 500 })
  }

  return Response.json({ alert: data })
}
