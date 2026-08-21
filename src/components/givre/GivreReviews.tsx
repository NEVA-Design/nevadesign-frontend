"use client";

/*
 * 03 — Avis clients (REFONTE 50k). La grande citation à gauche
 * reste ; le registre de droite devient un DÉFILEMENT : lignes
 * fines sans cartes, index mono, masque de fondu haut/bas, boucle
 * lente (46 s), pause au survol, clic = la pull-quote change.
 * Plus aucune pastille d'initiales (liste noire №1) — le pseudo
 * mono suffit. Étoiles au trait ARGENT (l'aurore est une lumière,
 * jamais un glyphe UI).
 */

import { useEffect, useRef, useState } from "react";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";
import { useTranslations } from "@/components/LanguageProvider";
import reviews from "@/data/reviews.json";

type Review = {
  slug: string;
  pseudo: string;
  tag?: string;
  produit: string | null;
  note: number;
  texte: string;
};

/* Étoiles fines — trait 1.2 px argent, la voix précieuse du site */
function StarsFine({ note, size = 13 }: { note: number; size?: number }) {
  return (
    <span className="flex gap-[3px]" aria-label={`${note}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < note ? "rgba(200,203,208,0.2)" : "none"}
          stroke={i < note ? "#C8CBD0" : "rgba(255,255,255,0.22)"}
          strokeWidth="1.2"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
        </svg>
      ))}
    </span>
  );
}

const ROTATE_MS = 6000;

export default function GivreReviews() {
  const { t } = useTranslations();
  const list = reviews as Review[];
  const [active, setActive] = useState(0);
  /* pause au survol — lue par l'intervalle, jamais de re-render */
  const hovered = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!hovered.current) setActive((a) => (a + 1) % list.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [list.length]);

  const current = list[active];

  /* Une copie du registre = la liste des 9 lignes. Deux copies
     empilées + cycle −50 % : boucle sans couture. */
  const registerCopy = (copy: number) => (
    <ol key={copy} aria-hidden={copy > 0} className="shrink-0">
      {list.map((review, i) => {
        const isActive = copy === 0 && i === active;
        return (
          <li key={`${review.slug}-${copy}`} className="border-b border-[color:var(--color-ligne)] first:border-t">
            <button
              type="button"
              data-qa={copy === 0 ? "avis-ligne" : undefined}
              tabIndex={copy === 0 ? 0 : -1}
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={
                "relative flex w-full items-center gap-4 px-4 py-[13px] text-left transition-colors duration-200" +
                (isActive ? " bg-[rgba(255,255,255,0.04)]" : " hover:bg-[rgba(255,255,255,0.025)]")
              }
            >
              {/* filet argent de l'entrée active */}
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[2px] bg-[color:var(--color-argent)] transition-opacity duration-200"
                style={{ opacity: isActive ? 0.9 : 0 }}
              />
              <span
                className={
                  "font-mono text-[10px] tracking-[0.1em] " +
                  (isActive ? "text-ink" : "text-mist")
                }
              >
                {String(i + 1).padStart(3, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={
                    "block truncate text-[13.5px] " +
                    (isActive ? "font-medium text-ink" : "text-slate")
                  }
                >
                  {review.pseudo}
                </span>
                <span className="mt-[2px] block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-mist">
                  {review.produit ?? review.tag ?? "Client"}
                </span>
              </span>
              <StarsFine note={review.note} size={10} />
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <section id="avis" className="pv-scene pv-section--tight">
      <div aria-hidden className="pv-scene-bg--calm absolute inset-0" />
      <div aria-hidden className="pv-field-light pv-field-light--bl" />

      <div
        className="relative z-10"
        style={{
          paddingLeft: "calc(var(--frame-inset) + 24px)",
          paddingRight: "calc(var(--frame-inset) + 24px)",
        }}
      >
        <div className="pv-container mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <RevealBlock>
                <div className="pv-page-num [&>b]:text-[44px]">
                  <b>03</b>
                  <span>/10</span>
                </div>
              </RevealBlock>
              <RevealBlock delay={0.06}>
                <p className="pv-label mt-8">
                  {t("reviews.label", "Avis clients")}
                </p>
              </RevealBlock>
              <RevealMask delay={0.12} className="mt-4">
                <h2 className="pv-display pv-t-mid">
                  {t("reviews.title.a", "Ils ont commandé.")}{" "}
                  <b>{t("reviews.title.beam", "Ils reviennent.")}</b>
                </h2>
              </RevealMask>
            </div>
            <RevealBlock delay={0.16}>
              <div className="flex items-center gap-3">
                <StarsFine note={5} />
                <p className="pv-label !text-[color:var(--color-mist)]">
                  {t("reviews.note", "5/5 — 9 avis")}
                </p>
              </div>
            </RevealBlock>
          </div>

          {/* ── Le duo : pull-quote (60 %) + registre défilant (40 %) ── */}
          <div
            className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14"
            onMouseEnter={() => (hovered.current = true)}
            onMouseLeave={() => (hovered.current = false)}
          >
            {/* La pull-quote — remontée à chaque changement d'entrée */}
            <RevealBlock>
              <figure key={current.slug} className="pv-quote-in flex h-full flex-col justify-center">
                <StarsFine note={current.note} size={15} />
                <blockquote className="mt-6">
                  <p className="pv-display text-[clamp(26px,3vw,42px)] !leading-[1.24] !text-[color:var(--color-ink)]">
                    <span aria-hidden className="mr-1 text-[0.9em] text-mist">«&#8202;</span>
                    {current.texte}
                    <span aria-hidden className="ml-1 text-[0.9em] text-mist">&#8202;»</span>
                  </p>
                </blockquote>
                <figcaption className="mt-7 flex items-baseline gap-3">
                  <span aria-hidden className="inline-block h-px w-6 self-center bg-[color:var(--color-ligne-2)]" />
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist">
                    {current.pseudo}
                    {current.produit ? (
                      <span> · {current.produit}</span>
                    ) : current.tag ? (
                      <span> · {current.tag}</span>
                    ) : null}
                  </span>
                </figcaption>
              </figure>
            </RevealBlock>

            {/* Le registre — défilement lent sous masque de fondu */}
            <RevealBlock delay={0.1}>
              <div
                className="relative max-h-[460px] overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(180deg, transparent 0, black 56px, black calc(100% - 56px), transparent 100%)",
                  maskImage:
                    "linear-gradient(180deg, transparent 0, black 56px, black calc(100% - 56px), transparent 100%)",
                }}
              >
                <div className="pv-marquee-v" style={{ "--marquee-duration": "46s" } as React.CSSProperties}>
                  {registerCopy(0)}
                  {registerCopy(1)}
                </div>
              </div>
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
