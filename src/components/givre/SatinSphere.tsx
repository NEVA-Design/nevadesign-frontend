/*
 * La sphère satinée — la matière du hero en CSS pur : trois
 * radiaux (spéculaire, rebond pêche, rebond lilas) sur une bille
 * ivoire, avec son ombre de contact elliptique. Poster statique
 * de la scène pour les pages sans canvas (auth, finale, 404).
 */
export default function SatinSphere({
  size = 168,
  className = "",
  style = {},
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div aria-hidden className={className} style={style}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "999px",
          background:
            "radial-gradient(58% 52% at 33% 26%, #FFFFFF 0%, rgba(255,255,255,0) 62%), radial-gradient(70% 66% at 68% 74%, rgba(239,184,148,0.5) 0%, rgba(239,184,148,0) 74%), radial-gradient(80% 76% at 26% 62%, rgba(164,139,232,0.42) 0%, rgba(164,139,232,0) 76%), radial-gradient(120% 120% at 50% 40%, #F7F4F0 0%, #E9E4DE 78%, #DCD6CF 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -14px 26px rgba(96,84,140,0.16), 0 26px 40px -18px rgba(43,36,80,0.28)",
        }}
      />
      <div
        style={{
          width: size * 1.1,
          height: Math.round(size * 0.24),
          marginTop: Math.round(size * 0.07),
          marginLeft: -size * 0.05,
          borderRadius: "50%",
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(43,36,80,0.2) 0%, rgba(43,36,80,0) 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
