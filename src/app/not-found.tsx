import Link from "next/link";


/*
 * 404 — la sphère satinée seule au centre du cyclorama, l'atelier
 * au repos. Un moment signature, pas une impasse (D31).
 */
export default function NotFound() {
  return (
    <div className="pv-light pv-scene relative min-h-[100svh] text-ink">
      <style>{`html{color-scheme:dark}body{background-color:#060606;color:#F2F2F0}`}</style>
      <div aria-hidden className="pv-scene-bg--dawn-calm absolute inset-0" />
      <div aria-hidden className="pv-caustics" />
      <div aria-hidden className="pv-windowlight absolute inset-0 opacity-50" />
      {/* le halo aurore, au calme */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(34% 42% at 40% 30%, rgba(185,167,218,0.22) 0%, rgba(185,167,218,0) 70%), radial-gradient(30% 38% at 62% 64%, rgba(233,198,162,0.2) 0%, rgba(233,198,162,0) 72%)",
        }}
      />

      {/* Cadre éditorial */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-[24px] border border-[rgba(255,255,255,0.14)]"
        style={{ inset: "var(--frame-inset)" }}
      />

      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <svg
          viewBox="0 0 1441 1000"
          aria-hidden
          className="mx-auto h-20 w-auto"
          fill="none"
          stroke="rgba(244,242,238,0.3)"
          strokeWidth="18"
        >
          <path d="M440.2 0 L864.6 1000 L694.6 1000 L441 379 L180.1 1000 L0 1000 Z" />
          <path d="M439.5 710 L559.2 1000 L320 1000 Z" />
          <path d="M575 0 L755.1 0 L1013 618 L1266.6 0 L1438.1 0 L1015.2 990 Z" />
          <path d="M893.4 0 L1134.1 0 L1013.7 292 Z" />
        </svg>

        <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
          404 — Page introuvable
        </p>
        <h1 className="pv-display mt-4 text-[clamp(2rem,5.6vw,3.2rem)]">
          Perdu dans{" "}
          <span className="pv-display-strong">l’atelier.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[380px] text-[15px] leading-[1.7] text-slate">
          Cette page n’existe pas — ou plus. La lumière, elle, est
          toujours là.
        </p>
        <Link href="/" className="pv-btn mt-9">
          Revenir à l’accueil
        </Link>
      </main>
    </div>
  );
}
