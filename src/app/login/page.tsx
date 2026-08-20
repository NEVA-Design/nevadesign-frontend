'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storeSession } from "@/lib/session";
import { backendFetch } from "@/lib/api/backend-client";
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

  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      {/* La scène — le satin assagi sous UN champ aurore propre
          (Phase 4 QA 20/08 : fini l'empilement caustiques + rais +
          halos 20 % qui viraient marron ; fini le cadre viewport) */}
      <div aria-hidden className="pv-auth-bg" />

      {/* Coins de page — retour discret, registre */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-7 sm:px-10">
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
          {/* La sphère satinée — ENTIÈRE, posée à droite au-dessus
              de la carte : elle équilibre la composition, plus
              jamais recouverte (Phase 4.4) */}
          <SatinSphere
            size={150}
            className="pointer-events-none absolute -top-[24px] right-[-186px] hidden lg:block"
          />
          {/* La carte porteuse — spec Phase 4.2 : blanc 4 %,
              bordure 12 %, top-light */}
          <section className="pv-auth-card pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="white" />
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
