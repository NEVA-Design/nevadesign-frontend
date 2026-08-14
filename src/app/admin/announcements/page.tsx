/* Affichages — garde d'auth admin puis chargement trié (priorité desc,
   création desc). Tout le visuel vit dans le client. */
import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { AdminAnnouncementsClient } from './AdminAnnouncementsClient'
import type { SiteAnnouncement } from '@/lib/announcements'

export default async function AdminAnnouncementsPage() {
  const data = await backendGetJson<{ announcements: SiteAnnouncement[] }>('/admin/announcements')
  if (!data) redirect('/dashboard')

  return <AdminAnnouncementsClient initialAnnouncements={data.announcements} />
}
