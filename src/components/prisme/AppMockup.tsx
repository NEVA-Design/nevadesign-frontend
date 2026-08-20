"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Palette,
  PenTool,
  MessageSquare,
  Wand2,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { useTranslations } from "@/components/LanguageProvider";
import { BrandMark } from "@/components/prisme/Brand";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/*
 * La démo qui vend le produit : une session Design Studio qui
 * tourne toute seule, en boucle. Un brief se tape au clavier,
 * la direction se fixe, le rendu se matérialise — miniature
 * YouTube, puis logo, puis affiche. Personne ne touche à rien :
 * c'est le studio qui travaille sous les yeux du visiteur.
 */

const MODULES = [
  { icon: Palette, label: "Design Studio" },
  { icon: PenTool, label: "Brand" },
  { icon: MessageSquare, label: "Creative Director" },
  { icon: Wand2, label: "Enhance" },
  { icon: UserRound, label: "Character" },
];

type Brief = {
  key: "b1" | "b2" | "b3";
  module: number;
  render: { src: string; ratio: string };
  swatches: string[];
};

const BRIEFS: Brief[] = [
  {
    key: "b1",
    module: 0,
    render: { src: "/showcase/thumb-gtarp.webp", ratio: "aspect-[16/9]" },
    swatches: ["#0B0E1C", "#FFE816", "#FF2E2E", "#E6E9F2", "#4A5468"],
  },
  {
    key: "b2",
    module: 1,
    render: { src: "/showcase/logo-kova.webp", ratio: "aspect-[4/3]" },
    swatches: ["#0C0F14", "#C7F464", "#1F2530", "#E8ECF2", "#4A5468"],
  },
  {
    key: "b3",
    module: 0,
    render: { src: "/postergrandfivem2.webp", ratio: "aspect-[3/4]" },
    swatches: ["#12081F", "#7C6AFF", "#B14BF4", "#E6E9F2", "#4CC9F0"],
  },
];

const BASE_COUNT = 87;

