import { NextResponse } from 'next/server'
import { jsonError, sanitizeText, validateUploadedImage } from '@/lib/api/security'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// ─── Gemini Vision helper ─────────────────────────────────────────────────────

type GeminiTextResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  error?: { code: number; message: string }
}

async function geminiVision(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('Le moteur de vision Neva n\'est pas configuré')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      }],
      generationConfig: { maxOutputTokens: 1400, temperature: 0.1 },
    }),
  })

  const body = await res.json() as GeminiTextResponse
  if (!res.ok) throw new Error(body.error?.message?.replace(/gemini/gi, 'moteur de vision') ?? `Erreur moteur de vision ${res.status}`)
  return body.candidates?.[0]?.content?.parts?.find(p => p.text)?.text?.trim() ?? ''
}

// ─── Character card prompt ────────────────────────────────────────────────────

const CHARACTER_CARD_PROMPT = `You are building a CHARACTER IDENTITY CARD for a FiveM/GTA V character.
Goal: produce a text description precise enough that an AI reading ONLY this text can reproduce the same character visually in any new scene, without ever seeing the original image.

Cover every stable visual marker. Use exact descriptors — no vague words:

FACE: face shape, skin tone (warm/olive/light brown/tan/pale/dark — be specific), forehead, cheekbones, jawline (sharp/soft/square/rounded), chin
EYES: exact color, shape (almond/round/hooded/upturned), size, spacing, eyebrow style (thick/thin/arched/flat/bushy), eyebrow color
NOSE: proportional size, bridge width, tip shape
MOUTH: lip fullness (thin/medium/full), width
HAIR: exact color shade (jet black/dark brown/chestnut/auburn/platinum blonde — specify), cut, length, texture (straight/wavy/curly), styling
FACIAL HAIR: clean-shaven — OR — stubble (sparse/medium, color) — OR — beard (style, shape, density, color)
DISTINCTIVE MARKS: tattoos (exact location, motif, style, color for each), scars, piercings, birthmarks
BODY: build (lean/athletic/muscular/stocky/heavyset), proportions
OUTFIT: every visible garment top to bottom — type, specific color, material look, fit. Include all layers
FOOTWEAR: type, color, style details
ACCESSORIES: watches (wrist, style), chains (length, style, metal), rings (which fingers, style), earrings, glasses/sunglasses (frame shape/color), hat/cap
CHARACTER ENERGY: 3-4 adjectives capturing visual vibe

Output each section with its exact header. Be extremely precise.`

const ARCHETYPE_EXTRACT_PROMPT = `Look at this FiveM character. Respond with ONLY a JSON object:
{
  "archetype": "one_word_underscore_label (e.g. luxury_male, lspd_officer, street_female, mechanic_male, beach_female)",
  "tags": ["tag1", "tag2", "tag3"],
  "style_summary": "One sentence describing the visual style — no personal details, just clothing/aesthetic style"
}`

// ─── GET — list user's characters ─────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('character_profiles')
    .select('id, name, image_preview, role, server, style, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ characters: data ?? [] })
}

// ─── POST — create character from reference image ──────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name: string;
    imageBase64: string;
    imageMimeType: string;
    imagePreview?: string;
    metadata?: { role?: string; server?: string; style?: string };
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, imageBase64, imageMimeType } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (!imageBase64) return NextResponse.json({ error: 'Image is required' }, { status: 400 })
  const validatedImage = validateUploadedImage({ data: imageBase64, mimeType: imageMimeType }, 'character_image')
  if (!validatedImage.ok) return jsonError(validatedImage.error, 400)

  // Run character card + archetype extraction in parallel (Gemini Vision)
  let description: string
  let archetypeRaw: string

  try {
    ;[description, archetypeRaw] = await Promise.all([
      geminiVision(validatedImage.image.data, validatedImage.image.mimeType, CHARACTER_CARD_PROMPT),
      geminiVision(validatedImage.image.data, validatedImage.image.mimeType, ARCHETYPE_EXTRACT_PROMPT),
    ])
  } catch (e: unknown) {
    console.error('[characters] Gemini Vision error:', (e as Error).message)
    return NextResponse.json({ error: 'Analyse du personnage échouée' }, { status: 500 })
  }

  if (!description) {
    return NextResponse.json({ error: 'Description vide retournée par le modèle' }, { status: 500 })
  }

  // Save to user's character profiles
  const { data, error } = await supabase
    .from('character_profiles')
    .insert({
      user_id: user.id,
      name: sanitizeText(name, 80),
      description,
      image_preview: typeof body.imagePreview === 'string' ? body.imagePreview.slice(0, 12_000_000) : `data:${validatedImage.image.mimeType};base64,${validatedImage.image.data}`,
      role: sanitizeText(body.metadata?.role, 120),
      server: sanitizeText(body.metadata?.server, 120),
      style: sanitizeText(body.metadata?.style, 120),
      metadata: body.metadata ?? {},
    })
    .select('id, name, image_preview, role, server, style, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Feed anonymized style to global pool (best-effort, don't block response)
  try {
    const parsed = JSON.parse(archetypeRaw) as { archetype?: string; tags?: string[]; style_summary?: string }
    if (parsed.archetype && parsed.style_summary) {
      const service = await createServiceClient()
      await service.from('character_style_pool').insert({
        archetype: parsed.archetype,
        style_tags: parsed.tags ?? [],
        description: parsed.style_summary,
      })
    }
  } catch {
    // Non-blocking — global pool feed failure doesn't affect the user
  }

  return NextResponse.json({ character: data })
}
