import { Suspense } from "react";
import PrismShell from "@/components/prisme/Shell";
import GivreNavbar from "@/components/givre/GivreNavbar";
import PrismLoader from "@/components/prisme/PrismLoader";
import GivreHero from "@/components/givre/GivreHero";
import GivreStudio from "@/components/givre/GivreStudio";
import GivreEnhance from "@/components/givre/GivreEnhance";
import GivreType from "@/components/givre/GivreType";
import GivreFields from "@/components/givre/GivreFields";
import GivreModules from "@/components/givre/GivreModules";
import GivreStats from "@/components/givre/GivreStats";
import GivreCreations from "@/components/givre/GivreCreations";
import GivrePricing from "@/components/givre/GivrePricing";
import GivrePacks from "@/components/givre/GivrePacks";
import GivreFAQ from "@/components/givre/GivreFAQ";
import GivreFooter from "@/components/givre/GivreFooter";
import SectionRail from "@/components/givre/SectionRail";
import LocaleKeyed from "@/components/prisme/LocaleKeyed";
import { defaultSeo, siteName, siteUrl } from "@/lib/seo";
import { PLANS, TOPUPS } from "@/lib/plans";
import { CREATION_PACKS } from "@/lib/resources";
import { TRANSLATIONS_FR } from "@/lib/i18n";

/* JSON-LD Product — abonnements et packs depuis la source de vérité
   des prix (run 3, LOT 5) : jamais de montant en dur ici. */
const planNodes = Object.values(PLANS)
  .filter((p) => p.price > 0)
  .map((p) => ({
    "@type": "Product",
    "@id": `${siteUrl}/#plan-${p.id}`,
    name: `Abonnement ${p.name}`,
    description: p.description,
    brand: { "@id": `${siteUrl}/#organization` },
    offers: {
      "@type": "Offer",
      price: String(p.price),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/#pricing`,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(p.price),
        priceCurrency: "EUR",
        billingDuration: "P1M",
      },
    },
  }));

const packNodes = Object.values(CREATION_PACKS).map((p) => ({
  "@type": "Product",
  "@id": `${siteUrl}/#${p.id}`,
  name: p.name,
  description: p.description,
  brand: { "@id": `${siteUrl}/#organization` },
  offers: {
    "@type": "Offer",
    price: String(p.price),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/#packs`,
  },
}));

const topupNode = {
  "@type": "Product",
  "@id": `${siteUrl}/#topups`,
  name: "Recharges de créations",
  description:
    "Des créations supplémentaires à 2,90 € l’unité, par packs de 10, 30 ou 100 — sans changer d’abonnement.",
  brand: { "@id": `${siteUrl}/#organization` },
  offers: TOPUPS.map((t) => ({
    "@type": "Offer",
    name: `${t.credits} créations`,
    price: String(t.price),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${siteUrl}/#pricing`,
  })),
};

/* FAQPage — les 6 questions réelles de la section FAQ (mêmes clés
   i18n que le composant : jamais deux vérités). */
const faqNode = {
  "@type": "FAQPage",
  "@id": `${siteUrl}/#faq`,
  mainEntity: [1, 2, 3, 4, 5, 6].map((i) => ({
    "@type": "Question",
    name: TRANSLATIONS_FR[`faq.q${i}`],
    acceptedAnswer: {
      "@type": "Answer",
      text: TRANSLATIONS_FR[`faq.a${i}`],
    },
  })),
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Neva Design",
        url: siteUrl,
        logo: `${siteUrl}/brand/logo-noir-large.png`,
        sameAs: [siteUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        alternateName: ["Neva Design", "Neva Design Studio", "Neva AI"],
        description: defaultSeo.description,
        inLanguage: "fr-FR",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: siteName,
        alternateName: "Neva Design AI",
        applicationCategory: "DesignApplication",
        operatingSystem: "Web",
        url: siteUrl,
        image: `${siteUrl}/brand/og.jpg`,
        description: defaultSeo.description,
        keywords: defaultSeo.keywords.join(", "),
        brand: {
          "@id": `${siteUrl}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
        audience: {
          "@type": "Audience",
          audienceType:
            "Youtubeurs et créateurs de contenu, entrepreneurs et marques, équipes esport, serveurs GTA RP et communautés gaming",
        },
      },
      ...planNodes,
      ...packNodes,
      topupNode,
      faqNode,
    ],
  };

  return (
    <PrismShell>
      {/* Givre impose sa lumière à la route : l'ivoire de
          l'atelier jusque sous l'overscroll, scrollbars et
          contrôles natifs clairs. */}
      <style>{`html{color-scheme:light}body{background-color:#F1EFE9;color:#2B2450}`}</style>
      <main className="pv-light min-h-screen bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Anti-flash du F5 : exécuté au parse, AVANT le rideau dans
            le flux — si la session a déjà vu l'ouverture, l'attribut
            masque monogramme et compteur dès le premier paint (le
            micro-rideau ne montre que l'ivoire). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("prism-overture"))document.documentElement.setAttribute("data-prism-seen","1")}catch(e){}',
          }}
        />
        <PrismLoader />
        <GivreNavbar />
        <SectionRail />
        <LocaleKeyed>
          {/* Hydratation SÉLECTIVE (run 3, LOT 7) : sans frontières,
              react-dom hydrate les 12 sections en un bloc — 17 s de
              script mesurées à CPU ×4 (Lighthouse bootup-time), le
              « très lourd » du premier chargement. Une boundary par
              section sous le pli découpe ce bloc en tâches courtes
              interruptibles et priorisées par interaction ; le HTML
              serveur reste affiché tel quel pendant ce temps —
              fallback jamais montré, zéro changement visuel. */}
          <GivreHero />
          <Suspense>
            <GivreStudio />
          </Suspense>
          <Suspense>
            <GivreCreations />
          </Suspense>
          <Suspense>
            <GivreEnhance />
          </Suspense>
          <Suspense>
            <GivreType />
          </Suspense>
          <Suspense>
            <GivreFields />
          </Suspense>
          <Suspense>
            <GivreModules />
          </Suspense>
          <Suspense>
            <GivreStats />
          </Suspense>
          <Suspense>
            <GivrePricing />
          </Suspense>
          <Suspense>
            <GivrePacks />
          </Suspense>
          <Suspense>
            <GivreFAQ />
          </Suspense>
          <Suspense>
            <GivreFooter />
          </Suspense>
        </LocaleKeyed>
      </main>
    </PrismShell>
  );
}
