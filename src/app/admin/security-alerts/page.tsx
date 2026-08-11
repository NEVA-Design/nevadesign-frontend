import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { SecurityAlertsClient } from './SecurityAlertsClient'
import type { SignupSecurityEvent } from '@/lib/signup-security'

export default async function SecurityAlertsPage() {
  const admin = await verifyAdmin()
  if (!admin) redirect('/dashboard')

  const service = await createServiceClient()
  const { data } = await service
    .from('signup_security_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return <SecurityAlertsClient initialAlerts={(data ?? []) as SignupSecurityEvent[]} />
}
