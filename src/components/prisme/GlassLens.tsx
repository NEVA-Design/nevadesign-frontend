/*
 * Lentille de verre — l'objet 3D de Givre (ref Lexi).
 * Une bulle au backdrop-blur réel : ce qui passe derrière elle
 * (rubans, dégradé, caustiques) se floute vraiment — la réfraction
 * perçue, animable, quasi gratuite. Arc spéculaire haut-gauche,
 * caustique interne basse, ombre au sol elliptique qui la pose.
 * Discipline perf : ≤ 320px, 2 par scène, 1 sur mobile
 * (docs/GIVRE.md §8). La lévitation est une boucle autonome CSS —
 * aucun effet souris.
 */

type GlassLensProps = {
  /** Diamètre en px */
  size: number;
  /** Position via style (top/left/right/bottom) */
  style?: React.CSSProperties;
  className?: string;
  /** Amplitude de lévitation (px, négatif = monte) — 0 pour figer */
  floatY?: number;
  /** Durée de la lévitation (s) */
  floatDur?: number;
  /** Ombre au sol sous la bulle */
  groundShadow?: boolean;
  /** Cœur lumineux spectral (ref Founder) — réservé à UNE bulle par page */
  core?: boolean;
};

export default function GlassLens({
  size,
  style,
  className = "",
  floatY = -14,
  floatDur = 10,
  groundShadow = true,
  core = false,
}: GlassLensProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative ${className}`}
      style={{ width: size, height: size * (groundShadow ? 1.22 : 1), ...style }}
    >
      <div
        className={floatY === 0 ? "pv-lens" : "pv-lens pv-float"}
        style={
          {
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            "--float-y": `${floatY}px`,
            "--float-dur": `${floatDur}s`,
          } as React.CSSProperties
        }
      >
        {core ? (
          <span
            className="pv-breathe absolute rounded-full"
            style={{
              left: "30%",
              top: "34%",
              width: "40%",
              height: "36%",
              background:
                "radial-gradient(50% 50% at 50% 50%, rgba(184,161,232,0.5) 0%, rgba(240,197,168,0.34) 48%, rgba(240,197,168,0) 100%)",
              filter: "blur(6px)",
            }}
          />
        ) : null}
      </div>
      {groundShadow ? (
        <div
          className="pv-ground-shadow"
          style={{
            left: "8%",
            right: "8%",
            bottom: 0,
            height: size * 0.16,
          }}
        />
      ) : null}
    </div>
  );
}
