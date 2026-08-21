import type { Metadata } from "next";
import { BrandMark } from "@/components/prisme/Brand";

/*
 * /pay/success — retour de l'Embedded Checkout (return_url).
 * Confirmation ✅ + retour direct au ticket Discord.
 */

export const metadata: Metadata = {
  title: "Paiement confirmé",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BOT_API = (process.env.BOT_PAY_API_URL ?? "http://localhost:4100").replace(/\/$/, "");

type Infos = { numero: number; retour_discord: string; produit: { nom: string; emoji: string } } | null;

async function chargerInfos(sessionId: string | undefined): Promise<Infos> {
  if (!sessionId) return null;
  try {
    const res = await fetch(`${BOT_API}/api/pay/${encodeURIComponent(sessionId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Infos;
  } catch {
    return null;
  }
}

export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const infos = await chargerInfos(session_id);

  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      <div aria-hidden className="pv-auth-bg" />
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-7 sm:px-10">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">ΛV Neva Design</span>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">Paiement</span>
      </header>

      <main className="relative z-10 flex min-h-[100svh] items-center justify-center px-6 py-24">
        <div className="w-full max-w-[440px]">
          <section className="pv-auth-card pv-fade-up px-8 py-10 text-center">
            <BrandMark size={26} tone="white" className="mx-auto" />
            <p aria-hidden className="mt-7 text-[44px] leading-none">✅</p>
            <h1 className="pv-display mt-5 text-[clamp(1.7rem,5.4vw,2.15rem)] leading-[1.12]">
              Paiement <span className="font-medium text-ink">confirmé</span>.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              {infos
                ? `Merci ! La commande #${String(infos.numero).padStart(4, "0")} — ${infos.produit.emoji} ${infos.produit.nom} — est réglée.`
                : "Merci ! Ton paiement est bien enregistré."}{" "}
              La confirmation vient d&apos;arriver dans ton ticket, l&apos;équipe enchaîne sur ta création.
            </p>
            {infos?.retour_discord ? (
              <a href={infos.retour_discord} className="pv-btn mt-8 w-full">
                Retour au ticket
              </a>
            ) : (
              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                Retrouve l&apos;équipe dans ton ticket Discord
              </p>
            )}
            <p className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
              🔒 Reçu Stripe envoyé par e-mail
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
