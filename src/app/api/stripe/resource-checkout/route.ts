import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { RESOURCE_PACKS } from '@/lib/resources'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { packId } = await request.json() as { packId?: string }
    if (!packId) return NextResponse.json({ error: 'packId required' }, { status: 400 })

    const pack = RESOURCE_PACKS[packId]
    if (!pack) return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 })

    if (!pack.priceId || pack.priceId.startsWith('price_') === false) {
      return NextResponse.json(
        { error: `Price ID non configuré pour "${pack.name}". Ajoute STRIPE_PRICE_${packId.toUpperCase().replace(/-/g, '_')} dans tes variables d'environnement.` },
        { status: 400 }
      )
    }

    // Check already purchased
    const { data: existing } = await supabase
      .from('resource_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', packId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ alreadyOwned: true, redirect: '/dashboard/downloads' })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    const stripe = getStripe()

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/downloads?success=${packId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#resources`,
      metadata: {
        supabase_user_id: user.id,
        type: 'resource',
        resource_id: packId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const e = err as { message?: string }
    console.error('[/api/stripe/resource-checkout]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Stripe error' }, { status: 500 })
  }
}
