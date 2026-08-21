"use client";

/*
 * La vue de paiement — même cimaise que /login : satin vivant nu,
 * carte d'ENCRE MATE pour le récap, panneau IVOIRE pour le
 * Checkout Stripe (l'iframe est claire : on lui donne un cadre
 * assumé plutôt qu'un choc noir/blanc). Mobile : récap compact
 * au-dessus, checkout dessous. États designés : chargement,
 * session expirée/introuvable, déjà payée, erreur.
 */

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/prisme/Brand";

export type PayData = {
  numero: number;
  produit: { nom: string; description: string; emoji: string; image_url: string | null };
  prix_cents: number;
  devise: string;
  statut: "pending" | "paid" | "expired" | "canceled";
  expire_le: string | null;
  client_secret: string | null;
  retour_discord: string;
  fake?: boolean;
};

function euro(cents: number) {
  const [ent, dec] = (cents / 100).toFixed(2).replace(".", ",").split(",");
  return `${ent.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} €`;
}

const nf = (n: number) => `#${String(n).padStart(4, "0")}`;

/* ── Le Checkout embarqué ───────────────────────────────────── */

function CheckoutStripe({ clientSecret, fake }: { clientSecret: string | null; fake: boolean }) {
  const hote = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<"chargement" | "pret" | "erreur">("chargement");

  useEffect(() => {
    if (fake || !clientSecret) return;
    let checkout: import("@stripe/stripe-js").StripeEmbeddedCheckout | null = null;
    let annule = false;
    (async () => {
      try {
        const pk = process.env.NEXT_PUBLIC_STRIPE_PK;
        if (!pk) throw new Error("NEXT_PUBLIC_STRIPE_PK absent");
        const { loadStripe } = await import("@stripe/stripe-js");
        const stripe = await loadStripe(pk);
        if (!stripe || annule) throw new Error("Stripe indisponible");
        checkout = await stripe.createEmbeddedCheckoutPage({ clientSecret });
        if (annule || !hote.current) return;
        checkout.mount(hote.current);
        setEtat("pret");
      } catch {
        if (!annule) setEtat("erreur");
      }
    })();
    return () => {
      annule = true;
      checkout?.destroy();
    };
  }, [clientSecret, fake]);

  if (fake) {
    /* recette visuelle sans Stripe : silhouette du checkout */
    return (
      <div className="flex h-full min-h-[420px] flex-col gap-4 p-7" aria-hidden>
        <div className="h-4 w-40 rounded bg-black/10" />
        <div className="h-11 rounded-[10px] border border-black/10 bg-black/[0.04]" />
        <div className="h-4 w-24 rounded bg-black/10" />
        <div className="h-11 rounded-[10px] border border-black/10 bg-black/[0.04]" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 rounded-[10px] border border-black/10 bg-black/[0.04]" />
          <div className="h-11 rounded-[10px] border border-black/10 bg-black/[0.04]" />
        </div>
        <div className="mt-auto h-12 rounded-[12px] bg-[#0A0A0A]" />
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-black/40">
          Aperçu — le formulaire Stripe se charge ici
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[420px]">
      {etat === "chargement" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/50">
          <span className="pv-spinner h-6 w-6 border-black/30 border-t-black/70" aria-hidden />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em]">Ouverture du paiement…</p>
        </div>
      ) : null}
      {etat === "erreur" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-[15px] font-medium text-black/80">Le formulaire n&apos;a pas pu se charger.</p>
          <p className="text-[13px] text-black/50">Recharge la page — si ça persiste, préviens l&apos;équipe dans ton ticket Discord.</p>
        </div>
      ) : null}
      <div ref={hote} className={etat === "pret" ? "" : "invisible"} />
    </div>
  );
}

/* ── États pleine carte (expirée / introuvable / payée) ─────── */

