import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id: userId } = await params
  const body = await request.json() as {
    action: 'add' | 'set' | 'reset'
    amount?: number
  }

  if (!['add', 'set', 'reset'].includes(body.action)) {
    return Response.json({ error: 'Action invalide' }, { status: 400 })
  }

  const service = await createServiceClient()

  // Get current profile
  const { data: profile, error: profileErr } = await service
    .from('profiles')
    .select('credits, plan')
    .eq('id', userId)
    .single()

  if (profileErr || !profile) return Response.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  let newCredits: number
  let logDescription: string

  if (body.action === 'add') {
    const amount = Number(body.amount)
    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return Response.json({ error: 'Montant invalide' }, { status: 400 })
    }
    newCredits = profile.credits + amount
    logDescription = `Admin (${admin.email}): +${amount} créations ajoutées (ancien: ${profile.credits} → nouveau: ${newCredits})`
  } else if (body.action === 'set') {
    const amount = Number(body.amount)
    if (amount === undefined || amount < 0 || !Number.isInteger(amount)) {
      return Response.json({ error: 'Montant invalide' }, { status: 400 })
    }
    newCredits = amount
    logDescription = `Admin (${admin.email}): créations définies à ${newCredits} (ancien: ${profile.credits})`
  } else {
    // reset to plan default
    const plan = profile.plan as keyof typeof PLANS
    newCredits = PLANS[plan as keyof typeof PLANS]?.credits ?? PLANS.free.credits
    logDescription = `Admin (${admin.email}): créations réinitialisées au plan ${plan} (${newCredits})`
  }

  const { data: updated, error: updateErr } = await service
    .from('profiles')
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('credits')
    .single()

  if (updateErr) {
    console.error('[admin/credits] update error:', updateErr)
    return Response.json({ error: 'Erreur mise à jour' }, { status: 500 })
  }

  // Log in credit_transactions
  await service.from('credit_transactions').insert({
    user_id: userId,
    amount: newCredits - profile.credits,
    type: `admin_credits_${body.action}`,
    description: logDescription,
  })

  return Response.json({ credits: updated.credits })
}
