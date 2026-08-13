"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import PrismShell from "@/components/prisme/Shell";
import { Brand } from "@/components/prisme/Brand";
import CreationsMarquee from "@/components/prisme/CreationsMarquee";
import { RevealBlock } from "@/components/prisme/Motion";
import SilverSilk from "@/components/prisme/SilverSilk";
import GlassLens from "@/components/prisme/GlassLens";
import { CLIENT_LOGOS } from "@/lib/client-logos";
import {
  PORTFOLIO_CATEGORIES,
  type NevaDesignPortfolioItem,
} from "@/lib/neva-design-portfolio";
import { cn } from "@/lib/utils";

/*
 * Vitrine Neva Design — la galerie dans la lumière Givre.
 * Le noir a quitté la page : quatre scènes claires alternées
 * (dawn, dawn-calm, glacier, dawn), un cadre éditorial en filets
 * blancs sur le hero, pagination 01/04, typo Outfit légère en
 * encre ardoise — l'accent est un contraste de graisse, jamais
 * du gras. Les œuvres sont la seule vraie couleur de la page :
 * tirages à l'ombre mauve posés sur la brume. Un seul canal de
 * conversion : Discord. La lightbox reste la salle de projection —
 * l'unique îlot sombre autorisé.
 */

const DISCORD_URL = "https://discord.gg/nevadesign";

/* Images de secours pour les items sans image_path (rotation). */
const previewAssets = [
  "/Prime_-_preview_serveur_pack_15.png",
  "/Prime_-_preview_serveur_pack_4.png",
  "/Prime_-_preview_serveur_pack_7.png",
  "/Prime_-_preview_serveur_pack_8.png",
  "/Prime_-_preview_serveur_pack_9.png",
  "/postergrandfivem.png",
  "/postergrandfivem2.png",
  "/posterlarya.png",
  "/affiche1.png",
  "/affiche2.png",
  "/affiche3.png",
];

