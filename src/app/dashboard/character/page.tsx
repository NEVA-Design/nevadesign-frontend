import { backendGetJson } from '@/lib/api/backend-server'
import CharacterPageClient from "./CharacterPageClient";

type SavedCharacter = { id: string; name: string; description?: string; image_preview?: string | null; role?: string | null; server?: string | null; style?: string | null };
type CharactersResponse = { characters: SavedCharacter[] }

// Server component — pre-fetches saved characters (auth already gated by dashboard/layout.tsx)
export default async function NevaCharacterPage() {
  const res = await backendGetJson<CharactersResponse>('/characters');
  return <CharacterPageClient initialCharacters={res?.characters ?? []} />;
}
