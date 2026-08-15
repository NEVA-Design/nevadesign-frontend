import { redirect } from 'next/navigation'
import { getMe } from '@/lib/api/backend-server'
import DashboardShell from "@/components/dashboard/DashboardShell"

// Depends on the request's session cookie — never prerender statically.
export const dynamic = 'force-dynamic'

type MeResponse = {
  id: string
  email: string
  user_metadata?: { display_name?: string; full_name?: string; name?: string; avatar_url?: string; picture?: string }
  display_name?: string
  avatar_url?: string | null
  credits: number
  plan: string
  maxCredits: number
  creditReviewStatus: string | null
  isAdmin?: boolean
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const me = await getMe<MeResponse>()
  if (!me) redirect('/login')

  const meta = me.user_metadata ?? {}
  const name = me.display_name || meta.display_name || meta.full_name || meta.name || me.email.split('@')[0] || 'Créateur'
  const avatarUrl = me.avatar_url ?? meta.avatar_url ?? meta.picture ?? null
  const initials = name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DashboardShell
      user={{
        id: me.id,
        name,
        email: me.email,
        avatarUrl,
        initials,
        credits: me.credits,
        maxCredits: me.maxCredits,
        plan: me.plan,
        creditReviewStatus: me.creditReviewStatus,
        isAdmin: me.isAdmin ?? false,
      }}
    >
      {children}
    </DashboardShell>
  )
}
