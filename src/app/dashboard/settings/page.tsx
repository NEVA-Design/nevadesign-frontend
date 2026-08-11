import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, discord_handle, bio, notification_prefs')
    .eq('id', user.id)
    .single()

  if (error?.message?.includes('notification_prefs') || error?.code === 'PGRST204') {
    const fallback = await supabase
      .from('profiles')
      .select('display_name, avatar_url, discord_handle, bio')
      .eq('id', user.id)
      .single()
    profile = fallback.data as typeof profile
  }

  return (
    <SettingsClient
      email={user.email ?? ''}
      initialDisplayName={profile?.display_name ?? ''}
      initialAvatarUrl={profile?.avatar_url ?? null}
      initialDiscordHandle={profile?.discord_handle ?? ''}
      initialBio={profile?.bio ?? ''}
      initialNotificationPrefs={(profile?.notification_prefs ?? {}) as Record<string, unknown>}
    />
  )
}
