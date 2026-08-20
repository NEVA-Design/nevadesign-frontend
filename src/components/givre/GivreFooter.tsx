"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import LocalTime from "@/components/prisme/LocalTime";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";
import { DISCORD_URL } from "@/lib/links";

/*
 * Finale + footer Givre — la boucle se boucle. La page s'était
 * ouverte sur la scène dawn du hero : elle s'y referme, au calme.
 * Même cadre éditorial en filets blancs, même bille de verre dans
 * le titre, rais de fenêtre et caustiques — mais le centre est
 * vide de sculpture : il n'y a plus que l'appel. Dessous, le
 * registre sur la brume claire, puis un dernier filet blanc et
 * de l'air. Plus aucun îlot noir.
 */

type FooterLink = { label: string; href: string; external?: boolean };

export default function GivreFooter() {
  const { t } = useTranslations();
  const year = new Date().getFullYear();

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      /* Pivot 20/08 : plus d'ancres Tarifs/Packs (legacy sous flag)
         — la colonne mène au studio, aux avis et à la Generative */
      title: t("footer.product", "Produit"),
      links: [
        { label: t("nav.studio2", "Le studio"), href: "#studio" },
        { label: t("nav.reviews", "Avis"), href: "#avis" },
        { label: t("nav.creations", "Créations"), href: "#creations" },
        { label: t("nav.generative", "Neva Generative"), href: "#generative" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: t("footer.company", "Studio"),
      links: [
        { label: t("footer.link.studio", "Neva Design Studio"), href: "/neva-design" },
        { label: t("footer.link.agency", "Maison mère"), href: "https://neva-agency.fr", external: true },
        { label: t("footer.link.discord", "Discord"), href: DISCORD_URL, external: true },
        { label: t("footer.link.contact", "Contact"), href: "mailto:nevapro@nevadesign.fr", external: true },
      ],
    },
    {
      /* Solutions (run 3, LOT 5) : les landings par intention de
         recherche — leur seule porte d'entrée dans la navigation */
      title: t("footer.solutions", "Solutions"),
      links: [
        /* Purge 20/08 : Miniature YouTube / Générateur de logo /
           Flyer en ligne retirés — leurs landings sont en 301
           vers les landings FiveM (SEO préservé). */
        { label: t("footer.link.fivemDesigner", "Graphiste FiveM"), href: "/graphiste-fivem" },
        { label: t("footer.link.fivemLogo", "Logo FiveM"), href: "/logo-fivem" },
        { label: t("footer.link.fivemPack", "Pack graphique FiveM"), href: "/pack-graphique-fivem" },
        { label: t("footer.link.fivemBanner", "Bannière Discord FiveM"), href: "/banniere-discord-fivem" },
        { label: t("footer.link.fivemPoster", "Affiche serveur FiveM"), href: "/affiche-serveur-fivem" },
        { label: t("footer.link.fivemLoading", "Loading screen FiveM"), href: "/loading-screen-fivem" },
      ],
    },
    {
      title: t("footer.legal", "Légal"),
      links: [
        { label: t("footer.link.privacy", "Confidentialité"), href: "/privacy" },
        { label: t("footer.link.terms", "Conditions d'utilisation"), href: "/terms" },
        { label: t("footer.link.cookies", "Cookies"), href: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="relative">
      {/* ── La finale — la scène du hero, rendue au silence ────── */}
      <section className="pv-scene relative overflow-hidden">
        <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn" />
        <div aria-hidden className="pv-windowlight" />
        <div aria-hidden className="pv-caustics" />

        {/* Le halo aurore de la finale — les deux lobes du hero,
            revenus au calme derrière le titre (D07) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(34% 42% at 38% 30%, rgba(164,139,232,0.16) 0%, rgba(164,139,232,0) 70%), radial-gradient(30% 38% at 64% 62%, rgba(239,184,148,0.14) 0%, rgba(239,184,148,0) 72%)",
          }}
        />

        {/* La sphère satinée — en périphérie de l'appel, elle
            attrape les deux lobes ; ombre de contact dessous.
            CSS pur : la matière du hero, au poids d'un gradient. */}
        <div
          aria-hidden
          className="pointer-events-none absolute hidden lg:block"
          style={{
            right: "7%",
            top: "11%",
            width: 168,
            height: 168,
            borderRadius: "999px",
            background:
              "radial-gradient(58% 52% at 33% 26%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 62%), radial-gradient(70% 66% at 68% 74%, rgba(239,184,148,0.28) 0%, rgba(239,184,148,0) 74%), radial-gradient(80% 76% at 26% 62%, rgba(164,139,232,0.24) 0%, rgba(164,139,232,0) 76%), radial-gradient(120% 120% at 50% 40%, #1E1E1E 0%, #121212 78%, #0C0C0C 100%)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.22), inset 0 -14px 26px rgba(0,0,0,0.45), 0 26px 40px -18px rgba(0,0,0,0.60)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute hidden lg:block"
          style={{
            right: "6.4%",
            top: "calc(11% + 160px)",
            width: 186,
            height: 40,
            borderRadius: "50%",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Cadre éditorial — les mêmes filets blancs que le hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.12)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_2px_6px_rgba(0,0,0,0.40),0_30px_80px_rgba(0,0,0,0.50)]"
          style={{
            inset: "var(--frame-inset)",
            background:
              "radial-gradient(115% 115% at 50% 50%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.03) 100%)",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[76vh] pv-container flex-col items-center justify-center px-6 py-28 text-center sm:px-8 lg:py-36">
          <RevealBlock>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t(
                "hero.eyebrow",
                "Studio de graphisme — Logos · Packs FiveM · Bannières · IA générative"
              )}
            </p>
          </RevealBlock>

          <RevealMask className="mt-7">
            <h2 className="mx-auto max-w-[900px] font-display pv-t-colophon font-light leading-[1.08] tracking-[-0.015em] text-slate">
              {t("footer.cta.title.a", "Publiez quelque chose dont votre communauté")}{" "}
              <span className="font-medium text-ink">
                {t("footer.cta.title.beam", "sera fière.")}
              </span>
            </h2>
          </RevealMask>

          <RevealBlock delay={0.08}>
            <p className="mx-auto mt-6 max-w-[440px] text-[15.5px] leading-[1.7] text-slate">
              {t(
                "footer.cta.subtitle",
                "Commandez au studio sur Discord, ou abonnez-vous à Neva Generative."
              )}
            </p>
          </RevealBlock>

          <RevealBlock delay={0.16}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pv-btn"
              >
                {t("footer.cta.primary", "Commander sur Discord")}
                <ArrowRight size={16} />
              </a>
              <a href="#generative" className="pv-btn pv-btn--ghost">
                {t("footer.cta.secondary", "Neva Generative")}
              </a>
            </div>
            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist">
              {t("footer.cta.note", "Réponse rapide sur Discord")}
            </p>
          </RevealBlock>
        </div>
      </section>

      {/* ── Le registre — marque et colonnes, voile sur le satin ── */}
      <div className="relative overflow-hidden border-t border-[rgba(255,255,255,0.07)] bg-[rgba(8,8,8,0.45)]">
        {/* Filigrane ΛV géant en ligne de base (D08) — le gaufrage
            de la maison, coupé par le bord bas comme une marque à
            chaud. Ink 0,04 : présence, jamais salissure. */}
        <svg
          aria-hidden
          viewBox="0 0 1441 1000"
          className="pointer-events-none absolute left-1/2 w-[min(860px,86vw)] -translate-x-1/2 fill-[rgba(255,255,255,0.04)]"
          style={{ bottom: "-34%" }}
        >
          <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
          <path d="M439.5 710 L559.2 1000 L320 1000 Z" />
          <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
          <path d="M893.4 0 L1134.1 0 L1013.7 292 Z" />
        </svg>
        <div className="relative mx-auto pv-container px-5 sm:px-8">
          <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:gap-14">
            <div>
              <Image
                src="/brand/logo-blanc.png"
                alt="Neva Design"
                width={72}
                height={50}
                className="h-[44px] w-auto"
              />
              <p className="mt-5 max-w-[30ch] text-sm leading-relaxed text-slate">
                {t(
                  "footer.baseline",
                  "Studio de graphisme & IA générative — logos, packs FiveM, bannières, scènes GTA."
                )}
              </p>
            </div>
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mb-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                  {column.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="text-[13.5px] text-slate transition-colors duration-300 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Rangée basse — copyright, heure du studio, réseaux */}
        <div className="relative border-t border-[rgba(255,255,255,0.07)]">
          <div className="mx-auto flex pv-container flex-col items-start justify-between gap-4 px-5 py-7 sm:flex-row sm:items-center sm:px-8">
            <p className="font-mono text-[11px] tracking-[0.1em] text-mist">
              © {year} Neva Design · {t("footer.rights", "Tous droits réservés.")}
            </p>
            <div className="flex items-center gap-6">
              <LocalTime />
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-slate transition-colors duration-300 hover:text-[color:var(--num-color)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.32 4.37a19.8 19.8 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/nevadesign"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-slate transition-colors duration-300 hover:text-[color:var(--num-color)]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Le dernier geste — un filet blanc aligné sur le cadre,
            puis de l'air. Le wordmark géant a disparu avec l'îlot. */}
        <div
          aria-hidden
          className="h-px bg-[rgba(255,255,255,0.22)]"
          style={{
            marginLeft: "var(--frame-inset)",
            marginRight: "var(--frame-inset)",
          }}
        />
        <div aria-hidden className="h-14" />
      </div>
    </footer>
  );
}
