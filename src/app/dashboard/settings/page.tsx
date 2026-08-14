import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import SettingsClient from './SettingsClient'

type DiscordIdentity = { username: string; avatarUrl: string | null }

type MeResponse = {
  email: string
  display_name: string
  avatar_url: string | null
  discord: DiscordIdentity | null
  bio: string
  notification_prefs: Record<string, unknown>
  mfaEnabled: boolean
}

export default async function SettingsPage() {
  const me = await backendGetJson<MeResponse>('/me')
  if (!me) redirect('/login')

  return (
    <SettingsClient
      email={me.email}
      initialDisplayName={me.display_name}
      initialAvatarUrl={me.avatar_url}
      initialDiscord={me.discord}
      initialBio={me.bio}
      initialNotificationPrefs={me.notification_prefs}
      initialMfaEnabled={me.mfaEnabled}
    />
  )
}
