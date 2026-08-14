"use client";

import Image from "next/image";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock, RevealMask, RevealMedia } from "@/components/prisme/Motion";

/*
 * Les terrains, réécrits Givre — le registre éditorial. Fini la
 * mosaïque : un en-tête paginé à gauche (05/10), puis quatre
 * grandes rangées entre filets, kicker mono à gauche, un média
 * de preuve à droite. Les rangées 2 et 4 s'inversent pour le
 * rythme ; le chrome YouTube factice reste sur la première —
 * c'est lui qui prouve. Scène dawn-calm, caustiques, aucune
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

/* Chrome YouTube factice — la miniature en situation réelle */
function YouTubeFrame({
  src,
  alt,
  title,
  channel,
  stats,
  duration,
}: {
  src: string;
  alt: string;
  title: string;
  channel: string;
  stats: string;
  duration: string;
}) {
  return (
    <figure>
      <div className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 92vw, 55vw"
          className="object-cover group-hover:scale-[1.04]"
        />
        {/* Durée — le badge YouTube */}
        <span className="absolute bottom-3 right-3 z-[1] rounded-md bg-[rgba(0,0,0,0.82)] px-2 py-1 font-mono text-[11px] font-medium tracking-[0.04em] text-white">
          {duration}
        </span>
        {/* Barre de lecture amorcée */}
        <span className="absolute inset-x-0 bottom-0 z-[1] h-[3px] bg-white/20">
          <span className="block h-full w-[38%] bg-[#FF0000]" />
        </span>
      </div>
      <figcaption className="mt-3 flex gap-3">
        <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#FFE816,#FF9A2E)] text-[13px] font-medium text-[#111]">
          {channel.charAt(0)}
        </span>
        <span>
          <span className="block text-[14px] font-medium leading-snug text-ink">
            {title}
          </span>
          <span className="mt-1 block font-mono text-[10.5px] uppercase tracking-[0.1em] text-mist">
            {channel} · {stats}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

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
              <b>05</b>
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

        {/* Le registre — quatre grandes rangées entre filets */}
        <div className="mt-14 sm:mt-16">
          {/* ── 01 · Miniatures — la scène YouTube + deux tuiles ── */}
          <FieldRow
            kicker={t("fields.thumbs.kicker", "( 01 ) Miniatures YouTube")}
            title={t("fields.thumbs.title", "Le visage, le titre, le clic.")}
            desc={t(
              "fields.thumbs.desc",
              "Compositions pensées pour la vignette : expression, hiérarchie, lisibilité — même à 120 pixels de large."
            )}
            meta={t("fields.thumbs.meta", "1280 × 720 · pensées CTR")}
          >
            <RevealMedia>
              <div>
                <YouTubeFrame
                  src="/showcase/thumb-invest.webp"
                  alt="Miniature YouTube finance composée par Neva Design"
                  title="J'ai tout vendu — ce que personne ne comprend"
                  channel="Lena Invest"
                  stats="214 k vues · 3 jours"
                  duration="14:32"
                />
              </div>
            </RevealMedia>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <RevealMedia delay={0.08}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/showcase/thumb-esport.webp"
                    alt="Miniature YouTube esport composée par Neva Design"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
              <RevealMedia delay={0.16}>
                <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                  <Image
                    src="/showcase/thumb-defi.webp"
                    alt="Miniature YouTube défi composée par Neva Design"
                    fill
                    sizes="(max-width: 1024px) 45vw, 27vw"
                    className="object-cover group-hover:scale-[1.04]"
                  />
                </figure>
              </RevealMedia>
            </div>
          </FieldRow>

          {/* ── 02 · Logos — la planche Kova, média à gauche ── */}
          <FieldRow
            reversed
            kicker={t("fields.logos.kicker", "( 02 ) Logos & branding")}
            title={t("fields.logos.title", "Des marques qui tiennent debout.")}
            desc={t(
              "fields.logos.desc",
              "Monogrammes, wordmarks et symboles livrés en vectoriel — du favicon à l'enseigne."
            )}
            meta={t("fields.logos.meta", "SVG · toutes déclinaisons")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-[4/3]">
                <Image
                  src="/showcase/logo-kova.webp"
                  alt="Logo Kova, banque mobile"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
          </FieldRow>

          {/* ── 03 · Chartes — la planche documentée Méridien ── */}
          <FieldRow
            kicker={t("fields.charts.kicker", "( 03 ) Chartes graphiques")}
            title={t("fields.charts.title", "La cohérence, documentée.")}
            desc={t(
              "fields.charts.desc",
              "Palette, typographies, usages : la planche qui aligne tous vos supports, réseaux compris."
            )}
            meta={t("fields.charts.meta", "palette · typos · déclinaisons")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-[16/10]">
                <Image
                  src="/showcase/charte-meridien.webp"
                  alt="Charte graphique Méridien composée par Neva Design"
                  fill
                  sizes="(max-width: 1024px) 92vw, 55vw"
                  className="object-cover group-hover:scale-[1.04]"
                />
              </figure>
            </RevealMedia>
          </FieldRow>

          {/* ── 04 · Gaming — la campagne Larya, média à gauche ── */}
          <FieldRow
            reversed
            kicker={t("fields.gaming.kicker", "( 04 ) Gaming & FiveM")}
            title={t("fields.gaming.title", "Le terrain d'origine.")}
            desc={t(
              "fields.gaming.desc",
              "Affiches, packs serveur et identités d'équipe — l'univers où le studio a fait ses armes."
            )}
            meta={t("fields.gaming.meta", "8K · campagnes complètes")}
          >
            <RevealMedia>
              <figure className="pv-media pv-media--hover pv-shadow-mauve relative aspect-video">
                <Image
                  src="/posterlarya.png"
                  alt="Campagne Larya serveur GTA RP"
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
