import { redirect } from 'next/navigation'
import { backendGetJson, getMe } from '@/lib/api/backend-server'
import { DesignPageClient } from './DesignPageClient'

type MeResponse = { plan: string }
type SavedChar = { id: string; name: string; image_preview?: string | null; role?: string | null; server?: string | null; style?: string | null };
type CharactersResponse = { characters: SavedChar[] }

// Server component — fetches user plan + saved characters in parallel, then renders the client component
export default async function DesignPage() {
  const [me, charactersRes] = await Promise.all([
    getMe<MeResponse>(),
    backendGetJson<CharactersResponse>('/characters'),
  ]);
  if (!me) redirect('/login');

  return <DesignPageClient userPlan={me.plan ?? 'free'} initialCharacters={charactersRes?.characters ?? []} />;
}
