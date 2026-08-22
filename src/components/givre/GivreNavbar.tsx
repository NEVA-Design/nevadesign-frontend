"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import LanguageSelector from "@/components/LanguageSelector";
import { Brand } from "@/components/prisme/Brand";
import { cn } from "@/lib/utils";

/* Pivot 20/08 : le studio et la Generative portent la navigation ;
   Tarifs/Packs (legacy) sortent avec LEGACY_PRICING. */
const NAV_LINKS = [
  { key: "nav.studio2", fallback: "Le studio", href: "#studio" },
  { key: "nav.reviews", fallback: "Avis", href: "#avis" },
  { key: "nav.creations", fallback: "Créations", href: "#creations" },
  { key: "nav.generative", fallback: "Neva Generative", href: "#generative" },
  { key: "nav.portfolio", fallback: "Portfolio", href: "/neva-design" },
];

/*
 * Navigation Givre — l'UI chuchote : petites capitales mono très
 * espacées posées dans le cadre éditorial du hero. Transparente en
 * tête de page (elle appartient au cadre), voile de verre pleine
 * largeur dès qu'on quitte la scène.
 */
export default function GivreNavbar() {
  const { t } = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  /* §phase 4 — l'état ACTIF de la nav : la section visible allume
     son lien (filet argent). Observateur léger, jamais de scroll
     handler par lien. */
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
      /* en haut de page (le hero), aucune section de nav n'est
         active — l'observateur garderait la dernière visitée */
      if (window.scrollY < window.innerHeight * 0.4) setActiveHash("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href)
      .filter((h) => h.startsWith("#"))
      .map((h) => h.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveHash(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-32% 0px -58% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[90] transition-[background-color,border-color,box-shadow] duration-500",
        scrolled
          ? "border-b border-[rgba(255,255,255,0.07)] bg-[rgba(8,8,8,0.66)] shadow-[0_1px_2px_rgba(0,0,0,0.40)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-[72px] w-full items-center justify-between"
        style={{
          paddingLeft: "calc(var(--frame-inset) + 26px)",
          paddingRight: "calc(var(--frame-inset) + 26px)",
        }}
      >
        <Brand size={19} tone="white" />

        {/* Desktop — capitales espacées ; le lien de la section
            visible porte un filet argent (état actif, §phase 4) */}
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === activeHash;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 hover:text-ink",
                  isActive ? "text-ink" : "text-slate"
                )}
              >
                {t(link.key, link.fallback)}
                <span
                  aria-hidden
                  className={cn(
                    "absolute -bottom-[9px] left-0 right-0 h-px bg-[color:var(--color-argent)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive ? "scale-x-100 opacity-80" : "scale-x-0 opacity-0"
                  )}
                  style={{ transformOrigin: "left center" }}
                />
              </Link>
            );
          })}
        </div>
        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSelector />
          <Link
            href="/login"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate transition-colors duration-300 hover:text-ink"
          >
            {t("common.login", "Connexion")}
          </Link>
          <Link
            href="/signup"
            className="pv-btn !min-h-0 h-9 px-5 text-[12.5px] font-normal"
          >
            {t("common.getStarted", "Commencer")}
          </Link>
        </div>

        {/* Mobile */}
        <button
          className="rounded-full p-2 text-ink lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} strokeWidth={1.6} />
        </button>
      </nav>

      {/* Menu mobile plein écran — même monde, plus calme */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-[95] flex flex-col overflow-hidden lg:hidden">
          <div className="pv-scene-bg--dawn-calm absolute inset-0" />
          <div className="pv-windowlight absolute inset-0" />
          <div className="relative flex h-[72px] items-center justify-between border-b border-[rgba(255,255,255,0.07)] px-6">
            <Brand size={19} tone="white" />
            <button
              className="rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.06)] p-2 text-ink"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
            >
              <X size={20} strokeWidth={1.6} />
            </button>
          </div>
          <div className="relative flex flex-1 flex-col justify-between px-7 pb-10 pt-8">
            <div className="flex flex-col">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="pv-fade-up flex items-baseline justify-between border-b border-[rgba(255,255,255,0.07)] py-5"
                  style={{ animationDelay: `${0.05 + index * 0.055}s` }}
                >
                  <span className="pv-display text-[27px] text-slate">
                    {t(link.key, link.fallback)}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.16em] text-mist">
                    0{index + 1}
                  </span>
                </Link>
              ))}
            </div>
            <div className="pv-fade-up flex flex-col gap-3" style={{ animationDelay: "0.4s" }}>
              <div className="mb-2 flex items-center justify-between">
                <LanguageSelector />
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate"
                >
                  {t("common.login", "Connexion")}
                </Link>
              </div>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="pv-btn w-full"
              >
                {t("common.startFree", "Commencer gratuitement")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
