"use client";

import { useTranslations } from "@/components/LanguageProvider";
import { cn } from "@/lib/utils";

export default function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, languages } = useTranslations();

  return (
    <div
      className={cn("flex items-center gap-1 font-mono text-[11px] tracking-[0.14em]", className)}
      role="group"
      aria-label="Langue"
    >
      {languages.map((language, index) => (
        <span key={language.code} className="flex items-center gap-1">
          {index > 0 ? (
            <span className="text-[color:var(--ink-28)]">/</span>
          ) : null}
          <button
            type="button"
            onClick={() => setLocale(language.code)}
            aria-pressed={locale === language.code}
            aria-label={language.label}
            className={cn(
              "cursor-pointer px-1 py-1 uppercase transition-colors duration-300",
              locale === language.code
                ? "text-[color:var(--num-color)]"
                : "text-dusk hover:text-steel"
            )}
          >
            {language.code}
          </button>
        </span>
      ))}
    </div>
  );
}
