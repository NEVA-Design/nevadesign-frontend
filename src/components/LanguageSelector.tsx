"use client";

import { useTranslations } from "@/components/LanguageProvider";

export default function LanguageSelector() {
  const { locale, setLocale, languages } = useTranslations();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-select" className="sr-only">
        Select language
      </label>
      <select
        id="locale-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value as typeof locale)}
        className="rounded-2xl border border-white/10 bg-[#0d0d0d] text-sm text-[#F5F0E8] px-3 py-2 outline-none focus:border-[#FF7B4B] focus:ring-2 focus:ring-[#FF7B4B]/20"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code} className="bg-[#0d0d0d] text-[#F5F0E8]">
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
}
