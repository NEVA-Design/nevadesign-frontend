"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BarChart3, Download, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gauge } from "@/components/ui/gauge";
import { Spinner } from "@/components/ui/spinner";
import { FormMessage } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";
import { backendFetch } from "@/lib/api/backend-client";

/*
 * Audit — le verdict comme une scène : grand score serif teinté
 * sage/ochre/clay, catégories en rangées à jauges violet,
 * forces, risques et recommandations en trois listes éditoriales.
 */

type SourceImage = { data: string; mimeType: string; preview: string };
type AssetType = "poster" | "banner" | "logo" | "landing_page" | "social_media";
type ReportLanguage = "fr" | "en" | "es" | "de" | "it" | "pt" | "ar";

type AuditCategory = {
  name: string;
  score: number;
  notes: string;
};

type AuditResult = {
  overallScore: number;
  summary?: string;
  categories: AuditCategory[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

const ASSET_TYPES: Array<{ id: AssetType; label: string }> = [
  { id: "poster", label: "Affiche" },
  { id: "banner", label: "Bannière" },
  { id: "logo", label: "Logo" },
  { id: "landing_page", label: "Page de destination" },
  { id: "social_media", label: "Réseaux sociaux" },
];

const REPORT_LANGUAGES: Array<{ id: ReportLanguage; label: string }> = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
  { id: "ar", label: "العربية" },
];

/* Ton du verdict — états système désaturés, jamais de vert/rouge vifs */
function scoreTone(score: number): "sage" | "ochre" | "clay" {
  if (score >= 80) return "sage";
  if (score >= 60) return "ochre";
  return "clay";
}

const TONE_TEXT: Record<"sage" | "ochre" | "clay", string> = {
  sage: "text-ok",
  ochre: "text-warn",
  clay: "text-err",
};

const TONE_VERDICT: Record<"sage" | "ochre" | "clay", string> = {
  sage: "Solide",
  ochre: "Perfectible",
  clay: "À retravailler",
};

export default function AuditPageClient() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [assetType, setAssetType] = useState<AssetType>("poster");
  const [reportLanguage, setReportLanguage] = useState<ReportLanguage>("fr");
  const [generateImprovedVersion, setGenerateImprovedVersion] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [improvedImage, setImprovedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeStep = audit ? 2 : sourceImage ? 1 : 0;

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const preview = reader.result as string;
      const data = preview.split(",")[1];
      setSourceImage({ data, mimeType: file.type, preview });
      setAudit(null);
      setImprovedImage(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const runAudit = async () => {
    if (!sourceImage) {
      setError("Ajoutez un visuel à analyser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await backendFetch("/audit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage: { data: sourceImage.data, mimeType: sourceImage.mimeType },
          assetType,
          generateImprovedVersion,
          reportLanguage,
        }),
      });

      const data = await readApiResponse<{ audit: AuditResult; improvedImage?: string | null }>(res);

      setAudit(data.audit);
      setImprovedImage(data.improvedImage ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImproved = () => {
    if (!improvedImage) return;
    const link = document.createElement("a");
    link.href = improvedImage;
    link.download = `neva-audit-improved-${assetType}.webp`;
    link.click();
  };

  const tone = audit ? scoreTone(audit.overallScore) : "sage";

  return (
    <div className="relative mx-auto min-h-full w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
      <div aria-hidden className="pv-halo--violet pv-halo right-[-10%] top-[-120px] h-[420px] w-[520px] opacity-70" />

      <ModuleHeader
        icon={Search}
        eyebrow="Neva Audit"
        title="Découvrez ce qui empêche votre design d'avoir plus d'impact"
        description="Déposez un visuel. Obtenez un score, un verdict et les corrections prioritaires."
        accent="#B9A7DA"
        meta="1 création · +2 avec correction"
        activeStep={activeStep}
        steps={[
          { label: "Importer", detail: "Projet à analyser" },
          { label: "Qualifier", detail: ASSET_TYPES.find((type) => type.id === assetType)?.label ?? "Type" },
          { label: "Corriger", detail: "Verdict + priorités" },
        ]}
      />

      <div className="relative grid gap-8 xl:grid-cols-[380px_1fr] xl:gap-12">
        {/* ── Préparation de l'audit ─────────────────────────────── */}
        <section>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Téléverser le visuel à auditer"
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[rgba(246,243,238,0.22)] bg-abyss text-left transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] hover:border-[rgba(185,167,218,0.45)]"
          >
            {sourceImage ? (
              <Image src={sourceImage.preview} alt="Visuel téléversé" fill sizes="380px" className="object-contain" />
            ) : (
              <span className="flex flex-col items-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet/25 bg-[rgba(185,167,218,0.08)] text-[color:var(--num-color)]">
                  <Upload size={16} />
                </span>
                <span className="text-sm font-medium text-ink/80">Téléverser le visuel</span>
                <span className="pv-meta">PNG, JPG ou WebP</span>
              </span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />

          <div className="mt-7">
            <p className="pv-label mb-3">Type de projet</p>
            <div className="grid grid-cols-2 gap-2">
              {ASSET_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAssetType(type.id)}
                  className={`min-h-[40px] rounded-lg border px-3 py-2 text-[13px] transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                    assetType === type.id
                      ? "border-[color:var(--color-ink)] bg-[rgba(185,167,218,0.12)] text-ink"
                      : "border-[color:var(--hairline)] text-steel hover:border-[#4A4A4A] hover:text-ink"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <p className="pv-label mb-3">Langue du rapport</p>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_LANGUAGES.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => setReportLanguage(language.id)}
                  className={`min-h-[40px] rounded-lg border px-3 py-2 text-[13px] transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                    reportLanguage === language.id
                      ? "border-[color:var(--color-ink)] bg-[rgba(185,167,218,0.12)] text-ink"
                      : "border-[color:var(--hairline)] text-steel hover:border-[#4A4A4A] hover:text-ink"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-7 flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[color:var(--hairline)] bg-abyss px-4 py-3 transition-colors duration-300 hover:border-[#4A4A4A]">
            <input
              type="checkbox"
              checked={generateImprovedVersion}
              onChange={(e) => setGenerateImprovedVersion(e.target.checked)}
              className="h-4 w-4 accent-violet"
            />
            <span className="flex-1 text-sm text-ink/80">Créer une version corrigée</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--num-color)]/80">+2</span>
          </label>

          {error && (
            <FormMessage tone="error" className="mt-5">
              {error}
            </FormMessage>
          )}

          <Button onClick={runAudit} disabled={loading || !sourceImage} variant="gradient" className="mt-6 w-full">
            {loading ? <Spinner className="border-void/30 border-t-night" /> : <BarChart3 size={16} />}
            Obtenir le verdict
          </Button>
        </section>

        {/* ── La scène du verdict ────────────────────────────────── */}
        <section className="min-w-0">
          {!audit ? (
            <EmptyState
              className="min-h-[520px]"
              title="Le verdict apparaîtra ici."
              hint="Forces, risques et corrections à faire en premier."
            />
          ) : (
            <div className="pv-fade-up">
              {/* Verdict — le score comme une scène */}
              <div className="relative overflow-hidden rounded-xl border border-[color:var(--hairline)] bg-white/5 px-6 py-8 shadow-[var(--shadow-print)] sm:px-8">
                <div aria-hidden className="pv-halo--violet pv-halo left-[-10%] top-[-40%] h-[320px] w-[420px]" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="pv-label text-[color:var(--num-color)]">Verdict</p>
                    <p className="mt-2 flex items-baseline gap-3">
                      <span className={`pv-display text-[clamp(4.2rem,9vw,6.5rem)] leading-none ${TONE_TEXT[tone]}`}>
                        {audit.overallScore}
                      </span>
                      <span className="font-mono text-sm tracking-[0.08em] text-dusk">/ 100</span>
                    </p>
                  </div>
                  <div className="max-w-md sm:text-right">
                    <span
                      className={`inline-flex rounded-full border px-2 py-[3px] font-mono text-[10px] font-medium uppercase tracking-[0.16em] ${TONE_TEXT[tone]} ${
                        tone === "sage"
                          ? "border-ok/30 bg-ok/10"
                          : tone === "ochre"
                            ? "border-warn/30 bg-warn/10"
                            : "border-err/30 bg-err/10"
                      }`}
                    >
                      {TONE_VERDICT[tone]}
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-steel">
                      {audit.summary ?? "L'audit de votre visuel est terminé."}
                    </p>
                  </div>
                </div>

                {/* Axes de lecture — estimations dérivées du score global */}
                <div className="relative mt-8 border-t border-[color:var(--hairline)] pt-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="pv-label">Axes de lecture</p>
                    <p className="pv-meta">( estimations dérivées du score global )</p>
                  </div>
                  <div className="mt-4 grid gap-5 sm:grid-cols-3">
                    {["Branding", "Storytelling", "Conversion"].map((label, index) => {
                      const value = Math.max(42, audit.overallScore - index * 9);
                      return (
                        <div key={label}>
                          <div className="mb-2 flex items-baseline justify-between">
                            <span className="text-[13px] text-ink/70">{label}</span>
                            <span className="font-mono text-[11px] text-[color:var(--num-color)]">{value}</span>
                          </div>
                          <Gauge value={value} max={100} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Catégories — rangées à jauges violet */}
              <div className="mt-10">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="pv-display text-xl text-ink">Lecture par catégorie</h2>
                  <span className="pv-label hidden sm:block">Notée sur 100</span>
                </div>
                <ul>
                  {audit.categories?.map((category, index) => (
                    <li key={category.name} className="pv-row px-2 py-5">
                      <div className="grid grid-cols-[36px_1fr_auto] items-baseline gap-3">
                        <span className="pv-num">0{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium text-ink">{category.name}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-steel">{category.notes}</span>
                        </span>
                        <span className={`font-mono text-sm ${TONE_TEXT[scoreTone(category.score)]}`}>
                          {category.score}
                        </span>
                      </div>
                      <div className="mt-4 pl-[48px]">
                        <Gauge value={category.score} max={100} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trois listes éditoriales */}
              <div className="mt-10 grid gap-10 lg:grid-cols-3 lg:gap-8">
                <AuditList title="Forces" toneClass="text-ok" items={audit.strengths} />
                <AuditList title="Risques" toneClass="text-err" items={audit.weaknesses} />
                <AuditList title="Recommandations" toneClass="text-[color:var(--num-color)]" items={audit.suggestions} />
              </div>

              {/* Version corrigée */}
              {improvedImage && (
                <div className="mt-10 rounded-xl border border-violet/25 bg-[rgba(185,167,218,0.05)] p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="pv-label text-[color:var(--num-color)]">Version corrigée</p>
                      <p className="mt-1 text-sm text-steel">Les priorités du verdict, appliquées.</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={downloadImproved}>
                      <Download size={13} />
                      Télécharger
                    </Button>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-[color:var(--hairline)] bg-abyss">
                    <Image src={improvedImage} alt="Version corrigée du visuel" fill sizes="900px" className="object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* Liste éditoriale — étiquette mono teintée, entrées en filets */
function AuditList({ title, toneClass, items }: { title: string; toneClass: string; items?: string[] }) {
  return (
    <div>
      <p className={`pv-label ${toneClass} mb-1`}>{title}</p>
      <ul>
        {(items ?? []).map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="border-t border-[color:var(--hairline)] py-3 text-[13px] leading-relaxed text-ink/70 last:border-b last:border-b-[color:var(--hairline)]"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
