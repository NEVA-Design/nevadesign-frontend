import Link from "next/link";

/*
 * Gabarit des pages légales (run 3, LOT 5) — les liens du footer
 * pointaient sur des 404. Même voix éditoriale sobre que les
 * landings : ivoire, encre, filets d'un pixel. Server Component
 * pur, zéro JS.
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <style>{`html{color-scheme:dark}body{background-color:#060606;color:#F2F2F0}`}</style>
      <main className="pv-light min-h-screen text-ink">
        <header className="mx-auto flex w-full max-w-[820px] items-center justify-between px-6 pb-2 pt-7">
          <Link
            href="/"
            className="font-display text-[17px] font-medium tracking-[-0.01em] text-ink"
          >
            Neva Design
          </Link>
          <Link
            href="/"
            className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist transition-colors hover:text-slate"
          >
            ← Accueil
          </Link>
        </header>

        <article className="mx-auto w-full max-w-[820px] px-6 pb-24">
          <h1 className="mt-12 font-display text-[clamp(32px,3.6vw,48px)] font-light leading-[1.08] tracking-[-0.015em] text-ink">
            {title}
          </h1>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist">
            {updated}
          </p>

          <div className="mt-10 max-w-[660px]">
            {sections.map((section) => (
              <section key={section.heading} className="mt-10 first:mt-0">
                <h2 className="font-display text-[clamp(20px,2vw,26px)] font-light leading-[1.2] text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3 text-[14.5px] leading-[1.75] text-slate">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
                {section.list ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[14.5px] leading-[1.7] text-slate marker:text-mist">
                    {section.list.map((item) => (
                      <li key={item.slice(0, 32)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-14 border-t border-[rgba(255,255,255,0.08)] pt-6 text-[13.5px] leading-[1.7] text-mist">
            Une question sur ces conditions ou vos données ? Écrivez-nous :{" "}
            <a
              href="mailto:nevapro@nevadesign.fr"
              className="text-slate underline decoration-[rgba(255,255,255,0.20)] underline-offset-4 hover:text-ink"
            >
              nevapro@nevadesign.fr
            </a>
          </p>
        </article>
      </main>
    </>
  );
}
