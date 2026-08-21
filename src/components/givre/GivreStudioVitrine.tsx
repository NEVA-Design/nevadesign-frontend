"use client";

/*
 * 02 — Le Studio (REFONTE 50k). Le template est mort : plus de
 * cartes, plus de pastilles d'initiales, plus de pills.
 *   Prestations — une rangée de tags mono séparés par « · ».
 *   Équipe — un REGISTRE éditorial pleine largeur : index mono
 *   ( 01—04 ), métier en display, mission sur une ligne, filet
 *   inférieur. Au survol la rangée s'illumine (argent) et le
 *   visuel du métier se révèle à droite, suivant le curseur.
 *   Process — une LIGNE TEMPORELLE horizontale unique : un rail
 *   qui se remplit au fil du scroll, quatre étapes posées dessus.
 */

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";
import { useTranslations } from "@/components/LanguageProvider";
import { DISCORD_URL } from "@/lib/links";
import { ArrowRight } from "lucide-react";
import team from "@/data/team.json";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type TeamMember = {
  id: string;
  pseudo: string | null;
  role: string;
  mission: string;
  avatar: string | null;
};

/* Le visuel de chaque métier — des livrables réels du studio,
   déjà présents dans /public (aucun octet nouveau). */
const CRAFT_VISUALS: Record<string, { src: string; alt: string }> = {
  g1: { src: "/affiche3.webp", alt: "Affiche d'événement dirigée par la DA" },
  g2: { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Identité complète d'un serveur" },
  g3: { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack graphique FiveM livré" },
  g4: { src: "/vice.webp", alt: "Scène animée pour habillage de stream" },
};

const SERVICES = [
  { key: "studio.service.1", fallback: "Logos & identités" },
  { key: "studio.service.2", fallback: "Packs FiveM complets" },
  { key: "studio.service.3", fallback: "Bannières Discord & réseaux" },
  { key: "studio.service.4", fallback: "Affiches & posters" },
  { key: "studio.service.5", fallback: "Loading screens" },
  { key: "studio.service.6", fallback: "Overlays de stream" },
  { key: "studio.service.7", fallback: "Créations sur mesure" },
];

const PROCESS = [
  {
    key: "studio.process.1",
    title: "Brief",
    desc: "Vous décrivez le besoin sur Discord : références, ambiance, délais.",
  },
  {
    key: "studio.process.2",
    title: "Suivi en direct",
    desc: "Le graphiste travaille avec vous en vocal — vous voyez la création avancer.",
  },
  {
    key: "studio.process.3",
    title: "Révisions",
    desc: "Les ajustements se font dans la foulée, jusqu'à la version validée.",
  },
  {
    key: "studio.process.4",
    title: "Livraison rapide",
    desc: "Fichiers finaux livrés dans les meilleurs délais, prêts à l'emploi.",
  },
];

/* Une rangée du registre équipe — le visuel du métier se révèle au
   survol et suit doucement le curseur (quickTo, desktop only). */
function CraftRow({
  index,
  member,
  roleLabel,
  missionLabel,
}: {
  index: number;
  member: TeamMember;
  roleLabel: string;
  missionLabel: string;
}) {
  const row = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  const yTo = useRef<((v: number) => void) | null>(null);

  useGSAP(
    () => {
      if (!visual.current) return;
      yTo.current = gsap.quickTo(visual.current, "y", {
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { scope: row }
  );

  const onMove = (e: React.MouseEvent) => {
    if (!row.current || !yTo.current) return;
    const r = row.current.getBoundingClientRect();
    const rel = (e.clientY - r.top) / r.height - 0.5;
    yTo.current(rel * 26);
  };

  const craft = CRAFT_VISUALS[member.id];

  return (
    <div
      ref={row}
      onMouseMove={onMove}
      className="group relative border-b border-[color:var(--color-ligne)] transition-colors duration-500 first:border-t hover:bg-[rgba(255,255,255,0.025)]"
    >
      {/* filet bas qui s'allume argent au survol */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[-1px] h-px origin-left scale-x-0 bg-[color:var(--color-argent)] opacity-70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
      />
      <div className="flex items-baseline gap-5 py-7 pr-[calc(200px+3vw)] sm:gap-8 sm:py-8 lg:pr-[calc(240px+3vw)] max-lg:!pr-0">
        <span className="pv-num w-14 shrink-0 whitespace-nowrap text-[color:var(--ink-28)] transition-colors duration-500 group-hover:text-[color:var(--color-argent)]">
          ( 0{index + 1} )
        </span>
        <h3 className="pv-display pv-t-field-card min-w-0 shrink-0 basis-[46%] !text-[color:var(--text-2)] transition-colors duration-500 group-hover:!text-[color:var(--color-ink)] sm:basis-[38%]">
          {member.pseudo ?? roleLabel}
        </h3>
        <p className="hidden min-w-0 flex-1 truncate text-[14px] leading-[1.6] text-mist sm:block">
          {missionLabel}
        </p>
      </div>
      {/* mission en 2e ligne sous 640 (jamais tronquée en aveugle) */}
      <p className="pb-6 pl-[68px] pr-4 text-[13.5px] leading-[1.6] text-mist sm:hidden">
        {missionLabel}
      </p>

      {/* Le visuel du métier — révélé au survol, suit le curseur */}
      {craft ? (
        <div
          ref={visual}
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 hidden w-[220px] -translate-y-1/2 lg:block"
        >
          <div className="overflow-hidden rounded-[6px] border border-[color:var(--color-ligne-2)] opacity-0 shadow-[0_18px_44px_rgba(0,0,0,0.55)] transition-[opacity,clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [clip-path:inset(12%_8%_12%_8%)] group-hover:opacity-100 group-hover:[clip-path:inset(0%_0%_0%_0%)]">
            <Image
              src={craft.src}
              alt=""
              width={440}
              height={275}
              sizes="220px"
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* La ligne temporelle du process — un rail unique qui se remplit
   au fil du scroll, quatre étapes posées dessus. */
function ProcessTimeline({
  t,
}: {
  t: (key: string, fallback?: string) => string;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope);
      gsap.fromTo(
        q("[data-rail-fill]"),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: scope.current,
            start: "top 82%",
            end: "bottom 45%",
            scrub: 0.5,
          },
        }
      );
      /* chaque étape s'éveille quand le remplissage la rejoint */
      q("[data-step]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0.35 },
          {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scope.current,
              start: `top+=${i * 8}% 70%`,
              once: true,
            },
          }
        );
      });
    },
    { scope }
  );

  return (
    <div ref={scope}>
      {/* Desktop : rail horizontal */}
      <div className="relative hidden lg:block">
        <div aria-hidden className="absolute left-0 right-0 top-[5px] h-px bg-[color:var(--color-ligne)]" />
        <div
          aria-hidden
          data-rail-fill
          className="absolute left-0 right-0 top-[5px] h-px bg-[color:var(--color-argent)] opacity-80"
        />
        <ol className="grid grid-cols-4 gap-8">
          {PROCESS.map((p, i) => (
            <li key={p.key} data-step className="relative pt-8">
              <span
                aria-hidden
                className="absolute left-0 top-0 h-[11px] w-[11px] rounded-full border border-[color:var(--color-argent)] bg-[color:var(--color-noir-0)]"
              />
              <span className="pv-num text-[color:var(--color-argent)]">0{i + 1}</span>
              <p className="mt-3 text-[16px] font-medium text-ink">
                {t(`${p.key}.title`, p.title)}
              </p>
              <p className="mt-2 max-w-[30ch] text-[13.5px] leading-[1.65] text-mist">
                {t(`${p.key}.desc`, p.desc)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile : le même rail, vertical */}
      <ol className="relative flex flex-col gap-9 border-l border-[color:var(--color-ligne)] pl-7 lg:hidden">
        {PROCESS.map((p, i) => (
          <li key={p.key} data-step className="relative">
            <span
              aria-hidden
              className="absolute left-[-32px] top-[3px] h-[11px] w-[11px] rounded-full border border-[color:var(--color-argent)] bg-[color:var(--color-noir-0)]"
            />
            <span className="pv-num text-[color:var(--color-argent)]">0{i + 1}</span>
            <p className="mt-2 text-[16px] font-medium text-ink">
              {t(`${p.key}.title`, p.title)}
            </p>
            <p className="mt-1.5 text-[13.5px] leading-[1.65] text-mist">
              {t(`${p.key}.desc`, p.desc)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function GivreStudioVitrine() {
  const { t } = useTranslations();
  const members = team as TeamMember[];

  return (
    <section id="studio" className="pv-scene pv-section--tight">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-field-light pv-field-light--tr" />

      <div
        className="relative z-10"
        style={{
          paddingLeft: "calc(var(--frame-inset) + 24px)",
          paddingRight: "calc(var(--frame-inset) + 24px)",
        }}
      >
        <div className="pv-container mx-auto">
          {/* En-tête éditorial */}
          <RevealBlock>
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>02</b>
              <span>/10</span>
            </div>
          </RevealBlock>
          <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:gap-12">
            <div>
              <RevealBlock delay={0.06}>
                <p className="pv-label">
                  {t("studio.eyebrow", "Le studio — des graphistes, en direct")}
                </p>
              </RevealBlock>
              <RevealMask delay={0.12} className="mt-4">
                <h2 className="pv-display pv-section-title">
                  {t("studio.title.a", "Un studio de graphisme")}{" "}
                  <b>{t("studio.title.beam", "à votre service.")}</b>
                </h2>
              </RevealMask>
            </div>
            <RevealBlock delay={0.18}>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-[1.7] text-slate lg:mt-0">
                {t(
                  "studio.pitch",
                  "Neva Design, c'est d'abord une équipe de graphistes. Identités, packs FiveM, bannières, affiches, loading screens, overlays — briefés sur Discord, suivis en vocal, livrés vite."
                )}
              </p>
            </RevealBlock>
          </div>

          {/* Prestations — la rangée de tags mono (fini les pills) */}
          <RevealBlock delay={0.2}>
            <ul className="pv-tag-row mt-12">
              {SERVICES.map((s) => (
                <li key={s.key}>{t(s.key, s.fallback)}</li>
              ))}
            </ul>
          </RevealBlock>

          {/* L'équipe — le registre des métiers */}
          <RevealBlock delay={0.1}>
            <p className="pv-label mt-20">
              {t("studio.team.label", "L'équipe")}
            </p>
          </RevealBlock>
          <div className="mt-6">
            {members.map((m, i) => (
              <RevealBlock key={m.id} delay={0.05 + i * 0.05}>
                <CraftRow
                  index={i}
                  member={m}
                  roleLabel={t(`studio.team.${m.id}.role`, m.role)}
                  missionLabel={t(`studio.team.${m.id}.mission`, m.mission)}
                />
              </RevealBlock>
            ))}
          </div>

          {/* Le process — la ligne temporelle */}
          <RevealBlock delay={0.1}>
            <p className="pv-label mt-20">
              {t("studio.process.label", "Le process")}
            </p>
          </RevealBlock>
          <div className="mt-8">
            <ProcessTimeline t={t} />
          </div>

          {/* CTA — la commande se passe sur Discord */}
          <RevealBlock delay={0.14}>
            <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pv-btn min-h-[50px]"
              >
                {t("studio.cta", "Commander sur Discord")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </a>
              <p className="pv-label !text-[color:var(--color-mist)]">
                {t("studio.cta.note", "Brief, suivi et livraison — tout se passe sur Discord")}
              </p>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
