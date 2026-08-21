import type { Metadata } from "next";
import PayView, { type PayData } from "./PayView";

/*
 * /pay/<session> — la page de paiement des commandes Discord du
 * studio (bot Neva). Récap à gauche (carte encre, même grammaire
 * que /login), Stripe Embedded Checkout à droite dans un panneau
 * ivoire. Les données viennent de l'API du bot (le sessionId
 * cs_… fait office de jeton : non devinable).
 */

export const metadata: Metadata = {
  title: "Paiement sécurisé",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const BOT_API = (process.env.BOT_PAY_API_URL ?? "http://localhost:4100").replace(/\/$/, "");

async function chargerCommande(sessionId: string): Promise<PayData | null> {
  try {
    const res = await fetch(`${BOT_API}/api/pay/${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PayData;
  } catch {
    return null;
  }
}

export default async function PayPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const commande = await chargerCommande(sessionId);
  return <PayView commande={commande} />;
}
