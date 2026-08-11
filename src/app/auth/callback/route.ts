import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { evaluateSignupSecurity } from '@/lib/signup-security'

type SupabaseAuthErrorDetails = {
  details?: string
  hint?: string
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    console.error('Auth callback missing code:', request.url)
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&message=missing_code`)
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (!userError && userData.user) {
        const service = await createServiceClient()
        const { data: existingEvent } = await service
          .from('signup_security_events')
          .select('id')
          .eq('user_id', userData.user.id)
          .maybeSingle()

        if (!existingEvent) {
          const rawIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? ''
          const ip = rawIp.split(',')[0].trim() || 'unknown'
          const email = userData.user.email ?? 'unknown'
          const userAgent = request.headers.get('user-agent') ?? ''

          try {
            await evaluateSignupSecurity({
              service,
              userId: userData.user.id,
              email,
              ipAddress: ip,
              userAgent,
            })
          } catch (securityError) {
            console.error('OAuth signup security evaluation error:', securityError)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    // Log details server-side for debugging without exposing secrets to the user
    // (Vercel logs will contain this output)
    console.error('Supabase exchangeCodeForSession error:', error)

    const safeMessage = encodeURIComponent(error?.message ?? 'unknown')
    const authDetails = error as SupabaseAuthErrorDetails
    const safeHint = encodeURIComponent(authDetails.details ?? authDetails.hint ?? '')
    return NextResponse.redirect(
      `${origin}/login?error=auth_callback_failed&message=${safeMessage}${safeHint ? `&hint=${safeHint}` : ''}`,
    )
  } catch (err) {
    console.error('Auth callback unexpected error:', err)
    const msg = encodeURIComponent((err as Error)?.message ?? 'unexpected_error')
    return NextResponse.redirect(`${origin}/login?error=server_error&message=${msg}`)
  }
}
