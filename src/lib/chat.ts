import { createClient } from '@/lib/supabase/server'

export interface ChatAttachment {
  data: string
  mimeType: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  image?: string
  canGenerateImage?: boolean
  attachments?: ChatAttachment[]
}

export async function getChatHistory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_histories')
    .select('messages')
    .eq('user_id', userId)
    .single()

  if (error) {
    throw error
  }

  return data?.messages as ChatMessage[] | null
}

export async function saveChatHistory(userId: string, messages: ChatMessage[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('chat_histories')
    .upsert({ user_id: userId, messages, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  if (error) {
    throw error
  }
}
