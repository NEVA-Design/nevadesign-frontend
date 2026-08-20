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

function FieldRow({
  kicker,
  title,
  desc,
  meta,
  reversed = false,
  children,
}: {
  kicker: string;
  title: string;
  desc: string;
  meta: string;
  reversed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="pv-row group grid items-center gap-x-12 gap-y-8 py-10 sm:py-12 lg:grid-cols-12">
      <div className={`lg:col-span-5 ${reversed ? "lg:order-2 lg:pl-2" : "lg:pr-2"}`}>
        <RevealBlock>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
            {kicker}
          </p>
          <h3 className="mt-4 font-display pv-t-field-card font-normal leading-[1.15] tracking-[-0.012em] text-ink">
            {title}
          </h3>
          <p className="mt-3 max-w-[420px] text-[14.5px] leading-[1.7] text-slate">
            {desc}
          </p>
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
            {meta}
          </p>
        </RevealBlock>
      </div>
      <div className={`lg:col-span-7 ${reversed ? "lg:order-1" : ""}`}>
        {children}
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

      <div className="relative mx-auto pv-container px-5 pb-24 pt-24 sm:px-8 sm:pb-32 sm:pt-28">
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
            <h2 className="font-display pv-t-fields font-light leading-[1.08] tracking-[-0.015em] text-slate">
              {titleHead}
              {titleTail ? (
                <span className="font-medium text-ink">{titleTail}</span>
              ) : null}
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
            kicker={t("fields.packs.kicker", "( 01 ) Packs FiveM")}
            title={t("fields.packs.title", "L'identité complète du serveur.")}
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
                    alt="Déclinaisons d'un pack serveur FiveM"
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
                    alt="Visuel boutique d'un pack serveur FiveM"
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
            kicker={t("fields.banners.kicker", "( 02 ) Bannières Discord & réseaux")}
            title={t("fields.banners.title", "La première image de votre serveur.")}
            desc={t(
              "fields.banners.desc",
              "Bannières, avatars et boutiques aux formats exacts de Discord et des réseaux — nets à chaque taille d'affichage."
            )}
            meta={t("fields.banners.meta", "960 × 540 · Discord & réseaux")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/Prime_-_preview_serveur_pack_8.webp"
                  alt="Kit de bannières Discord d'un serveur FiveM"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
          </FieldRow>

          {/* ── 03 · Affiches & loading screens ── */}
          <FieldRow
            kicker={t("fields.posters.kicker", "( 03 ) Affiches & loading screens")}
            title={t("fields.posters.title", "L'événement, en grand format.")}
            desc={t(
              "fields.posters.desc",
              "Recrutements, ouvertures, soirées : des compositions qui tiennent l'écran de chargement comme l'impression."
            )}
            meta={t("fields.posters.meta", "4K · écran & impression")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/affiche3.webp"
                  alt="Affiche d'événement pour serveur GTA RP"
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
                    alt="Campagne d'affiches serveur GTA RP"
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
                    alt="Série d'affiches verticales pour serveur FiveM"
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
            kicker={t("fields.ia.kicker", "( 04 ) IA générative")}
            title={t("fields.ia.title", "Des scènes GTA photoréalistes.")}
            desc={t(
              "fields.ia.desc",
              "Neva Generative compose vos mises en scène — personnages, lumière, ambiance — dans l'univers de votre serveur."
            )}
            meta={t("fields.ia.meta", "photoréaliste · jusqu'au 8K")}
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
