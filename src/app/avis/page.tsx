import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/prisme/Brand";

/*
 * /avis — mur d'avis clients. Vrais retours (Discord), habillés de la
 * charte : fond satiné, cartes d'encre mate, étoiles IVOIRE (jamais dorées,
 * loi DA). Page marketing indexable, servie statiquement.
 */

export const metadata: Metadata = {
  title: "Avis clients — Neva Design Studio",
  description:
    "Ce que disent les créateurs FiveM et communautés qui nous font confiance : design au top, service à l'écoute, livraison rapide. Note moyenne 4,9/5.",
  alternates: { canonical: "/avis" },
};

type Avis = { nom: string; note: number; texte: string; tag?: string; produit?: string };

const AVIS: Avis[] = [
  { nom: "Nil", tag: "Client", note: 5, texte: "Direction artistique exceptionnelle, que ce soit pour le logo ou l'identité visuelle. Tout est pensé avec goût, cohérence et créativité. Ultra talentueux, à l'écoute et force de proposition. Je recommande à 100 %." },
  { nom: "Zakall", tag: "Client Premium", note: 5, texte: "Super expérience ! Réponse rapide, très à l'écoute et travail fait exactement comme demandé. Service sérieux et efficace, je referai appel sans hésiter." },
  { nom: "Rifi", note: 5, texte: "Rien à dire, excellent. Il est resté plus de 6h en vocal avec moi et a fait le pack entier devant moi. Du sérieux." },
  { nom: "Yoza", tag: "Client Premium", note: 5, texte: "Excellent travail, très réactif sur les changements. Resté en vocal avec nous un bon moment pour répondre à nos demandes, et nous a même conseillés sur le logo." },
  { nom: "izox", tag: "Client", note: 5, texte: "J'ai pris le pack à 32 €, il est juste magnifique, rapide et efficace. Je recommande à 200 %." },
  { nom: "Erox", tag: "Client", note: 5, texte: "Travail sérieux, rapide et de qualité. Très content de ma commande. Je recommande !" },
  { nom: "Miu", tag: "Client", note: 5, texte: "Excellent travail, une très bonne communication. Avoir le suivi du travail est génial. Très rapide et efficace, un staff très à l'écoute et de bon conseil." },
  { nom: "wissox", produit: "Pack n°1 + Overlay TikTok", note: 5, texte: "Service très rapide, commande reçue en même pas 15h. La DA est très soignée, 0 imperfection. Le prix pour la qualité est totalement rentable, je recommande. Allez-y !" },
  { nom: "Lukhas", note: 5, texte: "Je recommande fort. Comprend vraiment bien l'univers qu'on lui décrit. 10/10." },
  { nom: "XProDz_Tv", tag: "Client Premium", note: 5, texte: "Service de qualité. Si vous cherchez quelqu'un de professionnel dans son métier, c'est ici que ça se passe." },
  { nom: "white", tag: "Client", note: 5, texte: "On sent vraiment le travail derrière, tout est propre et bien fait. Merci beaucoup." },
  { nom: "Uminøx", tag: "Client", note: 5, texte: "Incroyable. Ils prennent le temps de comprendre ce qu'on veut et rendent un travail très bien fait. Travail sérieux, je recommande." },
  { nom: "Kyiuu", tag: "Client", note: 5, texte: "Je recommande, il fait les modifications jusqu'à ce que le produit te plaise !" },
  { nom: "kawaazaki", tag: "Client", note: 5, texte: "Excellent travail, livraison en 1 heure." },
  { nom: "Naiko", tag: "Client", produit: "Sur-mesure (2 affiches)", note: 5, texte: "Tout est parfait ! La qualité est au rendez-vous et la rapidité de livraison est irréprochable. 10/10." },
  { nom: "LR_TOTO", tag: "Client", note: 5, texte: "Produit de qualité, personnes professionnelles. Je recommande x1000." },
  { nom: "Marwane", tag: "Client", note: 5, texte: "Foncez, c'est très méchant ce qu'ils proposent." },
  { nom: "C'Pirate", tag: "Client", produit: "Logo + loading screen", note: 5, texte: "Livraison rapide et conforme à mes attentes. Travail fait avec rapidité et sérieux, merci." },
  { nom: "French.off", note: 5, texte: "Travail sérieux, résultat magnifique, je recommande !" },
  { nom: "Butcher", tag: "Client Premium", note: 5, texte: "Excellent travail, je recommande." },
  { nom: "white", tag: "Client", note: 5, texte: "Incroyable travail pour la 3ᵉ fois sur plusieurs projets. Je suis satisfait, merci." },
  { nom: "Kzk", note: 5, texte: "Juste trop chaud, je vous recommande." },
  { nom: "R3B", tag: "Client", produit: "Crédits Neva-AI", note: 5, texte: "Incroyable l'IA les brothers ! Ça va m'aider pour mes prochaines créations." },
  { nom: "tylerr", note: 5, texte: "Je recommande, design au top, servi rapidement." },
  { nom: "scarf", tag: "Client", note: 5, texte: "Travail propre et rapide, pas mal, je recommande !" },
  { nom: "Kayto", tag: "Client", note: 5, texte: "Incroyable, foncez !" },
  { nom: "Nil", tag: "Client", note: 5, texte: "Les tenues staff sont tout simplement impeccables et dignes d'un service 5 étoiles." },
  { nom: "Ryzco", tag: "Client", produit: "Logo + bannières", note: 5, texte: "Assets conformes aux attentes, propre et rapide." },
  { nom: "Marwane", tag: "Client", note: 5, texte: "Au top, comprend bien la demande et rapide, je recommande !" },
  { nom: "Zeydraxx", note: 5, texte: "Excellent travail, service de qualité, très efficace. 10/10." },
  { nom: "Naox", tag: "Client", produit: "Pack 3", note: 4, texte: "Service de qualité, rapide et sérieux. Il vous prend en vocal pour que vous présentiez votre projet." },
  { nom: "Talpa", produit: "Logo", note: 5, texte: "Incroyable, il a fait en peu de temps et j'aime trop le résultat !" },
];

