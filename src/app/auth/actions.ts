'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { evaluateSignupSecurity } from '@/lib/signup-security'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()
  const headersList = await headers()
  const rawIp = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? ''
  const ip = rawIp.split(',')[0].trim() || 'unknown'
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://neva-ai.com'
  const email = formData.get('email') as string
  const userAgent = headersList.get('user-agent') ?? ''

  const limitDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: attempts, error: attemptError } = await serviceSupabase
    .from('signup_attempts')
    .select('id')
    .eq('ip', ip)
    .gte('created_at', limitDate)

  if (attemptError) {
    console.error('Signup attempt count error:', attemptError)
  }

  if (!attemptError && attempts && attempts.length >= 3) {
    return { error: 'Trop de tentatives d\'inscription depuis cette adresse. Réessaie plus tard.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        display_name: formData.get('display_name') as string,
      },
    },
  })

  if (error) {
    console.error('Supabase signUp error:', error)
    if (error.message.toLowerCase().includes('sending confirmation email')) {
      return {
        error: "Impossible d'envoyer l'email de confirmation. Vérifie la configuration SMTP/email dans Supabase Auth.",
      }
    }
    return { error: error.message }
  }

  if (data.user?.id) {
    try {
      await evaluateSignupSecurity({
        service: serviceSupabase,
        userId: data.user.id,
        email,
        ipAddress: ip,
        userAgent,
      })
    } catch (securityError) {
      console.error('Signup security evaluation error:', securityError)
    }
  }

  if (!data.session) {
    return {
      success: true,
      message: "Compte créé. Vérifie ta boîte mail pour confirmer ton inscription, puis connecte-toi.",
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle(): Promise<void> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://neva-ai.com'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
