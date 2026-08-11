import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin'
import { DEFAULT_MAINTENANCE, type MaintenanceMode } from '@/lib/maintenance'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminMaintenanceClient } from './AdminMaintenanceClient'

export default async function AdminMaintenancePage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  const service = await createServiceClient()
  const { data, error } = await service
    .from('site_maintenance')
    .select('*')
    .eq('id', 'global')
    .maybeSingle()

  if (error && error.code !== '42P01') {
    console.error('[admin/maintenance] page load error:', error)
  }

  return (
    <AdminMaintenanceClient
      initialMaintenance={(data ?? DEFAULT_MAINTENANCE) as MaintenanceMode}
      tableMissing={error?.code === '42P01'}
    />
  )
}
