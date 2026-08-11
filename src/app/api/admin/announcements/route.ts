import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'
import {
  isAnnouncementAccent,
  isAnnouncementKind,
  type AnnouncementAccent,
  type AnnouncementKind,
} from '@/lib/announcements'

interface AnnouncementPayload {
  title?: unknown
  message?: unknown
  kind?: unknown
  badge?: unknown
  cta_label?: unknown
  href?: unknown
  accent?: unknown
  is_active?: unknown
  priority?: unknown
  starts_at?: unknown
  ends_at?: unknown
}

function optionalText(value: unknown) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function optionalDate(value: unknown) {
  const text = optionalText(value)
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function validatePayload(body: AnnouncementPayload) {
  const title = optionalText(body.title)
  const message = optionalText(body.message)

  if (!title) return { error: 'Titre requis' }
  if (!message) return { error: 'Message requis' }

  const kind: AnnouncementKind = isAnnouncementKind(body.kind) ? body.kind : 'info'
  const accent: AnnouncementAccent = isAnnouncementAccent(body.accent) ? body.accent : 'orange'
  const priority = Number(body.priority ?? 0)

  if (!Number.isInteger(priority) || priority < 0) {
    return { error: 'Priorite invalide' }
  }

  return {
    payload: {
      title,
      message,
      kind,
      badge: optionalText(body.badge),
      cta_label: optionalText(body.cta_label),
      href: optionalText(body.href),
      accent,
      is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
      priority,
      starts_at: optionalDate(body.starts_at),
      ends_at: optionalDate(body.ends_at),
      updated_at: new Date().toISOString(),
    },
  }
}

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const service = await createServiceClient()
  const { data, error } = await service
    .from('site_announcements')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/announcements] list error:', error)
    return Response.json({ error: 'Erreur chargement' }, { status: 500 })
  }

  return Response.json({ announcements: data ?? [] })
}

export async function POST(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json() as AnnouncementPayload
  const validated = validatePayload(body)

  if ('error' in validated) {
    return Response.json({ error: validated.error }, { status: 400 })
  }

  const service = await createServiceClient()
  const { data, error } = await service
    .from('site_announcements')
    .insert(validated.payload)
    .select('*')
    .single()

  if (error) {
    console.error('[admin/announcements] create error:', error)
    return Response.json({ error: 'Erreur creation' }, { status: 500 })
  }

  return Response.json({ announcement: data }, { status: 201 })
}
