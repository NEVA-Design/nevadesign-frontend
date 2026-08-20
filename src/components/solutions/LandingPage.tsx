import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Landing } from "@/lib/landings-types";
import { getLanding } from "@/lib/landings";
import { siteUrl } from "@/lib/seo";

/*
 * Gabarit des landings « Solutions » (run 3, LOT 5).
 * Une page éditoriale de l'atelier Givre : ivoire, encre ardoise,
 * filets d'un pixel, Outfit léger pour les titres. Server Component
 * pur — la FAQ s'ouvre en <details> natif, zéro JS d'hydratation.
 * Structure assumée différente de la home (une landing est une
 * page de lecture, pas une scène) : aucun composant de section de
 * la home n'est dupliqué ici.
 */

const RATIOS: Record<Landing["examples"][number]["ratio"], string> = {
  video: "aspect-[16/9]",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/10]",
};

function tr(landing: Landing, fr: string, en: string) {
  return landing.locale === "fr" ? fr : en;
}

export default function LandingPage({ landing }: { landing: Landing }) {
  const home = landing.locale === "fr" ? "/" : "/";
  const solutionsLabel = tr(landing, "Solutions", "Solutions");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: tr(landing, "Accueil", "Home"),
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: solutionsLabel,
            item: `${siteUrl}/#solutions`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: landing.h1,
            item: `${siteUrl}/${landing.slug}`,
          },
        ],
      },
      {
        "@type": "Service",
        name: landing.h1,
        description: landing.description,
        url: `${siteUrl}/${landing.slug}`,
        provider: {
          "@type": "Organization",
          name: "Neva Design",
          url: siteUrl,
        },
        areaServed: landing.locale === "fr" ? "FR" : "Worldwide",
      },
      {
        "@type": "FAQPage",
        mainEntity: landing.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <style>{`html{color-scheme:dark}body{background-color:#060606;color:#F2F2F0}`}</style>
      <main className="pv-light min-h-screen bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* En-tête léger — pas la navbar applicative : une page de
            lecture porte juste la marque et la sortie utile */}
        <header className="mx-auto flex w-full max-w-[1080px] items-center justify-between px-6 pb-2 pt-7">
          <Link
            href={home}
            className="font-display text-[17px] font-medium tracking-[-0.01em] text-ink"
          >
            Neva Design
          </Link>
          {/* Pivot 20/08 : les outils de création sont « À venir » —
              la sortie utile est l'offre Neva Generative */}
          <Link href="/#generative" className="pv-btn text-[13.5px]">
            {tr(landing, "Découvrir Neva Generative", "Discover Neva Generative")}
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </header>

        <article className="mx-auto w-full max-w-[1080px] px-6 pb-24">
          {/* fil d'ariane */}
          <nav
            aria-label={tr(landing, "Fil d'ariane", "Breadcrumb")}
            className="mt-8 font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist"
          >
            <Link href={home} className="transition-colors hover:text-slate">
              {tr(landing, "Accueil", "Home")}
            </Link>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span>{solutionsLabel}</span>
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="text-slate">{landing.h1}</span>
          </nav>

          {/* tête d'article */}
          <p className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.2em] text-mist">
            {landing.kicker}
          </p>
          <h1 className="mt-4 max-w-[720px] font-display text-[clamp(38px,4.6vw,64px)] font-light leading-[1.05] tracking-[-0.015em] text-ink">
            {landing.h1}
          </h1>
          <div className="mt-6 max-w-[640px] space-y-4 text-[15.5px] leading-[1.7] text-slate">
            {landing.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/#generative" className="pv-btn">
              {landing.ctaLabel}
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
            <Link
              href="/neva-design"
              className="pv-btn pv-btn--ghost"
            >
              {tr(landing, "Voir le portfolio", "See the portfolio")}
            </Link>
          </div>

          {/* la preuve visuelle — de vraies pièces de la galerie */}
          <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
            {landing.examples.map((example) => (
              <figure
                key={example.src}
                className={`pv-print relative overflow-hidden ${RATIOS[example.ratio]}`}
              >
                <Image
                  src={example.src}
                  alt={example.alt}
                  fill
                  sizes="(max-width: 768px) 46vw, 250px"
                  className="object-cover"
                />
              </figure>
            ))}
          </div>

          {/* corps éditorial */}
          <div className="mt-16 max-w-[680px]">
            {landing.sections.map((section) => (
              <section key={section.heading} className="mt-12 first:mt-0">
                <h2 className="font-display text-[clamp(24px,2.4vw,32px)] font-light leading-[1.15] tracking-[-0.01em] text-ink">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-[1.75] text-slate">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* comparatif — le tableau qui répond à la vraie question */}
          <section className="mt-16">
            <h2 className="font-display text-[clamp(24px,2.4vw,32px)] font-light leading-[1.15] tracking-[-0.01em] text-ink">
              {tr(
                landing,
                "Graphiste traditionnel ou studio IA ?",
                "Traditional designer or AI studio?"
              )}
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[14px] leading-[1.6]">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.14)] font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist">
                    <th className="py-3 pr-4 font-normal">
                      {tr(landing, "Critère", "Criteria")}
                    </th>
                    <th className="py-3 pr-4 font-normal">
                      {tr(landing, "Graphiste traditionnel", "Traditional designer")}
                    </th>
                    <th className="py-3 font-normal text-slate">Neva Design</th>
                  </tr>
                </thead>
                <tbody>
                  {landing.comparison.map((row) => (
                    <tr
                      key={row.criteria}
                      className="border-b border-[rgba(255,255,255,0.08)] align-top"
                    >
                      <td className="py-3.5 pr-4 font-medium text-ink">
                        {row.criteria}
                      </td>
                      <td className="py-3.5 pr-4 text-slate">{row.traditional}</td>
                      <td className="py-3.5 text-slate">{row.neva}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* la ligne d'honnêteté vit déjà dans le tableau : la
                note ne s'affiche que si elle dit AUTRE chose */}
            {landing.comparisonNote &&
            !landing.comparisonNote.startsWith(
              landing.comparison[landing.comparison.length - 1]?.criteria ?? " "
            ) ? (
              <p className="mt-4 max-w-[640px] text-[13.5px] leading-[1.65] text-mist">
                {landing.comparisonNote}
              </p>
            ) : null}
          </section>

          {/* mini-FAQ — details natif : lisible sans JS, indexable */}
          <section className="mt-16 max-w-[680px]">
            <h2 className="font-display text-[clamp(24px,2.4vw,32px)] font-light leading-[1.15] tracking-[-0.01em] text-ink">
              {tr(landing, "Questions fréquentes", "Frequently asked questions")}
            </h2>
            <div className="mt-6 border-t border-[rgba(255,255,255,0.08)]">
              {landing.faq.map((item) => (
                <details
                  key={item.q}
                  className="group border-b border-[rgba(255,255,255,0.08)] py-4"
                >
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span
                      aria-hidden
                      className="font-mono text-[13px] text-mist transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-[600px] text-[14.5px] leading-[1.7] text-slate">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* clôture + maillage */}
          <section className="mt-16 border-t border-[rgba(255,255,255,0.08)] pt-10">
            <p className="max-w-[560px] text-[15.5px] leading-[1.7] text-slate">
              {landing.ctaText}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/#generative" className="pv-btn">
                {landing.ctaLabel}
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
              <Link href="/#generative" className="pv-btn pv-btn--ghost">
                {tr(landing, "Voir les formules", "See the plans")}
              </Link>
            </div>
            {landing.related.length ? (
              <nav
                aria-label={tr(landing, "Pages liées", "Related pages")}
                className="mt-10"
              >
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-mist">
                  {tr(landing, "À explorer aussi", "Also worth a look")}
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                  {landing.related.map((slug) => {
                    const rel = getLanding(slug);
                    if (!rel) return null;
                    return (
                      <li key={slug}>
                        <Link
                          href={`/${slug}`}
                          className="text-slate underline decoration-[rgba(255,255,255,0.20)] underline-offset-4 transition-colors hover:text-ink"
                        >
                          {rel.h1}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            ) : null}
          </section>
        </article>

        {/* pied de page minimal */}
        <footer className="border-t border-[rgba(255,255,255,0.08)]">
          <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center justify-between gap-4 px-6 py-8 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mist">
            <Link href={home} className="transition-colors hover:text-slate">
              ← Neva Design
            </Link>
            <span>© {new Date().getFullYear()} Neva Design</span>
          </div>
        </footer>
      </main>
    </>
  );
}
