"use client";

/*
 * Hero Givre — la scène de la ref, habitée par Neva.
 * Un rendu 3D temps réel (sculpture de verre) sous un cadre
 * éditorial en filets d'un pixel : pagination 01/10, rail de
 * points, titre Outfit léger en encre ardoise, colonne des
 * terrains à droite, tarif d'appel en pied. L'UI chuchote,
 * la scène parle.
 */

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { demoteSceneTier, detectSceneTier, type SceneTier } from "./scene-tier";

const GlassSculpture = dynamic(() => import("./GlassSculpture"), {
  ssr: false,
});

/* Purge 20/08 (passe whaou P5) : les 4 VRAIS terrains du studio —
   plus jamais de miniatures YouTube ni de branding généraliste. */
const FIELD_ITEMS = [
  { key: "fields.packs.kicker", fallback: "01 — Packs FiveM", active: true },
  { key: "fields.banners.kicker", fallback: "02 — Bannières Discord & réseaux", active: false },
  { key: "fields.posters.kicker", fallback: "03 — Affiches & loading screens", active: false },
  { key: "fields.ia.kicker", fallback: "04 — IA générative", active: false },
];

/* « 01 — Miniatures YouTube » → « Miniatures YouTube » */
function fieldLabel(kicker: string) {
  const parts = kicker.split("—");
  return (parts[1] ?? kicker).trim();
}

