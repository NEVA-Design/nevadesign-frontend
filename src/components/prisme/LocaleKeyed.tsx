"use client";

import { useTranslations } from "@/components/LanguageProvider";

/*
 * Re-monte son contenu quand la langue change : indispensable pour
 * les titres découpés par SplitText, dont le DOM fragmenté ne peut
 * pas être réconcilié par React après un changement de locale.
 */
export default function LocaleKeyed({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslations();
  return <div key={locale}>{children}</div>;
}
