"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Loader2, Play, ShieldCheck } from "lucide-react";
import { backendFetch } from "@/lib/api/backend-client";
import { cn } from "@/lib/utils";

/*
 * /admin/test-moteur (run 5.2, LOT 5) — la checklist à cliquer.
 * Chaque cas montre son prompt compilé AVANT lancement (GET = compilation
 * pure, zéro appel API). Le lancement est un choix de l'admin, le coût
 * réel s'affiche. Rien n'est généré automatiquement.
 */

type Variant = {
  id: string;
  label: string;
  pipeline: "v1" | "v2" | "instruct";
  kind: "logo" | "hero";
  model: string;
  count: number;
  prompt: string;
  referencesJointes: number;
  ocrAttendus: string[];
  aspectRatio: string;
};

type TestCase = {
  id: string;
  titre: string;
  attendu: string;
  variants: Variant[];
};

type RunResult = {
  resultats: Array<{ dataUrl: string; ocrRejects: number; retried: boolean }>;
  coutEur: number;
  dureeMs: number;
};

export default function TestMoteur() {
  const [cases, setCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openPrompts, setOpenPrompts] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [runErrors, setRunErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    backendFetch("/admin/test-moteur/cases")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error ?? "Chargement impossible");
        setCases(json.cases ?? []);
      })
      .catch((e) => setLoadError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  async function run(caseId: string, variantId: string) {
    const key = `${caseId}:${variantId}`;
    if (running) return;
    setRunning(key);
    setRunErrors((e) => ({ ...e, [key]: "" }));
    try {
      const res = await backendFetch("/admin/test-moteur/run", {
        method: "POST",
        body: JSON.stringify({ caseId, variantId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Génération échouée");
      setResults((r) => ({ ...r, [key]: json as RunResult }));
    } catch (e) {
      setRunErrors((errors) => ({ ...errors, [key]: (e as Error).message }));
    } finally {
      setRunning(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-steel">
        <Loader2 size={16} className="animate-spin" />
        Compilation des cas de test…
      </div>
    );
  }

  if (loadError) {
    return (
      <p className="rounded-xl border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-4 py-3 text-[13px] text-[#B4443C]">
        {loadError}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="pv-label text-[color:var(--num-color)]">Run 5.2 — moteur v2</p>
        <h1 className="pv-display mt-2 text-[clamp(1.6rem,3vw,2.3rem)] text-ink">Banc de test du moteur.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
          Chaque cas affiche son prompt compilé avant tout lancement — la compilation ne coûte
          rien. Le bouton «&nbsp;Lancer&nbsp;» déclenche la ou les générations réelles et affiche le
          coût mesuré. Aucun crédit produit n&apos;est débité.
        </p>
      </header>

      {cases.map((testCase, index) => (
        <section
          key={testCase.id}
          className="pv-glass pv-glass--card pv-edge rounded-[20px] p-6"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-white">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-medium text-ink">{testCase.titre}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-steel">{testCase.attendu}</p>
            </div>
          </div>

          <div className={cn("mt-5 grid gap-4", testCase.variants.length > 1 ? "lg:grid-cols-2" : "")}>
            {testCase.variants.map((variant) => {
              const key = `${testCase.id}:${variant.id}`;
              const result = results[key];
              const isRunning = running === key;
              const promptOpen = openPrompts[key] ?? false;
              return (
                <div key={variant.id} className="rounded-2xl border border-[color:var(--hairline-strong)] bg-white/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">{variant.label}</p>
                      <p className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-dusk">
                        {variant.model} · ×{variant.count} · {variant.referencesJointes} réf. jointe{variant.referencesJointes > 1 ? "s" : ""}
                        {variant.ocrAttendus.length ? ` · OCR : ${variant.ocrAttendus.join(" + ")}` : " · sans OCR"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(running)}
                      onClick={() => run(testCase.id, variant.id)}
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors",
                        !running
                          ? "bg-ink text-white hover:bg-[#35305E]"
                          : "cursor-not-allowed bg-ink/10 text-mist"
                      )}
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      {isRunning ? "Génération…" : "Lancer"}
                    </button>
                  </div>

                  {/* Le prompt compilé — visible AVANT lancement */}
                  <button
                    type="button"
                    onClick={() => setOpenPrompts((o) => ({ ...o, [key]: !promptOpen }))}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-steel transition-colors hover:text-ink"
                  >
                    <ChevronDown size={13} className={cn("transition-transform", promptOpen ? "rotate-180" : "")} />
                    Prompt compilé ({variant.prompt.length.toLocaleString("fr-FR")} caractères)
                  </button>
                  {promptOpen ? (
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg border border-[color:var(--hairline)] bg-[#14111F] p-3 text-[10.5px] leading-relaxed text-[#D8D3EC] whitespace-pre-wrap">
                      {variant.prompt}
                    </pre>
                  ) : null}

                  {runErrors[key] ? (
                    <p className="mt-3 rounded-lg border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-3 py-2 text-[12px] text-[#B4443C]">
                      {runErrors[key]}
                    </p>
                  ) : null}

                  {result ? (
                    <div className="mt-4">
                      <div className={cn("grid gap-2", result.resultats.length > 1 ? "grid-cols-3" : "grid-cols-1")}>
                        {result.resultats.map((r, i) => (
                          <figure key={i} className="overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.dataUrl} alt={`Résultat ${i + 1}`} className="w-full object-contain" />
                            <figcaption className="flex items-center justify-between bg-white/70 px-2 py-1 font-mono text-[9.5px] text-dusk">
                              <span>#{i + 1}</span>
                              <span className="flex items-center gap-1">
                                {r.ocrRejects > 0 ? `${r.ocrRejects} rejet${r.ocrRejects > 1 ? "s" : ""} OCR` : variant.ocrAttendus.length ? (
                                  <>
                                    <ShieldCheck size={10} className="text-[#3D7A58]" /> OCR ok
                                  </>
                                ) : "—"}
                              </span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                      <p className="mt-2 font-mono text-[10.5px] tracking-[0.05em] text-dusk">
                        Coût mesuré : {result.coutEur.toFixed(4)} € · {(result.dureeMs / 1000).toFixed(1)} s
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <p className="text-[12px] leading-relaxed text-mist">
        La gomme non destructive (masque, taille 10-200 px, dureté, undo/redo 30 pas) se teste
        dans l&apos;éditeur, sur n&apos;importe quelle création — bouton «&nbsp;Gomme&nbsp;» de la barre.
      </p>
    </div>
  );
}
