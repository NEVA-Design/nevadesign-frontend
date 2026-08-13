"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock, RevealMask, CountUp } from "@/components/prisme/Motion";
import { cn } from "@/lib/utils";

/*
 * Modules Givre — le sixième moment de la page. L'en-tête passe à
 * droite (miroir du hero), pagination 06/08 en Outfit léger, puis
 * la grille bento reprend ses six preuves : le brief qui devient
 * miniature, l'identité en construction, le détail 8K, le
 * moodboard qui répond, la carte d'identité, le verdict chiffré.
 * Matière : verre figé (pv-glass--still, zéro blur par tuile) sur
 * la scène glacier — la plus froide de la page.
 */

function Tile({
  className,
  children,
  title,
  description,
}: {
  className?: string;
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article
      className={cn(
        "pv-glass pv-glass--still pv-ignite group relative flex flex-col overflow-hidden !rounded-[16px]",
        className
      )}
    >
      <div className="relative flex-1">{children}</div>
      <div className="relative border-t border-[rgba(29,35,64,0.07)] px-5 py-4">
        <h3 className="text-[16px] font-medium tracking-[-0.01em] text-ink">
          {title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-[1.6] text-slate">{description}</p>
      </div>
    </article>
  );
}

/* ── Tuile 1 : Design Studio — le brief devient une miniature ──── */
function DesignStudioScene() {
  const { t } = useTranslations();
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="rounded-[12px] border border-[rgba(29,35,64,0.07)] bg-white/55 p-4">
        <p className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
          {t("bento.design.brief", "Brief")}
        </p>
        <p className="text-[13px] leading-[1.65] text-slate">
          {t(
            "bento.design.prompt",
            "« Miniature pour un test PC — visage choqué, prix énorme en rouge, fond sombre. »"
          )}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex h-7 items-center gap-2 rounded-full bg-ink px-3 text-[11px] font-medium text-white">
            {t("bento.design.action", "Composer")}
            <ArrowRight size={11} />
          </span>
          <span className="font-mono text-[10px] text-mist">
            {t("bento.design.meta", "3 rendus · 12 s")}
          </span>
        </div>
      </div>
      <figure className="pv-media min-h-[220px] flex-1">
        <Image
          src="/showcase/thumb-pc.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 46vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        <figcaption className="absolute bottom-3 left-4 z-[1] flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" />
          {t("bento.design.campaign", "Miniature livrée · 2560 × 1440")}
        </figcaption>
      </figure>
    </div>
  );
}

