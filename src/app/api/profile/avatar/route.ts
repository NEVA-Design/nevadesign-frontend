import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('avatar')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Fichier trop lourd — max 4 Mo' }, { status: 400 })
  }

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: 'Format invalide — JPG, PNG ou WebP uniquement' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `${user.id}/avatar.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const service = await createServiceClient()

  const { error: uploadError } = await service.storage
    .from('avatars')
    .upload(storagePath, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[avatar upload]', uploadError.message)
    return NextResponse.json({ error: `Upload échoué: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage.from('avatars').getPublicUrl(storagePath)
  const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

  await service
    .from('profiles')
    .update({ avatar_url: urlWithCacheBust, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  return NextResponse.json({ url: urlWithCacheBust })
}
