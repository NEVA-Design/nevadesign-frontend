import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans'
import DashboardShell from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const meta = user.user_metadata ?? {}
  const name = meta.display_name ?? meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'Créateur'
  const email = user.email ?? ''
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, plan')
    .eq('id', user.id)
    .single()

  const credits = profile?.credits ?? 0
  const plan = profile?.plan ?? 'free'
  const maxCredits = PLANS[plan as keyof typeof PLANS]?.credits ?? PLANS.free.credits
  let creditReviewStatus: string | null = null

  try {
    const service = await createServiceClient()
    const { data: securityEvent } = await service
      .from('signup_security_events')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    creditReviewStatus = securityEvent?.status ?? null
  } catch {
    creditReviewStatus = null
  }

  return (
    <DashboardShell user={{ id: user.id, name, email, avatarUrl, initials, credits, maxCredits, plan, creditReviewStatus }}>
      {children}
    </DashboardShell>
  )
}
