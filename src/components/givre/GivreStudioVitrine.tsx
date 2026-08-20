"use client";

/*
 * 02 — Le Studio (pivot 20/08). La vitrine du studio de graphisme :
 * pitch, prestations, l'équipe (team.json, avatars à venir →
 * initiales), le process en 4 étapes, et LE CTA de conversion :
 * Commander sur Discord. Structure : en-tête éditorial pleine
 * largeur, puis deux registres — l'équipe en cartes de verre, le
 * process en rangées numérotées (aucune voisine ne partage cette
 * structure).
 */

import { RevealBlock } from "@/components/prisme/Motion";
import { useTranslations } from "@/components/LanguageProvider";
import { DISCORD_URL } from "@/lib/links";
import { ArrowRight } from "lucide-react";
import team from "@/data/team.json";

type TeamMember = {
  id: string;
  /* null tant que les pseudos réels ne sont pas fournis (Sami) :
     la carte se présente alors par métier — jamais de placeholder */
  pseudo: string | null;
  role: string;
  mission: string;
  avatar: string | null;
};

/* Initiales du pseudo (ou du métier en attendant) — fallback avatar
   tant que les photos ne sont pas fournies : 2 lettres, tags [XXX]
   ignorés. */
function initials(pseudo: string) {
  const words = pseudo
    .replace(/\[.*?\]/g, "")
    .split(/[\s_.&-]+/)
    .filter(Boolean);
  const a = words[0]?.[0] ?? "?";
  const b = words[1]?.[0] ?? words[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

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

export default function GivreStudioVitrine() {
  const { t } = useTranslations();
  const members = team as TeamMember[];

  return (
    <section id="studio" className="pv-scene pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      {/* Glows aurore derrière les cartes de verre — la matière que
          le blur attrape */}
      <div aria-hidden className="pv-halo pv-halo--violet left-[4%] top-[30%] h-[520px] w-[560px]" />
      <div aria-hidden className="pv-halo pv-halo--cyan right-[2%] top-[52%] h-[460px] w-[520px]" />

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
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                  {t("studio.eyebrow", "Le studio — des graphistes, en direct")}
                </p>
              </RevealBlock>
              <RevealBlock delay={0.12}>
                <h2 className="pv-display pv-section-title mt-4">
                  {t("studio.title.a", "Un studio de graphisme")}{" "}
                  <b>{t("studio.title.beam", "à votre service.")}</b>
                </h2>
              </RevealBlock>
            </div>
            <RevealBlock delay={0.18}>
              <p className="mt-6 text-[15px] leading-[1.7] text-slate lg:mt-0">
                {t(
                  "studio.pitch",
                  "Neva Design, c'est d'abord une équipe de graphistes. Identités, packs FiveM, bannières, affiches, loading screens, overlays — briefés sur Discord, suivis en vocal, livrés vite."
                )}
              </p>
            </RevealBlock>
          </div>

          {/* Prestations — pilules mono */}
          <RevealBlock delay={0.2}>
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {SERVICES.map((s) => (
                <li
                  key={s.key}
                  className="pv-pill !min-h-[36px] font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate"
                >
                  {t(s.key, s.fallback)}
                </li>
              ))}
            </ul>
          </RevealBlock>

          {/* L'équipe — cartes de verre */}
          <RevealBlock delay={0.1}>
            <p className="mt-16 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("studio.team.label", "L'équipe")}
            </p>
          </RevealBlock>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {members.map((m, i) => (
              <RevealBlock key={m.id} delay={0.08 + i * 0.06}>
                <div className="pv-glass pv-glass--card pv-card-hover flex flex-col items-center px-5 py-8 text-center">
                  {m.avatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.avatar}
                      alt={m.pseudo ?? m.role}
                      width={64}
                      height={64}
                      loading="lazy"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-16 w-16 items-center justify-center rounded-full font-display text-[20px] font-medium text-ink"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(184,161,232,0.30), rgba(240,197,168,0.26))",
                      }}
                    >
                      {initials(m.pseudo ?? t(`studio.team.${m.id}.role`, m.role))}
                    </span>
                  )}
                  <p className="mt-4 text-[15px] font-medium text-ink">
                    {m.pseudo ?? t(`studio.team.${m.id}.role`, m.role)}
                  </p>
                  {m.pseudo ? (
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">
                      {t(`studio.team.${m.id}.role`, m.role)}
                    </p>
                  ) : (
                    <p className="mt-2 max-w-[220px] text-[12.5px] leading-[1.6] text-mist">
                      {t(`studio.team.${m.id}.mission`, m.mission)}
                    </p>
                  )}
                </div>
              </RevealBlock>
            ))}
          </div>

          {/* Le process — 4 rangées numérotées */}
          <RevealBlock delay={0.1}>
            <p className="mt-16 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("studio.process.label", "Le process")}
            </p>
          </RevealBlock>
          <div className="mt-6 grid gap-px overflow-hidden rounded-[16px] border border-[color:var(--hairline-glass)] bg-[color:var(--hairline)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_44px_rgba(0,0,0,0.50)] sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div
                key={p.key}
                className="bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] px-6 py-7"
              >
                <RevealBlock delay={0.08 + i * 0.06}>
                  <span className="pv-num pv-beam-text !text-[13px]">0{i + 1}</span>
                  <p className="mt-3 text-[15.5px] font-medium text-ink">
                    {t(`${p.key}.title`, p.title)}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-[1.65] text-mist">
                    {t(`${p.key}.desc`, p.desc)}
                  </p>
                </RevealBlock>
              </div>
            ))}
          </div>

          {/* CTA — la commande se passe sur Discord */}
          <RevealBlock delay={0.14}>
            <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="pv-btn min-h-[50px]"
              >
                {t("studio.cta", "Commander sur Discord")}
                <ArrowRight size={15} strokeWidth={1.8} />
              </a>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist">
                {t("studio.cta.note", "Brief, suivi et livraison — tout se passe sur Discord")}
              </p>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
