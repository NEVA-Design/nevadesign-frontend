"use client";

import Image from "next/image";

/*
 * La galerie en mouvement (REFONTE 50k) — plein bleed, deux rangées
 * à sens opposés, hauteur de rangée FIXE, gap constant 16 px,
 * radius 6 px uniforme. Au survol : scale 1.03 + légende mono
 * (client · type) qui monte du bord bas. Le survol fige la rangée.
 */
type Piece = { src: string; alt: string; ratio: string; client: string; type: string };

const ROW_A: Piece[] = [
  { src: "/affiche1.webp", alt: "Affiche de recrutement serveur FiveM", ratio: "aspect-[16/9]", client: "Serveur RP", type: "Affiche" },
  { src: "/Prime_-_preview_serveur_pack_8.webp", alt: "Kit bannières Discord d'un serveur", ratio: "aspect-[4/3]", client: "Prime", type: "Kit Discord" },
  { src: "/posterlarya.webp", alt: "Campagne serveur GTA RP", ratio: "aspect-[3/4]", client: "Larya", type: "Campagne" },
  { src: "/jetski.webp", alt: "Scène GTA photoréaliste", ratio: "aspect-[16/10]", client: "Generative", type: "Scène GTA" },
  { src: "/Prime_-_preview_serveur_pack_7.webp", alt: "Pack graphique serveur FiveM", ratio: "aspect-[16/9]", client: "Prime", type: "Pack serveur" },
  { src: "/Prime_-_preview_serveur_pack_15.webp", alt: "Visuel boutique serveur FiveM", ratio: "aspect-[4/3]", client: "Prime", type: "Boutique" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_18.webp", alt: "Déclinaisons pack serveur", ratio: "aspect-[4/3]", client: "Prime", type: "Déclinaisons" },
  { src: "/affiche2.webp", alt: "Affiche staff serveur FiveM", ratio: "aspect-[16/9]", client: "Serveur RP", type: "Affiche staff" },
];

/* Jamais deux fois le même artwork à l'écran (QA 20/08). */
const ROW_B: Piece[] = [
  { src: "/postergrandfivem2.webp", alt: "Affiche grand format FiveM", ratio: "aspect-[3/4]", client: "Serveur RP", type: "Grand format" },
  { src: "/Prime_-_preview_serveur_pack_9.webp", alt: "Pack complet serveur FiveM", ratio: "aspect-[16/9]", client: "Prime", type: "Pack complet" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_455.webp", alt: "Kit réseaux d'un serveur", ratio: "aspect-[16/10]", client: "New Paradise", type: "Kit réseaux" },
  { src: "/neva-design/packs/Prime_-_preview_serveur_pack_4_1.webp", alt: "Bannière boutique serveur", ratio: "aspect-[4/3]", client: "Essential V", type: "Bannière" },
  { src: "/affiche3.webp", alt: "Affiche événement serveur", ratio: "aspect-[3/4]", client: "Serveur RP", type: "Événement" },
  { src: "/postergrandfivem.webp", alt: "Série d'affiches serveur FiveM", ratio: "aspect-[16/9]", client: "Serveur RP", type: "Série d'affiches" },
  { src: "/Prime_-_preview_serveur_pack_4.webp", alt: "Pack graphique serveur", ratio: "aspect-[4/3]", client: "Prime", type: "Pack serveur" },
  { src: "/vice.webp", alt: "Scène GTA ambiance Vice", ratio: "aspect-[16/10]", client: "Generative", type: "Scène GTA" },
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
  /* Trois copies de la strip (run 2) : le keyframe translate
     d'exactement UNE strip (−33,333 %). */
  const strip = (copy: number) => (
    <div
      aria-hidden={copy > 0}
      key={copy}
      className="flex shrink-0 items-center gap-4 pr-4"
    >
      {pieces.map((piece, i) => (
        <figure
          key={`${piece.src}-${copy}`}
          data-qa={copy === 0 ? "marquee-tuile" : undefined}
          className={`pv-print group h-[150px] shrink-0 !rounded-[6px] sm:h-[176px] ${piece.ratio}`}
        >
          <Image
            src={piece.src}
            alt={copy > 0 ? "" : piece.alt}
            fill
            sizes="(min-width: 2200px) 380px, 320px"
            loading={i < 6 && copy === 0 ? "eager" : "lazy"}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
          {/* Légende mono — monte du bord bas au survol */}
          <figcaption
            aria-hidden={copy > 0}
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-[linear-gradient(180deg,transparent,rgba(6,6,6,0.82))] px-3 pb-2.5 pt-7 font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100"
          >
            {piece.client} · {piece.type}
          </figcaption>
        </figure>
      ))}
    </div>
  );

  return (
    <div
      className={`pv-marquee py-2 ${reverse ? "pv-marquee--reverse" : ""}`}
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
