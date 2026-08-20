"use client";

/*
 * 09 — Neva Generative (pivot 20/08, passe whaou P6). L'offre
 * générative sur abonnement, en DEUX formules :
 *   3A « Scènes GTA » — galerie 1 majeure + 2 empilées
 *       (/generative/*.webp, lazy + srcset, ratio 5504×3072
 *       préservé, hover scale 1.03 / 300 ms, liseré blanc 8 %).
 *   3B « Bannières Discord IA » — bibliothèque de modèles
 *       (src/data/models.json) : previews SVG designées en code
 *       (/generative/models/*.svg, « NEVA » composé dans le style
 *       de chaque modèle — zéro génération IA), rangée d'icônes de
 *       capacités (trait 1.5 px ; disponible = accent, sinon
 *       barrée à 35 %), tooltips.
 * Prix : source unique src/lib/generative/pricing.ts — tant que
 * null, état designé « — € /mois » + badge accès anticipé (plus
 * jamais de TODO_* rendu à l'écran).
 * Le flux de génération réel n'est PAS branché : voir le stub
 * src/lib/generative/banner-service.ts (aucun appel réseau).
 * Remplace à l'affichage l'ancienne grille (GivrePricing/GivrePacks,
 * conservée sous LEGACY_PRICING).
 */

import { useState } from "react";
import Link from "next/link";
import { RevealBlock } from "@/components/prisme/Motion";
import { useTranslations } from "@/components/LanguageProvider";
import models from "@/data/models.json";
import {
  GENERATIVE_PRICING,
  formatGenerativePrice,
} from "@/lib/generative/pricing";

type BannerModel = {
  id: string;
  name: string;
  preview: string;
  capabilities: { name: boolean; theme: boolean; color: boolean; extraText: boolean };
};

/* ── Les 4 icônes de capacités — trait 1.5 px, 20×20 ─────────── */

function IconExtraText() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* « Aa » au trait */}
      <path d="M2.5 17.5 L7 6.5 L11.5 17.5" />
      <path d="M4.2 13.4 H9.8" />
      <circle cx="17.2" cy="13.8" r="3.2" />
      <path d="M20.4 10.6 V17.5" />
    </svg>
  );
}

function IconColor() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* palette */}
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2.1-.8 2.1-1.8 0-.9-.6-1.4-.6-2.2 0-1 .8-1.8 2-1.8h2.2c2 0 2.8-1.5 2.8-3.2C20.5 6.9 16.7 3.5 12 3.5Z" />
      <circle cx="8" cy="9.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="12.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="7.4" cy="13.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTheme() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* pinceau */}
      <path d="M20.5 3.5c-3.2.6-6.8 3.1-9.2 5.9l3.3 3.3c2.8-2.4 5.3-6 5.9-9.2Z" />
      <path d="M11.3 9.4 8.6 12c-1.7 0-3.6 1.4-3.6 4.2 0 1.5-.8 2.4-1.5 2.9 1 .6 2.3.9 3.5.9 3 0 4.9-2 4.9-4l2.7-2.7" />
    </svg>
  );
}

function IconName() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* badge / rosette */}
      <circle cx="12" cy="9.2" r="5.7" />
      <path d="M9.2 13.9 7.6 21l4.4-2.4L16.4 21l-1.6-7.1" />
    </svg>
  );
}

const CAPABILITIES = [
  {
    id: "name" as const,
    Icon: IconName,
    label: "Nom personnalisé",
    labelKey: "generative.cap.name",
    unavailable: "Nom personnalisé : non disponible sur ce modèle",
  },
  {
    id: "theme" as const,
    Icon: IconTheme,
    label: "Thème modifiable",
    labelKey: "generative.cap.theme",
    unavailable: "Thème : non modifiable sur ce modèle",
  },
  {
    id: "color" as const,
    Icon: IconColor,
    label: "Couleur modifiable",
    labelKey: "generative.cap.color",
    unavailable: "Couleur : non modifiable sur ce modèle",
  },
  {
    id: "extraText" as const,
    Icon: IconExtraText,
    label: "Textes additionnels",
    labelKey: "generative.cap.extraText",
    unavailable: "Textes additionnels : non disponibles sur ce modèle",
  },
];

