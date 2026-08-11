import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LandingShowcase from "@/components/landing/LandingShowcase";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Showcase from "@/components/landing/Showcase";
import SocialProof from "@/components/landing/SocialProof";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
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
        logo: `${siteUrl}/nevalogooo.png`,
        sameAs: [siteUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        alternateName: ["Neva Design", "Neva AI FiveM", "FiveM IA"],
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
        image: `${siteUrl}/bglanding.png`,
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
          audienceType: "Createurs FiveM, serveurs GTA RP, designers et entrepreneurs gaming",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#050505] overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <LandingShowcase />
      <SocialProof />
      <Features />
      <Pricing />
      <Showcase />
      <FAQ />
      <Footer />
    </main>
  );
}
