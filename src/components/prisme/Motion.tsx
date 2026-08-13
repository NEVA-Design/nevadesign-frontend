"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Primitives de motion Prisme.
 * Une seule grammaire : les blocs montent de 24px en fondu quand ils
 * entrent dans le viewport, une fois, sur courbe expo. Le motion est
 * une décision produit : il reste actif quel que soit le réglage
 * système (optimisations Windows comprises).
 */
export function RevealBlock({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/*
 * Titre sous masque — le bloc monte derrière un rideau invisible,
 * comme les lignes du hero. Réservé aux display de section.
 */
export function RevealMask({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;

      gsap.fromTo(
        inner,
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 1.15,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={`overflow-hidden pb-[0.08em] ${className ?? ""}`}>
      <div>{children}</div>
    </div>
  );
}

/*
 * Révélation d'un média — le cadre s'ouvre par clip-path pendant
 * que l'image relâche un léger zoom. Une fois, au scroll, comme
 * un tirage qu'on découvre.
 */
export function RevealMedia({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.firstElementChild as HTMLElement | null;

      gsap.fromTo(
        el,
        { clipPath: "inset(8% 4% 62% 4% round 12px)", opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 12px)",
          opacity: 1,
          duration: 1.15,
          delay,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        }
      );
      if (inner) {
        gsap.fromTo(
          inner,
          { scale: 1.12 },
          {
            scale: 1,
            duration: 1.5,
            delay,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          }
        );
      }
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "clip-path" }}>
      {children}
    </div>
  );
}

/*
 * Compteur animé — les chiffres géants s'incrémentent à l'entrée.
 * `value` accepte "2400", "8", "99.9"… le formatage (séparateur fin,
 * suffixe) reste dans le JSX autour.
 */
export function CountUp({
  value,
  duration = 1.6,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const isFloat = !Number.isInteger(value);

      const format = (v: number) =>
        (isFloat ? v.toFixed(1) : Math.round(v).toString()).replace(
          /\B(?=(\d{3})+(?!\d))/g,
          " "
        );

      const state = { v: 0 };
      el.textContent = format(0);
      gsap.to(state, {
        v: value,
        duration,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = format(state.v);
        },
      });
    },
    { scope: ref }
  );

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