/* ── Tuile 2 : Brand — l'identité en construction ──────────────── */
function BrandScene() {
  const { t } = useTranslations();
  const palette = ["#C7F464", "#0C0F14", "#1F2530", "#E8ECF2", "#4A5468"];
  return (
    <div className="flex h-full flex-col gap-4 p-6">
      {/* La planche logo posée sur la grille de construction */}
      <figure className="pv-media pv-blueprint min-h-[170px] flex-1 bg-abyss">
        <Image
          src="/showcase/logo-kova.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 90vw, 34vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
        <figcaption className="absolute bottom-3 left-3 z-[1] rounded-full border border-[rgba(29,35,64,0.08)] bg-[rgba(255,255,255,0.85)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink">
          {t("bento.brand.meta", "Identité Kova · vectoriel")}
        </figcaption>
      </figure>
      {/* Palette + typographies : la charte en raccourci */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-4">
        <div className="flex gap-2">
          {palette.map((c) => (
            <span
              key={c}
              className="h-7 w-7 rounded-full border border-[rgba(29,35,64,0.1)]"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <dl className="flex flex-col gap-1 font-mono text-[9.5px] uppercase tracking-[0.12em]">
          <div className="flex justify-between gap-2">
            <dt className="text-mist">{t("bento.brand.wordmark", "Wordmark")}</dt>
            <dd className="text-slate">Space Grotesk</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-mist">{t("bento.brand.usage", "Déclinaisons")}</dt>
            <dd className="text-slate">App · Carte · Web</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ── Tuile 3 : Enhance — le détail ×4, netteté conservée ───────── */
function EnhanceScene() {
  const { t } = useTranslations();
  return (
    <div className="flex h-full min-h-[250px] flex-col gap-3 p-6">
      <div className="relative grid flex-1 grid-cols-[1fr_1.15fr] gap-3">
        <figure className="pv-media">
          <Image src="/jetski.jpg" alt="" fill sizes="(max-width: 1024px) 40vw, 16vw" className="object-cover" />
          <span
            aria-hidden
            className="absolute left-[40%] top-[16%] z-[1] h-[42%] w-[26%] rounded-md border border-[rgba(124,106,255,0.85)] shadow-[0_0_16px_rgba(124,106,255,0.45)]"
          />
          <figcaption className="absolute bottom-3 left-3 z-[1] font-mono text-[9px] uppercase tracking-[0.14em] text-white/75">
            {t("bento.enhance.source", "Source")}
          </figcaption>
        </figure>
        <figure className="pv-media border-[rgba(124,106,255,0.35)]">
          <Image
            src="/jetski.jpg"
            alt=""
            fill
            sizes="100vw"
            quality={90}
            className="scale-[3.6] object-cover"
            style={{ objectPosition: "53% 37%", transformOrigin: "53% 37%" }}
          />
          <figcaption className="absolute bottom-3 left-3 z-[1] font-mono text-[9px] uppercase tracking-[0.14em] text-white">
            {t("bento.enhance.zoom", "Détail ×4 · 8K")}
          </figcaption>
        </figure>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
        {t("bento.enhance.note", "Upscale 8K — le grain devient de la matière")}
      </p>
    </div>
  );
}

/* ── Tuile 4 : Creative Director — le moodboard qui répond ─────── */
function DirectorScene() {
  const { t } = useTranslations();
  const moods = [
    { src: "/showcase/thumb-esport.webp", label: "Néon" },
    { src: "/showcase/logo-volt.webp", label: "Carbone" },
    { src: "/showcase/charte-kova.webp", label: "Lime" },
  ];
  return (
    <div className="flex h-full min-h-[250px] flex-col justify-end gap-3 p-6">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-white/60 px-4 py-3 text-[12.5px] leading-[1.6] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(29,35,64,0.05)]">
        {t("bento.director.user", "Il me faut une identité pour ma chaîne tech.")}
      </div>
      <div className="mr-auto max-w-[94%] rounded-2xl rounded-bl-md border border-[rgba(124,106,255,0.3)] bg-[rgba(124,106,255,0.06)] px-4 py-3 text-[12.5px] leading-[1.6] text-slate">
        {t(
          "bento.director.answer",
          "Trois pistes, moodboards à l'appui. Je compose la première ?"
        )}
        <span className="mt-3 flex gap-2">
          {moods.map((mood) => (
            <span key={mood.label} className="pv-media relative h-[52px] flex-1">
              <Image src={mood.src} alt="" fill sizes="90px" className="object-cover" />
              <span className="absolute bottom-1 left-2 z-[1] font-mono text-[8px] uppercase tracking-[0.12em] text-white/85">
                {mood.label}
              </span>
            </span>
          ))}
        </span>
      </div>
      <div className="mr-auto flex items-center gap-2 pl-1 pt-1">
        <span className="h-1 w-1 animate-pulse rounded-full bg-[color:var(--num-color)]" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-[color:var(--num-color)] [animation-delay:150ms]" />
        <span className="h-1 w-1 animate-pulse rounded-full bg-[color:var(--num-color)] [animation-delay:300ms]" />
        <span className="ml-2 font-mono text-[10px] text-mist">
          {t("bento.director.typing", "compose un moodboard…")}
        </span>
      </div>
    </div>
  );
}

/* ── Tuile 5 : Character — la carte d'identité ──────────────────── */
function CharacterScene() {
  const { t } = useTranslations();
  return (
    <div className="flex h-full min-h-[250px] items-center justify-center p-6">
      <div className="relative w-full max-w-[300px] -rotate-2 overflow-hidden rounded-[12px] border border-[rgba(255,255,255,0.62)] bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),var(--shadow-print)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-0">
        <div className="flex items-center justify-between border-b border-[rgba(29,35,64,0.07)] px-4 py-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate">
            {t("bento.character.state", "État de San Andreas")}
          </span>
          <span className="font-mono text-[9px] tracking-[0.14em] text-[color:var(--num-color)]">
            ID-2947
          </span>
        </div>
        <div className="flex gap-4 p-4">
          <div className="relative h-[84px] w-[68px] shrink-0 overflow-hidden rounded-md bg-abyss">
            <Image
              src="/poser.png"
              alt=""
              fill
              sizes="140px"
              className="scale-[2.1] object-cover"
              style={{ objectPosition: "38% 26%" }}
            />
          </div>
          <dl className="flex flex-col gap-2 font-mono text-[10px] leading-none">
            <div>
              <dt className="mb-1 uppercase tracking-[0.14em] text-mist">
                {t("bento.character.name", "Nom")}
              </dt>
              <dd className="text-[12px] tracking-[0.06em] text-ink">V. MORETTI</dd>
            </div>
            <div>
              <dt className="mb-1 uppercase tracking-[0.14em] text-mist">
                {t("bento.character.job", "Profession")}
              </dt>
              <dd className="text-[11px] tracking-[0.04em] text-slate">
                {t("bento.character.jobValue", "Import-export")}
              </dd>
            </div>
            <div>
              <dt className="mb-1 uppercase tracking-[0.14em] text-mist">
                {t("bento.character.status", "Casier")}
              </dt>
              <dd className="text-[11px] tracking-[0.04em] text-warn">
                {t("bento.character.statusValue", "3 mentions")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

/* ── Tuile 6 : Audit — le bandeau verdict qui ferme la section ─── */
function AuditScene() {
  const { t } = useTranslations();
  const bars = [
    { label: t("bento.audit.compo", "Composition"), value: 88 },
    { label: t("bento.audit.typo", "Typographie"), value: 74 },
    { label: t("bento.audit.impact", "Impact"), value: 91 },
  ];
  return (
    <div className="grid h-full gap-6 p-6 md:grid-cols-[1.1fr_auto_1.2fr] md:items-center">
      <figure className="pv-media relative h-[120px] md:h-[136px]">
        <Image
          src="/bglanding.png"
          alt=""
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover"
          style={{ objectPosition: "50% 30%" }}
        />
        <figcaption className="absolute bottom-2 left-3 z-[1] font-mono text-[9px] uppercase tracking-[0.14em] text-white/80">
          {t("bento.audit.imageLabel", "Visuel audité")}
        </figcaption>
      </figure>
      <p className="flex items-baseline gap-2 md:flex-col md:items-center md:gap-1 md:border-x md:border-[rgba(29,35,64,0.07)] md:px-10">
        <span className="font-display text-[56px] font-light leading-none text-ink md:text-[64px]">
          <CountUp value={84} />
        </span>
        <span className="font-mono text-[12px] text-mist">/100</span>
        <span className="ml-auto rounded-full border border-ok/30 bg-ok/10 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ok md:ml-0 md:mt-2">
          {t("bento.audit.verdict", "Solide")}
        </span>
      </p>
      <div className="flex flex-col gap-3">
        {bars.map((bar) => (
          <div key={bar.label}>
            <p className="mb-2 flex justify-between font-mono text-[10px] tracking-[0.08em]">
              <span className="uppercase tracking-[0.14em] text-slate">{bar.label}</span>
              <span className="text-ink">
                <CountUp value={bar.value} duration={1.2} />
              </span>
            </p>
            <div className="pv-gauge">
              <span style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GivreModules() {
  const { t } = useTranslations();

  return (
    <section id="modules" className="pv-scene">
      <div aria-hidden className="pv-scene-bg pv-scene-bg--glacier" />
      <div aria-hidden className="pv-caustics" />
      <div className="relative mx-auto max-w-[1140px] px-5 py-20 sm:px-8 lg:py-24">
        {/* En-tête latéral droit — le miroir du hero : la pagination
            et le titre se rangent contre le filet droit du cadre */}
        <div className="flex flex-col items-end text-right">
          <RevealBlock>
            <div className="pv-page-num justify-end [&>b]:text-[44px]">
              <b>06</b>
              <span>/08</span>
            </div>
            <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("bento.label", "Modules")}
            </p>
          </RevealBlock>
          <RevealMask className="mt-4">
            <h2 className="max-w-[720px] font-display text-[clamp(2rem,4.4vw,3.3rem)] font-light leading-[1.12] tracking-[-0.015em] text-slate">
              {t("bento.title", "Six modules. Une seule direction artistique.")}
            </h2>
          </RevealMask>
          <RevealBlock delay={0.12}>
            <p className="mt-5 max-w-[500px] text-[15px] leading-[1.7] text-slate">
              {t(
                "bento.subtitle",
                "Chaque module travaille la même matière : votre image. De la miniature à la charte complète, sans jamais perdre la ligne."
              )}
            </p>
          </RevealBlock>
        </div>

        {/* Filet blanc — l'en-tête se détache de la grille */}
        <div aria-hidden className="mt-12 h-px w-full bg-[rgba(255,255,255,0.55)]" />

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <RevealBlock className="lg:col-span-7">
            <Tile
              className="h-full"
              title={t("bento.design.title", "Design Studio")}
              description={t(
                "bento.design.desc",
                "Miniatures, affiches, bannières : un brief, des rendus prêts à publier."
              )}
            >
              <DesignStudioScene />
            </Tile>
          </RevealBlock>
          <RevealBlock delay={0.08} className="lg:col-span-5">
            <Tile
              className="h-full"
              title={t("bento.brand.title", "Brand")}
              description={t(
                "bento.brand.desc",
                "Logos et chartes complètes : palette, typographies, déclinaisons."
              )}
            >
              <BrandScene />
            </Tile>
          </RevealBlock>
          <RevealBlock className="lg:col-span-4">
            <Tile
              className="h-full"
              title={t("bento.enhance.title", "Enhance")}
              description={t(
                "bento.enhance.desc",
                "Vos visuels existants repassent au studio — netteté, lumière, 8K."
              )}
            >
              <EnhanceScene />
            </Tile>
          </RevealBlock>
          <RevealBlock delay={0.08} className="lg:col-span-4">
            <Tile
              className="h-full"
              title={t("bento.director.title", "Creative Director")}
              description={t(
                "bento.director.desc",
                "Le directeur artistique qui répond, propose et lance la génération."
              )}
            >
              <DirectorScene />
            </Tile>
          </RevealBlock>
          <RevealBlock delay={0.16} className="lg:col-span-4">
            <Tile
              className="h-full"
              title={t("bento.character.title", "Character")}
              description={t(
                "bento.character.desc",
                "Personnages et mascottes pour vos serveurs et vos chaînes."
              )}
            >
              <CharacterScene />
            </Tile>
          </RevealBlock>
          <RevealBlock delay={0.1} className="lg:col-span-12">
            <Tile
              className="h-full"
              title={t("bento.audit.title", "Audit")}
              description={t(
                "bento.audit.desc",
                "Une note détaillée sur votre design — et la version corrigée."
              )}
            >
              <AuditScene />
            </Tile>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
