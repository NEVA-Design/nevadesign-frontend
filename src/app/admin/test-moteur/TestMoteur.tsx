"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, Download, Loader2, Play, ShieldCheck, Sparkles } from "lucide-react";
import { backendFetch } from "@/lib/api/backend-client";
import { cn } from "@/lib/utils";

/*
 * /admin/test-moteur (run 5.2 → 5.4) — la checklist à cliquer.
 * Run 5.4 (LOT 6) : badge d'état ADN/exemplars/réfs en tête — cas GRISÉS avec
 * le message « Entraînement requis » tant que train-fivem-v4 n'a pas tourné.
 * Cas Fruitz FiveM-check : les gabarits maîtres complets se déplient AVANT
 * génération, les scores du contrôle (relief, glow, verdict ADN, lisibilité
 * 64 px) s'affichent après. Cas étape B : 3 fonds générés sans le logo,
 * composition par calques, déclinaisons téléchargeables. Compteurs : rejets
 * OCR, échecs concept, ÉCHECS ADN, coût cumulé. Rien n'est généré
 * automatiquement — chaque lancement est un clic de l'admin.
 */

type Variant = {
  id: string;
  label: string;
  pipeline: "v1" | "v2" | "instruct" | "logo_v3_concepts" | "logo_v3_generation" | "logo_fond_b";
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
  brief?: string;
  variants: Variant[];
};

type Concept = { nom: string; justification: string; citations: string[]; rendu: "relief" | "plat"; prompt: string };

type Compteurs = {
  generations: number;
  ocrRejets: number;
  echecsConcept: number;
  echecsAdn: number;
  regenerationsCiblees: number;
  coutCumuleEur: number;
};

type Entrainement = {
  installed: boolean;
  adnActif: boolean;
  version: number | null;
  exemplarsLogo: number;
  referencesJointes: number;
  fondsBibliotheque: number;
  manques: string[];
};

type CoutParEtage = { daEur: number; generationEur: number; relectureEur: number; totalEur: number };

type RunResult = {
  resultats?: Array<{ dataUrl: string; ocrRejects: number; retried: boolean }>;
  coutEur?: number;
  concepts?: Concept[];
  propositions?: Array<{
    dataUrl: string;
    concept: Concept;
    ocrRejects: number;
    conceptOk: boolean;
    adnOk: boolean;
    serveurLogo: boolean;
    lisible64: boolean;
    scores: { relief: number; glow: number };
    defauts: string[];
    regenere: boolean;
  }>;
  fonds?: Array<{ fondDataUrl: string; previewDataUrl: string }>;
  declinaisons?: { alphaDataUrl: string; carreDataUrl: string; banniereDataUrl: string };
  coutParEtage?: CoutParEtage;
  dureeMs: number;
  compteurs?: Compteurs;
};

const COMPTEUR_TILES: Array<{ id: keyof Compteurs; label: string }> = [
  { id: "generations", label: "Générations" },
  { id: "ocrRejets", label: "Rejets OCR" },
  { id: "echecsConcept", label: "Échecs concept" },
  { id: "echecsAdn", label: "Échecs ADN" },
  { id: "regenerationsCiblees", label: "Régén. ciblées" },
  { id: "coutCumuleEur", label: "Coût cumulé €" },
];

