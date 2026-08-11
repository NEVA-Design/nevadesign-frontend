import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EnhancePageClient } from './EnhancePageClient'

export default async function EnhancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return <EnhancePageClient userPlan={profile?.plan ?? 'free'} />
}
