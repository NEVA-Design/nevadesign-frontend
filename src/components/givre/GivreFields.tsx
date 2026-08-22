"use client";

import Image from "next/image";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock, RevealMask, RevealMedia } from "@/components/prisme/Motion";

/*
 * Les terrains, réécrits Givre — le registre éditorial. Purge
 * 20/08 : quatre terrains RÉELS (packs FiveM, bannières Discord,
 * affiches & loading screens, IA générative), illustrés par les
 * livrables du repo. Quatre grandes rangées entre filets, kicker
 * mono à gauche, un média de preuve à droite ; les rangées 2 et 4
 * s'inversent pour le rythme. Scène dawn-calm, caustiques, aucune
 * carte blanche opaque : les œuvres restent la couleur de la page.
 */

/* Refonte 50k : ( 01 ) s'affirme en display, un FILET VERTICAL
   sépare texte et média, la légende mono vit SOUS le visuel. */
function FieldRow({
  num,
  kicker,
  title,
  desc,
  meta,
  reversed = false,
  children,
}: {
  num: string;
  kicker: string;
  title: string;
  desc: string;
  meta: string;
  reversed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="pv-row group grid items-center gap-x-0 gap-y-8 py-10 sm:py-12 lg:grid-cols-12">
      <div
        className={`lg:col-span-5 ${
          reversed
            ? "lg:order-2 lg:border-l lg:border-[color:var(--color-ligne)] lg:pl-12"
            : "lg:border-r lg:border-[color:var(--color-ligne)] lg:pr-12"
        }`}
      >
        <RevealBlock>
          <p className="flex items-baseline gap-3">
            <span className="pv-display text-[clamp(28px,2.6vw,40px)] !leading-none !text-[color:var(--ink-28)]">
              ( {num} )
            </span>
            <span className="pv-label !text-[color:var(--color-mist)]">{kicker}</span>
          </p>
          <h3 className="mt-5 pv-display pv-t-field-card !text-[color:var(--color-ink)]">
            {title}
          </h3>
          <p className="mt-3 max-w-[46ch] text-[14.5px] leading-[1.7] text-slate">
            {desc}
          </p>
        </RevealBlock>
      </div>
      <div className={`lg:col-span-7 ${reversed ? "lg:order-1 lg:pr-12" : "lg:pl-12"}`}>
        {children}
        {/* légende mono — sous le visuel, alignée au cadre */}
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
          {meta}
        </p>
      </div>
    </article>
  );
}

/* (Purge 20/08 — le chrome YouTube factice a disparu avec l'offre
   miniatures : les livrables FiveM se montrent en tirages nus.) */

