import { redirect } from 'next/navigation'
import { backendGetJson } from '@/lib/api/backend-server'
import SettingsClient from './SettingsClient'

type MeResponse = {
  email: string
  display_name: string
  avatar_url: string | null
  discord_handle: string
  bio: string
  notification_prefs: Record<string, unknown>
}

export default async function SettingsPage() {
  const me = await backendGetJson<MeResponse>('/me')
  if (!me) redirect('/login')

  return (
    <SettingsClient
      email={me.email}
      initialDisplayName={me.display_name}
      initialAvatarUrl={me.avatar_url}
      initialDiscordHandle={me.discord_handle}
      initialBio={me.bio}
      initialNotificationPrefs={me.notification_prefs}
    />
  )
}
