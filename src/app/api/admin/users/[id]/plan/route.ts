import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'

const VALID_PLANS = ['free', 'creator', 'studio', 'pro'] as const
type Plan = typeof VALID_PLANS[number]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id: userId } = await params
  const body = await request.json() as {
    plan?: string
    resetCredits?: boolean
    cancelSubscription?: boolean
  }

  const plan = body.plan as Plan
  if (!VALID_PLANS.includes(plan)) {
    return Response.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const service = await createServiceClient()

  // Verify user exists
  const { data: { user }, error: userErr } = await service.auth.admin.getUserById(userId)
  if (userErr || !user) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    plan,
    updated_at: new Date().toISOString(),
  }

  if (body.resetCredits) {
    updatePayload.credits = PLANS[plan].credits
  }

  if (body.cancelSubscription) {
    updatePayload.stripe_subscription_id = null
    updatePayload.subscription_status = null
  }

  const { data: updated, error: updateErr } = await service
    .from('profiles')
    .update(updatePayload)
    .eq('id', userId)
    .select('credits, plan')
    .single()

  if (updateErr) {
    console.error('[admin/plan] update error:', updateErr)
    return Response.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }

  // Log action
  await service.from('credit_transactions').insert({
    user_id: userId,
    amount: 0,
    type: 'admin_plan_change',
    description: `Admin (${admin.email}): plan changé en ${plan}${body.resetCredits ? ` · créations réinitialisées à ${PLANS[plan].credits}` : ''}${body.cancelSubscription ? ' · abonnement Stripe supprimé' : ''}`,
  })

  return Response.json({ plan: updated.plan, credits: updated.credits })
}
