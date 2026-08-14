/* Newsletter — garde d'auth admin, comptage des audiences et détection
   de la configuration Resend. Tout le visuel vit dans le client. */
import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { AdminNewsletterClient } from './AdminNewsletterClient'

type NewsletterStats = {
  total: number
  free: number
  paid: number
  resendConfigured: boolean
  fromEmail: string
}

export default async function NewsletterPage() {
  const [admin, stats] = await Promise.all([
    backendGetJson<{ email: string }>('/admin/verify'),
    backendGetJson<NewsletterStats>('/admin/newsletter'),
  ])
  if (!admin || !stats) redirect('/dashboard')

  return <AdminNewsletterClient initialStats={stats} adminEmail={admin.email} />
}
