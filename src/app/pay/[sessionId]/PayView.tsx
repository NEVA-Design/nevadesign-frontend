"use client";

/*
 * La vue de paiement v2 — le pattern des checkouts premium :
 * SPLIT PLEINE HAUTEUR. À gauche, le panneau de MARQUE (noir
 * profond, l'œuvre du studio voilée en toile de fond, facture
 * détaillée, réassurances, badges cartes) ; à droite, la colonne
 * CLAIRE pleine hauteur du formulaire Stripe — pas de cartes qui
 * flottent, deux mondes soudés par une hairline. Mobile : marque
 * compacte en haut, formulaire plein écran dessous.
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

/* ── Badges cartes — épurés, dessinés en code ───────────────── */

function BadgesCartes() {
  const base =
    "flex h-7 min-w-[44px] items-center justify-center rounded-[6px] border border-[rgba(255,255,255,0.14)] bg-white/[0.05] px-2";
  return (
    <span className="flex items-center gap-2" aria-label="Visa, Mastercard, Carte Bancaire">
      <span className={base}>
        <span className="text-[10px] font-bold italic tracking-tight text-[#F2EFE9]">VISA</span>
      </span>
      <span className={base} aria-hidden>
        <span className="relative flex items-center">
          <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B]/85" />
          <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#F79E1B]/85" />
        </span>
      </span>
      <span className={base}>
        <span className="text-[10px] font-bold tracking-tight text-[#F2EFE9]">CB</span>
      </span>
    </span>
  );
}

/* ── Le Checkout embarqué ───────────────────────────────────── */

function CheckoutStripe({ clientSecret, fake, montant }: { clientSecret: string | null; fake: boolean; montant: string }) {
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
    /* recette visuelle sans Stripe : maquette réaliste du formulaire */
    const label = "mb-1.5 block text-[11px] font-medium tracking-[0.02em] text-black/55";
    const champ = "h-11 rounded-[8px] border border-black/[0.14] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]";
    return (
      <div className="flex flex-col gap-4" aria-hidden>
        <div>
          <span className={label}>Adresse e-mail</span>
          <div className={champ} />
        </div>
        <div>
          <span className={label}>Informations de la carte</span>
          <div className="overflow-hidden rounded-[8px] border border-black/[0.14] bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex h-11 items-center justify-between border-b border-black/[0.08] px-3">
              <span className="text-[13px] text-black/35">1234 1234 1234 1234</span>
              <BadgesCartesClair />
            </div>
            <div className="grid grid-cols-2">
              <div className="flex h-11 items-center border-r border-black/[0.08] px-3 text-[13px] text-black/35">MM / AA</div>
              <div className="flex h-11 items-center px-3 text-[13px] text-black/35">CVC</div>
            </div>
          </div>
        </div>
        <div>
          <span className={label}>Nom du titulaire</span>
          <div className={champ} />
        </div>
        <button className="mt-2 h-12 rounded-[10px] bg-[#0A0A0A] text-[14.5px] font-medium text-[#F2EFE9]" tabIndex={-1}>
          Payer {montant}
        </button>
        <p className="text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-black/35">
          Aperçu de démonstration — le formulaire sécurisé Stripe s&apos;affiche ici
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[440px]">
      {etat === "chargement" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-black/50">
          <span className="pv-spinner h-6 w-6 border-black/25 border-t-black/70" aria-hidden />
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em]">Ouverture du paiement…</p>
        </div>
      ) : null}
      {etat === "erreur" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-[15px] font-medium text-black/80">Le formulaire n&apos;a pas pu se charger.</p>
          <p className="text-[13px] text-black/50">
            Rechargez la page. Si le problème persiste, contactez l&apos;équipe dans votre ticket Discord.
          </p>
        </div>
      ) : null}
      <div ref={hote} className={etat === "pret" ? "" : "invisible"} />
    </div>
  );
}

function BadgesCartesClair() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <span className="flex h-5 items-center rounded-[4px] border border-black/10 px-1 text-[8px] font-bold italic text-black/60">VISA</span>
      <span className="relative flex items-center">
        <span className="h-3 w-3 rounded-full bg-[#EB001B]/70" />
        <span className="-ml-1 h-3 w-3 rounded-full bg-[#F79E1B]/70" />
      </span>
    </span>
  );
}

/* ── États pleine carte (expirée / introuvable / payée) ─────── */

function EtatSeul({ emoji, titre, texte, lien }: { emoji: string; titre: string; texte: string; lien?: { href: string; label: string } }) {
  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      <div aria-hidden className="pv-auth-bg" />
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-7 sm:px-10">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">ΛV Neva Design</span>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">Paiement</span>
      </header>
      <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24">
        <div className="w-full max-w-[430px]">
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
      </main>
    </div>
  );
}

/* ── La page ────────────────────────────────────────────────── */

