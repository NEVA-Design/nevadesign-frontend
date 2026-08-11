"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Home, Images, MessageCircle, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PORTFOLIO_CATEGORIES, type NevaDesignPortfolioItem } from "@/lib/neva-design-portfolio";
import { cn } from "@/lib/utils";

const filters = ["Tout", ...PORTFOLIO_CATEGORIES];

const previewAssets = [
  "/Prime_-_preview_serveur_pack_15.png",
  "/postergrandfivem.png",
  "/Prime_-_preview_serveur_pack_4.png",
  "/posterlarya.png",
  "/Prime_-_preview_serveur_pack_7.png",
  "/affiche1.png",
  "/Prime_-_preview_serveur_pack_8.png",
  "/Prime_-_preview_serveur_pack_9.png",
  "/affiche2.png",
  "/affiche3.png",
  "/postergrandfivem2.png",
];

const clientLogos = [
  "/neva-design/work-logos/A.png",
  "/neva-design/work-logos/astologo.png",
  "/neva-design/work-logos/Dlogo.png",
  "/neva-design/work-logos/EVlogo.png",
  "/neva-design/work-logos/flashhh.png",
  "/neva-design/work-logos/gtavice.png",
  "/neva-design/work-logos/logo.png",
  "/neva-design/work-logos/logo2.png",
  "/neva-design/work-logos/logoeffet.png",
  "/neva-design/work-logos/logosmallv.png",
  "/neva-design/work-logos/S.png",
  "/neva-design/work-logos/sansfondlabete.png",
  "/neva-design/work-logos/Slogo.png",
  "/neva-design/work-logos/starkkk.png",
  "/neva-design/work-logos/Studio%20V.png",
  "/neva-design/work-logos/tbnloo.png",
  "/neva-design/work-logos/YTEA.png",
  "/neva-design/work-logos/Z.png",
];

const studioSignals = [
  { value: "01", label: "Direction", detail: "Identite premium" },
  { value: "02", label: "Production", detail: "Assets sur mesure" },
  { value: "03", label: "Delivery", detail: "Pret a publier" },
];

const serviceRail = [
  { number: "01", label: "Logo" },
  { number: "02", label: "Pack" },
  { number: "03", label: "Poster" },
  { number: "04", label: "Launch" },
];

const navItems = [
  { label: "Accueil", href: "#top", icon: Home },
  { label: "Portfolio", href: "#portfolio", icon: Images },
  { label: "Services", href: "#services", icon: ShoppingBag },
  { label: "Contact", href: "#contact", icon: UserRound },
];

function WorkImage({
  item,
}: {
  item: Pick<NevaDesignPortfolioItem, "title" | "category" | "image_path">;
}) {
  const isLogo = item.category === "Logos";
  const isContain = isLogo || item.category === "Branding";

  return (
    <Image
      src={item.image_path || previewAssets[0]}
      alt={item.title}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      className={cn(
        "transition duration-500 group-hover:scale-[1.035]",
        isContain ? "object-contain p-8 sm:p-10" : "object-cover"
      )}
    />
  );
}

function StudioSignalPanel() {
  return (
    <motion.aside
      className="studio-signal-panel hidden lg:block"
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="signal-eyebrow">Neva system</p>
      <div className="signal-line" />
      {studioSignals.map((signal) => (
        <div key={signal.value} className="signal-row">
          <span className="signal-value">{signal.value}</span>
          <span className="signal-copy">
            <span className="signal-label">{signal.label}</span>
            <span className="signal-detail">{signal.detail}</span>
          </span>
        </div>
      ))}
      <div className="signal-orbit">
        {clientLogos.slice(0, 4).map((logo, index) => (
          <motion.span
            key={logo}
            className="orbit-logo"
            animate={{ y: [0, index % 2 === 0 ? -5 : 5, 0], opacity: [0.38, 0.82, 0.38] }}
            transition={{ duration: 3.5 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image src={logo} alt="" width={24} height={24} className="h-full w-full object-contain" />
          </motion.span>
        ))}
      </div>
    </motion.aside>
  );
}

function ServiceRail() {
  return (
    <motion.aside
      className="service-rail hidden lg:flex"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="service-rail-glow" />
      <p className="service-rail-title">Creative stack</p>
      <div className="service-rail-list">
        {serviceRail.map((item) => (
          <a key={item.number} href="#services" className="service-rail-item">
            <span>{item.number}</span>
            {item.label}
          </a>
        ))}
      </div>
    </motion.aside>
  );
}

const cardTransition = {
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1] as const,
};

const workCardVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)", scale: 0.98 },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, transition: cardTransition },
  exit: { opacity: 0, y: -12, filter: "blur(8px)", scale: 0.985, transition: { duration: 0.2 } },
};

