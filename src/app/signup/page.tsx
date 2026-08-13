'use client'

import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { signup, loginWithGoogle } from "@/app/auth/actions";
import { BrandMark } from "@/components/prisme/Brand";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";

/*
 * Inscription — la même déclinaison calme du hero Givre que la
 * connexion : scène d'aube diluée, cadre éditorial d'un pixel, une
 * carte de verre dépoli. Après création du compte, la même carte
 * devient l'écran « Vérifiez vos e-mails ».
 */

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
    <div className="pv-scene relative min-h-[100svh] text-ink">
      {/* La scène — aube calme, caustiques, rais de fenêtre discrets */}
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-60" />

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
          Inscription
        </span>
      </header>

      <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24 sm:px-8">
        <div className="w-full max-w-[420px]">
          {/* La carte porteuse — verre fort, arête allumée, ombre mauve */}
          <section className="pv-glass pv-glass--strong pv-edge pv-shadow-mauve pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="ink" />
            </Link>

            {success ? (
              <div className="pv-scale-in">
                <span className="pv-pill mt-7 h-12 w-12 justify-center px-0">
                  <MailCheck size={22} strokeWidth={1.6} className="text-ok" />
                </span>
                <h1 className="pv-display mt-5 text-[clamp(1.7rem,5.2vw,2.1rem)] leading-[1.12]">
                  Vérifiez vos e-mails.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {success}
                </p>
                <p className="mt-5 rounded-[12px] border border-[rgba(43,36,80,0.07)] bg-white/60 px-4 py-3.5 text-[13px] leading-relaxed text-slate">
                  Pensez aussi à vérifier les courriers indésirables. Une fois
                  l’adresse confirmée, vous pourrez vous connecter à votre espace.
                </p>
                <Link href="/login" className="mt-7 block">
                  <Button type="button" variant="primary" size="lg" className="pv-btn w-full">
                    Aller à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                  Accès anticipé
                </p>
                <h1 className="pv-display mt-3 text-[clamp(1.7rem,5.2vw,2.1rem)] leading-[1.12]">
                  Votre <span className="font-medium text-ink">première création</span>{" "}
                  vous attend.
                </h1>
                <p className="mt-3 max-w-[340px] text-sm leading-relaxed text-slate">
                  Le studio compose, vous publiez — affiches, logos et identités
                  complètes pour votre serveur.
                </p>
                <p className="mt-4 text-balance font-mono text-[10px] tracking-[0.04em] text-mist">
                  ( 5 créations offertes · Sans carte bancaire )
                </p>

                {error ? (
                  <FormMessage tone="error" className="mt-6">
                    {error}
                  </FormMessage>
                ) : null}

                <form action={handleSubmit} className="mt-7 flex flex-col gap-5">
                  <div>
                    <Label htmlFor="display_name">Nom d’affichage</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      type="text"
                      placeholder="Créateur FiveM"
                      autoComplete="nickname"
                      required
                    />
                  </div>
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
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="6 caractères minimum"
                      autoComplete="new-password"
                      required
                      minLength={6}
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
                        Création du compte…
                      </>
                    ) : (
                      "Créer mon compte gratuit"
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

                <form action={loginWithGoogle}>
                  <Button type="submit" variant="secondary" size="lg" className="w-full">
                    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </Button>
                </form>
              </>
            )}
          </section>

          {!success ? (
            <div
              className="pv-fade-up mt-7 text-center"
              style={{ animationDelay: "0.2s" }}
            >
              <p className="text-[13px] text-slate">
                Déjà un compte ?{" "}
                <Link href="/login" className="pv-link">
                  Connectez-vous
                </Link>
              </p>
              <p className="mx-auto mt-3 max-w-[360px] text-[11px] leading-relaxed text-mist">
                En créant un compte, vous acceptez nos{" "}
                <Link
                  href="/terms"
                  className="underline decoration-[rgba(43,36,80,0.3)] underline-offset-2 transition-colors hover:text-ink"
                >
                  Conditions d’utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy"
                  className="underline decoration-[rgba(43,36,80,0.3)] underline-offset-2 transition-colors hover:text-ink"
                >
                  Politique de confidentialité
                </Link>
                .
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
