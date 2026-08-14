import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { DEFAULT_MAINTENANCE, type MaintenanceMode } from '@/lib/maintenance'
import { AdminMaintenanceClient } from './AdminMaintenanceClient'

/* Maintenance — chargement serveur de l'état global, rendu côté client. */
export default async function AdminMaintenancePage() {
  const data = await backendGetJson<{ maintenance: MaintenanceMode; tableMissing: boolean }>('/admin/maintenance')
  if (!data) redirect('/dashboard')

  return (
    <AdminMaintenanceClient
      initialMaintenance={data.maintenance ?? DEFAULT_MAINTENANCE}
      tableMissing={data.tableMissing}
    />
  )
}
