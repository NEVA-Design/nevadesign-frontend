/* Landings SEO (run 3, LOT 5) — pages d'atterrissage par intention
   de recherche, hors nav principale (regroupées au footer
   « Solutions »). Contenu 100 % statique : chaque page est un
   Server Component prerendered, sans un octet de JS d'hydratation
   dédié. */

export type LandingLocale = "fr" | "en";

export interface LandingExample {
  src: string;
  alt: string;
  ratio: "video" | "portrait" | "wide";
}

export interface LandingSection {
  heading: string;
  paragraphs: string[];
}

export interface LandingComparisonRow {
  criteria: string;
  traditional: string;
  neva: string;
}

export interface LandingFaqItem {
  q: string;
  a: string;
}

export interface Landing {
  /* chemin sans slash initial : "graphiste-fivem", "en/fivem-logo-maker" */
  slug: string;
  locale: LandingLocale;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  intro: string[];
  examples: LandingExample[];
  sections: LandingSection[];
  comparison: LandingComparisonRow[];
  /* la ligne d'honnêteté : quand un graphiste humain reste le bon choix */
  comparisonNote: string;
  faq: LandingFaqItem[];
  ctaText: string;
  ctaLabel: string;
  /* slugs des landings sœurs (maillage interne) */
  related: string[];
  /* slug de la même page dans l'autre langue (hreflang) */
  altLocaleSlug?: string;
}
