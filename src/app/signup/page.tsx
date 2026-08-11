'use client'

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, MailCheck } from "lucide-react";
import { signup, loginWithGoogle } from "@/app/auth/actions";
import { useState } from "react";

const perks = [
  "No credit card needed",
  "Access to all 6 creative modules",
  "5 créations offertes pour tester le produit",
];

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    if (result?.success) {
      setSuccess(result.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B7D]/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#FFD166]/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[#666] hover:text-[#F5F0E8] transition-colors">
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-12 h-12 mb-3">
            <Image src="/nevalogooo.png" alt="Neva AI" fill sizes="48px" className="object-contain" />
          </div>
          <span className="font-bold text-xl">
            <span className="text-neva-gradient">Neva</span>
            <span className="text-[#F5F0E8]/80"> AI</span>
          </span>
          <p className="text-xs text-[#555] mt-1">Your Creative AI for FiveM</p>
        </div>

        <div className="flex flex-col gap-1.5 mb-6">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-xs text-[#9A9A9A]">
              <div className="w-4 h-4 rounded-full bg-[#FF7B4B]/20 flex items-center justify-center flex-shrink-0">
                <Check size={9} className="text-[#FF7B4B]" />
              </div>
              {perk}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-7 border border-white/[0.08]">
          {success ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <MailCheck size={26} className="text-emerald-300" />
              </div>
              <h1 className="text-xl font-bold text-[#F5F0E8] mb-2">Vérifie tes emails</h1>
              <p className="text-sm text-[#9A9A9A] leading-relaxed mb-5">
                {success}
              </p>
              <div className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3.5 py-3 text-left text-xs text-[#777] mb-5">
                Pense aussi à vérifier les spams ou courriers indésirables. Une fois l&apos;email validé, tu pourras te connecter à ton dashboard.
              </div>
              <Link
                href="/login"
                className="w-full h-12 px-6 rounded-xl bg-gradient-to-r from-[#FF6B7D] via-[#FF7B4B] to-[#FFD166] text-white font-medium inline-flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                Aller à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#F5F0E8] mb-1">Create your account</h1>
              <p className="text-sm text-[#666] mb-6">Start creating in seconds.</p>

              {error && (
                <div className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Display Name</label>
                  <input
                    name="display_name"
                    type="text"
                    placeholder="FiveM Creator"
                    required
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9A9A9A] mb-1.5">Password</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#F5F0E8] placeholder-[#444] outline-none focus:border-[#FF7B4B]/40 transition-colors"
                  />
                </div>
                <Button variant="gradient" size="lg" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Free Account'}
                </Button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-[#444]">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <form action={loginWithGoogle}>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/5 border border-white/[0.08] rounded-xl text-sm text-[#CCCCC0] hover:bg-white/[0.08] hover:border-white/[0.14] transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <>
            <p className="text-center text-xs text-[#555] mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-[#FF7B4B] hover:text-[#FFD166] transition-colors">Sign in</Link>
            </p>
            <p className="text-center text-[10px] text-[#333] mt-2">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-[#666]">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-[#666]">Privacy Policy</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
