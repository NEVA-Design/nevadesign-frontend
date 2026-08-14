'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storeSession } from "@/lib/session";
import { backendFetch, BACKEND_URL } from "@/lib/api/backend-client";
import { BrandMark } from "@/components/prisme/Brand";
import SatinSphere from "@/components/givre/SatinSphere";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";

/*
 * Connexion — la déclinaison calme du hero Givre. La scène d'aube
 * diluée respire derrière un cadre éditorial d'un pixel ; une seule
 * carte de verre dépoli porte le monogramme et le formulaire.
 * L'UI chuchote, la lumière fait le reste.
 */

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const queryError = searchParams.get('error');
    const queryMessage = searchParams.get('message');
    if (queryError) {
      setError(queryMessage ? decodeURIComponent(queryMessage) : queryError);
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    try {
      const res = await backendFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? "Connexion impossible.")
        setLoading(false)
        return
      }

      storeSession(data.session)

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Connexion impossible. Réessayez.")
      setLoading(false)
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${BACKEND_URL}/auth/google?next=/dashboard`
  }

  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      {/* La scène — aube calme, caustiques, rais de fenêtre discrets */}
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-60" />
      {/* Le halo aurore de l'atelier, à 60 % du gain du hero (D17) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(36% 44% at 34% 26%, rgba(164,139,232,0.21) 0%, rgba(164,139,232,0) 70%), radial-gradient(32% 40% at 68% 68%, rgba(239,184,148,0.2) 0%, rgba(239,184,148,0) 72%)",
        }}
      />

      {/* Cadre éditorial — la page comme objet imprimé */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.55)]"
        style={{ inset: "var(--frame-inset)" }}
      />

      {/* Coins du cadre — retour discret, registre de page */}
      <header
        className="absolute z-20 flex items-center justify-between"
        style={{
          top: "calc(var(--frame-inset) + 18px)",
          left: "calc(var(--frame-inset) + 22px)",
          right: "calc(var(--frame-inset) + 22px)",
        }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.6} />
          Retour à l’accueil
        </Link>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">
          Connexion
        </span>
      </header>

      <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24 sm:px-8">
        <div className="relative w-full max-w-[420px]">
          {/* La sphère satinée — la pièce du studio, en périphérie
              de la carte (D17) : elle déborde, la carte la recouvre */}
          <SatinSphere
            size={150}
            className="pointer-events-none absolute -right-[104px] -top-[70px] hidden lg:block"
          />
          {/* La carte porteuse — verre fort, arête allumée, ombre mauve */}
          <section className="pv-glass pv-glass--strong pv-edge pv-shadow-mauve pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="ink" />
            </Link>

            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              Espace créateur
            </p>
            <h1 className="pv-display mt-3 text-[clamp(1.8rem,5.6vw,2.25rem)] leading-[1.12]">
              Reprenez <span className="font-medium text-ink">la lumière</span>.
            </h1>
            <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-slate">
              Vos créations et vos crédits vous attendent, exactement où vous
              les avez laissés.
            </p>

            {error ? (
              <FormMessage tone="error" className="mt-6">
                {error}
              </FormMessage>
            ) : null}

            <form action={handleSubmit} className="mt-7 flex flex-col gap-5">
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <Label htmlFor="password" className="mb-0">
                    Mot de passe
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist transition-colors hover:text-ink"
                  >
                    Oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="pv-btn mt-1 w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span aria-hidden className="pv-spinner h-4 w-4" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span aria-hidden className="pv-rule flex-1" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
                ou
              </span>
              <span aria-hidden className="pv-rule flex-1" />
            </div>

            <Button type="button" variant="secondary" size="lg" className="w-full" onClick={handleGoogleLogin}>
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continuer avec Google
            </Button>
          </section>

          <p
            className="pv-fade-up mt-7 text-center text-[13px] text-slate"
            style={{ animationDelay: "0.2s" }}
          >
            Pas encore de compte ?{" "}
            <Link href="/signup" className="pv-link">
              Créez-le gratuitement
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
