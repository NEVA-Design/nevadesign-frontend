import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isMissingNotificationPrefs(error: { message?: string; code?: string } | null) {
  return Boolean(error?.message?.includes('notification_prefs') || error?.code === 'PGRST204')
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, discord_handle, bio, notification_prefs')
    .eq('id', user.id)
    .single()

  if (isMissingNotificationPrefs(error)) {
    const fallback = await supabase
      .from('profiles')
      .select('display_name, avatar_url, discord_handle, bio')
      .eq('id', user.id)
      .single()
    profile = fallback.data as typeof profile
  }

  return NextResponse.json({
    email: user.email ?? '',
    display_name: profile?.display_name ?? '',
    avatar_url: profile?.avatar_url ?? null,
    discord_handle: profile?.discord_handle ?? '',
    bio: profile?.bio ?? '',
    notification_prefs: profile?.notification_prefs ?? {},
  })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (typeof body.display_name === 'string') {
    updates.display_name = body.display_name.slice(0, 100).trim()
  }
  if (typeof body.discord_handle === 'string') {
    updates.discord_handle = body.discord_handle.slice(0, 50).trim()
  }
  if (typeof body.bio === 'string') {
    updates.bio = body.bio.slice(0, 500)
  }
  if (
    body.notification_prefs !== undefined &&
    typeof body.notification_prefs === 'object' &&
    body.notification_prefs !== null
  ) {
    const prefs = body.notification_prefs as Record<string, unknown>
    updates.notification_prefs = {
      sound: Boolean(prefs.sound),
      browser: Boolean(prefs.browser),
    }
  }

  let { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (isMissingNotificationPrefs(error) && 'notification_prefs' in updates) {
    delete updates.notification_prefs
    const retry = await supabase.from('profiles').update(updates).eq('id', user.id)
    error = retry.error
  }
  if (error) {
    return NextResponse.json({ success: false, error: { code: 'profile_update_failed', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { ok: true }, ok: true })
}