export default function AppMockup({ className }: { className?: string }) {
  const { t } = useTranslations();
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      const typeEl = root.querySelector<HTMLElement>("[data-demo-type]");
      const chipEl = root.querySelector<HTMLElement>("[data-demo-chip]");
      const metaEl = root.querySelector<HTMLElement>("[data-demo-meta]");
      const countEl = root.querySelector<HTMLElement>("[data-demo-count]");
      const gaugeEl = root.querySelector<HTMLElement>("[data-demo-gauge]");
      const btnLabel = root.querySelector<HTMLElement>("[data-demo-btnlabel]");
      const typoEl = root.querySelector<HTMLElement>("[data-demo-typo]");
      const formatEl = root.querySelector<HTMLElement>("[data-demo-format]");
      const swatches = Array.from(
        root.querySelectorAll<HTMLElement>("[data-demo-swatch]")
      );
      const moduleEls = Array.from(
        root.querySelectorAll<HTMLElement>("[data-demo-module]")
      );
      const renderEls = Array.from(
        root.querySelectorAll<HTMLElement>("[data-demo-render]")
      );
      if (!typeEl || !chipEl || !metaEl || !btnLabel) return;

      const texts = (key: Brief["key"]) => ({
        text: t(`demo.${key}.text`, ""),
        chip: t(`demo.${key}.chip`, ""),
        typo: t(`demo.${key}.typo`, ""),
        format: t(`demo.${key}.format`, ""),
        meta: t(`demo.${key}.meta`, ""),
      });

      const composeLabel = t("demo.compose", "Composer");
      const composingLabel = t("demo.composing", "Le studio compose…");

      const setActiveModule = (idx: number) => {
        moduleEls.forEach((el, i) => {
          el.classList.toggle("bg-ink", i === idx);
          el.classList.toggle("text-[#060606]", i === idx);
          el.classList.toggle("font-medium", i === idx);
          el.classList.toggle("text-slate", i !== idx);
          const dot = el.querySelector<HTMLElement>("[data-demo-dot]");
          if (dot) dot.style.opacity = i === idx ? "1" : "0";
        });
      };

      gsap.set(q("[data-demo-render]"), { autoAlpha: 0 });
      gsap.set(q("[data-demo-badge]"), { autoAlpha: 0 });
      gsap.set(q("[data-demo-caption]"), { autoAlpha: 0 });
      gsap.set(q("[data-demo-skeleton]"), { autoAlpha: 0 });

      const master = gsap.timeline({ repeat: -1, delay: 0.6 });

      BRIEFS.forEach((brief, idx) => {
        const strings = texts(brief.key);
        const typeState = { i: 0 };
        const renderEl = renderEls[idx];

        const cycle = gsap.timeline({
          defaults: { ease: "power2.out" },
          onStart: () => {
            setActiveModule(brief.module);
            typeEl.textContent = "";
            chipEl.textContent = strings.chip;
            if (typoEl) typoEl.textContent = strings.typo;
            if (formatEl) formatEl.textContent = strings.format;
            metaEl.textContent = strings.meta;
            btnLabel.textContent = composeLabel;
            brief.swatches.forEach((c, i) => {
              if (swatches[i]) swatches[i].style.backgroundColor = c;
            });
            if (countEl) countEl.textContent = String(BASE_COUNT + idx);
            if (gaugeEl) gaugeEl.style.width = `${87 + idx}%`;
          },
        });

        /* 1 — le brief se tape au clavier */
        cycle
          .set(q("[data-demo-caret]"), { autoAlpha: 1 })
          .fromTo(
            q("[data-demo-chip-wrap]"),
            { autoAlpha: 0, y: 6 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
            0
          )
          .to(typeState, {
            i: strings.text.length,
            duration: strings.text.length * 0.024,
            ease: "none",
            onUpdate: () => {
              typeEl.textContent = strings.text.slice(0, Math.round(typeState.i));
            },
          });

        /* 2 — la direction se fixe */
        cycle
          .fromTo(
            q("[data-demo-dir] > *"),
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09 },
            ">-0.1"
          )
          .fromTo(
            q("[data-demo-swatch]"),
            { scale: 0.55, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.45,
              stagger: 0.055,
              ease: "back.out(2.2)",
            },
            "<+0.15"
          );

        /* 3 — Composer s'enfonce, le studio travaille */
        cycle
          .to(q("[data-demo-btn]"), {
            scale: 0.96,
            duration: 0.12,
            yoyo: true,
            repeat: 1,
            ease: "power1.inOut",
            onComplete: () => {
              btnLabel.textContent = composingLabel;
            },
          })
          .to(q("[data-demo-skeleton]"), { autoAlpha: 1, duration: 0.3 }, "<")
          .to({}, { duration: 0.85 });

        /* 4 — le rendu se matérialise : flou, puis net */
        cycle
          .to(q("[data-demo-skeleton]"), { autoAlpha: 0, duration: 0.35 })
          .fromTo(
            renderEl,
            { autoAlpha: 0, scale: 1.07, filter: "blur(26px)" },
            {
              autoAlpha: 1,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.5,
              ease: "power3.out",
              onStart: () => {
                btnLabel.textContent = composeLabel;
              },
            },
            "<"
          )
          .fromTo(
            q("[data-demo-caption]"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            ">-0.5"
          )
          .fromTo(
            q("[data-demo-badge]"),
            { autoAlpha: 0, scale: 0.8 },
            { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" },
            "<+0.15"
          )
          .set(q("[data-demo-caret]"), { autoAlpha: 0 }, "<");

        /* 5 — le rendu s'installe, puis la scène se vide */
        cycle
          .to({}, { duration: 2.7 })
          .to(
            [renderEl, ...q("[data-demo-caption]"), ...q("[data-demo-dir] > *"), ...q("[data-demo-chip-wrap]")],
            { autoAlpha: 0, duration: 0.45, ease: "power1.in" }
          )
          .to(
            typeState,
            {
              i: 0,
              duration: 0.28,
              ease: "power1.in",
              onUpdate: () => {
                typeEl.textContent = strings.text.slice(0, Math.round(typeState.i));
              },
            },
            "<"
          );

        master.add(cycle);
      });
    },
    { scope }
  );

  return (
    <div
      ref={scope}
      className={cn(
        "pv-glass pv-chrome-edge relative overflow-hidden rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.10),var(--shadow-float)]",
        className
      )}
    >
      {/* Barre de fenêtre — la scène est en direct */}
      <div className="pv-hairline flex h-12 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ink/10" />
          <span className="h-2 w-2 rounded-full bg-ink/10" />
          <span className="h-2 w-2 rounded-full bg-ink/10" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate">
          {t("demo.window", "Design Studio — Neva")}
        </p>
        <span className="hidden items-center gap-2 rounded-full border border-[color:var(--hairline-glass)] bg-white/5 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-slate shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md sm:inline-flex">
          <span className="pv-breathe h-1.5 w-1.5 rounded-full bg-ok" />
          {t("demo.label", "Design Studio — en direct")}
        </span>
      </div>

      <div className="grid md:grid-cols-[188px_1fr_1.05fr]">
        {/* Rail modules — le module actif porte la pilule encre */}
        <aside className="pv-hairline hidden flex-col justify-between border-r p-4 md:flex">
          <div>
            <BrandMark size={16} tone="white" className="mb-6 opacity-90" />
            <nav className="flex flex-col gap-1">
              {MODULES.map(({ icon: Icon, label }, i) => (
                <span
                  key={label}
                  data-demo-module
                  className={cn(
                    "flex items-center gap-3 rounded-full px-3 py-2 text-[12px] transition-colors duration-500",
                    i === 0 ? "bg-ink font-medium text-[#060606]" : "text-slate"
                  )}
                >
                  <Icon size={13} strokeWidth={1.8} />
                  {label}
                  <span
                    data-demo-dot
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-[linear-gradient(100deg,#B8A1E8,#F0C5A8)] transition-opacity duration-500"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  />
                </span>
              ))}
            </nav>
          </div>
          <div>
            <p className="mb-2 flex items-baseline justify-between font-mono text-[10px] text-dusk">
              <span className="uppercase tracking-[0.14em]">Créations</span>
              <span data-demo-count className="text-ink">
                87
              </span>
            </p>
            <div className="pv-gauge">
              <span data-demo-gauge style={{ width: "87%" }} />
            </div>
          </div>
        </aside>

        {/* Brief — il se tape tout seul */}
        <div className="pv-hairline flex min-h-[360px] flex-col border-r p-5">
          <p className="pv-label mb-3">{t("demo.brief", "Brief")}</p>
          <p className="min-h-[88px] text-[13px] leading-[1.7] text-ink/85">
            <span data-demo-type />
            <span
              data-demo-caret
              className="ml-[1px] inline-block h-[14px] w-[7px] translate-y-[2px] animate-pulse bg-[color:var(--num-color)]"
            />
          </p>
          <div data-demo-chip-wrap className="mt-3 flex flex-wrap gap-2">
            <span
              data-demo-chip
              className="pv-hairline rounded-full border bg-linen px-3 py-1 font-mono text-[10px] tracking-[0.06em] text-slate"
            />
          </div>

          {/* La direction fixée par le studio */}
          <div className="pv-hairline mt-6 border-t pt-5">
            <p className="pv-label mb-3">{t("demo.direction", "Direction")}</p>
            <div data-demo-dir className="flex flex-col gap-3">
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    data-demo-swatch
                    className="h-8 w-8 rounded-full border border-ink/10 shadow-[0_1px_2px_rgba(0,0,0,0.38)]"
                  />
                ))}
              </div>
              <dl className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.12em]">
                <div className="flex justify-between gap-3">
                  <dt className="text-dusk">{t("demo.typo", "Typographie")}</dt>
                  <dd data-demo-typo className="text-right text-ink/80" />
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-dusk">{t("demo.format", "Format")}</dt>
                  <dd data-demo-format className="text-right text-ink/80" />
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <span
              data-demo-btn
              className="inline-flex h-9 cursor-default items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-[#060606] shadow-[0_1px_2px_rgba(0,0,0,0.44),0_8px_22px_rgba(0,0,0,0.5)]"
            >
              <span data-demo-btnlabel>{t("demo.compose", "Composer")}</span>
              <ArrowRight size={13} />
            </span>
            <span className="ml-3 font-mono text-[10px] text-dusk">
              {t("demo.cost", "1 création")}
            </span>
          </div>
        </div>

        {/* Rendu — l'œuvre exposée dans son passe-partout */}
        <div className="p-4">
          <div className="pv-blueprint relative aspect-square w-full overflow-hidden rounded-2xl border border-[color:var(--hairline)] bg-linen">
            {/* Skeleton pendant la composition */}
            <div
              data-demo-skeleton
              className="pv-skeleton absolute inset-4 rounded-lg"
            />
            {/* Les trois rendus superposés — un seul visible à la fois */}
            {BRIEFS.map((brief) => (
              <div
                key={brief.key}
                data-demo-render
                className="absolute inset-0 flex items-center justify-center p-5"
              >
                <div
                  className={cn(
                    "pv-passepartout",
                    brief.key === "b3" ? "h-full" : "w-full"
                  )}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden",
                      brief.render.ratio,
                      brief.key === "b3" ? "h-full w-auto" : "w-full"
                    )}
                  >
                    <Image
                      src={brief.render.src}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 90vw, 34vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
            {/* La légende de galerie — pilule de verre posée sur l'œuvre */}
            <div
              data-demo-caption
              className="pv-pill absolute bottom-8 left-1/2 z-10 -translate-x-1/2 gap-3 whitespace-nowrap"
            >
              <p data-demo-meta className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/80" />
              <span
                data-demo-badge
                className="flex items-center gap-2 font-mono text-[10px] text-ink/60"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                {t("demo.ready", "Prêt à publier")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
