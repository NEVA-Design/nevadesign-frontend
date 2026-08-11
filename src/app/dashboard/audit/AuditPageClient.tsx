"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BarChart3, CheckCircle2, Download, ImageIcon, Loader2, Search, Sparkles, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";
import { readApiResponse } from "@/lib/api/client";

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
  { id: "poster", label: "Poster" },
  { id: "banner", label: "Banner" },
  { id: "logo", label: "Logo" },
  { id: "landing_page", label: "Landing Page" },
  { id: "social_media", label: "Social Media" },
];

const REPORT_LANGUAGES: Array<{ id: ReportLanguage; label: string }> = [
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "de", label: "Deutsch" },
  { id: "it", label: "Italiano" },
  { id: "pt", label: "Português" },
  { id: "ar", label: "Arabic" },
];

function scoreColor(score: number) {
  if (score >= 80) return "#4ADE80";
  if (score >= 60) return "#FFD166";
  return "#FF6B7D";
}

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
      setError("Ajoute un visuel à analyser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/audit-image", {
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

  return (
    <div className="mx-auto min-h-full max-w-[1320px] p-4 sm:p-6 lg:p-8">
      <ModuleHeader
        icon={Search}
        eyebrow="Neva Audit"
        title="Découvrez ce qui empêche votre design d'avoir plus d'impact"
        description="Déposez un visuel. Obtenez un score, un verdict et les corrections prioritaires."
        accent="#4ADE80"
        meta="1 création · +2 avec correction"
        activeStep={activeStep}
        steps={[
          { label: "Importer", detail: "Projet à analyser" },
          { label: "Qualifier", detail: ASSET_TYPES.find((type) => type.id === assetType)?.label ?? "Type" },
          { label: "Corriger", detail: "Verdict + priorités" },
        ]}
      />
      <div className="hidden">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-[#4ADE80]/25 bg-[#4ADE80]/10 px-2.5 py-1 text-xs font-semibold text-[#4ADE80]">
            <Search size={13} />
            NEVA AUDIT
          </div>
          <h1 className="text-2xl font-bold text-[#F5F0E8]">Analyze FiveM visuals</h1>
          <p className="mt-1 max-w-2xl text-sm text-[#777]">
            Upload posters, banners, logos, landing pages or social visuals and get a comprehensive premium audit focused on hierarchy, readability and tasteful polish.
          </p>
        </div>
        <div className="text-xs text-[#666]">1 création / audit · +2 avec version corrigée</div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <section className="rounded-[16px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.018))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/[0.12] bg-white/[0.025] text-left transition-colors hover:border-[#4ADE80]/45"
          >
            {sourceImage ? (
              <Image src={sourceImage.preview} alt="Uploaded visual" fill sizes="390px" className="object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload size={24} className="text-[#4ADE80]" />
                <div className="text-sm font-medium text-[#CCCCC0]">Ajouter le visuel</div>
                <div className="text-xs text-[#666]">PNG, JPG or WebP</div>
              </div>
            )}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#555]">Type de projet</div>
            <div className="grid grid-cols-2 gap-2">
              {ASSET_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setAssetType(type.id)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    assetType === type.id
                      ? "border-[#4ADE80]/50 bg-[#4ADE80]/10 text-[#F5F0E8]"
                      : "border-white/[0.07] bg-white/[0.025] text-[#777] hover:text-[#CCCCC0]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#555]">Langue du rapport</div>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_LANGUAGES.map((language) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => setReportLanguage(language.id)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    reportLanguage === language.id
                      ? "border-[#4ADE80]/50 bg-[#4ADE80]/10 text-[#F5F0E8]"
                      : "border-white/[0.07] bg-white/[0.025] text-[#777] hover:text-[#CCCCC0]"
                  }`}
                >
                  {language.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-3">
            <input
              type="checkbox"
              checked={generateImprovedVersion}
              onChange={(e) => setGenerateImprovedVersion(e.target.checked)}
              className="h-4 w-4 accent-[#4ADE80]"
            />
            <span className="flex-1 text-sm text-[#CCCCC0]">Créer une version corrigée</span>
            <Sparkles size={15} className="text-[#FFD166]" />
          </label>

          {error && (
            <div className="mt-4 rounded-lg border border-[#FF6B7D]/25 bg-[#FF6B7D]/10 px-3 py-2 text-sm text-[#FFB5C8]">
              {error}
            </div>
          )}

          <Button onClick={runAudit} disabled={loading || !sourceImage} variant="gradient" className="mt-5 w-full">
            {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <BarChart3 size={16} className="mr-2" />}
            Obtenir le verdict
          </Button>
        </section>

        <section className="min-h-[620px] rounded-[16px] border border-white/[0.08] bg-[#080808] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5">
          {!audit ? (
            <div className="flex h-full min-h-[500px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <ImageIcon size={24} className="text-[#555]" />
              </div>
              <div className="text-sm font-medium text-[#9A9A9A]">Le score apparaîtra ici</div>
              <div className="mt-1 text-xs text-[#555]">Forces, faiblesses et corrections à faire en premier.</div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 border-b border-white/[0.06] pb-5 lg:grid-cols-[240px_1fr]">
                <div
                  className="relative flex aspect-square w-full max-w-[220px] flex-shrink-0 items-center justify-center rounded-[16px] border text-5xl font-semibold"
                  style={{ borderColor: `${scoreColor(audit.overallScore)}55`, color: scoreColor(audit.overallScore), background: `${scoreColor(audit.overallScore)}12` }}
                >
                  <div className="absolute inset-4 rounded-full border border-current opacity-20" />
                  <div className="absolute inset-8 rounded-full border border-current opacity-10" />
                  <span>{audit.overallScore}</span>
                  <span className="mt-14 text-sm text-[#777]">/100</span>
                </div>
                <div>
                  <div className="mb-2 inline-flex rounded-full border border-[#55D18A]/20 bg-[#55D18A]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#55D18A]">Verdict prêt</div>
                  <div className="text-2xl font-semibold tracking-tight text-[#F5F0E8]">Design Score</div>
                  <p className="mt-1 text-sm leading-relaxed text-[#9A9A9A]">{audit.summary ?? "FiveM visual audit completed."}</p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {["Branding", "Storytelling", "Conversion"].map((label, index) => (
                      <div key={label} className="rounded-[16px] border border-white/[0.06] bg-white/[0.025] p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[#555]">{label}</div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-[#55D18A]" style={{ width: `${Math.max(42, audit.overallScore - index * 9)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {audit.categories?.map((category) => (
                  <div key={category.name} className="rounded-[16px] border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#F5F0E8]">{category.name}</span>
                      <span className="text-sm font-bold" style={{ color: scoreColor(category.score) }}>{category.score}</span>
                    </div>
                    <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${category.score}%`, background: scoreColor(category.score) }} />
                    </div>
                    <p className="text-xs leading-relaxed text-[#777]">{category.notes}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <AuditList title="Forces" icon="good" items={audit.strengths} />
                <AuditList title="Risques" icon="bad" items={audit.weaknesses} />
                <AuditList title="Recommandations" icon="spark" items={audit.suggestions} />
              </div>

              {improvedImage && (
                <div className="rounded-xl border border-[#FFD166]/20 bg-[#FFD166]/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#F5F0E8]">Improved version</div>
                    <button
                      type="button"
                      onClick={downloadImproved}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/[0.09] px-3 py-1.5 text-xs text-[#CCCCC0] hover:text-[#F5F0E8]"
                    >
                      <Download size={13} />
                      Download
                    </button>
                  </div>
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                    <Image src={improvedImage} alt="Improved visual" fill sizes="900px" className="object-contain" />
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

function AuditList({ title, icon, items }: { title: string; icon: "good" | "bad" | "spark"; items?: string[] }) {
  const Icon = icon === "good" ? CheckCircle2 : icon === "bad" ? XCircle : Sparkles;
  const color = icon === "good" ? "#4ADE80" : icon === "bad" ? "#FF6B7D" : "#FFD166";

  return (
    <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.025] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#F5F0E8]">
        <Icon size={15} style={{ color }} />
        {title}
      </div>
      <div className="space-y-2">
        {(items ?? []).map((item, index) => (
          <div key={`${title}-${index}`} className="text-xs leading-relaxed text-[#9A9A9A]">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
