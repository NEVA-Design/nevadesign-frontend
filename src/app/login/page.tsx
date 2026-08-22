'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { backendFetch } from "@/lib/api/backend-client";
import { BrandMark } from "@/components/prisme/Brand";
import { Input, Label, FormMessage } from "@/components/ui/field";

/*
 * Connexion — redesign 21/08 : la cimaise de galerie. Deux
 * panneaux sur le satin vivant : à gauche la carte d'ENCRE MATE
 * (opaque — plus de verre) qui porte le formulaire, à droite
 * l'ŒUVRE — la scène porcelaine du studio, encadrée avec sa
 * légende d'exposition. Plus de sphère décorative, plus d'aurore
 * violette : le drapé fait l'atmosphère.
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

      // La session est posée en cookies HttpOnly par le backend (FRONT-001) —
      // plus rien à stocker côté JS.
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

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1240px] items-center px-6 py-24 sm:px-8">
        {/* §phase 6 : split 50/50 — formulaire éditorial / panneau matière */}
        <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="mx-auto w-full max-w-[430px]">
          {/* La carte porteuse — encre mate opaque, top-light */}
          <section className="pv-auth-card pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="white" />
            </Link>

            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              Espace créateur
            </p>
            <h1 className="pv-display mt-3 text-[clamp(1.8rem,5.6vw,2.25rem)] leading-[1.12]">
              Reprenez <b>la lumière</b>.
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
              {/* bouton pv-btn nu : radius 14 de la charte (le
                  composant Button imposait sa pilule rounded-full) */}
              <button type="submit" className="pv-btn mt-1 w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span aria-hidden className="pv-spinner h-4 w-4" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            {/* Pied de carte — le second chemin, relié par un filet */}
            <p className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-5 text-[13px] text-slate">
              Pas encore de compte ?{" "}
              <Link href="/signup" className="pv-link">
                Créez-le gratuitement
              </Link>
            </p>
          </section>
          </div>

          {/* L'œuvre — la scène porcelaine du studio, en cimaise.
              La légende dit vrai : c'est le rendu temps réel de
              l'accueil, bake par pose caméra. */}
          <figure
            className="pv-auth-art pv-fade-up hidden h-[min(74vh,700px)] lg:block"
            style={{ animationDelay: "0.12s" }}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/scene/low/hero-poster-1440.avif"
              alt=""
              loading="lazy"
              decoding="async"
              style={{ objectPosition: "70% 44%" }}
            />
            {/* la lumière aurore du panneau — la seule couleur */}
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(42% 52% at 56% 30%, rgba(185,167,218,0.16) 0%, rgba(185,167,218,0) 70%), radial-gradient(38% 46% at 72% 66%, rgba(233,198,162,0.13) 0%, rgba(233,198,162,0) 72%)",
              }}
            />
            <figcaption>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink">
                Monogramme AV — verre &amp; lumière aurore
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                La scène du studio
              </span>
            </figcaption>
          </figure>
        </div>
      </main>
    </div>
  );
}