export default function GivreFields() {
  const { t } = useTranslations();

  /* L'accent medium se pose après la virgule du titre — sans
     toucher au texte : « Un studio, » léger, la suite en encre. */
  const title = t("fields.title", "Un studio, quatre terrains de jeu.");
  const cut = title.indexOf(", ");
  const titleHead = cut === -1 ? title : title.slice(0, cut + 2);
  const titleTail = cut === -1 ? "" : title.slice(cut + 2);

  return (
    <section id="terrains" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div aria-hidden className="pv-caustics" />

      <div className="pv-section--tight relative mx-auto pv-container px-5 sm:px-8">
        {/* En-tête paginé — tout à gauche, l'UI chuchote */}
        <header className="max-w-[760px]">
          <RevealBlock>
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>06</b>
              <span>/10</span>
            </div>
          </RevealBlock>
          <RevealBlock delay={0.08}>
            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("fields.label", "Terrains")}
            </p>
          </RevealBlock>
          <RevealMask delay={0.12} className="mt-4">
            <h2 className="pv-display pv-t-fields">
              {titleHead}
              {titleTail ? <b>{titleTail}</b> : null}
            </h2>
          </RevealMask>
          <RevealBlock delay={0.2}>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.7] text-slate">
              {t(
                "fields.subtitle",
                "Le même directeur artistique, quatre métiers. Chaque pièce ci-dessous est un livrable du studio, dans son format de travail."
              )}
            </p>
          </RevealBlock>
        </header>

        {/* Le registre — quatre grandes rangées entre filets.
            Purge 20/08 : les quatre VRAIS terrains, illustrés par
            les livrables FiveM du repo. */}
        <div className="mt-14 sm:mt-16">
          {/* ── 01 · Packs FiveM — le pack complet + deux tuiles ── */}
          <FieldRow
            num="01"
            kicker={t("fields.packs.kicker", "( 01 ) Packs FiveM").replace(/^\(\s*\d+\s*\)\s*/, "")}
            title={t("fields.packs.title", "L’identité complète du serveur.")}
            desc={t(
              "fields.packs.desc",
              "Logo, bannière, affiches, loading screen : un pack cohérent, prêt à poser sur Discord et en jeu."
            )}
            meta={t("fields.packs.meta", "pack complet · toutes déclinaisons")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/Prime_-_preview_serveur_pack_4.webp"
                  alt="Pack graphique complet de serveur FiveM par Neva Design"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <RevealMedia delay={0.08}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/Prime_-_preview_serveur_pack_7.webp"
                    alt="Déclinaisons d’un pack serveur FiveM"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
              <RevealMedia delay={0.16}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/Prime_-_preview_serveur_pack_15.webp"
                    alt="Visuel boutique d’un pack serveur FiveM"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
            </div>
          </FieldRow>

          {/* ── 02 · Bannières — le kit Discord, média à gauche ── */}
          <FieldRow
            reversed
            num="02"
            kicker={t("fields.banners.kicker", "( 02 ) Bannières Discord & réseaux").replace(/^\(\s*\d+\s*\)\s*/, "")}
            title={t("fields.banners.title", "La première image de votre serveur.")}
            desc={t(
              "fields.banners.desc",
              "Bannières, avatars et boutiques aux formats exacts de Discord et des réseaux — nets à chaque taille d’affichage."
            )}
            meta={t("fields.banners.meta", "960 × 540 · Discord & réseaux")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/Prime_-_preview_serveur_pack_8.webp"
                  alt="Kit de bannières Discord d’un serveur FiveM"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
          </FieldRow>

          {/* ── 03 · Affiches & loading screens ── */}
          <FieldRow
            num="03"
            kicker={t("fields.posters.kicker", "( 03 ) Affiches & loading screens").replace(/^\(\s*\d+\s*\)\s*/, "")}
            title={t("fields.posters.title", "L’événement, en grand format.")}
            desc={t(
              "fields.posters.desc",
              "Recrutements, ouvertures, soirées : des compositions qui tiennent l’écran de chargement comme l’impression."
            )}
            meta={t("fields.posters.meta", "4K · écran & impression")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/affiche3.webp"
                  alt="Affiche d’événement pour serveur GTA RP"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <RevealMedia delay={0.08}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/posterlarya.webp"
                    alt="Campagne d’affiches serveur GTA RP"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
              <RevealMedia delay={0.16}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/postergrandfivem2.webp"
                    alt="Série d’affiches verticales pour serveur FiveM"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
            </div>
          </FieldRow>

          {/* ── 04 · IA générative — la scène GTA, média à gauche ── */}
          <FieldRow
            reversed
            num="04"
            kicker={t("fields.ia.kicker", "( 04 ) IA générative").replace(/^\(\s*\d+\s*\)\s*/, "")}
            title={t("fields.ia.title", "Des scènes GTA photoréalistes.")}
            desc={t(
              "fields.ia.desc",
              "Neva Generative compose vos mises en scène — personnages, lumière, ambiance — dans l’univers de votre serveur."
            )}
            meta={t("fields.ia.meta", "photoréaliste · jusqu’au 8K")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/jetski.webp"
                  alt="Scène GTA photoréaliste composée par Neva Generative"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
          </FieldRow>
        </div>
      </div>
    </section>
  );
}
