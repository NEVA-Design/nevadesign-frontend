import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceId, mode } = await request.json()

    if (!priceId || priceId.startsWith('price_REMPLACE') || priceId.startsWith('prod_')) {
      return NextResponse.json({
        error: 'Price ID invalide. Va dans Stripe → ton produit → copie le price_xxx sous "Pricing".',
      }, { status: 400 })
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
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
      metadata: { supabase_user_id: user.id },
      subscription_data: mode === 'subscription' ? {
        metadata: { supabase_user_id: user.id },
      } : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const e = err as { message?: string; statusCode?: number }
    console.error('[/api/stripe/checkout]', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Stripe error' }, { status: 500 })
  }
}
