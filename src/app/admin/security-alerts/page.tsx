import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { SecurityAlertsClient } from './SecurityAlertsClient'
import type { SignupSecurityEvent } from '@/lib/signup-security'

export default async function SecurityAlertsPage() {
  const data = await backendGetJson<{ alerts: SignupSecurityEvent[] }>('/admin/security-alerts')
  if (!data) redirect('/dashboard')

  return <SecurityAlertsClient initialAlerts={data.alerts} />
}
