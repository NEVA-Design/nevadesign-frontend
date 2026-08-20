"use client";

import Image from "next/image";

/*
 * La galerie en mouvement — les vraies productions du studio,
 * exposées comme des tirages posés sur une table : chaque carte
 * porte sa propre ombre, les formats se mélangent (packs FiveM,
 * bannières, affiches, scènes GTA), deux rangées en sens opposés.
 * Purge 20/08 : plus AUCUNE vignette miniatures YouTube / kova /
 * Méridien — FiveM, bannières et scènes uniquement.
 */
type Piece = { src: string; alt: string; ratio: string };

const ROW_A: Piece[] = [
  { src: "/affiche1.webp", alt: "Affiche de recrutement serveur FiveM", ratio: "aspect-[16/9]" },
  { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Kit bannières Discord d'un serveur", ratio: "aspect-[4/3]" },
  { src: "/posterlarya.webp", alt: "Campagne serveur GTA RP", ratio: "aspect-[3/4]" },
  { src: "/jetski.webp", alt: "Scène GTA photoréaliste", ratio: "aspect-[16/10]" },
  { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack graphique serveur FiveM", ratio: "aspect-[16/9]" },
  { src: "/Prime_-_preview_serveur_pack_15.webp", alt: "Visuel boutique serveur FiveM", ratio: "aspect-[4/3]" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_18.webp", alt: "Déclinaisons pack serveur", ratio: "aspect-[4/3]" },
  { src: "/affiche2.webp", alt: "Affiche staff serveur FiveM", ratio: "aspect-[16/9]" },
];

const ROW_B: Piece[] = [
  { src: "/postergrandfivem2.webp", alt: "Affiche grand format FiveM", ratio: "aspect-[3/4]" },
  { src: "/Prime_-_preview_serveur_pack_9.webp", alt: "Pack complet serveur FiveM", ratio: "aspect-[16/9]" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_19.webp", alt: "Kit réseaux d'un serveur", ratio: "aspect-[16/10]" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_3.webp", alt: "Bannière boutique serveur", ratio: "aspect-[4/3]" },
  { src: "/affiche3.webp", alt: "Affiche événement serveur", ratio: "aspect-[3/4]" },
  { src: "/postergrandfivem.webp", alt: "Série d'affiches serveur FiveM", ratio: "aspect-[16/9]" },
  { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Pack graphique serveur", ratio: "aspect-[4/3]" },
  { src: "/vice.webp", alt: "Scène GTA ambiance Vice", ratio: "aspect-[16/10]" },
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
  /* Trois copies de la strip (run 2) : une strip ≈ 2 240 px ne
     couvrait pas un viewport 3440 — la boucle montrait un trou.
     Le keyframe translate d'exactement UNE strip (−33,333 %) :
     vitesse inchangée au pixel. ≥ 2200 px : les tirages gagnent
     en présence (176 → 204 px). */
  const strip = (copy: number) => (
    <div
      aria-hidden={copy > 0}
      key={copy}
      className="flex shrink-0 items-center gap-6 pr-6"
    >
      {pieces.map((piece, i) => (
        <figure
          key={`${piece.src}-${copy}`}
          className={`pv-print group h-[150px] shrink-0 sm:h-[176px] ${piece.ratio}`}
        >
          <Image
            src={piece.src}
            alt={copy > 0 ? "" : piece.alt}
            fill
            sizes="(min-width: 2200px) 380px, 320px"
            loading={i < 6 && copy === 0 ? "eager" : "lazy"}
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
      {strip(0)}
      {strip(1)}
      {strip(2)}
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
