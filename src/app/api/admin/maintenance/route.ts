import { verifyAdmin } from '@/lib/admin'
import { DEFAULT_MAINTENANCE, maintenanceFromPayload, type MaintenancePayload } from '@/lib/maintenance'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const service = await createServiceClient()
  const { data, error } = await service
    .from('site_maintenance')
    .select('*')
    .eq('id', 'global')
    .maybeSingle()

  if (error) {
    console.error('[admin/maintenance] load error:', error)
    return Response.json({
      maintenance: DEFAULT_MAINTENANCE,
      tableMissing: error.code === '42P01',
    })
  }

  return Response.json({ maintenance: data ?? DEFAULT_MAINTENANCE, tableMissing: false })
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null) as MaintenancePayload | null
  if (!body) return Response.json({ error: 'Requete invalide' }, { status: 400 })

  const payload = maintenanceFromPayload(body, admin.email)
  const service = await createServiceClient()
  const { data, error } = await service
    .from('site_maintenance')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (error) {
    console.error('[admin/maintenance] save error:', error)
    return Response.json({
      error: error.code === '42P01'
        ? 'Table site_maintenance manquante. Applique la migration SQL.'
        : 'Erreur sauvegarde maintenance',
    }, { status: 500 })
  }

  return Response.json({ maintenance: data })
}
