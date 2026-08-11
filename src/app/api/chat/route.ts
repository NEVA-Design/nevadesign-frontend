import OpenAI from 'openai'
import { getModel, IMAGE_BRIEF_MARKER, MODULE_SYSTEM_PROMPTS } from '@/lib/ai/models'
import { composeModuleSystemPrompt, getModuleContract, type NevaAIModule } from '@/lib/ai/orchestrator'
import {
  checkRateLimit,
  hasPromptInjectionRisk,
  jsonError,
  sanitizeText,
  securityLog,
  validateUploadedImages,
} from '@/lib/api/security'
import { createClient } from '@/lib/supabase/server'
import { deductCredits } from '@/lib/credits'
import { saveChatHistory } from '@/lib/chat'
import { CREDIT_COSTS } from '@/lib/plans'

// Lazy init
let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY
    if (!key) throw new Error('OPENAI_API_KEY is not set')
    _openai = new OpenAI({ apiKey: key })
  }
  return _openai
}

function hasCompleteEnding(text: string) {
  const trimmed = text.trim()
  if (/[.!?…]["''")]*$/.test(trimmed)) return true
  if (/\d+\s*(px|%|dpi|pt|em|rem|K|k)["''")]*$/i.test(trimmed)) return true
  if (/\.(png|jpg|jpeg|gif|svg|psd|pdf|webp)["''")]*$/i.test(trimmed)) return true
  if (/#[0-9A-Fa-f]{3,8}["''")]*$/.test(trimmed)) return true
  return false
}

type IncomingMessage = {
  role: 'user' | 'assistant'
  content: string
  attachments?: Array<{ data: string; mimeType: string }>
}

// Build an OpenAI-compatible message from our internal format
function toOpenAIMessage(m: IncomingMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  if (m.role === 'assistant') {
    return { role: 'assistant', content: m.content || '.' }
  }

  // User message — may include image attachments
  if (m.attachments?.length) {
    const parts: OpenAI.Chat.Completions.ChatCompletionContentPart[] = m.attachments.map(att => ({
      type: 'image_url' as const,
      image_url: { url: `data:${att.mimeType};base64,${att.data}`, detail: 'high' as const },
    }))
    parts.push({ type: 'text', text: m.content || '.' })
    return { role: 'user', content: parts }
  }

  return { role: 'user', content: m.content || '.' }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { messages, modelId, module: moduleName } = await request.json() as {
      messages?: IncomingMessage[]
      modelId?: string
      module?: string
    }

    const moduleKey: NevaAIModule = moduleName === 'design' || moduleName === 'enhance' || moduleName === 'audit' || moduleName === 'character'
      ? moduleName
      : 'chat'
    const contract = getModuleContract(moduleKey)
    const rate = checkRateLimit(`chat:${user.id}`, contract.rateLimitPerMinute)
    if (!rate.ok) {
      securityLog('rate_limited', { userId: user.id, module: moduleKey })
      return jsonError('rate_limited', 429)
    }

    if (!messages?.length || messages.length > 30) return new Response('No messages provided', { status: 400 })

    const safeMessages: IncomingMessage[] = []
    for (const message of messages) {
      const safeContent = sanitizeText(message.content, contract.maxInputChars)
      if (hasPromptInjectionRisk(safeContent)) {
        securityLog('prompt_injection_signal', { userId: user.id, module: moduleKey })
      }

      const attachments = message.attachments ?? []
      const validated = validateUploadedImages(attachments, contract.maxImages)
      if (!validated.ok) return jsonError(validated.error, 400)

      safeMessages.push({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: safeContent || '.',
        attachments: validated.images,
      })
    }

    const deduction = await deductCredits(user.id, CREDIT_COSTS.chat, 'chat', 'Message Neva Chat')
    if (!deduction.success) {
      return new Response(
        JSON.stringify({ error: 'insufficient_credits', remaining: deduction.remaining }),
        { status: 402, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const nevaModel = getModel(modelId ?? 'neva-pro')
    const moduleExtra = MODULE_SYSTEM_PROMPTS[moduleKey] ?? ''
    const systemPrompt = composeModuleSystemPrompt(moduleKey, nevaModel.systemPrompt, moduleExtra)

    // Build OpenAI message array: system + history + last user message
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...safeMessages.map(toOpenAIMessage),
    ]

    // Start streaming
    const openaiStream = await getOpenAI().chat.completions.create({
      model: nevaModel.openaiModel,
      messages: openaiMessages,
      stream: true,
      max_tokens: Math.min(nevaModel.maxOutputTokens ?? 900, 900),
      temperature: nevaModel.temperature ?? 0.45,
    })

    let assistantText = ''
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              assistantText += text
              controller.enqueue(encoder.encode(text))
            }
          }

          // Anti-cutoff: if response ended mid-sentence, ask OpenAI to finish it
          if (assistantText && !hasCompleteEnding(assistantText.replaceAll(IMAGE_BRIEF_MARKER, ''))) {
            const continuationStream = await getOpenAI().chat.completions.create({
              model: nevaModel.openaiModel,
              messages: [
                ...openaiMessages,
                { role: 'assistant', content: assistantText },
                {
                  role: 'user',
                  content: "Ta réponse s'est coupée. Termine uniquement la phrase ou l'étape en cours — 1 à 2 lignes maximum, puis arrête-toi. Ne répète rien du début.",
                },
              ],
              stream: true,
              max_tokens: 200,
              temperature: nevaModel.temperature ?? 0.45,
            })

            for await (const chunk of continuationStream) {
              const text = chunk.choices[0]?.delta?.content ?? ''
              if (text) {
                assistantText += text
                controller.enqueue(encoder.encode(text))
              }
            }
          }
        } catch (streamErr) {
          console.error('[/api/chat] stream error:', streamErr)
        }

        const canGenerateImage = assistantText.includes(IMAGE_BRIEF_MARKER)
        const cleanText = assistantText.replaceAll(IMAGE_BRIEF_MARKER, '').trim()

        // Persist — wrapped so Supabase errors never kill the stream
        try {
          await saveChatHistory(user.id, [
            ...safeMessages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: new Date().toISOString(),
              attachments: m.attachments,
            })),
            {
              role: 'assistant' as const,
              content: cleanText,
              canGenerateImage,
              timestamp: new Date().toISOString(),
            },
          ])
        } catch (e) {
          console.error('[/api/chat] saveChatHistory failed (non-fatal):', e)
        }

        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Neva-Model': nevaModel.name,
        'X-Credits-Remaining': String(deduction.remaining),
      },
    })
  } catch (err) {
    const e = err as { message?: string }
    console.error('[/api/chat]', e?.message ?? err)
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
