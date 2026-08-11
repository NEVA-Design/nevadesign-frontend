import { AdminsClient } from './AdminsClient'
import { getBootstrapAdminEmails } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminsPage() {
  const service = await createServiceClient()
  const { data } = await service
    .from('admin_users')
    .select('id, email, is_active, created_at, created_by')
    .order('created_at', { ascending: false })

  const bootstrapAdmins = getBootstrapAdminEmails().map(email => ({
    id: `env:${email}`,
    email,
    is_active: true,
    source: 'env' as const,
    created_at: null,
    created_by: null,
  }))

  const databaseAdmins = (data ?? []).map(item => ({
    ...item,
    source: 'database' as const,
  }))

  return <AdminsClient initialAdmins={[...bootstrapAdmins, ...databaseAdmins]} />
}