const NAV_ANCHORS = [
  { label: "Accueil", href: "#top" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const SERVICES = [
  {
    title: "Branding",
    description:
      "Logo, palette, direction artistique et système visuel complet pour votre serveur.",
    image: "/affiche3.png",
    span: "lg:col-span-5",
  },
  {
    title: "Affiches & posters",
    description:
      "Visuels marketing, annonces Discord et images de lancement qui donnent envie de rejoindre.",
    image: "/postergrandfivem2.png",
    span: "lg:col-span-7",
  },
  {
    title: "Packs GFX",
    description:
      "Templates, previews, overlays et assets prêts à l'emploi pour votre équipe.",
    image: "/Prime_-_preview_serveur_pack_7.png",
    span: "lg:col-span-7",
  },
  {
    title: "Landing pages",
    description:
      "Pages courtes, sombres et précises pour poser votre image avant le lancement.",
    image: "/ordi.png",
    span: "lg:col-span-5",
  },
];

type DisplayItem = NevaDesignPortfolioItem & { displayImage: string };

function frameClasses(item: DisplayItem) {
  const isLogo = item.category === "Logos" || item.category === "Branding";
  const isPack = item.category === "Packs";
  if (isLogo) return "col-span-1 lg:col-span-3 [&_.pv-frame]:aspect-square";
  if (isPack) {
    return cn(
      "col-span-2 lg:col-span-6 [&_.pv-frame]:aspect-video",
      item.layout === "wide" && "lg:col-span-12"
    );
  }
  // Affiches et autres
  return cn(
    "col-span-1 lg:col-span-4 [&_.pv-frame]:aspect-[4/5]",
    item.layout === "wide" && "col-span-2 lg:col-span-8 [&_.pv-frame]:aspect-video"
  );
}

export default function NevaDesignPage({
  initialPortfolioItems = [],
}: {
  initialPortfolioItems?: NevaDesignPortfolioItem[];
}) {
  const [activeFilter, setActiveFilter] = useState<string>("Tout");
  const [fullscreenItem, setFullscreenItem] = useState<DisplayItem | null>(null);

  const portfolioItems = useMemo<DisplayItem[]>(
    () =>
      initialPortfolioItems.map((item, index) => ({
        ...item,
        displayImage: item.image_path ?? previewAssets[index % previewAssets.length],
      })),
    [initialPortfolioItems]
  );

  const filters = ["Tout", ...PORTFOLIO_CATEGORIES];
  const filteredItems = useMemo(
    () =>
      activeFilter === "Tout"
        ? portfolioItems
        : portfolioItems.filter(
            (item) => item.category === activeFilter || item.tag === activeFilter
          ),
    [portfolioItems, activeFilter]
  );

  // Lightbox : Échap + verrou du scroll
  useEffect(() => {
    if (!fullscreenItem) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreenItem(null);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [fullscreenItem]);

  const isLogoPreview =
    fullscreenItem?.category === "Logos" || fullscreenItem?.category === "Branding";

  return (
    <PrismShell>
      <div id="top" className="relative bg-frost text-ink">
        {/* ── En-tête — pilule de verre ───────────────────────── */}
        <header className="fixed inset-x-0 top-0 z-[90] flex flex-col items-center px-4 pt-4 sm:px-6">
          <nav className="relative flex h-[56px] w-full max-w-[1080px] items-center justify-between rounded-full border border-[color:var(--hairline-glass)] bg-[rgba(248,249,252,0.66)] px-3 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(29,35,64,0.05),0_12px_36px_rgba(29,35,64,0.1)] backdrop-blur-xl">
            <Brand size={20} tone="ink" sub="Studio graphique" />
            <div className="hidden items-center gap-7 lg:flex">
              {NAV_ANCHORS.map((anchor) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  className="text-[13px] text-slate transition-colors duration-300 hover:text-ink"
                >
                  {anchor.label}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden text-[13px] text-slate transition-colors duration-300 hover:text-ink sm:block"
              >
                Le produit
              </Link>
              <a href="#contact" className="pv-btn min-h-[38px] px-5 text-[13px]">
                Commander
              </a>
            </div>
          </nav>
          {/* Ancres mobiles — la nav ne disparaît jamais */}
          <div className="mt-2 flex w-full max-w-[1080px] items-center justify-center gap-6 overflow-x-auto rounded-full border border-[color:var(--hairline-glass)] bg-[rgba(248,249,252,0.55)] px-5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-lg lg:hidden">
            {NAV_ANCHORS.map((anchor) => (
              <a
                key={anchor.href}
                href={anchor.href}
                className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-slate"
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </header>

        {/* ── 01 · Hero — le wordmark dans la scène dawn ──────── */}
        <section className="pv-scene">
          <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              maskImage:
                "linear-gradient(180deg, black 0%, black 55%, transparent 88%)",
              WebkitMaskImage:
                "linear-gradient(180deg, black 0%, black 55%, transparent 88%)",
            }}
          >
            <SilverSilk variant="hero" className="opacity-80" />
          </div>
          <div aria-hidden className="pv-windowlight" />
          <div aria-hidden className="pv-caustics" />

          {/* Le premier écran, serti dans le cadre éditorial */}
          <div className="relative flex min-h-[100svh] flex-col pt-[120px]">
            {/* Cadre — filets blancs, la page comme objet imprimé */}
            <div
              aria-hidden
              className="pv-fade-up pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.68)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_6px_rgba(96,84,140,0.07),0_30px_80px_rgba(96,84,140,0.13)]"
              style={{
                inset: "var(--frame-inset)",
                background:
                  "radial-gradient(115% 115% at 50% 50%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.1) 100%)",
                animationDelay: "0.2s",
              }}
            />

            <div className="absolute left-[6%] top-[20%] hidden lg:block">
              <GlassLens size={130} floatY={-10} floatDur={9} groundShadow={false} />
            </div>

            <div className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center px-5 text-center sm:px-8">
              <RevealBlock className="mb-8">
                <span className="inline-flex min-h-[32px] items-center gap-2.5 rounded-full border border-[color:var(--hairline-glass)] bg-[rgba(255,255,255,0.6)] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(29,35,64,0.05),0_10px_24px_rgba(29,35,64,0.06)]">
                  <span className="pv-breathe h-[5px] w-[5px] rounded-full bg-periwinkle" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                    Studio graphique · FiveM & GTA RP
                  </span>
                </span>
              </RevealBlock>
              <RevealBlock delay={0.1}>
                <h1 className="pv-display text-[clamp(3.4rem,12vw,10rem)] leading-[0.98]">
                  Neva <span className="pv-display-strong">Design</span>
                </h1>
              </RevealBlock>
              <RevealBlock delay={0.22}>
                <p className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.75] text-slate sm:text-[16px]">
                  Identités visuelles, affiches et packs GFX pour les serveurs qui
                  veulent une image nette, rare et mémorable.
                </p>
              </RevealBlock>
              <RevealBlock
                delay={0.34}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <a href="#portfolio" className="pv-btn">
                  Voir les projets
                </a>
                <a href="#contact" className="pv-btn pv-btn--ghost">
                  Commander
                  <ArrowRight size={15} />
                </a>
              </RevealBlock>
            </div>

            {/* Pagination — le folio de la page imprimée */}
            <div
              className="pv-page-num absolute hidden lg:flex"
              style={{
                left: "calc(var(--frame-inset) + 28px)",
                bottom: "calc(var(--frame-inset) + 22px)",
              }}
            >
              <b>01</b>
              <span>/04</span>
            </div>
          </div>

          {/* Fleuve de créations — serti de deux filets blancs */}
          <RevealBlock delay={0.3} className="relative mt-4">
            <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.55)]" />
            <CreationsMarquee duration={58} />
            <div aria-hidden className="h-px w-full bg-[rgba(255,255,255,0.55)]" />
          </RevealBlock>

          {/* Logos clients — encre noire sur la brume */}
          <div className="relative py-5">
            <div
              className="overflow-hidden"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
              }}
            >
              <div
                className="pv-marquee"
                style={{ "--marquee-duration": "44s" } as React.CSSProperties}
              >
                {[false, true].map((hidden) => (
                  <div
                    key={hidden ? "b" : "a"}
                    aria-hidden={hidden}
                    className="flex shrink-0 items-center gap-14 pr-14"
                  >
                    {CLIENT_LOGOS.map((logo) => (
                      <span
                        key={`${logo.src}-${hidden ? "b" : "a"}`}
                        className="flex h-9 w-24 items-center justify-center"
                      >
                        <Image
                          src={logo.src}
                          alt={hidden ? "" : logo.alt}
                          width={96}
                          height={36}
                          className="max-h-9 w-auto object-contain opacity-40 [filter:brightness(0)] transition-opacity duration-300 hover:opacity-70"
                        />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 · Portfolio — la grille sur la brume calme ───── */}
        {portfolioItems.length > 0 ? (
          <section id="portfolio" className="pv-scene">
            <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
            <div aria-hidden className="pv-caustics" />
            <div className="relative mx-auto max-w-[1200px] px-5 pb-28 pt-28 sm:px-8 lg:pb-36 lg:pt-32">
              <div className="flex flex-wrap items-end justify-between gap-10">
                <RevealBlock>
                  <div className="pv-page-num [&>b]:text-[52px]">
                    <b>02</b>
                    <span>/04</span>
                  </div>
                  <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                    Portfolio sélectionné
                  </p>
                  <h2 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.4rem)] font-light leading-[1.08] tracking-[-0.015em] text-slate">
                    Chaque serveur,{" "}
                    <span className="font-medium text-ink">une signature.</span>
                  </h2>
                </RevealBlock>
                {/* Filtres — pilules translucides, l'actif porte l'encre */}
                <RevealBlock delay={0.15} className="flex flex-wrap items-center gap-2 pb-2">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all duration-300",
                        activeFilter === filter
                          ? "border-transparent bg-ink text-white shadow-[0_1px_2px_rgba(29,35,64,0.18),0_8px_20px_rgba(29,35,64,0.2)]"
                          : "border-[color:var(--hairline-glass)] bg-[rgba(255,255,255,0.6)] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-white/80 hover:text-ink"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </RevealBlock>
              </div>

              {/* Grille — les œuvres, seule vraie couleur de la page */}
              <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-12 lg:gap-6">
                {filteredItems.map((item) => {
                  const isLogo = item.category === "Logos" || item.category === "Branding";
                  return (
                    <figure key={item.id} className={cn("group", frameClasses(item))}>
                      <button
                        type="button"
                        onClick={() => setFullscreenItem(item)}
                        aria-label={`Ouvrir ${item.title} en plein écran`}
                        className="block w-full cursor-pointer text-left"
                      >
                        <span
                          className={cn(
                            "pv-frame pv-print pv-shadow-mauve relative block w-full overflow-hidden !rounded-[16px]",
                            isLogo && "!bg-[rgba(255,255,255,0.66)]"
                          )}
                        >
                          <Image
                            src={item.displayImage}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1024px) 50vw, 30vw"
                            className={cn(
                              "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                              isLogo ? "object-contain p-7" : "object-cover"
                            )}
                          />
                          <span
                            aria-hidden
                            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.7)] bg-[rgba(255,255,255,0.85)] opacity-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_2px_6px_rgba(29,35,64,0.12)] transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <ArrowUpRight size={14} className="text-ink" />
                          </span>
                        </span>
                      </button>
                      <figcaption className="mt-3 flex items-baseline justify-between gap-3">
                        <span className="truncate text-[13px] text-slate transition-colors duration-300 group-hover:text-ink">
                          {item.title}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
                          {item.category}
                        </span>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 03 · Services — tirages posés sur le glacier ────── */}
        <section id="services" className="pv-scene">
          <div aria-hidden className="pv-scene-bg pv-scene-bg--glacier" />
          <div aria-hidden className="pv-caustics" />
          <div className="relative mx-auto max-w-[1200px] px-5 pb-28 pt-28 sm:px-8 lg:pb-32 lg:pt-32">
            <div className="flex flex-wrap items-end justify-between gap-10">
              <RevealBlock>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                  Services
                </p>
                <h2 className="mt-4 font-display text-[clamp(2rem,4.6vw,3.4rem)] font-light leading-[1.08] tracking-[-0.015em] text-slate">
                  Quatre métiers,{" "}
                  <span className="font-medium text-ink">une exigence.</span>
                </h2>
              </RevealBlock>
              {/* Pagination à droite — miroir du portfolio */}
              <RevealBlock delay={0.1}>
                <div className="pv-page-num [&>b]:text-[52px]">
                  <b>03</b>
                  <span>/04</span>
                </div>
              </RevealBlock>
            </div>
            <div className="mt-14 grid gap-x-5 gap-y-10 lg:grid-cols-12">
              {SERVICES.map((service, index) => {
                const wide = service.span === "lg:col-span-7";
                return (
                  <RevealBlock
                    key={service.title}
                    delay={(index % 2) * 0.08}
                    className={service.span}
                  >
                    <a href="#contact" className="group block">
                      {/* L'œuvre plein cadre — plus aucun voile d'encre */}
                      <span
                        className={cn(
                          "pv-print pv-shadow-mauve relative block w-full overflow-hidden",
                          wide ? "aspect-video" : "aspect-[4/3]"
                        )}
                      >
                        <Image
                          src={service.image}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 90vw, 45vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                        />
                      </span>
                      {/* La légende respire sur la scène */}
                      <span className="mt-4 flex items-start justify-between gap-4">
                        <span className="block">
                          <span className="block text-[17px] font-medium tracking-[-0.01em] text-ink">
                            {service.title}
                          </span>
                          <span className="mt-1.5 block max-w-md text-[13.5px] leading-[1.65] text-slate">
                            {service.description}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={17}
                          className="mt-1 shrink-0 text-mist transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        />
                      </span>
                    </a>
                  </RevealBlock>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 04 · Contact — la finale, scène dawn rendue au calme ── */}
        <section id="contact" className="pv-scene">
          <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-80"
            style={{
              maskImage:
                "radial-gradient(88% 76% at 50% 54%, black 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(88% 76% at 50% 54%, black 40%, transparent 100%)",
            }}
          >
            <SilverSilk variant="finale" />
          </div>
          <div aria-hidden className="pv-windowlight opacity-60" />
          <div aria-hidden className="pv-caustics" />
          <hr className="pv-rule--beam relative" />

          <div className="relative mx-auto max-w-[1200px] px-5 py-32 text-center sm:px-8 lg:py-44">
            <RevealBlock>
              <div className="flex justify-center">
                <div className="pv-page-num [&>b]:text-[52px]">
                  <b>04</b>
                  <span>/04</span>
                </div>
              </div>
              <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                Contact
              </p>
              <h2 className="mx-auto mt-5 max-w-4xl font-display text-[clamp(2.2rem,5.6vw,4.6rem)] font-light leading-[1.08] tracking-[-0.015em] text-slate">
                Votre image mérite{" "}
                <span className="font-medium text-ink">un studio.</span>
              </h2>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="mx-auto mt-7 max-w-md text-[15px] leading-[1.75] text-slate">
                La commande et le suivi se font sur Discord : décrivez votre
                serveur, le studio s’occupe du reste.
              </p>
            </RevealBlock>
            <RevealBlock delay={0.28} className="mt-11">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pv-btn"
              >
                Commander sur Discord
                <ArrowUpRight size={16} />
              </a>
            </RevealBlock>
          </div>

          {/* Bas de page — un filet blanc sur la scène */}
          <div className="relative border-t border-[rgba(255,255,255,0.55)]">
            <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-4 px-5 py-7 sm:flex-row sm:items-center sm:px-8">
              <Brand size={18} tone="ink" />
              <p className="font-mono text-[11px] tracking-[0.1em] text-mist">
                © {new Date().getFullYear()} Neva Design · Tous droits réservés.
              </p>
              <Link href="/" className="pv-link inline-flex items-center gap-2 text-[13px]">
                Découvrir le produit Neva Design
                <ArrowRight size={14} className="text-[color:var(--num-color)]" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Lightbox — la salle de projection reste sombre ──── */}
        {fullscreenItem ? (
          <div
            className="pv-dark-island fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={fullscreenItem.title}
          >
            <div
              className="absolute inset-0 bg-[rgba(12,14,28,0.9)] backdrop-blur-md"
              onClick={() => setFullscreenItem(null)}
              aria-hidden
            />
            <div className="pv-scale-in relative w-full max-w-5xl">
              <button
                onClick={() => setFullscreenItem(null)}
                aria-label="Fermer l'aperçu plein écran"
                className="absolute -top-12 right-0 cursor-pointer rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
              <div
                className={cn(
                  "pv-edge relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.12)] bg-abyss shadow-[0_6px_14px_rgba(0,0,0,0.4),0_52px_120px_rgba(0,0,0,0.6)]",
                  isLogoPreview ? "aspect-square sm:aspect-[4/3]" : "aspect-video"
                )}
              >
                <Image
                  src={fullscreenItem.displayImage}
                  alt={fullscreenItem.title}
                  fill
                  sizes="90vw"
                  className={cn("object-contain", isLogoPreview && "p-10")}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <p className="text-lg font-medium tracking-[-0.01em] text-white">
                  {fullscreenItem.title}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--num-color)]">
                  {fullscreenItem.category}
                </p>
              </div>
              {fullscreenItem.description ? (
                <p className="mt-1 max-w-xl text-sm text-[color:var(--text-2)]">
                  {fullscreenItem.description}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </PrismShell>
  );
}
