/* Affichages — garde d'auth admin puis chargement trié (priorité desc,
   création desc). Tout le visuel vit dans le client. */
import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminAnnouncementsClient } from './AdminAnnouncementsClient'
import type { SiteAnnouncement } from '@/lib/announcements'

export default async function AdminAnnouncementsPage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  const service = await createServiceClient()
  const { data } = await service
    .from('site_announcements')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  return <AdminAnnouncementsClient initialAnnouncements={(data ?? []) as SiteAnnouncement[]} />
}
