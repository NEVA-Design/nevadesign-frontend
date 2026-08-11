import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const key = process.env.GOOGLE_AI_API_KEY
  if (!key) return Response.json({ error: 'No API key' }, { status: 500 })

  // Try both v1beta and v1
  const results: Record<string, unknown> = {}

  for (const version of ['v1beta', 'v1']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/${version}/models?key=${key}&pageSize=200`
      )
      const data = await res.json()
      // Filter to models that support generateContent or image generation
      const imageModels = (data.models ?? []).filter((m: { name: string; supportedGenerationMethods?: string[] }) =>
        m.name.toLowerCase().includes('image') ||
        m.name.toLowerCase().includes('imagen') ||
        m.name.toLowerCase().includes('flash-exp') ||
        (m.supportedGenerationMethods ?? []).some((method: string) => method.includes('generate'))
      )
      results[version] = imageModels.map((m: { name: string; displayName?: string; supportedGenerationMethods?: string[] }) => ({
        name: m.name,
        displayName: m.displayName,
        methods: m.supportedGenerationMethods,
      }))
    } catch (e) {
      results[version] = { error: String(e) }
    }
  }

  return Response.json(results)
}
