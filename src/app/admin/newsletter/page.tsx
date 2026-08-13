/* Newsletter — garde d'auth admin, comptage des audiences et détection
   de la configuration Resend. Tout le visuel vit dans le client. */
import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminNewsletterClient } from './AdminNewsletterClient'

async function getNewsletterStats() {
  const service = await createServiceClient()
  const perPage = 1000
  let page = 1
  let total = 0
  let free = 0

  while (true) {
    const { data } = await service.auth.admin.listUsers({ page, perPage })
    const users = data?.users ?? []
    if (users.length === 0) break

    const ids = users.map((user) => user.id)
    const { data: profiles } = await service
      .from('profiles')
      .select('id, plan')
      .in('id', ids)

    const planMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.plan ?? 'free']))

    for (const user of users) {
      if (!user.email) continue
      total += 1
      if ((planMap.get(user.id) ?? 'free') === 'free') free += 1
    }

    if (users.length < perPage) break
    page += 1
  }

  return {
    total,
    free,
    paid: total - free,
    resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL),
    fromEmail: process.env.NEWSLETTER_FROM_EMAIL ?? '',
  }
}

export default async function NewsletterPage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  const stats = await getNewsletterStats()

  return <AdminNewsletterClient initialStats={stats} adminEmail={admin.email} />
}
