"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { useTranslations } from "@/components/LanguageProvider";
import { DISCORD_URL } from "@/lib/links";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";

/*
 * FAQ Givre — le moment le plus silencieux de la page. Pas de
 * panneau : l'accordéon vit nu sur la scène dawn diluée, en pur
 * registre éditorial — numéros mono Q1…Q6, filets d'encre à sept
 * pour cent, chevron fin qui bascule. À gauche, la colonne sticky
 * porte le titre et l'appel Discord en pilule de verre.
 */
export default function GivreFAQ() {
  const { t } = useTranslations();

  const items = [
    {
      q: t("faq.q1", "Neva Design, c'est quoi exactement ?"),
      a: t(
        "faq.a1",
        "Un studio créatif complet piloté par IA : vous décrivez une intention, il compose packs FiveM, bannières, affiches et scènes GTA prêts à publier — avec une vraie direction artistique, pas une génération au hasard."
      ),
    },
    {
      q: t("faq.q2", "Que vaut vraiment le plan gratuit ?"),
      a: t(
        "faq.a2",
        "Le plan Découverte permet d'explorer le flux complet, brief compris, sans créditer de créations. Les formules débloquent les exports HD, l'usage commercial et la priorité de génération."
      ),
    },
    {
      q: t("faq.q3", "Puis-je vendre ce que je crée ?"),
      a: t(
        "faq.a3",
        "Oui. Dès le premier plan payant, chaque création vous appartient commercialement : chaîne, boutique, réseaux, serveur, livrables clients."
      ),
    },
    {
      q: t("faq.q4", "Le Creative Director, encore un chatbot ?"),
      a: t(
        "faq.a4",
        "Non. Il connaît vos références, votre historique et les codes de votre terrain — pack serveur, bannière Discord ou affiche GTA RP. Il propose des concepts, structure des briefs et peut lancer une génération depuis la conversation."
      ),
    },
    {
      q: t("faq.q5", "Je ne sais pas designer. C'est un problème ?"),
      a: t(
        "faq.a5",
        "C'est exactement pour ça que Neva existe. Décrivez le résultat voulu ; la composition, la typographie et l'étalonnage sont pris en charge. Le module Audit vous dit même quoi améliorer."
      ),
    },
    {
      q: t("faq.q6", "Et si je veux arrêter ?"),
      a: t(
        "faq.a6",
        "Deux clics depuis votre espace. Le plan reste actif jusqu'à la fin de la période en cours — rien de caché, rien de retenu."
      ),
    },
  ];

  return (
    <section id="faq" className="pv-scene">
      {/* Scène dawn diluée, sans caustiques : la respiration avant
          la finale */}
      <div aria-hidden className="pv-scene-bg pv-scene-bg--dawn-calm" />
      <div className="relative mx-auto grid pv-container grid-cols-[minmax(0,1fr)] gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:py-28">
        {/* Colonne sticky — folio, titre et appel */}
        <RevealBlock>
          <div className="lg:sticky lg:top-28">
            <div className="pv-page-num [&>b]:text-[44px]">
              <b>10</b>
              <span>/10</span>
            </div>
            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
              {t("faq.label", "Questions")}
            </p>
            <h2 className="mt-5 font-display pv-t-mid font-light leading-[1.12] tracking-[-0.015em] text-slate">
              {t("faq.title.a", "Tout ce qu'on nous demande")}{" "}
              <span className="font-medium text-ink">
                {t("faq.title.beam", "avant de se lancer.")}
              </span>
            </h2>
            <p className="mt-5 max-w-[380px] text-[15px] leading-[1.7] text-slate">
              {t("faq.subtitle", "Une question plus précise ? Le Discord répond dans la journée.")}
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pv-btn pv-btn--ghost mt-8"
            >
              {t("faq.cta", "Rejoindre le Discord")}
            </a>
          </div>
        </RevealBlock>

        {/* Le registre — l'accordéon nu, tenu par les filets */}
        <RevealBlock delay={0.1}>
          <Accordion.Root type="single" collapsible className="flex flex-col">
            {items.map((item, i) => (
              <Accordion.Item
                key={item.q}
                value={`item-${i}`}
                className="group border-t border-[rgba(255,255,255,0.08)] last:border-b"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="flex w-full cursor-pointer items-baseline gap-5 py-6 text-left sm:gap-7">
                    <span className="w-7 shrink-0 font-mono text-[11px] tracking-[0.14em] text-mist">
                      Q{i + 1}
                    </span>
                    <span className="flex-1 text-[16px] font-medium leading-snug text-ink">
                      {item.q}
                    </span>
                    {/* Croix fine — tourne à 45° à l'ouverture (§10) */}
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      aria-hidden
                      className="shrink-0 self-center text-slate transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-45"
                    >
                      <path d="M7.5 1v13M1 7.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[pv-accordion-up_0.25s_cubic-bezier(0.16,1,0.3,1)] data-[state=open]:animate-[pv-accordion-down_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                  <p className="max-w-[65ch] pb-6 pl-12 pr-10 text-[14px] leading-[1.7] text-slate sm:pl-14">
                    {item.a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </RevealBlock>
      </div>
    </section>
  );
}
