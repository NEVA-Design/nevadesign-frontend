import { verifyAdmin } from '@/lib/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin()
  if (!admin) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  if (id.startsWith('env:')) {
    return Response.json({ error: 'Impossible de retirer un admin configure dans ADMIN_EMAILS' }, { status: 400 })
  }

  const service = await createServiceClient()

  const { data: target, error: targetErr } = await service
    .from('admin_users')
    .select('id, email')
    .eq('id', id)
    .maybeSingle()

  if (targetErr) {
    console.error('[admin/admins] find error:', targetErr)
    return Response.json({ error: targetErr.message }, { status: 500 })
  }

  if (!target) return Response.json({ error: 'Admin introuvable' }, { status: 404 })

  if (target.email.toLowerCase() === admin.email.toLowerCase()) {
    return Response.json({ error: 'Tu ne peux pas retirer ton propre acces admin depuis cette page' }, { status: 400 })
  }

  const { error } = await service
    .from('admin_users')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admin/admins] delete error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ ok: true })
}
