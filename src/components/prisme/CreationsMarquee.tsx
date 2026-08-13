"use client";

import Image from "next/image";

/*
 * La galerie en mouvement — les vraies productions du studio,
 * exposées comme des tirages posés sur une table : chaque carte
 * porte sa propre ombre, les formats se mélangent (miniatures,
 * logos, chartes, affiches FiveM), deux rangées en sens opposés.
 */
type Piece = { src: string; alt: string; ratio: string };

const ROW_A: Piece[] = [
  { src: "/showcase/thumb-gtarp.webp", alt: "Miniature YouTube GTA RP", ratio: "aspect-[16/9]" },
  { src: "/showcase/logo-kova.webp", alt: "Logo Kova, banque mobile", ratio: "aspect-[4/3]" },
  { src: "/posterlarya.png", alt: "Campagne serveur GTA RP", ratio: "aspect-[3/4]" },
  { src: "/showcase/charte-meridien.webp", alt: "Charte graphique Méridien", ratio: "aspect-[16/10]" },
  { src: "/showcase/thumb-esport.webp", alt: "Miniature YouTube esport", ratio: "aspect-[16/9]" },
  { src: "/Prime_-_preview_serveur_pack_8.png", alt: "Pack graphique complet", ratio: "aspect-[4/3]" },
  { src: "/showcase/logo-volt.webp", alt: "Logo Volt Esports", ratio: "aspect-[4/3]" },
  { src: "/showcase/thumb-invest.webp", alt: "Miniature YouTube finance", ratio: "aspect-[16/9]" },
];

const ROW_B: Piece[] = [
  { src: "/postergrandfivem2.png", alt: "Affiche grand format FiveM", ratio: "aspect-[3/4]" },
  { src: "/showcase/thumb-secret.webp", alt: "Miniature YouTube tutoriel", ratio: "aspect-[16/9]" },
  { src: "/showcase/charte-kova.webp", alt: "Charte graphique Kova", ratio: "aspect-[16/10]" },
  { src: "/showcase/logo-meridien.webp", alt: "Logo Méridien café", ratio: "aspect-[4/3]" },
  { src: "/affiche3.png", alt: "Identité visuelle serveur", ratio: "aspect-[3/4]" },
  { src: "/showcase/thumb-pc.webp", alt: "Miniature YouTube test PC", ratio: "aspect-[16/9]" },
  { src: "/Prime_-_preview_serveur_pack_4.png", alt: "Pack graphique serveur", ratio: "aspect-[4/3]" },
  { src: "/vice.png", alt: "Visuel ambiance Vice", ratio: "aspect-[16/10]" },
];

function Row({
  pieces,
  duration,
  reverse = false,
}: {
  pieces: Piece[];
  duration: number;
  reverse?: boolean;
}) {
  const strip = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center gap-6 pr-6">
      {pieces.map((piece, i) => (
        <figure
          key={`${piece.src}-${ariaHidden ? "b" : "a"}`}
          className={`pv-print group h-[150px] shrink-0 sm:h-[176px] ${piece.ratio}`}
        >
          <Image
            src={piece.src}
            alt={ariaHidden ? "" : piece.alt}
            fill
            sizes="320px"
            loading={i < 6 && !ariaHidden ? "eager" : "lazy"}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </figure>
      ))}
    </div>
  );

  return (
    <div
      className={`pv-marquee py-4 ${reverse ? "pv-marquee--reverse" : ""}`}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      {strip(false)}
      {strip(true)}
    </div>
  );
}

export default function CreationsMarquee({
  duration = 58,
}: {
  duration?: number;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        /* fondu latéral fixe : 80 px à toutes les largeurs (D03) */
        maskImage:
          "linear-gradient(90deg, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
      }}
    >
      <Row pieces={ROW_A} duration={duration} />
      <Row pieces={ROW_B} duration={duration + 8} reverse />
    </div>
  );
}
