"use client";

/*
 * Hero Givre — la scène de la ref, habitée par Neva.
 * Un rendu 3D temps réel (sculpture de verre) sous un cadre
 * éditorial en filets d'un pixel : pagination 01/08, rail de
 * points, titre Outfit léger en encre ardoise, colonne des
 * terrains à droite, tarif d'appel en pied. L'UI chuchote,
 * la scène parle.
 */

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";

const GlassSculpture = dynamic(() => import("./GlassSculpture"), {
  ssr: false,
});

const FIELD_ITEMS = [
  { key: "fields.thumbs.kicker", fallback: "01 — Miniatures YouTube", active: true },
  { key: "fields.logos.kicker", fallback: "02 — Logos & branding", active: false },
  { key: "fields.charts.kicker", fallback: "03 — Chartes graphiques", active: false },
  { key: "fields.gaming.kicker", fallback: "04 — Gaming & FiveM", active: false },
];

/* « 01 — Miniatures YouTube » → « Miniatures YouTube » */
function fieldLabel(kicker: string) {
  const parts = kicker.split("—");
  return (parts[1] ?? kicker).trim();
}

export default function GivreHero() {
  const { t } = useTranslations();
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const loaded =
        typeof window !== "undefined" &&
        (window as unknown as { __prismLoaded?: boolean }).__prismLoaded;

      const tl = gsap.timeline({
        delay: loaded ? 0.15 : 1.05,
        defaults: { ease: "expo.out" },
      });

      tl.fromTo(
        ".gh-num",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        0.25
      )
        .fromTo(
          ".gh-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 1.0, stagger: 0.12 },
          0.32
        )
        .fromTo(
          ".gh-eyebrow, .gh-sub",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
          0.72
        )
        .fromTo(
          ".gh-cta",
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
          0.9
        )
        .fromTo(
          ".gh-side-item",
          { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.7, stagger: 0.07 },
          0.85
        )
        .fromTo(
          ".gh-price, .gh-dots",
          { opacity: 0 },
          { opacity: 1, duration: 0.9, stagger: 0.1 },
          1.05
        );
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      className="pv-scene pv-scene--canvas relative min-h-[100svh] overflow-hidden"
    >
      {/* Poster baké de la même scène (par cadrage) — visible pendant
          le chargement du canvas, et seul fallback si WebGL est
          indisponible. Jamais une autre version du design. */}
      <picture>
        <source
          media="(max-width: 1023px)"
          srcSet="/scene/hero-poster-390.webp"
        />
        <img
          src="/scene/hero-poster.webp"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* La sculpture — rendu 3D temps réel plein cadre, en fondu
          par-dessus son poster */}
      <GlassSculpture className="absolute inset-0" />

      {/* Aucun cadre au-dessus de la scène : le canvas est nu, seule
          la vraie interface (texte, boutons, rails) se pose dessus. */}

      {/* Rail gauche — points de navigation, grille de pastilles */}
      <div
        className="pointer-events-auto absolute bottom-0 z-10 hidden w-[84px] flex-col items-center justify-between lg:flex"
        style={{
          left: "var(--frame-inset)",
          top: "calc(var(--frame-inset) + 120px)",
          paddingBottom: "calc(var(--frame-inset) + 28px)",
        }}
      >
        <nav className="pv-dot-rail gh-dots" aria-label="Sections">
          <a href="#top" className="is-active" aria-label="Haut de page" />
          <a href="#creations" aria-label="Créations" />
          <a href="#modules" aria-label="Modules" />
          <a href="#pricing" aria-label="Tarifs" />
          <a href="#packs" aria-label="Packs" />
        </nav>
        <div className="pv-dot-grid gh-dots" aria-hidden>
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* Contenu principal — en dessous de lg : le texte en haut,
          une FENÊTRE réservée à la sculpture au centre (elle y est
          cadrée entière, jamais tronquée), la preuve et les CTA
          pleine largeur en bas. En lg+ : centrage vertical face à
          la sculpture posée à droite. */}
      <div
        className="relative z-10 flex min-h-[100svh] flex-col pt-[calc(68px+2svh)] lg:justify-center lg:pt-[calc(72px+4vh)]"
        style={{
          paddingLeft: "calc(var(--frame-inset) + 24px)",
          paddingRight: "calc(var(--frame-inset) + 24px)",
          paddingBottom: "calc(var(--frame-inset) + 24px)",
        }}
      >
        <div className="w-full lg:pl-[108px] lg:pr-[40px]">
          <div className="max-w-[560px]">
            {/* Pagination — 8 moments réels sur la page */}
            <div className="gh-num pv-page-num">
              <b>01</b>
              <span>/08</span>
            </div>

            {/* Micro-label — l'eyebrow descend de sa pilule */}
            <p className="gh-eyebrow mt-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist lg:mt-8">
              {t(
                "hero.eyebrow",
                "Studio créatif IA — Miniatures · Logos · Identités · Gaming"
              )}
            </p>

            {/* Titre — Outfit léger, l'accent est un contraste de
                graisse. L'identité vit dans la scène (le monogramme
                de cristal) : aucun ornement dans la ligne. */}
            <h1 className="mt-4 font-display text-[clamp(36px,10.5vw,48px)] leading-[1.06] tracking-[-0.015em] sm:text-[clamp(40px,6.2vw,84px)] lg:mt-5">
              <span className="gh-line block overflow-hidden">
                <span className="block font-light text-slate">
                  {t("hero.line1", "Des visuels")}
                </span>
              </span>
              <span className="gh-line block overflow-hidden">
                <span className="block font-light text-slate">
                  {t("hero.line2.pre", "qui font")}
                </span>
              </span>
              <span className="gh-line block overflow-hidden">
                <span className="block font-medium text-ink">
                  {t("hero.line2.beam", "cliquer")}
                  {t("hero.line2.post", ".")}
                </span>
              </span>
            </h1>

            <p className="gh-sub mt-4 max-w-[400px] text-[15px] leading-[1.65] text-slate lg:mt-7 lg:leading-[1.7]">
              {t(
                "hero.subtitle",
                "Miniatures YouTube, logos, identités de marque, assets gaming. Décrivez ce que vous voulez — le studio IA compose des rendus prêts à publier, jusqu'en 8K."
              )}
            </p>

            {/* CTA desktop — dans la colonne, à gauche de la scène */}
            <div className="mt-9 hidden flex-wrap items-center gap-4 lg:flex">
              <Link href="/signup" className="gh-cta pv-btn">
                {t("hero.cta.primary", "Créer mon premier visuel")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
              <a href="#creations" className="gh-cta pv-btn pv-btn--ghost">
                {t("hero.cta.secondary", "Voir les créations")}
              </a>
            </div>
          </div>
        </div>

        {/* La fenêtre de la sculpture — mobile/tablette : la scène
            3D est cadrée ici par la caméra, pièce maîtresse entre
            le titre et les boutons. Rien ne s'y superpose. */}
        <div
          className="min-h-[clamp(180px,30svh,360px)] flex-1 lg:hidden"
          aria-hidden
        />

        {/* Bloc bas — mobile : preuve en pilule + CTA pleine
            largeur, cibles tactiles ≥ 48px */}
        <div className="lg:hidden">
          <p className="gh-price pv-pill flex w-full items-center justify-center whitespace-nowrap px-4 py-2 text-center font-mono text-[9.5px] uppercase tracking-[0.13em] text-slate">
            {t("hero.proof", "5 créations offertes · Sans carte bancaire")}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <Link
              href="/signup"
              className="gh-cta pv-btn min-h-[50px] w-full"
            >
              {t("hero.cta.primary", "Créer mon premier visuel")}
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
            <a
              href="#creations"
              className="gh-cta pv-btn pv-btn--ghost min-h-[50px] w-full"
            >
              {t("hero.cta.secondary", "Voir les créations")}
            </a>
          </div>
        </div>

        {/* Colonne des terrains — la liste contextuelle de la ref */}
        <aside
          className="absolute hidden w-[218px] -translate-y-1/2 lg:block"
          style={{
            right: "calc(var(--frame-inset) + 48px)",
            top: "52%",
          }}
        >
          <p className="gh-side-item font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
            {t("fields.label", "Terrains")}
          </p>
          <ul className="mt-5 flex flex-col gap-[18px]">
            {FIELD_ITEMS.map((item) => {
              const label = fieldLabel(t(item.key, item.fallback));
              return (
                <li key={item.key} className="gh-side-item">
                  <a
                    href="#creations"
                    className={
                      item.active
                        ? "flex items-center gap-3 text-[14.5px] font-medium text-ink"
                        : "block text-[13.5px] text-mist transition-colors duration-300 hover:text-slate"
                    }
                  >
                    {item.active ? (
                      <span className="h-px w-5 bg-[rgba(29,35,64,0.55)]" aria-hidden />
                    ) : null}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Tarif d'appel — le « prix » de la ref, en vrai contenu */}
        <div
          className="gh-price absolute bottom-0 right-0 hidden text-right lg:block"
          style={{
            right: "calc(var(--frame-inset) + 48px)",
            bottom: "calc(var(--frame-inset) + 34px)",
          }}
        >
          <a href="#pricing" className="group block">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("nav.pricing", "Tarifs")}
            </p>
            <p className="mt-1 font-display text-[34px] font-light leading-none text-ink">
              0<span className="ml-1 text-[22px] text-slate">€</span>
            </p>
            <p className="mt-2 max-w-[210px] font-mono text-[10px] uppercase leading-[1.7] tracking-[0.14em] text-mist">
              {t("hero.proof", "5 créations offertes · Sans carte bancaire")}
            </p>
          </a>
        </div>
      </div>
    </section>
  );
}