export default function PayView({ commande }: { commande: PayData | null }) {
  if (!commande) {
    return (
      <EtatSeul
        emoji="🔎"
        titre="Commande introuvable."
        texte="Ce lien de paiement ne correspond à aucune commande — il a peut-être été remplacé. Retournez dans votre ticket Discord : le lien le plus récent s'y trouve."
      />
    );
  }
  if (commande.statut === "paid") {
    return (
      <EtatSeul
        emoji="✅"
        titre="Commande déjà réglée."
        texte={`Le paiement de la commande ${nf(commande.numero)} a bien été enregistré — l'équipe l'a prise en charge.`}
        lien={{ href: commande.retour_discord, label: "Retour au ticket" }}
      />
    );
  }
  if (commande.statut !== "pending" || !commande.client_secret) {
    return (
      <EtatSeul
        emoji="⏰"
        titre="Session expirée."
        texte={`Le lien de paiement de la commande ${nf(commande.numero)} n'est plus valable. Demandez à l'équipe d'en générer un nouveau depuis votre ticket Discord.`}
        lien={{ href: commande.retour_discord, label: "Retour au ticket" }}
      />
    );
  }

  const p = commande.produit;
  const montant = euro(commande.prix_cents);

  return (
    <div className="relative min-h-[100svh] text-ink lg:grid lg:grid-cols-[minmax(460px,46%)_minmax(0,1fr)]">
      {/* ═══ Panneau de marque — noir sobre (le satin du site
          respire derrière, aucun ornement : registre de facture) ═══ */}
      <section className="relative flex flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.5)_0%,rgba(6,6,6,0.72)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 py-8 sm:px-10 lg:py-12">
          <header className="flex items-center justify-between">
            <BrandMark size={26} tone="white" />
            <a
              href={commande.retour_discord}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist transition-colors hover:text-ink"
            >
              ← Retour au ticket
            </a>
          </header>

          <div className="mt-10 lg:mt-16">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              Commande {nf(commande.numero)} — Neva Design Studio
            </p>
            <h1 className="pv-display mt-4 flex items-center gap-3 text-[clamp(1.5rem,3.2vw,2rem)] leading-[1.15]">
              {p.image_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.image_url} alt="" className="h-12 w-12 rounded-[10px] border border-[rgba(255,255,255,0.14)] object-cover" />
              ) : (
                <span aria-hidden className="text-[30px] leading-none">{p.emoji}</span>
              )}
              <span>{p.nom}</span>
            </h1>
            {p.description ? (
              <p className="mt-3 max-w-[400px] text-[13.5px] leading-relaxed text-slate">{p.description}</p>
            ) : null}
          </div>

          {/* La facture — le sérieux d'un vrai document */}
          <div className="mt-9 rounded-[14px] border border-[rgba(255,255,255,0.1)] bg-white/[0.03]">
            <div className="flex items-baseline justify-between px-5 py-3.5 text-[13.5px]">
              <span className="text-slate">{p.nom}</span>
              <span className="font-mono text-[13px] text-ink">{montant}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[rgba(255,255,255,0.08)] px-5 py-3.5 text-[13.5px]">
              <span className="text-slate">Prestation de services numériques</span>
              <span className="font-mono text-[13px] text-mist">Prix TTC</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[rgba(255,255,255,0.12)] px-5 py-4">
              <span className="text-[13.5px] font-medium text-ink">Total</span>
              <span className="pv-display text-[24px] leading-none text-ink">{montant}</span>
            </div>
          </div>

          {/* Réassurances — factuelles, registre professionnel */}
          <ul className="mt-8 flex flex-col gap-3 text-[13px] leading-snug text-slate">
            {[
              "Confirmation immédiate de la commande dans votre ticket Discord",
              "Prise en charge par l'équipe dès réception du règlement",
              "Reçu détaillé envoyé par e-mail — paiement unique, sans abonnement",
            ].map((l) => (
              <li key={l} className="flex items-start gap-3">
                <span aria-hidden className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[rgba(242,239,233,0.35)] text-[9px] text-[#F2EFE9]">
                  ✓
                </span>
                {l}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.1)] pt-6 lg:mt-auto">
            <p className="font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.14em] text-mist">
              🔒 Paiement sécurisé — chiffrement SSL
              <br />
              Données bancaires traitées exclusivement par Stripe
            </p>
            <BadgesCartes />
          </div>
        </div>
      </section>

      {/* ═══ Colonne formulaire — claire, pleine hauteur ═══ */}
      <section className="relative flex min-h-[560px] flex-col border-t border-[rgba(255,255,255,0.12)] bg-[#F7F5F0] lg:min-h-0 lg:border-l lg:border-t-0">
        <div className="mx-auto flex w-full max-w-[540px] flex-1 flex-col px-5 py-10 sm:px-10 lg:justify-center lg:py-16">
          <p className="mb-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-black/45">
            Règlement — {montant}
          </p>
          <CheckoutStripe clientSecret={commande.client_secret} fake={Boolean(commande.fake)} montant={montant} />
          <p className="mt-8 text-center font-mono text-[9.5px] uppercase tracking-[0.16em] text-black/35">
            Transactions sécurisées et traitées par <span className="font-bold text-black/55">Stripe</span>
          </p>
        </div>
      </section>
    </div>
  );
}
