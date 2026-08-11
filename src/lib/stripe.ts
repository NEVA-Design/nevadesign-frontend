// Server-only — never import this in Client Components
import Stripe from 'stripe'
import { PLANS, TOPUPS, CREDIT_COSTS } from '@/lib/plans'

let stripeInstance: Stripe | null = null

export function getStripe() {
  if (stripeInstance) return stripeInstance

  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable')
  }

  stripeInstance = new Stripe(apiKey, {
    apiVersion: '2026-05-27.dahlia',
  })

  return stripeInstance
}

// Re-export for server-side convenience
export { PLANS, TOPUPS, CREDIT_COSTS }
