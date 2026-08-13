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
        image: `${siteUrl}/brand/og.png`,
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
        <PrismLoader />
        <GivreNavbar />
        <SectionRail />
        <LocaleKeyed>
          <GivreHero />
          <GivreStudio />
          <GivreCreations />
          <GivreEnhance />
          <GivreType />
          <GivreFields />
          <GivreModules />
          <GivreStats />
          <GivrePricing />
          <GivrePacks />
          <GivreFAQ />
          <GivreFooter />
        </LocaleKeyed>
      </main>
    </PrismShell>
  );
}
