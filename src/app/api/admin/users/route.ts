import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim().toLowerCase() ?? ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const perPage = 20

  const service = await createServiceClient()

  let authUsers: Array<{
    id: string
    email?: string
    created_at: string
  }>
  let total = 0

  if (q) {
    // Fetch a large batch and filter by email
    const { data } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const all = data?.users ?? []
    const filtered = all.filter(u => u.email?.toLowerCase().includes(q))
    total = filtered.length
    const start = (page - 1) * perPage
    authUsers = filtered.slice(start, start + perPage)
  } else {
    const { data } = await service.auth.admin.listUsers({ page, perPage })
    authUsers = data?.users ?? []
    // Get total count
    const { data: all } = await service.auth.admin.listUsers({ page: 1, perPage: 1 })
    // Supabase doesn't return total count — use a profiles count instead
    const { count } = await service.from('profiles').select('*', { count: 'exact', head: true })
    total = count ?? authUsers.length
  }

  if (authUsers.length === 0) {
    return Response.json({ users: [], total: 0, page, perPage })
  }

  // Enrich with profile data
  const ids = authUsers.map(u => u.id)
  const { data: profiles } = await service
    .from('profiles')
    .select('id, credits, plan, stripe_subscription_id, subscription_status')
    .in('id', ids)

  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  const users = authUsers.map(u => {
    const profile = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '(no email)',
      created_at: u.created_at,
      plan: profile?.plan ?? 'free',
      credits: profile?.credits ?? 0,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
      subscription_status: profile?.subscription_status ?? null,
    }
  })

  return Response.json({ users, total, page, perPage })
}