function LogoMarquee({ inHero = false }: { inHero?: boolean }) {
  return (
    <div className={cn("logo-marquee-wrapper", !inHero && "relative inset-auto py-8")}>
      <motion.div
        className="logo-marquee-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {[...clientLogos, ...clientLogos, ...clientLogos, ...clientLogos].map((logo, index) => (
          <div key={`${logo}-${index}`} className="logo-marquee-item">
            <Image src={logo} alt="" width={72} height={72} className="object-contain" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function HeroSlider() {
  return (
    <>
      <div className="slider-fade-left" />
      <div className="slider-fade-right" />
      <motion.div
        className="slider-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
      >
        {[...previewAssets, ...previewAssets].map((asset, index) => (
          <Image key={`${asset}-${index}`} src={asset} alt="" width={420} height={340} className="hero-slide-img" priority={index < 4} />
        ))}
      </motion.div>
    </>
  );
}

export default function NevaDesignPage({
  initialPortfolioItems = [],
}: {
  initialPortfolioItems?: NevaDesignPortfolioItem[];
}) {
  const [activeFilter, setActiveFilter] = useState("Tout");
  const [activeNav, setActiveNav] = useState("#top");
  const [fullscreenItem, setFullscreenItem] = useState<NevaDesignPortfolioItem | null>(null);

  const portfolioItems = useMemo(
    () =>
      initialPortfolioItems.map((item, index) => ({
        ...item,
        image_path: item.image_path ?? previewAssets[index % previewAssets.length],
      })),
    [initialPortfolioItems]
  );

  const filteredPortfolio = useMemo(
    () =>
      activeFilter === "Tout"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === activeFilter || item.tag === activeFilter),
    [activeFilter, portfolioItems]
  );
  const activeFilterIndex = filters.indexOf(activeFilter);

  useEffect(() => {
    if (!fullscreenItem) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreenItem(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreenItem]);

  return (
    <div id="top" className="neva-ediz-page">
      <style>{`
        .neva-ediz-page {
          min-height: 100vh;
          overflow: hidden;
          background: #000;
          color: #fff;
          font-family: var(--font-geist-sans), "DM Sans", sans-serif;
          position: relative;
        }
        .neva-ediz-page::before {
          content: "";
          position: fixed;
          inset: 0;
          background-image: url("/bglanding.png");
          background-size: cover;
          background-position: center;
          opacity: 0.035;
          pointer-events: none;
          z-index: 0;
        }
        .neva-noise {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.055;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.24) 0 1px, transparent 1px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.18) 0 1px, transparent 1px);
          background-size: 28px 28px, 36px 36px;
        }
        .neva-top-nav {
          position: fixed;
          top: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
        }
        .neva-nav-links {
          display: flex;
          align-items: center;
          list-style: none;
        }
        .neva-nav-links li {
          position: relative;
        }
        .neva-nav-links li + li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          height: 12px;
          width: 1px;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.12);
        }
        .neva-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 18px;
          color: rgba(255,255,255,0.35);
          font-size: 0.82rem;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: color 0.25s ease;
        }
        .neva-nav-link svg {
          width: 13px;
          height: 13px;
          opacity: 0.6;
        }
        .neva-nav-link:hover,
        .neva-nav-link.active {
          color: rgba(255,255,255,0.88);
        }
        .neva-nav-underline {
          position: absolute;
          bottom: -2px;
          left: 18px;
          right: 18px;
          height: 1px;
          background: rgba(240,182,120,0.7);
          box-shadow: 0 0 18px rgba(240,182,120,0.34);
        }
        .neva-login-fixed {
          position: fixed;
          top: 28px;
          right: 72px;
          z-index: 50;
        }
        .service-rail {
          position: fixed;
          top: 50%;
          right: 46px;
          z-index: 40;
          width: 128px;
          transform: translateY(-50%);
          flex-direction: column;
          align-items: flex-start;
          gap: 18px;
        }
        .service-rail-glow {
          position: absolute;
          left: -18px;
          top: -32px;
          width: 1px;
          height: 260px;
          background: linear-gradient(180deg, transparent, rgba(240,182,120,0.75), rgba(255,123,75,0.24), transparent);
          box-shadow: 0 0 26px rgba(240,182,120,0.28);
        }
        .service-rail-title {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: rgba(255,255,255,0.22);
          font-size: .7rem;
          letter-spacing: .22em;
          text-transform: uppercase;
        }
        .service-rail-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .service-rail-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(255,255,255,0.34);
          font-size: .74rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          transition: color .25s ease, transform .25s ease;
        }
        .service-rail-item span {
          color: rgba(240,182,120,0.55);
          font-size: .68rem;
        }
        .service-rail-item:hover {
          color: rgba(255,255,255,0.86);
          transform: translateX(-4px);
        }
        .home-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .slider-track {
          position: absolute;
          top: 50%;
          left: 0;
          display: flex;
          gap: 24px;
          pointer-events: none;
          z-index: 2;
          will-change: transform;
        }
        .hero-slide-img {
          height: 340px;
          width: auto;
          border-radius: 12px;
          opacity: 0.16;
          object-fit: cover;
          flex-shrink: 0;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 8%, black 20%, black 80%, rgba(0,0,0,0.7) 92%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.7) 8%, black 20%, black 80%, rgba(0,0,0,0.7) 92%, transparent 100%);
        }
        .slider-fade-left,
        .slider-fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 180px;
          pointer-events: none;
          z-index: 3;
        }
        .slider-fade-left { left: 0; background: linear-gradient(to right, #000, transparent); }
        .slider-fade-right { right: 0; background: linear-gradient(to left, #000, transparent); }
        .glow-left,
        .glow-right,
        .glow-center {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 4;
        }
        .glow-left {
          bottom: -280px;
          left: -120px;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255,123,75,.26), rgba(255,123,75,.08) 58%, transparent 76%);
          filter: blur(72px);
        }
        .glow-right {
          bottom: -260px;
          right: -120px;
          width: 860px;
          height: 860px;
          background: radial-gradient(circle, rgba(240,182,120,.22), rgba(255,107,125,.08) 56%, transparent 76%);
          filter: blur(82px);
        }
        .glow-center {
          bottom: -180px;
          left: 50%;
          width: 500px;
          height: 500px;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(240,182,120,.12), transparent 70%);
          filter: blur(60px);
        }
        .rim {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 80%;
          height: 2px;
          transform: translateX(-50%);
          background: linear-gradient(90deg, transparent, rgba(255,123,75,.6), rgba(240,182,120,.45), transparent);
          filter: blur(1px);
          z-index: 5;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          animation: blockIn .9s .25s cubic-bezier(.22,1,.36,1) both;
        }
        .hero-kicker {
          margin-bottom: 18px;
          color: rgba(240,182,120,0.64);
          font-size: .72rem;
          font-weight: 500;
          letter-spacing: .28em;
          text-transform: uppercase;
        }
        @keyframes blockIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .title-line {
          display: block;
          font-size: clamp(4.4rem, 10vw, 9.4rem);
          font-weight: 200;
          line-height: 0.92;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, rgba(130,130,130,0.62), rgba(255,255,255,0.9) 38%, rgba(240,182,120,0.82) 58%, rgba(110,110,110,0.5));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 36px rgba(240,182,120,0.16)) drop-shadow(0 2px 4px rgba(0,0,0,0.65));
        }
        .home-subtitle {
          margin: 18px auto 0;
          max-width: 620px;
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.8;
          color: rgba(255,255,255,0.38);
        }
        .hero-cta {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .ediz-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 18px;
          border-radius: 6px;
          color: rgba(240,182,120,0.78);
          font-size: .82rem;
          letter-spacing: .06em;
          text-transform: uppercase;
          transition: color .25s ease, background .25s ease;
        }
        .ediz-cta:hover {
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.045);
        }
        .hero-proof {
          margin: 26px auto 0;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .proof-pill {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 0 13px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 999px;
          background: rgba(255,255,255,0.025);
          color: rgba(255,255,255,0.42);
          font-size: .72rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          backdrop-filter: blur(14px);
        }
        .studio-signal-panel {
          position: absolute;
          left: 70px;
          top: 50%;
          z-index: 10;
          transform: translateY(-50%);
          width: 220px;
          margin-top: -112px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 18px;
          background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018));
          backdrop-filter: blur(18px);
          box-shadow: 0 26px 80px rgba(0,0,0,0.32);
        }
        .signal-eyebrow {
          color: rgba(240,182,120,0.62);
          font-size: .68rem;
          letter-spacing: .24em;
          text-transform: uppercase;
        }
        .signal-line {
          height: 1px;
          margin: 14px 0 10px;
          background: linear-gradient(90deg, rgba(240,182,120,0.46), rgba(255,255,255,0.06), transparent);
        }
        .signal-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.055);
        }
        .signal-value {
          color: rgba(255,255,255,0.84);
          font-size: 1.25rem;
          font-weight: 200;
        }
        .signal-copy {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .signal-label {
          color: rgba(255,255,255,0.76);
          font-size: .78rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .signal-detail {
          margin-top: 3px;
          color: rgba(255,255,255,0.3);
          font-size: .72rem;
        }
        .signal-orbit {
          display: flex;
          gap: 10px;
          padding-top: 15px;
        }
        .orbit-logo {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          padding: 6px;
          border: 1px solid rgba(255,255,255,0.075);
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
        }
        .logo-marquee-wrapper {
          position: absolute;
          bottom: 52px;
          left: 0;
          right: 0;
          z-index: 10;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
        .logo-marquee-track {
          display: flex;
          gap: 32px;
          width: max-content;
          will-change: transform;
        }
        .logo-marquee-item {
          flex-shrink: 0;
          width: 72px;
          height: 72px;
          padding: 10px;
          opacity: 0.38;
          transition: opacity .4s ease, transform .4s ease;
        }
        .logo-marquee-item:hover {
          opacity: 0.95;
          transform: scale(1.06);
        }
        .work-section {
          position: relative;
          z-index: 8;
          min-height: 100vh;
          padding: 120px 40px;
        }
        .section-label {
          display: block;
          text-align: center;
          margin-bottom: 18px;
          color: rgba(240,182,120,0.6);
          font-size: .75rem;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .section-title {
          text-align: center;
          font-size: clamp(2.2rem,5vw,3.8rem);
          font-weight: 200;
          color: rgba(255,255,255,.88);
          line-height: 1.1;
        }
        .filter-bar {
          margin: 26px auto 38px;
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-button {
          position: relative;
          overflow: hidden;
          height: 34px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: rgba(255,255,255,0.35);
          font-size: .78rem;
          transition: color .25s ease, background .25s ease, border-color .25s ease;
        }
        .filter-button span {
          position: relative;
          z-index: 2;
        }
        .filter-active-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(240,182,120,0.16), rgba(255,123,75,0.07));
          box-shadow: inset 0 0 0 1px rgba(240,182,120,0.22), 0 0 24px rgba(240,182,120,0.09);
        }
        .filter-button.active,
        .filter-button:hover {
          color: rgba(255,255,255,0.85);
          border-color: rgba(240,182,120,0.28);
          background: rgba(240,182,120,0.06);
        }
        .work-grid {
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 18px;
        }
        .work-grid.pack-grid {
          max-width: 980px;
          grid-template-columns: repeat(2, minmax(0,1fr));
        }
        .work-card {
          position: relative;
          overflow: hidden;
          min-height: 300px;
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          background: rgba(15,15,18,0.95);
          border: 1px solid rgba(255,255,255,0.08);
          transition: transform .28s ease, border-color .28s ease, box-shadow .28s ease;
        }
        .work-card.logo-card {
          background:
            radial-gradient(circle at 50% 45%, rgba(240,182,120,0.12), transparent 58%),
            linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015));
        }
        .work-card.pack-card {
          aspect-ratio: 16 / 9;
          min-height: auto;
        }
        .work-card.poster-card {
          aspect-ratio: 4 / 5;
        }
        .work-card:hover {
          transform: translateY(-4px);
          border-color: rgba(240,182,120,0.22);
          box-shadow: 0 18px 60px rgba(0,0,0,0.35);
        }
        .work-card.tall { grid-row: span 2; aspect-ratio: 1 / 2.04; min-height: 620px; }
        .work-card.wide { grid-column: span 2; aspect-ratio: 2.05 / 1; }
        .work-card.logo-card.tall,
        .work-card.logo-card.wide {
          aspect-ratio: 1 / 1;
          grid-column: auto;
          grid-row: auto;
          min-height: 300px;
        }
        .work-card.pack-card.tall,
        .work-card.pack-card.wide {
          aspect-ratio: 16 / 9;
          grid-column: auto;
          grid-row: auto;
          min-height: auto;
        }
        .work-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.86), rgba(0,0,0,0.16), transparent);
        }
        .work-meta {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 20px;
        }
        .work-cat {
          color: rgba(240,182,120,0.72);
          font-size: 10px;
          letter-spacing: .22em;
          text-transform: uppercase;
        }
        .work-title {
          margin-top: 8px;
          font-size: 1.45rem;
          font-weight: 500;
        }
        .work-arrow {
          position: absolute;
          right: 18px;
          top: 18px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.58);
          opacity: 0;
          transform: translateY(8px);
          transition: opacity .25s ease, transform .25s ease;
          backdrop-filter: blur(12px);
        }
        .work-arrow:hover {
          color: rgba(255,255,255,0.95);
          background: rgba(240,182,120,0.18);
        }
        .work-card:hover .work-arrow {
          opacity: 1;
          transform: translateY(0);
        }
        .fullscreen-preview {
          position: fixed;
          inset: 0;
          z-index: 120;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 34px;
          background:
            radial-gradient(circle at 50% 20%, rgba(240,182,120,0.16), transparent 34%),
            rgba(0,0,0,0.9);
          backdrop-filter: blur(20px);
        }
        .fullscreen-shell {
          position: relative;
          width: min(92vw, 1500px);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(8,8,8,0.92);
          box-shadow: 0 38px 120px rgba(0,0,0,0.72);
        }
        .fullscreen-shell.logo-preview,
        .fullscreen-shell.poster-preview {
          width: min(82vw, 1000px);
          height: min(82vh, 820px);
          aspect-ratio: auto;
        }
        .fullscreen-close {
          position: fixed;
          right: 28px;
          top: 28px;
          z-index: 122;
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(10,10,10,0.68);
          color: rgba(255,255,255,0.74);
          backdrop-filter: blur(16px);
          transition: color .25s ease, background .25s ease, transform .25s ease;
        }
        .fullscreen-close:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
          transform: scale(1.04);
        }
        .fullscreen-meta {
          position: fixed;
          left: 34px;
          bottom: 28px;
          z-index: 122;
          color: rgba(255,255,255,0.72);
        }
        .fullscreen-meta span {
          display: block;
          margin-bottom: 6px;
          color: rgba(240,182,120,0.7);
          font-size: .7rem;
          letter-spacing: .18em;
          text-transform: uppercase;
        }
        .fullscreen-meta strong {
          font-size: .95rem;
          font-weight: 500;
        }
        .services-grid {
          max-width: 1100px;
          margin: 44px auto 0;
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 18px;
        }
        .service-card {
          background: rgba(15,15,18,0.95);
          border-radius: 18px;
          padding: 30px 24px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .service-number {
          display: block;
          margin-bottom: 28px;
          color: rgba(240,182,120,0.42);
          font-size: .74rem;
          letter-spacing: .18em;
        }
        .service-card h3 {
          font-size: 1.05rem;
          font-weight: 500;
          color: rgba(255,255,255,0.86);
        }
        .service-card p {
          margin-top: 10px;
          color: rgba(255,255,255,0.36);
          font-size: .88rem;
          line-height: 1.65;
        }
        @media (max-width: 1100px) {
          .service-rail,
          .studio-signal-panel {
            display: none;
          }
          .work-grid,
          .services-grid {
            grid-template-columns: repeat(2, minmax(0,1fr));
          }
        }
        @media (max-width: 720px) {
          .neva-top-nav,
          .neva-login-fixed {
            display: none;
          }
          .home-section {
            padding: 0 18px;
          }
          .hero-slide-img {
            height: 240px;
          }
          .home-subtitle {
            font-size: .95rem;
          }
          .logo-marquee-wrapper {
            bottom: 28px;
          }
          .work-section {
            padding: 90px 18px;
          }
          .work-grid,
          .services-grid {
            grid-template-columns: 1fr;
          }
          .work-card.wide,
          .work-card.tall {
            grid-column: auto;
            grid-row: auto;
            min-height: 330px;
          }
          .work-card.pack-card,
          .work-card.pack-card.wide,
          .work-card.pack-card.tall {
            grid-column: auto;
            min-height: auto;
            aspect-ratio: 16 / 9;
          }
        }
      `}</style>

      <div className="neva-noise" />

      <header className="neva-top-nav">
        <nav>
          <ul className="neva-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setActiveNav(item.href)}
                    className={cn("neva-nav-link", activeNav === item.href && "active")}
                  >
                    <Icon />
                    {item.label}
                    {activeNav === item.href ? (
                      <motion.span layoutId="neva-nav-underline" className="neva-nav-underline" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="neva-login-fixed">
        <Link href="#contact" className="neva-nav-link">
          <MessageCircle />
          Discord
        </Link>
      </div>

      <ServiceRail />

      <main>
        <section id="home" className="home-section">
          <HeroSlider />
          <div className="glow-left" />
          <div className="glow-right" />
          <div className="glow-center" />
          <div className="rim" />

          <StudioSignalPanel />

          <div className="hero-content">
            <p className="hero-kicker">FiveM creative studio</p>
            <div className="title-block">
              <span className="title-line">Neva</span>
              <span className="title-line">Design</span>
            </div>
            <p className="home-subtitle">
              Identites visuelles, posters et packs GFX pour les serveurs FiveM qui veulent une image nette, rare et memorable.
            </p>
            <div className="hero-cta">
              <Link href="#portfolio" className="ediz-cta" onClick={() => setActiveNav("#portfolio")}>
                Voir les projets <ArrowUpRight size={14} />
              </Link>
              <Link href="#contact" className="ediz-cta" onClick={() => setActiveNav("#contact")}>
                Commander <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="hero-proof" aria-label="Neva Design proofs">
              <span className="proof-pill">Branding serveur</span>
              <span className="proof-pill">Packs launch</span>
              <span className="proof-pill">Direction premium</span>
            </div>
          </div>

          <LogoMarquee inHero />
        </section>

        <section id="portfolio" className="work-section">
          <span className="section-label">Portfolio selectionne</span>
          <h2 className="section-title">Identites recentes</h2>

          {portfolioItems.length > 0 ? (
            <>
              <div className="filter-bar" data-active-index={activeFilterIndex}>
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      setActiveNav("#portfolio");
                    }}
                    className={cn("filter-button", activeFilter === filter && "active")}
                  >
                    {activeFilter === filter ? <motion.span layoutId="neva-filter-bg" className="filter-active-bg" /> : null}
                    <span>{filter}</span>
                  </button>
                ))}
              </div>

              <motion.div layout className={cn("work-grid", activeFilter === "Packs" && "pack-grid")}>
                <AnimatePresence mode="popLayout">
                  {filteredPortfolio.map((item) => (
                    <motion.article
                      layout
                      key={`${activeFilter}-${item.id}`}
                      variants={workCardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={cn(
                        "work-card group",
                        item.category === "Logos" && "logo-card",
                        item.category === "Packs" && "pack-card",
                        item.category === "Affiches" && "poster-card",
                        item.category === "Branding" && "logo-card",
                        item.layout === "tall" && "tall",
                        item.layout === "wide" && "wide"
                      )}
                    >
                      <WorkImage item={item} />
                      <div className="work-overlay" />
                      <button
                        type="button"
                        className="work-arrow"
                        onClick={() => setFullscreenItem(item)}
                        aria-label={`Ouvrir ${item.title} en plein ecran`}
                      >
                        <ArrowUpRight size={15} />
                      </button>
                      <div className="work-meta">
                        <p className="work-cat">{item.category}</p>
                        <h3 className="work-title">{item.title}</h3>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          ) : null}
        </section>

        <section id="services" className="work-section">
          <span className="section-label">Services</span>
          <h2 className="section-title">Ce que nous produisons</h2>
          <div className="services-grid">
            {[
              ["Branding", "Logo, palette, direction artistique et systeme visuel complet."],
              ["Posters", "Visuels marketing, annonces Discord et images de lancement."],
              ["Packs GFX", "Templates, previews, overlays et assets pour votre equipe."],
              ["Landing", "Pages courtes, sombres et propres pour poser votre image."],
            ].map(([title, text], index) => (
              <div key={title} className="service-card">
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="work-section">
          <span className="section-label">Contact</span>
          <h2 className="section-title">Ready to build your visual identity?</h2>
          <div className="mt-10 flex justify-center">
            <a href="https://discord.gg/nevadesign" target="_blank" rel="noopener noreferrer" className="ediz-cta">
              Commander sur Discord <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {fullscreenItem ? (
          <motion.div
            className="fullscreen-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setFullscreenItem(null)}
          >
            <button
              type="button"
              className="fullscreen-close"
              onClick={() => setFullscreenItem(null)}
              aria-label="Fermer l'aperçu plein écran"
            >
              <X size={18} />
            </button>
            <motion.div
              className={cn(
                "fullscreen-shell",
                fullscreenItem.category === "Logos" && "logo-preview",
                fullscreenItem.category === "Branding" && "logo-preview",
                fullscreenItem.category === "Affiches" && "poster-preview"
              )}
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={fullscreenItem.image_path || previewAssets[0]}
                alt={fullscreenItem.title}
                fill
                sizes="100vw"
                className={cn(
                  fullscreenItem.category === "Packs" || fullscreenItem.category === "Affiches"
                    ? "object-contain"
                    : "object-contain p-8"
                )}
                priority
              />
            </motion.div>
            <div className="fullscreen-meta">
              <span>{fullscreenItem.category}</span>
              <strong>{fullscreenItem.title}</strong>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