export default function GivreHero() {
  const { t } = useTranslations();
  const scope = useRef<HTMLElement>(null);
  /* run 3 : le tier décide si le chunk three (262 Ko gzip) part —
     et il ne part qu'APRÈS le first paint (deux rAF : la frame du
     poster est composée avant que le réseau ne s'occupe de la 3D) */
  const [tier, setTier] = useState<SceneTier | null>(null);
  /* MAJ soie : le canvas 3D est transparent — une fois la scène
     prête, le poster s'efface pour laisser la soie VIVANTE derrière
     le verre (il reste l'écran de chargement et la scène du tier
     low). Retombe à false si le tier redescend en low. */
  const [sceneReady, setSceneReady] = useState(false);
  /* bfcache (run 3, LOT 6) : un retour back/forward restaure un
     état GELÉ — contexte WebGL potentiellement perdu, canvas
     figé. pageshow persisted remonte la scène (textures en cache
     module : re-boot court, le poster couvre le crossfade). */
  const [sceneEpoch, setSceneEpoch] = useState(0);

  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSceneEpoch((k) => k + 1);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      /* MAJ 20/08 — le chunk three (~262 Ko gzip) part dès la 1re
         frame, EN PARALLÈLE de la détection de tier : réseau+parse
         ne s'additionnent plus à la peinture des textures.
         Exceptions (le chunk ne part pas) : session déjà classée
         low, et mobiles tactiles < 1024 px (leur scène EST le
         poster — même critère que scene-tier). */
      try {
        const touchOnly = window.matchMedia("(pointer: coarse) and (hover: none)").matches;
        const mobileLow = touchOnly && window.innerWidth < 1024;
        if (!mobileLow && window.sessionStorage.getItem("neva-scene-tier") !== "low") {
          import("./GlassSculpture");
        }
      } catch {
        import("./GlassSculpture");
      }
      raf = requestAnimationFrame(() => {
        const next = detectSceneTier().tier;
        setTier(next);
        /* en low, la scène n'émettra jamais : le loader reçoit sa
           part ET son signal « canvas » tout de suite (le poster HQ
           EST la scène du tier low) */
        if (next === "low") {
          try {
            window.dispatchEvent(
              new CustomEvent("neva:progress", {
                detail: { phase: "scene", p: 1 },
              })
            );
            window.dispatchEvent(
              new CustomEvent("neva:progress", {
                detail: { phase: "canvas", p: 1 },
              })
            );
          } catch {
            /* silencieux */
          }
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useGSAP(
    () => {
      const loaded =
        typeof window !== "undefined" &&
        (window as unknown as { __prismLoaded?: boolean }).__prismLoaded;

      /* MAJ 20/08 — mobile tactile (tier low) : pas de 3D à
         attendre, le poster est déjà là — l'entrée joue tout de
         suite et 30 % plus vite (LCP mobile mesuré à 5,1 s à
         cause du délai chorégraphique sous CPU lent). */
      let mobileLow = false;
      try {
        mobileLow =
          window.matchMedia("(pointer: coarse) and (hover: none)").matches &&
          window.innerWidth < 1024;
      } catch {
        /* matchMedia indisponible */
      }

      const tl = gsap.timeline({
        delay: loaded || mobileLow ? 0.12 : 1.05,
        defaults: { ease: "expo.out" },
      });
      if (mobileLow) tl.timeScale(1.3);

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
          /* mobile : le sous-titre est l'élément LCP — il reste
             peint dès le SSR (jamais opacity 0 sous CPU lent),
             seul le glissement anime */
          mobileLow ? { y: 16 } : { opacity: 0, y: 16 },
          mobileLow
            ? { y: 0, duration: 0.8, stagger: 0.08 }
            : { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
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

      /* F5 d'une session connue (data-prism-seen posé avant le
         paint) : le micro-rideau fond sur une page DÉJÀ composée —
         la cérémonie d'entrée n'est due qu'une fois par session,
         on la pose à son état final ; les animations permanentes
         (oscillation, marquee, breath) vivent, elles. */
      if (
        document.documentElement.getAttribute("data-prism-seen") === "1"
      ) {
        tl.progress(1);
      }
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      id="top"
      className="pv-scene pv-scene--canvas relative min-h-[100svh] overflow-hidden"
    >
      {/* Poster baké de la même scène (par cadrage) — visible pendant
          le chargement du canvas, et seul fallback si WebGL est
          indisponible. Jamais une autre version du design.
          Les media queries suivent EXACTEMENT les frontières des
          poses caméra (GlassSculpture.POSES) : le fondu poster →
          canvas reste un raccord, jamais un saut. */}
      <picture
        className={tier === "low" ? "pv-hero-parallax" : undefined}
        style={{
          opacity: sceneReady && (tier === "high" || tier === "mid") ? 0 : 1,
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Tier LOW (run 3) : la scène EST ce poster — versions AVIF
            haute qualité dédiées (≤ 120 Ko), micro-parallaxe CSS au
            scroll, zéro WebGL. Les autres tiers gardent les WebP
            légers : simple fond de crossfade. */}
        {/* Run 3, LOT 6 — chaque source porte ses densités : sans
            descripteur x, un 1440 CSS à DPR 1,25-2 (scaling Windows,
            Retina) recevait un poster 1440w étiré — LE fond flou du
            F5 pendant toute la phase poster. Le 4K (min-3560)
            recevait même un 1920w (×2) : corrigé par le 3840. */}
        {/* MAJ 20/08 : les AVIF (scène noire) sont plus légers que
            les WebP ET rendus côté serveur pour TOUS les tiers —
            l'ancien montage conditionnel (tier low, après
            hydratation) déclenchait un 2e chargement d'image qui
            repoussait le LCP mobile à ~5,3 s mesurées. */}
        <source
          media="(min-width: 2880px) and (min-aspect-ratio: 2/1)"
          srcSet="/scene/low/hero-poster-3440.avif"
          type="image/avif"
        />
        <source
          media="(min-width: 1920px)"
          srcSet="/scene/low/hero-poster-1920.avif 1x, /scene/low/hero-poster-3840.avif 2x"
          type="image/avif"
        />
        <source
          media="(min-width: 1024px)"
          srcSet="/scene/low/hero-poster-1440.avif 1x, /scene/low/hero-poster-2880.avif 2x"
          type="image/avif"
        />
        {/* QA 20/08 (R5) : palier tablette dédié — servir le poster
            390 (aspect portrait étroit) à 600-1023 le faisait
            recadrer en cover (~×1,9) : sculpture sous les CTA. */}
        <source
          media="(min-width: 600px) and (max-width: 1023px)"
          srcSet="/scene/low/hero-poster-768.avif 1x, /scene/low/hero-poster-1536.avif 2x"
          type="image/avif"
        />
        <source
          media="(max-width: 1023px)"
          srcSet="/scene/low/hero-poster-390.avif 2x, /scene/low/hero-poster-1170.avif 3x"
          type="image/avif"
        />
        <source
          media="(min-width: 2880px) and (min-aspect-ratio: 2/1)"
          srcSet="/scene/hero-poster-3440.webp"
        />
        <source
          media="(min-width: 3560px)"
          srcSet="/scene/hero-poster-3840.webp"
        />
        <source
          media="(min-width: 2200px)"
          srcSet="/scene/hero-poster-2560.webp 1x, /scene/hero-poster-3840.webp 2x"
        />
        <source
          media="(min-width: 1920px)"
          srcSet="/scene/hero-poster-1920.webp 1x, /scene/hero-poster-3840.webp 2x"
        />
        <source
          media="(min-width: 1680px)"
          srcSet="/scene/hero-poster-1680.webp 1x, /scene/hero-poster-3360.webp 2x"
        />
        <source
          media="(min-width: 600px) and (max-width: 1023px)"
          srcSet="/scene/hero-poster-768.webp 1x, /scene/hero-poster-1536.webp 2x"
        />
        <source
          media="(max-width: 1023px)"
          srcSet="/scene/hero-poster-390.webp 2x, /scene/hero-poster-1170.webp 3x"
        />
        <img
          src="/scene/hero-poster.webp"
          srcSet="/scene/hero-poster.webp 1x, /scene/hero-poster-2880.webp 2x"
          alt=""
          aria-hidden
          fetchPriority="high"
          className="pv-hero-layer absolute inset-0 h-full w-full object-cover"
        />
      </picture>

      {/* La sculpture — rendu 3D temps réel plein cadre, en fondu
          par-dessus son poster. Montée après le first paint (deux
          rAF), jamais en tier low : le chunk three n'est alors
          jamais téléchargé. */}
      {/* Le backdrop à réfracter (passe whaou P2.2) — nappe aurore
          lilas→pêche en dérive 26 s + deux light streaks à 22°,
          ≤ 8 % perçus : discret à l'œil, mais le verre le PLIE —
          c'est la référence qui fait lire la réfraction. */}
      <div
        aria-hidden
        className="pv-hero-aurora pv-hero-layer pointer-events-none absolute inset-[-4%]"
        style={{
          background:
            "radial-gradient(30% 42% at 58% 30%, rgba(184,161,232,0.085) 0%, rgba(184,161,232,0) 70%), radial-gradient(27% 38% at 74% 64%, rgba(240,197,168,0.075) 0%, rgba(240,197,168,0) 72%)",
        }}
      />
      <div
        aria-hidden
        className="pv-hero-layer pointer-events-none absolute inset-y-[-2%] right-0 hidden w-[58%] lg:block"
        style={{
          background:
            "linear-gradient(112deg, transparent 40%, rgba(255,255,255,0.05) 44.5%, transparent 49%), linear-gradient(112deg, transparent 62%, rgba(255,255,255,0.032) 65%, transparent 68%)",
        }}
      />

      {tier === "high" || tier === "mid" ? (
        <GlassSculpture
          key={`scene-${sceneEpoch}`}
          className="pv-hero-layer absolute inset-0"
          tier={tier}
          onReady={() => setSceneReady(true)}
          onDemote={(to, fps) => {
            demoteSceneTier(to, fps);
            setTier(to);
            if (to === "low") setSceneReady(false);
          }}
        />
      ) : null}

      {/* Aucun cadre au-dessus de la scène : le canvas est nu, seule
          la vraie interface (texte, boutons, rails) se pose dessus. */}

      {/* Fondu de raccord (G2 — QA 21/08) : plus de voile noir posé
          par-dessus (sa rampe → 92 % dessinait sa propre marche au
          bord de section, satin nu juste dessous). Le raccord est
          porté par le masque .pv-hero-layer sur chaque couche de
          scène : le drapé du cyclorama fond au transparent et la
          section suivante monte depuis le MÊME satin site-wide. */}

      {/* Le rail de sections vit désormais en fixed (SectionRail,
          monté par la page) : synchronisé au scroll, cliquable.
          La grille de pastilles décorative est retirée (D05 : un
          ornement sans rôle est du bruit). */}

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
          {/* Refonte 50k : la mesure s'ouvre pour porter le titre
              monumental (H1 §4.2, jusqu'à 148 px) */}
          <div className="max-w-[560px] lg:max-w-[760px]">
            {/* Pagination — 8 moments réels sur la page */}
            <div className="gh-num pv-page-num">
              <b>01</b>
              <span>/10</span>
            </div>

            {/* Micro-label — l'eyebrow descend de sa pilule */}
            <p className="gh-eyebrow mt-5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist lg:mt-8">
              {t(
                "hero.eyebrow",
                "Studio de graphisme — Logos · Packs FiveM · Bannières · IA générative"
              )}
            </p>

            {/* Titre — REFONTE 50k : Archivo variable, le jeu de
                largeurs EST l'accent. Voix calme en condensé light
                gris, la frappe en expanded massif ivoire — deux
                lignes, tension maximale, zéro couleur. */}
            <h1 className="mt-4 font-display gh-title lg:mt-5">
              <span className="gh-line block overflow-hidden">
                <span className="gh-line-calm block">
                  {t("hero.line1", "Des visuels")}
                </span>
              </span>
              <span className="gh-line block overflow-hidden">
                <span className="block">
                  <span className="gh-line-calm">{t("hero.line2.pre", "qui font")}</span>{" "}
                  <span className="gh-line-hit">
                    {t("hero.line2.beam", "cliquer")}
                    {t("hero.line2.post", ".")}
                  </span>
                </span>
              </span>
            </h1>

            <p className="gh-sub mt-4 max-w-[400px] text-[15px] leading-[1.65] text-slate lg:mt-7 lg:leading-[1.7]">
              {t(
                "hero.subtitle",
                "Des graphistes pour vos logos, packs FiveM, bannières et affiches — et Neva Generative, l'IA qui compose des scènes GTA photoréalistes. Brief sur Discord, suivi en direct, livraison rapide."
              )}
            </p>

            {/* CTA desktop — pivot 20/08 : le studio d'abord, la
                Generative ensuite (les outils de création sont « À
                venir », plus aucun CTA ne pointe dessus) */}
            <div className="mt-9 hidden flex-wrap items-center gap-4 lg:flex">
              <a href="#studio" data-qa="cta-primaire" className="gh-cta pv-btn">
                {t("hero.cta.primary", "Découvrir le studio")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </a>
              <a href="#generative" data-qa="cta-secondaire" className="gh-cta pv-btn pv-btn--ghost">
                {t("hero.cta.secondary", "Neva Generative")}
              </a>
            </div>

            {/* La preuve sociale — la note des avis clients */}
            <a
              href="#avis"
              className="gh-price pv-pill mt-5 hidden font-mono text-[10px] uppercase tracking-[0.14em] text-slate transition-colors duration-300 hover:text-ink lg:inline-flex"
            >
              <span className="font-display text-[15px] font-medium normal-case tracking-normal text-ink">
                5/5
              </span>
              {t("hero.proof", "Avis clients vérifiés")}
            </a>
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
            {t("hero.proof", "Avis clients vérifiés")}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            <a href="#studio" className="gh-cta pv-btn min-h-[50px] w-full">
              {t("hero.cta.primary", "Découvrir le studio")}
              <ArrowRight size={15} strokeWidth={1.8} />
            </a>
            <a
              href="#generative"
              className="gh-cta pv-btn pv-btn--ghost min-h-[50px] w-full"
            >
              {t("hero.cta.secondary", "Neva Generative")}
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
                    href="#terrains"
                    className={
                      item.active
                        ? "flex items-center gap-3 text-[14.5px] font-medium text-ink"
                        : "block text-[13.5px] text-mist transition-colors duration-300 hover:text-slate"
                    }
                  >
                    {item.active ? (
                      <span className="h-px w-5 bg-[rgba(242,242,240,0.55)]" aria-hidden />
                    ) : null}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </aside>

      </div>
    </section>
  );
}
