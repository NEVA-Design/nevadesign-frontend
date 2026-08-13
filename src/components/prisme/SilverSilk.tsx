import { useId } from "react";

/*
 * Soie chromée — la matière de Givre (ref simple.png).
 * De larges rubans de chrome froid traversent la scène en courbes
 * amples : dégradés métalliques du blanc pur aux creux bleutés
 * (#A4A9BE), flashs spéculaires, arêtes de lumière décalées le long
 * de la normale, ombre encrée translatée. Le tout adouci par un flou
 * CSS : une profondeur de champ, jamais un sujet.
 * SVG statique + un seul blur CSS : aucun coût par frame. La
 * respiration vient du voile WebGL nacre posé au-dessus en multiply
 * et des caustiques de la scène.
 * Le reflet traverse toujours la LARGEUR du ruban : gradients
 * userSpaceOnUse perpendiculaires à la course — c'est le contraste
 * de valeur qui fait le métal.
 */

type SilkVariant = "hero" | "band" | "finale" | "crest" | "chip";

const VIEWBOX: Record<SilkVariant, string> = {
  hero: "0 0 1440 900",
  band: "0 0 1440 360",
  finale: "0 0 1440 900",
  crest: "0 0 1440 480",
  chip: "0 0 400 120",
};

const PRESENCE: Record<SilkVariant, { opacity: number; blur: number }> = {
  hero: { opacity: 0.95, blur: 17 },
  band: { opacity: 0.9, blur: 22 },
  finale: { opacity: 0.85, blur: 20 },
  crest: { opacity: 0.55, blur: 26 },
  /* chip : rubans presque nets — c'est le verre posé dessus qui floute */
  chip: { opacity: 0.95, blur: 3 },
};