function EtatSeul({ emoji, titre, texte, lien }: { emoji: string; titre: string; texte: string; lien?: { href: string; label: string } }) {
  return (
    <div className="mx-auto w-full max-w-[430px]">
      <section className="pv-auth-card pv-fade-up px-8 py-10 text-center">
        <p aria-hidden className="text-[40px] leading-none">{emoji}</p>
        <h1 className="pv-display mt-5 text-[clamp(1.6rem,5vw,2rem)] leading-[1.15]">{titre}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate">{texte}</p>
        {lien ? (
          <a href={lien.href} className="pv-btn mt-7 w-full">
            {lien.label}
          </a>
        ) : null}
      </section>
    </div>
  );
}

/* ── La page ────────────────────────────────────────────────── */

export default function PayView({ commande }: { commande: PayData | null }) {
  const contenu = (() => {
    if (!commande) {
      return (
        <EtatSeul
          emoji="🔎"
          titre="Commande introuvable."
          texte="Ce lien de paiement ne correspond à aucune commande — il a peut-être été remplacé. Retourne dans ton ticket Discord : le lien le plus récent s'y trouve."
        />
      );
    }
    if (commande.statut === "paid") {
      return (
        <EtatSeul
          emoji="✅"
          titre="Déjà réglée."
          texte={`La commande ${nf(commande.numero)} est payée — l'équipe est déjà sur ta création.`}
          lien={{ href: commande.retour_discord, label: "Retour au ticket" }}
        />
      );
    }
    if (commande.statut !== "pending" || !commande.client_secret) {
      return (
        <EtatSeul
          emoji="⏰"
          titre="Session expirée."
          texte={`Le lien de la commande ${nf(commande.numero)} n'est plus valable. Demande à l'équipe d'en générer un nouveau dans ton ticket Discord — un clic leur suffit.`}
          lien={{ href: commande.retour_discord, label: "Retour au ticket" }}
        />
      );
    }

    const p = commande.produit;
    return (
      <div className="grid w-full items-stretch gap-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-12">
        {/* Récap — carte encre */}
        <section className="pv-auth-card pv-fade-up flex flex-col px-7 py-8 sm:px-8">
          <BrandMark size={24} tone="white" />
          <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
            Commande {nf(commande.numero)}
          </p>

          <div className="mt-5 flex items-start gap-4">
            {p.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.image_url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-[12px] border border-[rgba(255,255,255,0.12)] object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.12)] bg-white/[0.04] text-[26px]" aria-hidden>
                {p.emoji}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-[17px] font-medium leading-snug text-ink">{p.nom}</h1>
              {p.description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-slate">{p.description}</p>
              ) : null}
            </div>
          </div>

          <p className="pv-display mt-7 text-[clamp(2rem,6vw,2.6rem)] leading-none text-ink">
            {euro(commande.prix_cents)}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
            TTC · paiement unique
          </p>

          <div className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-5 lg:mt-auto">
            <p className="inline-flex items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-white/[0.03] px-3 py-[6px] font-mono text-[10px] uppercase tracking-[0.14em] text-slate">
              🔒 Paiement sécurisé par Stripe
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-mist">
              Ta carte n&apos;est jamais vue par le studio. Reçu envoyé par e-mail, confirmation
              instantanée dans ton ticket Discord.
            </p>
          </div>
        </section>

        {/* Checkout — panneau ivoire */}
        <section className="pv-fade-up overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.12)] bg-[#F5F2EC] shadow-[0_24px_60px_rgba(0,0,0,0.5)]" style={{ animationDelay: "0.1s" }}>
          <CheckoutStripe clientSecret={commande.client_secret} fake={Boolean(commande.fake)} />
        </section>
      </div>
    );
  })();

  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      <div aria-hidden className="pv-auth-bg" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-7 sm:px-10">
        {commande?.retour_discord ? (
          <a
            href={commande.retour_discord}
            className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-ink"
          >
            ← Retour au ticket
          </a>
        ) : (
          <span />
        )}
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">
          Paiement
        </span>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1180px] items-center px-5 py-24 sm:px-8">
        {contenu}
      </main>
    </div>
  );
}
