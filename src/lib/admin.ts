import { createClient, createServiceClient } from '@/lib/supabase/server'

export type VerifiedAdmin = {
  userId: string
  email: string
  source: 'env' | 'database'
}

export function getBootstrapAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? ''
  return raw.split(',').map(email => email.trim().toLowerCase()).filter(Boolean)
}

// ADMIN_EMAILS remains the bootstrap safety list. Database admins are managed from /admin/admins.
export async function verifyAdmin(): Promise<VerifiedAdmin | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null

  const email = user.email.toLowerCase()
  if (getBootstrapAdminEmails().includes(email)) {
    return { userId: user.id, email: user.email, source: 'env' }
  }

  try {
    const service = await createServiceClient()
    const { data } = await service
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle()

    if (!data) return null
    return { userId: user.id, email: user.email, source: 'database' }
  } catch (error) {
    console.error('[admin] verify database admin failed:', error)
    return null
  }
}
