/*
 * La sphère de verre — la matière du hero en CSS pur (passe whaou
 * P2 : même recette que la sphère 3D). Quatre couches : spéculaire
 * net haut-gauche, teintes lilas/pêche DANS l'épaisseur, liseré
 * lumineux CONTINU sur la silhouette (le rim des softbox — un
 * objet verre sur noir sans liseré n'existe pas), cœur de verre
 * sombre translucide. Ombre de contact elliptique conservée.
 * Poster statique pour les pages sans canvas (auth, finale, 404).
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
            "radial-gradient(46% 38% at 33% 24%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 58%), radial-gradient(48% 42% at 67% 77%, rgba(240,197,168,0.55) 0%, rgba(240,197,168,0) 72%), radial-gradient(54% 50% at 27% 63%, rgba(184,161,232,0.5) 0%, rgba(184,161,232,0) 74%), radial-gradient(closest-side at 50% 50%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.10) 87%, rgba(255,255,255,0.26) 96%, rgba(255,255,255,0.08) 100%), radial-gradient(120% 120% at 50% 40%, #221F2B 0%, #121016 76%, #0B0A0E 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.14), inset 0 -16px 28px rgba(0,0,0,0.4), 0 26px 40px -18px rgba(0,0,0,0.6)",
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
            "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(10px)",
        }}
      />
    </div>
  );
}