export default function TestMoteur() {
  const [cases, setCases] = useState<TestCase[]>([]);
  const [compteurs, setCompteurs] = useState<Compteurs | null>(null);
  const [entrainement, setEntrainement] = useState<Entrainement | null>(null);
  const [bloque, setBloque] = useState(false);
  const [messageBlocage, setMessageBlocage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openPrompts, setOpenPrompts] = useState<Record<string, boolean>>({});
  const [openConcepts, setOpenConcepts] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [runErrors, setRunErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    backendFetch("/admin/test-moteur/cases")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error ?? "Chargement impossible");
        setCases(json.cases ?? []);
        setCompteurs(json.compteurs ?? null);
        setEntrainement(json.entrainement ?? null);
        setBloque(Boolean(json.bloque));
        setMessageBlocage(json.messageBlocage ?? null);
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
      if ((json as RunResult).compteurs) setCompteurs((json as RunResult).compteurs!);
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
      <p className="rounded-xl border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-4 py-3 text-[13px] text-[#E08A84]">
        {loadError}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="pv-label text-[color:var(--num-color)]">Run 5.4 — l&apos;ADN FiveM</p>
        <h1 className="pv-display mt-2 text-[clamp(1.6rem,3vw,2.3rem)] text-ink">Banc de test du moteur.</h1>

        {/* LOT 0/6 : le badge d'état — le client ne teste plus jamais à l'aveugle */}
        {entrainement ? (
          <div
            className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] tracking-[0.04em]",
              entrainement.installed
                ? "border-[rgba(111,191,159,0.40)] bg-[rgba(111,191,159,0.10)] text-[#6FBF9F]"
                : "border-[rgba(220,80,80,0.35)] bg-[rgba(220,80,80,0.06)] text-[#E08A84]"
            )}
          >
            {entrainement.installed ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
            ADN v4 : {entrainement.adnActif ? "actif" : "absent"} · exemplars : {entrainement.exemplarsLogo} · réfs
            jointes au prochain appel : {entrainement.referencesJointes} · fonds : {entrainement.fondsBibliotheque}
          </div>
        ) : null}
        {bloque ? (
          <p className="mt-3 max-w-2xl rounded-xl border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-4 py-3 text-[13px] leading-relaxed text-[#E08A84]">
            {messageBlocage ?? "Entraînement requis"} — les cas sont grisés :{" "}
            {entrainement?.manques.join(" ; ")}.
          </p>
        ) : null}

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
          Les cas logo se jouent en deux temps&nbsp;: l&apos;étage 1 écrit les 3 gabarits
          maîtres du directeur artistique (dépliables AVANT toute image), les étages 2+3
          les dessinent en 2K et les relisent (OCR + ADN + lisibilité 64 px). L&apos;étape B
          génère les fonds SANS le logo et compose par calques. Chaque lancement est un
          clic — la compilation ne coûte rien, le coût réel s&apos;affiche par étage.
        </p>

        {/* Les compteurs de session (LOT 4.4) */}
        {compteurs ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-6">
            {COMPTEUR_TILES.map((tile) => (
              <div key={tile.id} className="rounded-2xl border border-[color:var(--hairline-strong)] bg-white/[0.05] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">{tile.label}</p>
                <p className="mt-1 text-[20px] font-medium text-ink">
                  {tile.id === "coutCumuleEur" ? compteurs.coutCumuleEur.toFixed(3) : compteurs[tile.id]}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </header>

      {cases.map((testCase, index) => (
        <section key={testCase.id} className="pv-glass pv-glass--card pv-edge rounded-[20px] p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-[#060606]">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-[16px] font-medium text-ink">{testCase.titre}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-steel">{testCase.attendu}</p>
              {testCase.brief ? (
                <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-[color:var(--hairline)] bg-white/[0.05] p-3 text-[10.5px] leading-relaxed text-ink whitespace-pre-wrap">
                  {testCase.brief}
                </pre>
              ) : null}
            </div>
          </div>

          <div className={cn("mt-5 grid gap-4", testCase.variants.length > 1 ? "lg:grid-cols-2" : "")}>
            {testCase.variants.map((variant) => {
              const key = `${testCase.id}:${variant.id}`;
              const result = results[key];
              const isRunning = running === key;
              const promptOpen = openPrompts[key] ?? false;
              return (
                <div key={variant.id} className="rounded-2xl border border-[color:var(--hairline-strong)] bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-medium text-ink">{variant.label}</p>
                      <p className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-dusk">
                        {variant.model} · ×{variant.count}
                        {variant.pipeline === "logo_v3_concepts"
                          ? " · thinking high · texte seul"
                          : ` · ${variant.referencesJointes} réf. jointe${variant.referencesJointes > 1 ? "s" : ""}`}
                        {variant.ocrAttendus.length ? ` · OCR : ${variant.ocrAttendus.join(" + ")}` : " · sans OCR"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(running) || bloque}
                      onClick={() => run(testCase.id, variant.id)}
                      title={bloque ? messageBlocage ?? "Entraînement requis" : undefined}
                      className="pv-btn nv-btn-sm shrink-0"
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      {isRunning ? "En cours…" : bloque ? "Grisé" : "Lancer"}
                    </button>
                  </div>

                  {/* Le brief / prompt — visible AVANT lancement */}
                  <button
                    type="button"
                    onClick={() => setOpenPrompts((o) => ({ ...o, [key]: !promptOpen }))}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-steel transition-colors hover:text-ink"
                  >
                    <ChevronDown size={13} className={cn("transition-transform", promptOpen ? "rotate-180" : "")} />
                    {variant.pipeline === "logo_v3_concepts" ? "Brief transmis au DA" : "Prompt compilé"} (
                    {variant.prompt.length.toLocaleString("fr-FR")} caractères)
                  </button>
                  {promptOpen ? (
                    <pre className="mt-2 max-h-72 overflow-auto rounded-lg border border-[color:var(--hairline)] bg-[#14111F] p-3 text-[10.5px] leading-relaxed text-[#D8D3EC] whitespace-pre-wrap">
                      {variant.prompt}
                    </pre>
                  ) : null}

                  {runErrors[key] ? (
                    <p className="mt-3 rounded-lg border border-[rgba(220,80,80,0.3)] bg-[rgba(220,80,80,0.06)] px-3 py-2 text-[12px] text-[#E08A84]">
                      {runErrors[key]}
                    </p>
                  ) : null}

                  {/* ── Résultat étage 1 : les 3 concepts du DA, dépliables ── */}
                  {result?.concepts ? (
                    <div className="mt-4 flex flex-col gap-2">
                      {result.concepts.map((concept, i) => {
                        const cKey = `${key}:concept:${i}`;
                        const open = openConcepts[cKey] ?? false;
                        return (
                          <div key={i} className="rounded-xl border border-[color:var(--hairline)] bg-white/[0.05] p-3">
                            <div className="flex items-start gap-2">
                              <Sparkles size={13} className="mt-0.5 shrink-0 text-[#7C6BD4]" />
                              <div className="min-w-0">
                                <p className="text-[13px] font-medium text-ink">
                                  Concept {i + 1} — {concept.nom}
                                  <span className="ml-2 rounded-full bg-ink/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-dusk">
                                    {concept.rendu}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-[12px] leading-relaxed text-steel">{concept.justification}</p>
                                {concept.citations?.length ? (
                                  <ul className="mt-1 flex flex-col gap-0.5">
                                    {concept.citations.map((c) => (
                                      <li key={c} className="text-[11px] leading-relaxed text-dusk">
                                        {c}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOpenConcepts((o) => ({ ...o, [cKey]: !open }))}
                              className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] text-steel transition-colors hover:text-ink"
                            >
                              <ChevronDown size={12} className={cn("transition-transform", open ? "rotate-180" : "")} />
                              Prompt de génération ({concept.prompt.trim().split(/\s+/).length} mots)
                            </button>
                            {open ? (
                              <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-[color:var(--hairline)] bg-[#14111F] p-3 text-[10.5px] leading-relaxed text-[#D8D3EC] whitespace-pre-wrap">
                                {concept.prompt}
                              </pre>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* ── Résultat étages 2+3 : propositions relues ──────────── */}
                  {result?.propositions ? (
                    <div className="mt-4">
                      <div className={cn("grid gap-2", result.propositions.length > 1 ? "grid-cols-3" : "grid-cols-1")}>
                        {result.propositions.map((prop, i) => (
                          <figure key={i} className="overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={prop.dataUrl} alt={`Proposition ${i + 1} — ${prop.concept.nom}`} className="w-full object-contain" />
                            <figcaption className="bg-white/[0.05] px-2 py-1.5">
                              <p className="truncate text-[10.5px] font-medium text-ink">
                                {prop.concept.nom}
                                <span className="ml-1.5 font-mono text-[8.5px] uppercase tracking-[0.06em] text-dusk">{prop.concept.rendu}</span>
                              </p>
                              {/* Les scores du contrôle (LOT 6.2) : relief, glow, ADN, 64 px */}
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[9.5px] text-dusk">
                                <span>relief {prop.scores?.relief ?? 0}/10</span>
                                <span>glow {prop.scores?.glow ?? 0}/10</span>
                                {prop.adnOk ? (
                                  <span className="inline-flex items-center gap-0.5 text-[#6FBF9F]">
                                    <ShieldCheck size={10} /> ADN ok
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[#E08A84]">
                                    <AlertTriangle size={10} /> {prop.serveurLogo ? "échec ADN" : "icône d’appli"}
                                  </span>
                                )}
                                <span className={prop.lisible64 ? "" : "text-[#E08A84]"}>{prop.lisible64 ? "64 px ok" : "64 px illisible"}</span>
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-[9.5px] text-dusk">
                                {prop.ocrRejects > 0 ? `${prop.ocrRejects} rejet${prop.ocrRejects > 1 ? "s" : ""} OCR` : "OCR ok"}
                                {prop.conceptOk ? (
                                  <span className="inline-flex items-center gap-0.5 text-[#6FBF9F]">
                                    <ShieldCheck size={10} /> concept ok
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[#E08A84]">
                                    <AlertTriangle size={10} /> {prop.defauts[0] ?? "échec concept"}
                                  </span>
                                )}
                                {prop.regenere ? <span>· régénéré</span> : null}
                              </p>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* ── Résultat étape B : fonds + composition + déclinaisons ── */}
                  {result?.fonds ? (
                    <div className="mt-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                        Fonds générés SANS le logo → aperçus composés [fond][logo]
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {result.fonds.map((f, i) => (
                          <figure key={i} className="overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.previewDataUrl} alt={`Fond ${i + 1} composé`} className="w-full object-contain" />
                            <figcaption className="bg-white/[0.05] px-2 py-1 font-mono text-[9.5px] text-dusk">
                              fond #{i + 1} — composé
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                      {result.declinaisons ? (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-dusk">
                            Déclinaisons (fond #1) :
                          </span>
                          {[
                            { label: "PNG alpha", url: result.declinaisons.alphaDataUrl, file: "logo-alpha.png" },
                            { label: "Carré 1:1", url: result.declinaisons.carreDataUrl, file: "logo-carre.png" },
                            { label: "Bannière 16:9", url: result.declinaisons.banniereDataUrl, file: "logo-banniere.png" },
                          ].map((d) => (
                            <a
                              key={d.label}
                              href={d.url}
                              download={d.file}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--hairline-strong)] px-3 py-1 text-[11px] text-ink transition-colors hover:border-[rgba(164,139,232,0.5)]"
                            >
                              <Download size={11} />
                              {d.label}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* ── Résultat v1/v2/instruct (héro, conservé) ───────────── */}
                  {result?.resultats ? (
                    <div className="mt-4">
                      <div className={cn("grid gap-2", result.resultats.length > 1 ? "grid-cols-3" : "grid-cols-1")}>
                        {result.resultats.map((r, i) => (
                          <figure key={i} className="overflow-hidden rounded-lg border border-[color:var(--hairline)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.dataUrl} alt={`Résultat ${i + 1}`} className="w-full object-contain" />
                            <figcaption className="flex items-center justify-between bg-white/[0.05] px-2 py-1 font-mono text-[9.5px] text-dusk">
                              <span>#{i + 1}</span>
                              <span className="flex items-center gap-1">
                                {r.ocrRejects > 0 ? (
                                  `${r.ocrRejects} rejet${r.ocrRejects > 1 ? "s" : ""} OCR`
                                ) : variant.ocrAttendus.length ? (
                                  <>
                                    <ShieldCheck size={10} className="text-[#6FBF9F]" /> OCR ok
                                  </>
                                ) : (
                                  "—"
                                )}
                              </span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* ── Coût mesuré ────────────────────────────────────────── */}
                  {result?.coutParEtage ? (
                    <table className="mt-3 w-full font-mono text-[10.5px] text-dusk">
                      <tbody>
                        <tr>
                          <td className="py-0.5">Étage 1 — DA (texte, thinking)</td>
                          <td className="text-right">{result.coutParEtage.daEur.toFixed(4)} €</td>
                        </tr>
                        <tr>
                          <td className="py-0.5">Étage 2 — génération pro image</td>
                          <td className="text-right">{result.coutParEtage.generationEur.toFixed(4)} €</td>
                        </tr>
                        <tr>
                          <td className="py-0.5">Étage 3 — relecture (OCR + concept)</td>
                          <td className="text-right">{result.coutParEtage.relectureEur.toFixed(4)} €</td>
                        </tr>
                        <tr className="border-t border-[color:var(--hairline)] text-ink">
                          <td className="py-0.5">Total · {(result.dureeMs / 1000).toFixed(1)} s</td>
                          <td className="text-right">{result.coutParEtage.totalEur.toFixed(4)} €</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : result && typeof result.coutEur === "number" ? (
                    <p className="mt-2 font-mono text-[10.5px] tracking-[0.05em] text-dusk">
                      Coût mesuré : {result.coutEur.toFixed(4)} € · {(result.dureeMs / 1000).toFixed(1)} s
                    </p>
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