const MOYENNE = "4,9";

function Etoiles({ note }: { note: number }) {
  return (
    <span aria-label={`${note} étoiles sur 5`} className="inline-flex gap-[3px] text-[13px] leading-none">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < note ? "#F2EFE9" : "rgba(255,255,255,0.16)" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function CarteAvis({ a }: { a: Avis }) {
  return (
    <figure className="pv-avis-card mb-5 break-inside-avoid rounded-[18px] px-6 py-6">
      <Etoiles note={a.note} />
      <blockquote className="mt-4 text-[14.5px] leading-relaxed text-slate">« {a.texte} »</blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-[rgba(255,255,255,0.07)] pt-4">
        <span className="text-[13px] font-medium text-ink">{a.nom}</span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">
          {a.produit ?? a.tag ?? "Client"}
        </span>
      </figcaption>
    </figure>
  );
}

export default function AvisPage() {
  return (
    <div className="pv-scene relative min-h-[100svh] text-ink">
      <div aria-hidden className="pv-auth-bg" />

      {/* En-tête */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-7 sm:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-ink"
        >
          <ArrowLeft size={12} strokeWidth={1.6} />
          Retour à l’accueil
        </Link>
        <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist sm:block">Avis clients</span>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1160px] px-6 pb-28 pt-32 sm:px-8">
        {/* Hero */}
        <section className="pv-fade-up mx-auto max-w-[720px] text-center">
          <Link href="/" aria-label="Neva Design — accueil" className="inline-flex">
            <BrandMark size={26} tone="white" className="mx-auto" />
          </Link>
          <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.24em] text-mist">Ils nous font confiance</p>
          <h1 className="pv-display mt-4 text-[clamp(2rem,6vw,3.1rem)] leading-[1.08]">
            Des créateurs qui <span className="font-medium text-ink">recommandent</span>,
            <br className="hidden sm:block" /> encore et encore.
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-relaxed text-slate">
            Logos, bannières, écrans de chargement, identités complètes. Voici ce que disent, sans filtre, les serveurs
            FiveM et communautés passés par le studio.
          </p>

          {/* Bandeau note */}
          <div className="mx-auto mt-9 flex max-w-[560px] flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <div className="flex flex-col items-center">
              <span className="pv-display text-[2rem] leading-none text-ink">{MOYENNE}<span className="text-mist text-[1.1rem]">/5</span></span>
              <span className="mt-2"><Etoiles note={5} /></span>
              <span className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">Note moyenne</span>
            </div>
            <div className="h-9 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
            <div className="flex flex-col items-center">
              <span className="pv-display text-[2rem] leading-none text-ink">50+</span>
              <span className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">Avis vérifiés</span>
            </div>
            <div className="h-9 w-px bg-[rgba(255,255,255,0.1)]" aria-hidden />
            <div className="flex flex-col items-center">
              <span className="pv-display text-[2rem] leading-none text-ink">98%</span>
              <span className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">Recommandent</span>
            </div>
          </div>
        </section>

        {/* Mur d'avis — masonry en colonnes */}
        <section className="pv-fade-up mt-16 columns-1 gap-5 sm:columns-2 lg:columns-3" style={{ animationDelay: "0.1s" }}>
          {AVIS.map((a, i) => (
            <CarteAvis key={`${a.nom}-${i}`} a={a} />
          ))}
        </section>

        {/* CTA */}
        <section className="pv-fade-up mx-auto mt-20 max-w-[560px] text-center" style={{ animationDelay: "0.15s" }}>
          <h2 className="pv-display text-[clamp(1.5rem,4vw,2rem)] leading-[1.12]">
            À ton tour de lancer <span className="font-medium text-ink">ton projet</span>.
          </h2>
          <p className="mx-auto mt-3 max-w-[420px] text-sm leading-relaxed text-slate">
            Décris ton univers, on s’occupe du reste. Livraison rapide, suivi en direct, révisions jusqu’à ce que ce soit parfait.
          </p>
        </section>
      </main>

      {/* Pied minimal */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] px-6 py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
          ΛV Neva Design Studio — <Link href="/" className="pv-link">neva-design.fr</Link>
        </p>
      </footer>
    </div>
  );
}