/* Icône d'état : disponible = pleine, couleur accent ; indisponible
   = barrée d'un trait diagonal 1.5 px, opacité 35 %. Tooltip au
   survol. */
function CapabilityIcon({
  cap,
  available,
  t,
}: {
  cap: (typeof CAPABILITIES)[number];
  available: boolean;
  t: (key: string, fallback?: string) => string;
}) {
  const label = t(cap.labelKey, cap.label);
  const tip = available ? label : t(`${cap.labelKey}.off`, cap.unavailable);
  return (
    <span className="group relative inline-flex" aria-label={tip}>
      <span
        className={
          available
            ? "relative text-[color:var(--color-violet)]"
            : "relative text-slate opacity-35"
        }
      >
        <cap.Icon />
        {!available ? (
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(45deg, transparent calc(50% - 0.75px), currentColor calc(50% - 0.75px), currentColor calc(50% + 0.75px), transparent calc(50% + 0.75px))",
            }}
          />
        ) : null}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-[color:var(--hairline)] bg-[#141414] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.06em] text-ink group-hover:block">
        {tip}
      </span>
    </span>
  );
}

/* Preview d'un modèle — bannière DESIGNÉE EN CODE (SVG servi
   depuis /generative/models/, passe whaou P6.2 : composition
   typographique « NEVA » dans le style du modèle, zéro génération
   IA). Le fallback n'affiche JAMAIS un rectangle coté : état
   designé — nom du modèle + badge « Bientôt ». */
function ModelPreview({ model }: { model: BannerModel }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className="relative flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.08)]"
        style={{
          aspectRatio: "680/240",
          background:
            "linear-gradient(120deg, rgba(184,161,232,0.14), rgba(255,255,255,0.03) 55%, rgba(240,197,168,0.12))",
        }}
      >
        <span className="font-display text-[22px] font-medium tracking-[0.08em] text-ink">
          {model.name}
        </span>
        <span className="rounded-[6px] border border-[rgba(255,255,255,0.14)] px-2 py-[2px] font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
          Aperçu bientôt
        </span>
      </div>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={model.preview}
      alt={`Modèle ${model.name} — bannière Discord Neva`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full rounded-[10px] border border-[rgba(255,255,255,0.08)] object-cover"
      style={{ aspectRatio: "680/240" }}
    />
  );
}

/* Carte tarifaire d'une formule — passe whaou P6.3 : tant que le
   prix n'est pas connu (source unique GENERATIVE_PRICING), l'état
   est DESIGNÉ : « — € /mois » + badge « Accès anticipé — prix
   bientôt ». Plus jamais de TODO_* dans l'UI rendue. */
function PriceCard({
  title,
  price,
  features,
  t,
}: {
  title: string;
  price: string;
  features: string[];
  t: (key: string, fallback?: string) => string;
}) {
  const pending = price === "—";
  return (
    <div className="pv-glass pv-glass--card flex h-full flex-col px-7 py-7">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">{title}</p>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-[34px] font-medium leading-none text-ink">
          {price}
        </span>
        <span className="font-mono text-[11px] text-mist">
          {t("generative.perMonth", "€ / mois")}
        </span>
      </p>
      {pending ? (
        <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-[6px] border border-[rgba(184,161,232,0.4)] bg-[rgba(184,161,232,0.08)] px-2.5 py-[4px] font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink">
          <span aria-hidden className="h-1 w-1 rounded-full bg-[#B8A1E8]" />
          {t("generative.earlyAccess", "Accès anticipé — prix bientôt")}
        </p>
      ) : null}
      <ul className="mt-5 flex flex-1 flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-[1.55] text-slate">
            <span
              aria-hidden
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-violet)]"
            />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/signup" className="pv-btn mt-6 w-full">
        {t("generative.subscribe", "S'abonner")}
      </Link>
    </div>
  );
}

