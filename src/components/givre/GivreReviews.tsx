"use client";

/*
 * 03 — Avis clients (passe whaou P4). Fini la grille 3×3 de cartes
 * jumelles : un layout ÉDITORIAL asymétrique dans l'ADN typo du
 * site (numérotation, mono, display).
 *   Gauche (~60 %) — LA pull-quote : citation en display 32-44 px,
 *   guillemets fins, étoiles fines, méta mono (pseudo · produit)
 *   avec avatar 32 px.
 *   Droite (~40 %) — le REGISTRE : les 9 entrées numérotées
 *   001 → 009, hairlines entre les lignes ; l'entrée active est
 *   surlignée (fond blanc 4 % + tick aurore 2 px à gauche) et
 *   alimente la pull-quote. Rotation auto 6 s, pause au survol,
 *   clic = activation. Transition de quote : fade + rise 300 ms.
 * Mobile : pull-quote puis registre en dessous.
 * Pseudos EXACTS conservés — mapping /public/avatars/<slug>.webp,
 * fallback initiales sur disque dégradé aurore.
 */

import { useEffect, useRef, useState } from "react";
import { RevealBlock } from "@/components/prisme/Motion";
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

function initials(pseudo: string) {
  const words = pseudo
    .replace(/\[.*?\]/g, "")
    .split(/[\s_.-]+/)
    .filter(Boolean);
  const a = words[0]?.[0] ?? "?";
  const b = words[1]?.[0] ?? words[0]?.[1] ?? "";
  return (a + b).toUpperCase();
}

/* Avatar — initiales sur disque dégradé aurore. Passer
   AVATAR_FILES_READY à true quand /public/avatars/<slug>.webp
   existeront (fournis par Sami) : en attendant, aucune requête
   réseau (le dossier n'existe pas → 9 × 404 par affichage). */
const AVATAR_FILES_READY = false;

function Avatar({ review, size = 32 }: { review: Review; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!AVATAR_FILES_READY || failed) {
    return (
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-ink"
        style={{
          width: size,
          height: size,
          background:
            "linear-gradient(135deg, rgba(184,161,232,0.34), rgba(240,197,168,0.3))",
        }}
      >
        {initials(review.pseudo)}
      </span>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/avatars/${review.slug}.webp`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

/* Étoiles FINES — au trait 1.2 px, la voix précieuse du site */
function StarsFine({ note, size = 13 }: { note: number; size?: number }) {
  return (
    <span className="flex gap-[3px]" aria-label={`${note}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < note ? "rgba(240,197,168,0.22)" : "none"}
          stroke={i < note ? "#F0C5A8" : "rgba(255,255,255,0.22)"}
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

  return (
    <section id="avis" className="pv-scene pb-24 pt-16 sm:pb-32 sm:pt-20">
      <div aria-hidden className="pv-scene-bg--calm absolute inset-0" />
      {/* Glows aurore — discrets derrière le registre */}
      <div aria-hidden className="pv-halo pv-halo--cyan left-[-4%] top-[38%] h-[480px] w-[520px]" />
      <div aria-hidden className="pv-halo pv-halo--violet right-[-2%] top-[16%] h-[520px] w-[560px]" />

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
                <p className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
                  {t("reviews.label", "Avis clients")}
                </p>
              </RevealBlock>
              <RevealBlock delay={0.12}>
                <h2 className="pv-display pv-t-mid mt-4">
                  {t("reviews.title.a", "Ils ont commandé.")}{" "}
                  <b>{t("reviews.title.beam", "Ils reviennent.")}</b>
                </h2>
              </RevealBlock>
            </div>
            <RevealBlock delay={0.16}>
              <div className="flex items-center gap-3">
                <StarsFine note={5} />
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mist">
                  {t("reviews.note", "5/5 — 9 avis")}
                </p>
              </div>
            </RevealBlock>
          </div>

          {/* ── Le duo éditorial : pull-quote (60 %) + registre (40 %) ── */}
          <div
            /* minmax(0,1fr) AUSSI en mobile (QA 20/08, R4) : sans lui,
               la colonne grid refuse de descendre sous le min-content
               des lignes truncate du registre → la section débordait
               de 64 px à 390 (citation coupée en plein mot, 5ᵉ étoile
               tronquée) */
            className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14"
            onMouseEnter={() => (hovered.current = true)}
            onMouseLeave={() => (hovered.current = false)}
          >
            {/* La pull-quote — remontée à chaque changement d'entrée */}
            <RevealBlock>
              <figure key={current.slug} className="pv-quote-in flex h-full flex-col justify-center">
                <StarsFine note={current.note} size={15} />
                <blockquote className="mt-6">
                  <p className="font-display text-[clamp(26px,3vw,42px)] font-light leading-[1.28] tracking-[-0.012em] text-ink">
                    <span aria-hidden className="mr-1 text-[0.9em] text-mist">«&#8202;</span>
                    {current.texte}
                    <span aria-hidden className="ml-1 text-[0.9em] text-mist">&#8202;»</span>
                  </p>
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <Avatar review={current} size={32} />
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

            {/* Le registre — 001 → 009 entre hairlines */}
            <RevealBlock delay={0.1}>
              <ol className="border-t border-[color:var(--hairline)]">
                {list.map((review, i) => {
                  const isActive = i === active;
                  return (
                    <li key={review.slug} className="border-b border-[color:var(--hairline)]">
                      <button
                        type="button"
                        data-qa="avis-ligne"
                        onClick={() => setActive(i)}
                        aria-pressed={isActive}
                        className={
                          "relative flex w-full items-center gap-4 px-4 py-[13px] text-left transition-colors duration-200" +
                          (isActive ? " bg-[rgba(255,255,255,0.04)]" : " hover:bg-[rgba(255,255,255,0.025)]")
                        }
                      >
                        {/* tick aurore 2 px de l'entrée active */}
                        <span
                          aria-hidden
                          className="absolute inset-y-0 left-0 w-[2px] transition-opacity duration-200"
                          style={{
                            background: "linear-gradient(180deg, #B8A1E8, #F0C5A8)",
                            opacity: isActive ? 1 : 0,
                          }}
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
            </RevealBlock>
          </div>
        </div>
      </div>
    </section>
  );
}