export default function SilverSilk({
  variant = "hero",
  className = "",
}: {
  variant?: SilkVariant;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, "");
  const a = `silk-a-${uid}`;
  const b = `silk-b-${uid}`;
  const c = `silk-c-${uid}`;
  const d = `silk-d-${uid}`;
  const { opacity, blur } = PRESENCE[variant];

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        viewBox={VIEWBOX[variant]}
        preserveAspectRatio="xMidYMid slice"
        className="absolute"
        style={{
          inset: "-8%",
          width: "116%",
          height: "116%",
          filter: `blur(${blur}px)`,
          opacity,
        }}
      >
        <defs>
          {/* Chrome froid : blanc → creux bleuté → flash — le reflet
              coupe la course du ruban. */}
          <linearGradient id={a} gradientUnits="userSpaceOnUse" x1="560" y1="-60" x2="820" y2="740">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.16" stopColor="#D9DAEC" />
            <stop offset="0.34" stopColor="#A3A5C8" />
            <stop offset="0.5" stopColor="#FCFCFE" />
            <stop offset="0.64" stopColor="#AFA9D4" />
            <stop offset="0.8" stopColor="#DBDDEE" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id={b} gradientUnits="userSpaceOnUse" x1="620" y1="-120" x2="840" y2="560">
            <stop offset="0" stopColor="#F3F4F9" />
            <stop offset="0.24" stopColor="#A9BCDE" />
            <stop offset="0.46" stopColor="#F8F9FC" />
            <stop offset="0.68" stopColor="#A3A6C8" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id={c} gradientUnits="userSpaceOnUse" x1="520" y1="140" x2="760" y2="900">
            <stop offset="0" stopColor="#E9EAF4" />
            <stop offset="0.3" stopColor="#ACAFD0" />
            <stop offset="0.55" stopColor="#F8F9FC" />
            <stop offset="0.78" stopColor="#A7AACC" />
            <stop offset="1" stopColor="#EEF0F6" />
          </linearGradient>
          {/* Métal des vitrines de carte — calibré petit viewBox */}
          <linearGradient id={d} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="400" y2="120">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.2" stopColor="#D4D7E3" />
            <stop offset="0.38" stopColor="#A8ADC2" />
            <stop offset="0.54" stopColor="#FCFCFE" />
            <stop offset="0.72" stopColor="#BEBDD8" />
            <stop offset="1" stopColor="#EFF0F5" />
          </linearGradient>
        </defs>

        {variant === "hero" ? (
          <>
            {/* Ombre portée du ruban maître — le volume de l'objet */}
            <path
              d="M 1560 -20 C 1080 60, 760 260, -120 520"
              stroke="rgba(29,35,64,0.09)"
              strokeWidth="300"
              fill="none"
              strokeLinecap="round"
              transform="translate(8 36)"
            />
            {/* Écho haut — le drapé au-dessus du ruban maître */}
            <path
              d="M 1560 -180 C 1000 -80, 600 80, -120 300"
              stroke={`url(#${c})`}
              strokeWidth="190"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
            {/* Ruban maître — la diagonale tendue qui traverse la scène */}
            <path
              d="M 1560 -20 C 1080 60, 760 260, -120 520"
              stroke={`url(#${a})`}
              strokeWidth="300"
              fill="none"
              strokeLinecap="round"
            />
            {/* Arêtes de lumière — la lame accroche le jour aux deux bords */}
            <path
              d="M 1560 -20 C 1080 60, 760 260, -120 520"
              stroke="#FFFFFF"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              opacity="0.95"
              transform="translate(46 -143)"
            />
            <path
              d="M 1560 -20 C 1080 60, 760 260, -120 520"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
              transform="translate(-44 137)"
            />
            {/* Ruban fin — file sous le maître, plus rapide */}
            <path
              d="M 1560 140 C 1120 180, 700 340, -120 640"
              stroke={`url(#${b})`}
              strokeWidth="110"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path
              d="M 1560 140 C 1120 180, 700 340, -120 640"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.65"
              transform="translate(17 -52)"
            />
            {/* Contre-courbe basse — la boucle qui referme la scène
                (ref simple.png : les rubans s'entrelacent) */}
            <path
              d="M -140 700 C 420 620, 900 780, 1560 560"
              stroke={`url(#${c})`}
              strokeWidth="150"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M -140 700 C 420 620, 900 780, 1560 560"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
              transform="translate(0 -68)"
            />
          </>
        ) : null}

        {variant === "band" ? (
          <>
            {/* Un seul ruban qui ondule à travers la respiration */}
            <path
              d="M -120 190 C 320 120, 620 260, 940 190 S 1320 90, 1560 170"
              stroke={`url(#${b})`}
              strokeWidth="150"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M -120 190 C 320 120, 620 260, 940 190 S 1320 90, 1560 170"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
              transform="translate(0 -76)"
            />
            <path
              d="M -100 300 C 420 250, 880 330, 1540 260"
              stroke={`url(#${c})`}
              strokeWidth="90"
              fill="none"
              strokeLinecap="round"
              opacity="0.45"
            />
          </>
        ) : null}

        {variant === "finale" ? (
          <>
            {/* Deux rubans qui passent derrière l'îlot */}
            <path
              d="M 1560 160 C 1120 120, 900 320, 560 380 S 60 420, -120 340"
              stroke={`url(#${a})`}
              strokeWidth="210"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 1560 160 C 1120 120, 900 320, 560 380 S 60 420, -120 340"
              stroke="#FFFFFF"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              transform="translate(0 -106)"
            />
            <path
              d="M -120 660 C 380 600, 820 700, 1560 600"
              stroke={`url(#${c})`}
              strokeWidth="160"
              fill="none"
              strokeLinecap="round"
              opacity="0.55"
            />
          </>
        ) : null}

        {variant === "chip" ? (
          <>
            {/* Vitrine de carte — deux rubans fins presque nets */}
            <path
              d="M -40 70 C 90 40, 200 95, 310 60 S 400 30, 440 45"
              stroke={`url(#${d})`}
              strokeWidth="46"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M -40 70 C 90 40, 200 95, 310 60 S 400 30, 440 45"
              stroke="#FFFFFF"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
              transform="translate(0 -23)"
            />
            <path
              d="M -30 108 C 120 90, 260 118, 440 92"
              stroke={`url(#${d})`}
              strokeWidth="26"
              fill="none"
              strokeLinecap="round"
              opacity="0.65"
            />
          </>
        ) : null}

        {variant === "crest" ? (
          <>
            {/* Présence fantôme en haut du plan de travail */}
            <path
              d="M -120 150 C 340 90, 700 210, 1040 150 S 1380 60, 1560 120"
              stroke={`url(#${b})`}
              strokeWidth="140"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M -120 150 C 340 90, 700 210, 1040 150 S 1380 60, 1560 120"
              stroke="#FFFFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.6"
              transform="translate(0 -70)"
            />
            <path
              d="M -100 300 C 460 250, 940 330, 1540 250"
              stroke={`url(#${c})`}
              strokeWidth="90"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />
          </>
        ) : null}
      </svg>
    </div>
  );
}
