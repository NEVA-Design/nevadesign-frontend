import { redirect } from 'next/navigation'
import { getMe } from '@/lib/api/backend-server'
import { EnhancePageClient } from './EnhancePageClient'

type MeResponse = { plan: string }

export default async function EnhancePage() {
  const me = await getMe<MeResponse>()
  if (!me) redirect('/login')

  return <EnhancePageClient userPlan={me.plan ?? 'free'} />
}
