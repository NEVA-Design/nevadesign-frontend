'use client'

import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { storeSession } from "@/lib/session";
import { backendFetch } from "@/lib/api/backend-client";
import { BrandMark } from "@/components/prisme/Brand";
import SatinSphere from "@/components/givre/SatinSphere";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";

/*
 * Inscription — la même déclinaison calme du hero Givre que la
 * connexion : scène d'aube diluée, cadre éditorial d'un pixel, une
 * carte de verre dépoli. Après création du compte, la même carte
 * devient l'écran « Vérifiez vos e-mails ».
 */

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const display_name = String(formData.get("display_name") ?? "")

    try {
      const res = await backendFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, display_name }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error ?? "Inscription impossible.")
        setLoading(false)
        return
      }

      if (data.session) {
        storeSession(data.session)
        router.push("/dashboard")
        router.refresh()
        return
      }

      setSuccess(data.message)
      setLoading(false)
    } catch {
      setError("Inscription impossible. Réessayez.")
      setLoading(false)
    }
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
            "radial-gradient(36% 44% at 34% 26%, rgba(184,161,232,0.21) 0%, rgba(184,161,232,0) 70%), radial-gradient(32% 40% at 68% 68%, rgba(240,197,168,0.2) 0%, rgba(240,197,168,0) 72%)",
        }}
      />

      {/* Cadre éditorial — la page comme objet imprimé */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.14)]"
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
        <div className="relative w-full max-w-[420px]">
          <SatinSphere
            size={150}
            className="pointer-events-none absolute -right-[104px] -top-[70px] hidden lg:block"
          />
          {/* La carte porteuse — verre fort, arête allumée, ombre mauve */}
          <section className="pv-glass pv-glass--strong pv-edge pv-shadow-mauve pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="white" />
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
                <p className="mt-5 rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-white/5 px-4 py-3.5 text-[13px] leading-relaxed text-slate">
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
                <p className="pv-pill mt-4 font-mono text-[10px] uppercase tracking-[0.13em] text-slate">
                  Sans carte bancaire
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
                  className="underline decoration-[rgba(255,255,255,0.25)] underline-offset-2 transition-colors hover:text-ink"
                >
                  Conditions d’utilisation
                </Link>{" "}
                et notre{" "}
                <Link
                  href="/privacy"
                  className="underline decoration-[rgba(255,255,255,0.25)] underline-offset-2 transition-colors hover:text-ink"
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
