import { NextResponse } from 'next/server'
import { getStripe, PLANS, TOPUPS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

type PaidPlan = Extract<(typeof PLANS)[keyof typeof PLANS], { priceId: string }>

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

function getPlanByPriceId(priceId: string | null | undefined) {
  if (!priceId) return null
  const plan = Object.values(PLANS).find(p => p.priceId === priceId)
  return plan && plan.id !== 'free' ? plan as PaidPlan : null
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const direct = (invoice as { subscription?: string | Stripe.Subscription | null }).subscription
  if (typeof direct === 'string') return direct
  if (direct?.id) return direct.id

  const parent = invoice.parent
  if (parent?.type === 'subscription_details') {
    const subscription = parent.subscription_details?.subscription
    if (typeof subscription === 'string') return subscription
    if (subscription?.id) return subscription.id
  }

  const lineSubscription = invoice.lines?.data
    .map(line => line.subscription)
    .find(Boolean)

  if (typeof lineSubscription === 'string') return lineSubscription
  return lineSubscription?.id
}

async function addCreditsAndUpdatePlan(
  userId: string,
  credits: number,
  plan: string | null,
  type: string,
  description: string,
  subscriptionId?: string,
  subscriptionStatus?: string,
  skipIfSubscriptionAlreadyActive = false
) {
  const supabase = getServiceClient()

  if (skipIfSubscriptionAlreadyActive && subscriptionId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_subscription_id, plan')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('[stripe/webhook] profile lookup error:', profileError)
      throw profileError
    }

    if (plan && profile?.stripe_subscription_id === subscriptionId && profile.plan === plan) {
      return
    }
  }

  const { error: creditError } = await supabase.rpc('increment_credits', {
    user_id: userId,
    amount: credits,
  })

  if (creditError) {
    console.error('[stripe/webhook] increment credits error:', creditError)
    throw creditError
  }

  const { error: profileUpdateError } = await supabase
    .from('profiles')
    .update({
      ...(plan ? { plan } : {}),
      ...(subscriptionId ? { stripe_subscription_id: subscriptionId } : {}),
      ...(subscriptionStatus ? { subscription_status: subscriptionStatus } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (profileUpdateError) {
    console.error('[stripe/webhook] profile update error:', profileUpdateError)
    throw profileUpdateError
  }

  const { error: transactionError } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: credits,
    type,
    description,
  })

  if (transactionError) {
    console.error('[stripe/webhook] transaction insert error:', transactionError)
    throw transactionError
  }
}

async function activateSubscriptionFromStripe(
  stripe: Stripe,
  subscriptionId: string,
  fallbackUserId: string | undefined,
  skipIfSubscriptionAlreadyActive: boolean
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const userId = subscription.metadata?.supabase_user_id ?? fallbackUserId
  if (!userId) return

  const priceId = subscription.items.data[0]?.price?.id
  const plan = getPlanByPriceId(priceId)
  if (!plan) return

  await addCreditsAndUpdatePlan(
    userId,
    plan.credits,
    plan.id,
    'subscription',
    `Abonnement ${plan.name} — ${plan.credits} créations`,
    subscription.id,
    subscription.status,
    skipIfSubscriptionAlreadyActive
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event
  let stripe: Stripe

  try {
    stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('[stripe/webhook] invalid signature:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (!userId) break

        if (session.mode === 'payment') {
          if (session.metadata?.type === 'resource' && session.metadata?.resource_id) {
            const resourceId = session.metadata.resource_id
            const { error } = await supabase.from('resource_purchases').upsert(
              {
                user_id: userId,
                resource_id: resourceId,
                stripe_payment_intent_id: typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : null,
              },
              { onConflict: 'user_id,resource_id', ignoreDuplicates: true }
            )

            if (error) throw error
            break
          }

          const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
          const priceId = lineItems.data[0]?.price?.id
          const topup = TOPUPS.find(t => t.priceId === priceId)

          if (topup) {
            await addCreditsAndUpdatePlan(
              userId,
              topup.credits,
              null,
              'topup',
              `Recharge ${topup.credits} creations`
            )
          }
        } else if (session.mode === 'subscription') {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id

          if (subscriptionId) {
            await activateSubscriptionFromStripe(stripe, subscriptionId, userId, true)
          }
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getInvoiceSubscriptionId(invoice)
        if (!subscriptionId) break

        const billingReason = (invoice as { billing_reason?: string }).billing_reason

        await activateSubscriptionFromStripe(
          stripe,
          subscriptionId,
          undefined,
          billingReason === 'subscription_create'
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        const { error } = await supabase.from('profiles').update({
          plan: 'free',
          subscription_status: 'canceled',
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)

        if (error) throw error
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        const { error } = await supabase.from('profiles').update({
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)

        if (error) throw error
        break
      }
    }
  } catch (error) {
    console.error('[stripe/webhook] handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
