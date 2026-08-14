/*
 * Tier de qualité de la scène 3D (run 3, LOT 4).
 * Décidé AVANT le chargement du chunk three (ce module reste dans
 * le bundle de la page, pas dans le chunk 3D) :
 *   high — pipeline complet, indistinguable du run 2 ;
 *   mid  — DPR ≤ 1,5, dispersion 1 passe, textures ÷2, ombres et
 *          caustiques statiques, grain 1 octave ;
 *   low  — poster HQ + micro-parallaxe CSS, AUCUN WebGL (le chunk
 *          3D n'est jamais téléchargé).
 * La descente en direct (fps < 30 sur 3 s) est loggée et mémorisée
 * pour les visites suivantes (localStorage), l'URL ?scene-tier=
 * force un tier pour les preuves.
 */

export type SceneTier = "high" | "mid" | "low";

const STORE_KEY = "neva-scene-tier";

let detected: { tier: SceneTier; reason: string } | null = null;

function classify(): { tier: SceneTier; reason: string } {
  if (typeof window === "undefined") return { tier: "high", reason: "ssr" };

  try {
    const forced = new URLSearchParams(window.location.search).get("scene-tier");
    if (forced === "high" || forced === "mid" || forced === "low") {
      return { tier: forced, reason: "forcé par ?scene-tier" };
    }
  } catch {
    /* URL illisible : on classe normalement */
  }

  try {
    const stored = window.localStorage.getItem(STORE_KEY);
    if (stored === "mid" || stored === "low") {
      return { tier: stored, reason: "mémorisé (descente d'une visite précédente)" };
    }
  } catch {
    /* stockage indisponible */
  }

  /* le renderer WebGL est le meilleur signal : un rendu logiciel
     (SwiftShader…) ne tiendra jamais le shader de verre */
  let renderer = "";
  try {
    const c = document.createElement("canvas");
    const gl =
      c.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      c.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    if (!gl) return { tier: "low", reason: "WebGL indisponible" };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return { tier: "low", reason: "création du contexte WebGL en échec" };
  }

  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
    return { tier: "low", reason: `rendu logiciel (${renderer})` };
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;

  if (memory <= 2) return { tier: "low", reason: `deviceMemory ${memory} Go` };

  /* GPU intégrés et mobiles : le fill rate du verre (≈ 24 fetches
     de texture par fragment) dépasse leur budget en plein cadre */
  const weakGpu =
    /intel.*(hd|uhd|iris)|mali|adreno|powervr|videocore|radeon.*vega.*(3|8)\b|graphics 4/i.test(
      renderer
    );
  if (weakGpu) return { tier: "mid", reason: `GPU intégré (${renderer})` };
  if (memory <= 4) return { tier: "mid", reason: `deviceMemory ${memory} Go` };
  if (cores <= 4) return { tier: "mid", reason: `${cores} cœurs CPU` };

  return { tier: "high", reason: renderer || "GPU dédié" };
}

export function detectSceneTier(): { tier: SceneTier; reason: string } {
  if (!detected) {
    detected = classify();
    if (typeof window !== "undefined") {
      console.info(`[scene] tier ${detected.tier} — ${detected.reason}`);
    }
  }
  return detected;
}

/* Descente en direct : mémorisée pour les prochains boots, loggée
   (exigence LOT 4 §« si fps < 30 pendant 3 s → descente loggée »). */
export function demoteSceneTier(to: SceneTier, fps: number) {
  try {
    window.localStorage.setItem(STORE_KEY, to);
  } catch {
    /* stockage indisponible : la descente vaut pour cette session */
  }
  detected = { tier: to, reason: `descente automatique (${fps} fps)` };
  console.info(`[scene] descente de tier → ${to} (${fps} fps médians sur 3 s)`);
}

/* Lu par GlassSculpture au chargement de son module (dimensionne
   les textures) : à ce moment la détection a déjà eu lieu — le
   chunk 3D n'est importé qu'après. */
export function currentSceneTier(): SceneTier {
  return detectSceneTier().tier;
}
