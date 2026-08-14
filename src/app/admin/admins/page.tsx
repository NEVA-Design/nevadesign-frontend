import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { AdminsClient } from './AdminsClient'

type AdminEntry = {
  id: string
  email: string
  is_active: boolean
  source: 'env' | 'database'
  created_at: string | null
  created_by: string | null
}

export default async function AdminsPage() {
  const data = await backendGetJson<{ admins: AdminEntry[] }>('/admin/admins')
  if (!data) redirect('/dashboard')

  return <AdminsClient initialAdmins={data.admins} />
}