const GALLERY = [
  { slug: "poser", alt: "Scène GTA générée — détente au bord de la piscine, Los Santos" },
  { slug: "ordi", alt: "Scène GTA générée — personnage face à l'écran au coucher de soleil" },
  { slug: "plage", alt: "Scène GTA générée — transat au bord de la piscine d'une villa" },
];

export default function GivreGenerative() {
  const { t } = useTranslations();
  const list = models as BannerModel[];

  return (
    <section id="generative" className="pv-scene pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div aria-hidden className="pv-scene-bg--dawn absolute inset-0" />
      <div aria-hidden className="pv-windowlight" />
      {/* Glows aurore derrière les cartes tarifaires */}
      <div aria-hidden className="pv-halo pv-halo--violet right-[-4%] top-[10%] h-[560px] w-[600px]" />
      <div aria-hidden className="pv-halo pv-halo--cyan right-[0%] top-[58%] h-[480px] w-[540px]" />
      <div aria-hidden className="pv-halo pv-halo--violet left-[-6%] top-[74%] h-[460px] w-[520px]" />

      <div
        className="relative z-10"
        style={{
          paddingLeft: "calc(var(--frame-inset) + 24px)",
          paddingRight: "calc(var(--frame-inset) + 24px)",
        }}
      >
        <div className="pv-container mx-auto">
          {/* En-tête */}
          <RevealBlock>
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>09</b>
              <span>/10</span>
            </div>
          </RevealBlock>
          <RevealBlock delay={0.06}>
            <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("generative.eyebrow", "Neva Generative — deux formules d'abonnement")}
            </p>
          </RevealBlock>
          <RevealBlock delay={0.12}>
            <h2 className="pv-display pv-section-title mt-4 max-w-[720px]">
              {t("generative.title.a", "L'IA du studio,")}{" "}
              <b>{t("generative.title.beam", "en abonnement.")}</b>
            </h2>
          </RevealBlock>

          {/* ── Formule 3A — Scènes GTA ─────────────────────────── */}
          <div className="mt-16 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
            <div>
              <RevealBlock>
                <p className="pv-num">{t("generative.gta.num", "Formule 01")}</p>
                <h3 className="pv-display pv-t-creations mt-3">
                  {t("generative.gta.title", "Scènes GTA")}
                </h3>
                <p className="mt-4 max-w-[560px] text-[14.5px] leading-[1.7] text-slate">
                  {t(
                    "generative.gta.pitch",
                    "Des scènes GTA photoréalistes générées par IA — bannières, posters, visuels de serveurs et de réseaux. Pensé pour les graphistes et les serveurs FiveM : l'outil que beaucoup utiliseront pour leurs propres clients."
                  )}
                </p>
              </RevealBlock>
              {/* Galerie (passe whaou P6.1) — fini le timbre-poste :
                  1 image MAJEURE (~60 % de la colonne) + 2
                  secondaires empilées à droite, liseré blanc 8 %,
                  hover scale 1.03 / 300 ms, coins 12 px partout. */}
              <div className="mt-8 grid gap-4 sm:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
                <RevealBlock delay={0.06}>
                  <figure className="h-full overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/generative/${GALLERY[0].slug}.webp`}
                      srcSet={`/generative/${GALLERY[0].slug}-640.webp 640w, /generative/${GALLERY[0].slug}-1024.webp 1024w, /generative/${GALLERY[0].slug}.webp 1920w`}
                      sizes="(min-width: 1024px) 38vw, (min-width: 640px) 55vw, 92vw"
                      alt={GALLERY[0].alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
                      style={{ aspectRatio: "5504/3072" }}
                    />
                  </figure>
                </RevealBlock>
                <div className="grid gap-4">
                  {GALLERY.slice(1).map((g, i) => (
                    <RevealBlock key={g.slug} delay={0.13 + i * 0.07}>
                      <figure className="overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.08)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/generative/${g.slug}.webp`}
                          srcSet={`/generative/${g.slug}-640.webp 640w, /generative/${g.slug}-1024.webp 1024w, /generative/${g.slug}.webp 1920w`}
                          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 36vw, 92vw"
                          alt={g.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full object-cover transition-transform duration-300 ease-out hover:scale-[1.03]"
                          style={{ aspectRatio: "5504/3072" }}
                        />
                      </figure>
                    </RevealBlock>
                  ))}
                </div>
              </div>
            </div>
            <RevealBlock delay={0.14}>
              <div className="mt-8 lg:sticky lg:top-24 lg:mt-0">
                <PriceCard
                  title={t("generative.gta.title", "Scènes GTA")}
                  price={formatGenerativePrice(GENERATIVE_PRICING.gta)}
                  features={[
                    t("generative.gta.f1", "Quota mensuel dévoilé à l'ouverture"),
                    t("generative.gta.f2", "Formats bannière + poster"),
                    t("generative.gta.f3", "Usage commercial autorisé"),
                  ]}
                  t={t}
                />
              </div>
            </RevealBlock>
          </div>

          <hr className="pv-rule--beam my-16" />

          {/* ── Formule 3B — Bannières Discord IA ───────────────── */}
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
            <div>
              <RevealBlock>
                <p className="pv-num">{t("generative.banner.num", "Formule 02")}</p>
                <h3 className="pv-display pv-t-creations mt-3">
                  {t("generative.banner.title", "Bannières Discord IA")}
                </h3>
                <p className="mt-4 max-w-[560px] text-[14.5px] leading-[1.7] text-slate">
                  {t(
                    "generative.banner.pitch",
                    "Une bibliothèque de modèles de bannières : saisissez le nom voulu, la bannière est générée avec. Selon le modèle, changez aussi le thème, la couleur, ou ajoutez des textes."
                  )}
                </p>
              </RevealBlock>

              {/* Légende des 4 icônes — au-dessus de la grille */}
              <RevealBlock delay={0.08}>
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                  {CAPABILITIES.map((cap) => (
                    <li key={cap.id} className="flex items-center gap-2">
                      <span className="text-[color:var(--color-violet)]">
                        <cap.Icon />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mist">
                        {t(cap.labelKey, cap.label)}
                      </span>
                    </li>
                  ))}
                </ul>
              </RevealBlock>

              {/* Grille des modèles */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2 min-[1680px]:grid-cols-3">
                {list.map((model, i) => (
                  <RevealBlock key={model.id} delay={0.05 + (i % 2) * 0.06}>
                    <div data-qa="modele-carte" className="pv-glass pv-glass--card pv-card-hover p-4">
                      <ModelPreview model={model} />
                      <div className="mt-3.5 flex items-center justify-between gap-3">
                        <p className="truncate text-[14px] font-medium text-ink">{model.name}</p>
                        <div className="flex shrink-0 items-center gap-2.5">
                          {CAPABILITIES.map((cap) => (
                            <CapabilityIcon
                              key={cap.id}
                              cap={cap}
                              available={model.capabilities[cap.id]}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </RevealBlock>
                ))}
              </div>
            </div>
            <RevealBlock delay={0.14}>
              <div className="mt-8 lg:sticky lg:top-24 lg:mt-0">
                <PriceCard
                  title={t("generative.banner.title", "Bannières Discord IA")}
                  price={formatGenerativePrice(GENERATIVE_PRICING.banner)}
                  features={[
                    t("generative.banner.f1", "Quota mensuel dévoilé à l'ouverture"),
                    t("generative.banner.f2", "Accès à tous les modèles"),
                    t("generative.banner.f3", "Personnalisation nom / thème / couleur"),
                  ]}
                  t={t}
                />
              </div>
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
