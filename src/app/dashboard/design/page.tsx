import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import { DesignPageClient } from './DesignPageClient'

type MeResponse = { plan: string }

// Server component — fetches user plan then renders the client component
export default async function DesignPage() {
  const me = await backendGetJson<MeResponse>('/me');
  if (!me) redirect('/login');

  return <DesignPageClient userPlan={me.plan ?? 'free'} />;
}
