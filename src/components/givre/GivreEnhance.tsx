"use client";

/*
 * 04 — Enhance. La seule des trois sections à composition centrée :
 * pagination, micro-label, titre display léger et sous-titre au
 * centre, puis le comparateur avant/après posé dans un panneau de
 * verre à l'arête chrome. Tout le mécanisme du comparateur vient
 * d'EnhanceSlider : pointer-drag volontaire, clavier, rAF — jamais
 * un effet de souris, rien ne bouge tant qu'on ne saisit pas la
 * poignée. La poignée devient une pilule de verre qui porte les
 * deux cartels AVANT / APRÈS.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { RevealBlock, RevealMask } from "@/components/prisme/Motion";

/* « La même création. Deux niveaux de finition. » → ligne légère +
   ligne accent. Le texte reste strictement celui de la clé : on
   coupe l'affichage à la première fin de phrase, rien de plus. */
function splitTitle(raw: string): [string, string | null] {
  const cut = raw.indexOf(". ");
  if (cut === -1) return [raw, null];
  return [raw.slice(0, cut + 1), raw.slice(cut + 2)];
}

export default function GivreEnhance() {
  const { t } = useTranslations();
  const frameRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pos = useRef(50);
  const raf = useRef(0);
  const dragging = useRef(false);
  /* Refonte 50k : auto-balayage lent (sinus 35-65 %) tant que le
     visiteur n'a pas saisi la poignée — la démo vit toute seule. */
  const interacted = useRef(false);

  const paint = useCallback(() => {
    raf.current = 0;
    const v = pos.current;
    if (beforeRef.current)
      beforeRef.current.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    if (handleRef.current) {
      handleRef.current.style.left = `${v}%`;
      handleRef.current.setAttribute("aria-valuenow", String(Math.round(v)));
    }
  }, []);

  const setPos = useCallback(
    (v: number) => {
      pos.current = Math.min(96, Math.max(4, v));
      if (!raf.current) raf.current = requestAnimationFrame(paint);
    },
    [paint]
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    let sweep = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (interacted.current) return;
      /* période 9 s, amplitude 35-65 % — assez lent pour se lire
         comme une respiration, jamais comme un bug */
      setPos(50 + 15 * Math.sin(((now - t0) / 9000) * Math.PI * 2));
      sweep = requestAnimationFrame(tick);
    };
    sweep = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(sweep);
  }, [setPos]);

  const posFromEvent = useCallback((e: React.PointerEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return ((e.clientX - rect.left) / rect.width) * 100;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      interacted.current = true;
      setPos(posFromEvent(e));
      try {
        frameRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* certains environnements refusent la capture — le drag suit quand même */
      }
    },
    [posFromEvent, setPos]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      setPos(posFromEvent(e));
    },
    [posFromEvent, setPos]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    try {
      frameRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* rien à relâcher */
    }
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      interacted.current = true;
      if (e.key === "ArrowLeft") setPos(pos.current - 4);
      else if (e.key === "ArrowRight") setPos(pos.current + 4);
      else if (e.key === "Home") setPos(4);
      else if (e.key === "End") setPos(96);
      else return;
      e.preventDefault();
    },
    [setPos]
  );

  const [titleLead, titleAccent] = splitTitle(
    t("enhance.title", "La même création. Deux niveaux de finition.")
  );

  return (
    <section id="enhance" className="pv-scene pv-section--tight">
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />

      <div className="relative z-10 mx-auto w-full pv-container px-5 sm:px-8">
        {/* En-tête éditorial centré — la symétrie est l'identité
            de cette section, à rebours des deux voisines */}
        <div className="mx-auto max-w-[760px] text-center">
          <RevealBlock>
            <div className="pv-page-num justify-center [&>b]:text-[44px]">
              <b>05</b>
              <span>/10</span>
            </div>
          </RevealBlock>
          <RevealBlock delay={0.06}>
            <p className="mt-7 flex items-center justify-center gap-4">
              <span className="pv-label">{t("enhance.label", "Enhance")}</span>
              <span className="pv-soon-badge" title={t("comingSoon.tooltip", "Disponible prochainement")}>
                {t("comingSoon.badge", "À venir")}
              </span>
            </p>
          </RevealBlock>
          <RevealMask className="mt-4">
            <h2 className="pv-display pv-section-title">
              <span className="block">{titleLead}</span>
              {titleAccent ? <b className="block">{titleAccent}</b> : null}
            </h2>
          </RevealMask>
          <RevealBlock delay={0.12}>
            <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.7] text-slate">
              {t(
                "enhance.subtitle",
                "Saisissez la poignée et faites-la glisser : netteté, lumière, étalonnage — vos anciens visuels repassent au studio, jusqu'au 8K."
              )}
            </p>
          </RevealBlock>
        </div>

        {/* Le comparateur — cadre AFFINÉ : un hairline, un radius
            sec, l'image fait le spectacle (fini le panneau verre
            à arête chrome) */}
        <RevealBlock delay={0.1}>
          <div className="mt-10 rounded-[8px] border border-[color:var(--color-ligne-2)] p-[6px] sm:mt-14">
            <div
              ref={frameRef}
              className="relative h-[50vh] min-h-[360px] w-full touch-none select-none overflow-hidden rounded-[6px] bg-pearl sm:h-[56vh] sm:max-h-[600px]"
              style={{ cursor: "ew-resize" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Après — la finition studio */}
              <Image
                src="/plage.webp"
                alt={t(
                  "enhance.alt",
                  "Rendu plage Los Santos retravaillé par le module Enhance"
                )}
                fill
                sizes="(max-width: 1200px) 100vw, 1112px"
                className="object-cover"
              />

              {/* Avant — terne, flou, sous-exposé (clipé à gauche) */}
              <div
                ref={beforeRef}
                aria-hidden
                className="absolute inset-0"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              >
                <Image
                  src="/plage.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1200px) 100vw, 1112px"
                  className="object-cover"
                  style={{
                    filter:
                      "saturate(0.42) brightness(0.6) contrast(0.85) blur(2.5px)",
                  }}
                />
                <div className="absolute inset-0 bg-[rgba(28,23,55,0.18)]" />
              </div>

              {/* La poignée — LIGNE argent + PASTILLE argent (§05).
                  Les cartels AVANT / APRÈS vivent aux coins bas. */}
              <div
                ref={handleRef}
                role="slider"
                tabIndex={0}
                aria-label={t("enhance.handle", "Comparer avant et après")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={50}
                onKeyDown={onKeyDown}
                className="absolute inset-y-0 left-1/2 z-10 w-px outline-none"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[color:var(--color-argent)] opacity-90 shadow-[0_0_14px_rgba(200,203,208,0.45)]"
                />
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--color-argent)] bg-[rgba(6,6,6,0.55)]"
                >
                  <span className="flex items-center text-[color:var(--color-argent)]">
                    <ChevronLeft size={11} strokeWidth={2} />
                    <ChevronRight size={11} strokeWidth={2} className="-ml-[3px]" />
                  </span>
                </span>
              </div>

              {/* Cartels — coins bas, mono nu sur voile noir */}
              <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-[4px] bg-[rgba(6,6,6,0.55)] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink">
                {t("enhance.before", "Avant")}
              </span>
              <span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-[4px] bg-[rgba(6,6,6,0.55)] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink">
                {t("enhance.after", "Après · 8K")}
              </span>
            </div>
          </div>
        </RevealBlock>

        {/* La ligne technique — sous le panneau */}
        <RevealBlock delay={0.15}>
          <p className="mt-6 text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist">
            {t(
              "enhance.meta",
              "Rendu 5504 × 3072 · Netteté +64 % · Étalonnage froid Neva")}
          </p>
        </RevealBlock>
      </div>
    </section>
  );
}
