'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/prisme/Brand";
import { Button } from "@/components/ui/button";
import { Input, Label, FormMessage } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/client";

/*
 * Mot de passe oublié — le lien existait sur /login et menait à un
 * 404 (run 3, LOT 5). Même scène calme que la connexion : une seule
 * carte, un seul champ, un seul geste.
 */

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      setError("Renseignez votre adresse e-mail.");
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
      });
      if (resetError) {
        setError("L'envoi a échoué. Réessayez dans un instant.");
      } else {
        setSent(true);
      }
    } catch {
      setError("L'envoi a échoué. Réessayez dans un instant.");
    }
    setLoading(false);
  }

  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(36% 44% at 34% 26%, rgba(164,139,232,0.21) 0%, rgba(164,139,232,0) 70%), radial-gradient(32% 40% at 68% 68%, rgba(239,184,148,0.2) 0%, rgba(239,184,148,0) 72%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.55)]"
        style={{ inset: "var(--frame-inset)" }}
      />

      <header
        className="absolute z-20 flex items-center justify-between"
        style={{
          top: "calc(var(--frame-inset) + 18px)",
          left: "calc(var(--frame-inset) + 22px)",
          right: "calc(var(--frame-inset) + 22px)",
        }}
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.6} />
          Retour à la connexion
        </Link>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">
          Mot de passe
        </span>
      </header>

      <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24 sm:px-8">
        <div className="relative w-full max-w-[420px]">
          <section className="pv-glass pv-glass--strong pv-edge pv-shadow-mauve pv-fade-up px-6 py-8 sm:px-9 sm:py-10">
            <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
              <BrandMark size={24} tone="ink" />
            </Link>

            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              Mot de passe oublié
            </p>
            <h1 className="pv-display mt-3 text-[clamp(1.8rem,5.6vw,2.25rem)] leading-[1.12]">
              On vous renvoie <span className="font-medium text-ink">la clé</span>.
            </h1>
            <p className="mt-3 max-w-[320px] text-sm leading-relaxed text-slate">
              Saisissez l'adresse de votre compte : vous recevrez un lien
              sécurisé pour définir un nouveau mot de passe.
            </p>

            {error ? (
              <FormMessage tone="error" className="mt-6">
                {error}
              </FormMessage>
            ) : null}

            {sent ? (
              <FormMessage tone="success" className="mt-6">
                C'est envoyé. Vérifiez votre boîte mail (et les indésirables) —
                le lien reste valable une heure.
              </FormMessage>
            ) : (
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
                      Envoi…
                    </>
                  ) : (
                    "Recevoir le lien"
                  )}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
              <Link href="/login" className="transition-colors hover:text-ink">
                Se connecter
              </Link>
              <span className="mx-2" aria-hidden>
                ·
              </span>
              <Link href="/signup" className="transition-colors hover:text-ink">
                Créer un compte
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
